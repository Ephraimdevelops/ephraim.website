"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";

// ═══════════════════════════════════════════════════════════════
// AI ENGINE — Unified generation interface
// Actions only — internal mutations live in aiInternal.ts
// ═══════════════════════════════════════════════════════════════

const COST_MAP: Record<string, number> = {
    "dall-e-3:1024x1024": 4,
    "dall-e-3:1024x1792": 8,
    "dall-e-3:1792x1024": 8,
    "gpt-4o:text": 2,
    "gpt-4o-mini:text": 1,
};

function estimateCost(model: string, variant: string): number {
    return COST_MAP[`${model}:${variant}`] || 1;
}

export const generateImage = action({
    args: {
        title: v.string(),
        prompt: v.string(),
        size: v.optional(v.union(
            v.literal("1024x1024"),
            v.literal("1024x1792"),
            v.literal("1792x1024")
        )),
        quality: v.optional(v.union(v.literal("standard"), v.literal("hd"))),
        projectId: v.optional(v.id("projects")),
    },
    returns: v.object({
        assetId: v.id("contentAssets"),
        imageUrl: v.union(v.string(), v.null()),
    }),
    handler: async (ctx, args): Promise<{ assetId: Id<"contentAssets">; imageUrl: string | null }> => {
        const size = args.size || "1024x1024";
        const quality = args.quality || "standard";
        const costCents = estimateCost("dall-e-3", size);

        const assetId = await ctx.runMutation(internal.aiInternal.createAsset, {
            type: "image" as const,
            title: args.title,
            prompt: args.prompt,
            provider: "openai",
            model: "dall-e-3",
            costCents,
            projectId: args.projectId,
        });

        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

            const response = await fetch("https://api.openai.com/v1/images/generations", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "dall-e-3",
                    prompt: args.prompt,
                    n: 1,
                    size,
                    quality,
                    response_format: "url",
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${errorText}`);
            }

            const data: any = await response.json();
            const imageUrl = data.data[0]?.url;
            if (!imageUrl) throw new Error("No image URL in response");

            // Download and store
            const imageResponse = await fetch(imageUrl);
            const imageBlob = await imageResponse.blob();
            const storageId = await ctx.storage.store(imageBlob);
            const servingUrl = await ctx.storage.getUrl(storageId);

            await ctx.runMutation(internal.aiInternal.updateAsset, {
                id: assetId,
                status: "completed" as const,
                storageId,
                outputUrl: servingUrl || undefined,
                width: parseInt(size.split("x")[0]),
                height: parseInt(size.split("x")[1]),
            });

            if (costCents > 0) {
                await ctx.runMutation(internal.aiInternal.trackCost, {
                    costCents,
                    description: `AI Image: ${args.title} (DALL-E 3, ${size})`,
                });
            }

            return { assetId, imageUrl: servingUrl };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            await ctx.runMutation(internal.aiInternal.updateAsset, {
                id: assetId,
                status: "failed" as const,
                error: msg,
            });
            throw error;
        }
    },
});

export const generateText = action({
    args: {
        title: v.string(),
        prompt: v.string(),
        systemPrompt: v.optional(v.string()),
        model: v.optional(v.union(v.literal("gpt-4o"), v.literal("gpt-4o-mini"))),
        maxTokens: v.optional(v.number()),
        projectId: v.optional(v.id("projects")),
    },
    returns: v.object({
        assetId: v.id("contentAssets"),
        text: v.string(),
    }),
    handler: async (ctx, args): Promise<{ assetId: Id<"contentAssets">; text: string }> => {
        const model = args.model || "gpt-4o-mini";
        const costCents = estimateCost(model, "text");

        const assetId = await ctx.runMutation(internal.aiInternal.createAsset, {
            type: "text" as const,
            title: args.title,
            prompt: args.prompt,
            provider: "openai",
            model,
            costCents,
            projectId: args.projectId,
        });

        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) throw new Error("OPENAI_API_KEY not configured");

            const messages: Array<{ role: string; content: string }> = [];
            if (args.systemPrompt) messages.push({ role: "system", content: args.systemPrompt });
            messages.push({ role: "user", content: args.prompt });

            const response = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model,
                    messages,
                    max_tokens: args.maxTokens || 2000,
                }),
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`OpenAI API error: ${errorText}`);
            }

            const data: any = await response.json();
            const text = data.choices[0]?.message?.content;
            if (!text) throw new Error("No text in response");

            await ctx.runMutation(internal.aiInternal.updateAsset, {
                id: assetId,
                status: "completed" as const,
                outputText: text,
            });

            if (costCents > 0) {
                await ctx.runMutation(internal.aiInternal.trackCost, {
                    costCents,
                    description: `AI Text: ${args.title} (${model})`,
                });
            }

            return { assetId, text };
        } catch (error: unknown) {
            const msg = error instanceof Error ? error.message : "Unknown error";
            await ctx.runMutation(internal.aiInternal.updateAsset, {
                id: assetId,
                status: "failed" as const,
                error: msg,
            });
            throw error;
        }
    },
});

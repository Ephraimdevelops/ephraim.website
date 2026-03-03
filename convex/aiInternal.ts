import { v } from "convex/values";
import { internalMutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// AI INTERNAL — Mutations called by AI actions
// Separated to avoid circular type inference in ai.ts
// ═══════════════════════════════════════════════════════════════

export const createAsset = internalMutation({
    args: {
        type: v.union(v.literal("image"), v.literal("video"), v.literal("text"), v.literal("audio")),
        title: v.string(),
        prompt: v.string(),
        provider: v.string(),
        model: v.string(),
        costCents: v.number(),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("contentAssets", {
            ...args,
            status: "generating",
            createdAt: Date.now(),
        });
    },
});

export const updateAsset = internalMutation({
    args: {
        id: v.id("contentAssets"),
        status: v.union(v.literal("completed"), v.literal("failed")),
        outputUrl: v.optional(v.string()),
        outputText: v.optional(v.string()),
        storageId: v.optional(v.id("_storage")),
        width: v.optional(v.number()),
        height: v.optional(v.number()),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

// Track AI generation cost as an expense + transaction
export const trackCost = internalMutation({
    args: {
        costCents: v.number(),
        description: v.string(),
    },
    handler: async (ctx, args) => {
        // Create an expense (must match expenses schema exactly)
        const expenseId = await ctx.db.insert("expenses", {
            description: args.description,
            amountCents: args.costCents,
            category: "software",
            currency: "USD",
            isTaxDeductible: true,
            date: Date.now(),
            createdAt: Date.now(),
        });

        // Auto-create transaction in ledger
        await ctx.db.insert("transactions", {
            type: "expense",
            amountCents: -args.costCents,
            currency: "USD",
            description: args.description,
            date: Date.now(),
            createdFrom: "expense",
            createdFromId: expenseId,
            isReversal: false,
            createdAt: Date.now(),
        });
    },
});

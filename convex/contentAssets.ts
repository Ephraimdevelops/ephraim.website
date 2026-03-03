import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// CONTENT ASSETS — Library + CRUD
// Browse, filter, and manage all AI-generated content
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        type: v.optional(v.union(
            v.literal("image"),
            v.literal("video"),
            v.literal("text"),
            v.literal("audio")
        )),
        status: v.optional(v.union(
            v.literal("generating"),
            v.literal("completed"),
            v.literal("failed")
        )),
        provider: v.optional(v.string()),
        projectId: v.optional(v.id("projects")),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let assets = await ctx.db.query("contentAssets").order("desc").collect();
        assets = assets.filter((a) => !a.deletedAt);

        if (args.type) assets = assets.filter((a) => a.type === args.type);
        if (args.status) assets = assets.filter((a) => a.status === args.status);
        if (args.provider) assets = assets.filter((a) => a.provider === args.provider);
        if (args.projectId) assets = assets.filter((a) => a.projectId === args.projectId);

        if (args.limit) assets = assets.slice(0, args.limit);

        // Resolve storage URLs
        return Promise.all(
            assets.map(async (asset) => {
                let url = asset.outputUrl;
                if (!url && asset.storageId) {
                    url = await ctx.storage.getUrl(asset.storageId) || undefined;
                }
                return { ...asset, resolvedUrl: url };
            })
        );
    },
});

export const getById = query({
    args: { id: v.id("contentAssets") },
    handler: async (ctx, args) => {
        const asset = await ctx.db.get(args.id);
        if (!asset) return null;
        let url = asset.outputUrl;
        if (!url && asset.storageId) {
            url = await ctx.storage.getUrl(asset.storageId) || undefined;
        }
        return { ...asset, resolvedUrl: url };
    },
});

export const remove = mutation({
    args: { id: v.id("contentAssets") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// Update just the title
export const updateTitle = mutation({
    args: {
        id: v.id("contentAssets"),
        title: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { title: args.title });
    },
});

// ── Stats ────────────────────────────────────────────────────
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const assets = await ctx.db.query("contentAssets").collect();
        const active = assets.filter((a) => !a.deletedAt);

        const totalCostCents = active
            .filter((a) => a.costCents)
            .reduce((sum, a) => sum + (a.costCents || 0), 0);

        return {
            total: active.length,
            byType: {
                image: active.filter((a) => a.type === "image").length,
                video: active.filter((a) => a.type === "video").length,
                text: active.filter((a) => a.type === "text").length,
                audio: active.filter((a) => a.type === "audio").length,
            },
            byStatus: {
                generating: active.filter((a) => a.status === "generating").length,
                completed: active.filter((a) => a.status === "completed").length,
                failed: active.filter((a) => a.status === "failed").length,
            },
            byProvider: active.reduce((acc, a) => {
                const key = a.provider || "unknown";
                acc[key] = (acc[key] || 0) + 1;
                return acc;
            }, {} as Record<string, number>),
            totalCostCents,
        };
    },
});

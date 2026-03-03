import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// SOCIAL POSTS — Schedule & Publish Content
// Single publisher approach with switch/case per platform
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(v.union(
            v.literal("draft"),
            v.literal("scheduled"),
            v.literal("publishing"),
            v.literal("published"),
            v.literal("failed")
        )),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        let posts = await ctx.db.query("socialPosts").order("desc").collect();
        posts = posts.filter((p) => !p.deletedAt);

        if (args.status) posts = posts.filter((p) => p.status === args.status);
        if (args.projectId) posts = posts.filter((p) => p.projectId === args.projectId);

        // Enrich with content asset data
        return Promise.all(
            posts.map(async (post) => {
                let assetUrl = post.mediaUrl;
                if (post.contentAssetId) {
                    const asset = await ctx.db.get(post.contentAssetId);
                    if (asset?.storageId) {
                        assetUrl = await ctx.storage.getUrl(asset.storageId) || assetUrl;
                    } else if (asset?.outputUrl) {
                        assetUrl = asset.outputUrl;
                    }
                }
                return { ...post, resolvedMediaUrl: assetUrl };
            })
        );
    },
});

export const getById = query({
    args: { id: v.id("socialPosts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Create a draft post
export const create = mutation({
    args: {
        caption: v.string(),
        contentAssetId: v.optional(v.id("contentAssets")),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.union(
            v.literal("image"),
            v.literal("video"),
            v.literal("carousel")
        )),
        targetPlatforms: v.array(v.string()),
        scheduledAt: v.optional(v.number()),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("socialPosts", {
            ...args,
            status: args.scheduledAt ? "scheduled" : "draft",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

// Schedule a draft
export const schedule = mutation({
    args: {
        id: v.id("socialPosts"),
        scheduledAt: v.number(),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");
        if (post.status !== "draft") throw new Error("Only draft posts can be scheduled");

        await ctx.db.patch(args.id, {
            scheduledAt: args.scheduledAt,
            status: "scheduled",
            updatedAt: Date.now(),
        });
    },
});

// Update a draft/scheduled post
export const update = mutation({
    args: {
        id: v.id("socialPosts"),
        caption: v.optional(v.string()),
        contentAssetId: v.optional(v.id("contentAssets")),
        mediaUrl: v.optional(v.string()),
        mediaType: v.optional(v.union(
            v.literal("image"),
            v.literal("video"),
            v.literal("carousel")
        )),
        targetPlatforms: v.optional(v.array(v.string())),
        scheduledAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const post = await ctx.db.get(args.id);
        if (!post) throw new Error("Post not found");
        if (post.status === "published" || post.status === "publishing") {
            throw new Error("Cannot edit published/publishing posts");
        }

        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("socialPosts") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// ── Calendar View ────────────────────────────────────────────
export const getCalendar = query({
    args: {
        startDate: v.number(),
        endDate: v.number(),
    },
    handler: async (ctx, args) => {
        const posts = await ctx.db.query("socialPosts").collect();
        return posts.filter(
            (p) =>
                !p.deletedAt &&
                p.scheduledAt &&
                p.scheduledAt >= args.startDate &&
                p.scheduledAt <= args.endDate
        );
    },
});

// ── Stats ────────────────────────────────────────────────────
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const posts = await ctx.db.query("socialPosts").collect();
        const active = posts.filter((p) => !p.deletedAt);

        const upcoming = active.filter(
            (p) => p.status === "scheduled" && p.scheduledAt && p.scheduledAt > Date.now()
        );

        return {
            total: active.length,
            draft: active.filter((p) => p.status === "draft").length,
            scheduled: active.filter((p) => p.status === "scheduled").length,
            published: active.filter((p) => p.status === "published").length,
            failed: active.filter((p) => p.status === "failed").length,
            nextScheduled: upcoming.sort((a, b) => (a.scheduledAt || 0) - (b.scheduledAt || 0))[0]?.scheduledAt,
            platformBreakdown: active.reduce((acc, p) => {
                for (const platform of p.targetPlatforms) {
                    acc[platform] = (acc[platform] || 0) + 1;
                }
                return acc;
            }, {} as Record<string, number>),
        };
    },
});

// ── Social Accounts CRUD ─────────────────────────────────────
export const listAccounts = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("socialAccounts").collect();
    },
});

export const createAccount = mutation({
    args: {
        platform: v.union(
            v.literal("instagram"),
            v.literal("linkedin"),
            v.literal("twitter"),
            v.literal("facebook"),
            v.literal("tiktok")
        ),
        accountName: v.string(),
        accountId: v.string(),
        businessName: v.string(),
        businessId: v.optional(v.string()),
        accessToken: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("socialAccounts", {
            ...args,
            isActive: true,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const toggleAccount = mutation({
    args: { id: v.id("socialAccounts") },
    handler: async (ctx, args) => {
        const account = await ctx.db.get(args.id);
        if (!account) throw new Error("Account not found");
        await ctx.db.patch(args.id, {
            isActive: !account.isActive,
            updatedAt: Date.now(),
        });
    },
});

// List accounts grouped by business
export const listAccountsByBusiness = query({
    args: {},
    handler: async (ctx) => {
        const accounts = await ctx.db.query("socialAccounts").collect();
        const grouped: Record<string, typeof accounts> = {};
        for (const acc of accounts) {
            const biz = acc.businessName || "Default";
            if (!grouped[biz]) grouped[biz] = [];
            grouped[biz].push(acc);
        }
        return grouped;
    },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// BLOG POSTS - Content CMS
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("scheduled"),
                v.literal("published"),
                v.literal("archived")
            )
        ),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("posts")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("posts").order("desc").collect();
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
    },
});

export const getById = query({
    args: { id: v.id("posts") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.optional(v.string()), // Optional initially
        coverImage: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();

        // Check for slug collision
        const existing = await ctx.db
            .query("posts")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) {
            throw new Error("Slug already in use");
        }

        return await ctx.db.insert("posts", {
            title: args.title,
            slug: args.slug,
            content: args.content || "",
            coverImage: args.coverImage,
            status: "draft",
            isPremium: false,
            viewCount: 0,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("posts"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        excerpt: v.optional(v.string()),
        content: v.optional(v.string()),
        coverImage: v.optional(v.id("_storage")),
        tags: v.optional(v.array(v.string())),
        category: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("scheduled"),
                v.literal("published"),
                v.literal("archived")
            )
        ),
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
        isPremium: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const post = await ctx.db.get(id);

        if (!post) throw new Error("Post not found");

        // If updating status to published for first time, set publishedAt
        const finalUpdates: any = { ...updates, updatedAt: Date.now() };

        if (args.status === "published" && !post.publishedAt) {
            finalUpdates.publishedAt = Date.now();
        }

        await ctx.db.patch(id, finalUpdates);
    },
});

export const remove = mutation({
    args: { id: v.id("posts") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

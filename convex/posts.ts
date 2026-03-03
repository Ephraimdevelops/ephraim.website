import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// ASSET ADAPTER - Backwards compatiability for Content CMS
// Maps old `posts` logic into the unified `contentAssets` schema
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(v.string()), // relaxed for adapter
    },
    handler: async (ctx, args) => {
        const mapAssets = (assets: any[]) => assets.map(a => ({
            ...a,
            _id: a._id as any,
            content: a.richOutput || "",
            coverImage: a.storageId,
            category: a.type === "blog_post" ? "thought" : a.type,
        }));

        if (args.status) {
            const assets = await ctx.db
                .query("contentAssets")
                .withIndex("by_status", (q) => q.eq("status", args.status as any))
                .order("desc")
                .collect();
            return mapAssets(assets);
        }

        const assets = await ctx.db.query("contentAssets").order("desc").collect();
        return mapAssets(assets);
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const a = await ctx.db
            .query("contentAssets")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();
        if (!a) return null;
        return {
            ...a,
            _id: a._id as any,
            content: a.richOutput || "",
            coverImage: a.storageId,
            category: a.type === "blog_post" ? "thought" : a.type,
        };
    },
});

export const getById = query({
    args: { id: v.id("contentAssets") },
    handler: async (ctx, args) => {
        const a = await ctx.db.get(args.id);
        if (!a) return null;
        return {
            ...a,
            _id: a._id as any,
            content: a.richOutput || "",
            coverImage: a.storageId,
            category: a.type === "blog_post" ? "thought" : a.type,
        };
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        slug: v.string(),
        content: v.optional(v.string()),
        coverImage: v.optional(v.id("_storage")),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const existing = await ctx.db
            .query("contentAssets")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (existing) throw new Error("Slug already in use");

        // Creates a new content asset
        return await ctx.db.insert("contentAssets", {
            type: "blog_post", // default mapped type
            title: args.title,
            slug: args.slug,
            richOutput: args.content || "",
            storageId: args.coverImage,
            status: "draft", // Valid in our new schema
            createdAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("contentAssets"),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        excerpt: v.optional(v.string()), // excerpt will just be dropped in adapter
        content: v.optional(v.string()),
        coverImage: v.optional(v.id("_storage")),
        tags: v.optional(v.array(v.string())), // dropped in adapter
        category: v.optional(v.string()),
        brandVoice: v.optional(v.union(
            v.literal("corporate_authority"),
            v.literal("luxury_lifestyle"),
            v.literal("bold_startup"),
            v.literal("empathetic_guide"),
            v.literal("technical_expert")
        )),
        status: v.optional(v.string()),
        metaTitle: v.optional(v.string()),
        metaDescription: v.optional(v.string()),
        isPremium: v.optional(v.boolean()),
    },
    handler: async (ctx, args) => {
        const { id, content, coverImage, category, excerpt, tags, metaTitle, metaDescription, isPremium, status, ...updates } = args;
        const asset = await ctx.db.get(id);

        if (!asset) throw new Error("Asset not found");

        const finalUpdates: any = { ...updates };

        if (content !== undefined) finalUpdates.richOutput = content;
        if (coverImage !== undefined) finalUpdates.storageId = coverImage;

        if (category !== undefined) {
            // Map UI category to schema type
            if (category === "thought" || category === "tutorial" || category === "case-study") {
                finalUpdates.type = "blog_post";
            } else {
                finalUpdates.type = category as any;
            }
        }

        if (status) {
            if (status === "published" || status === "draft" || status === "generating" || status === "failed" || status === "completed") {
                finalUpdates.status = status as any;
            } else if (status === "scheduled") {
                finalUpdates.status = "draft"; // fallback
            }
        }

        await ctx.db.patch(id, finalUpdates);
    },
});

export const remove = mutation({
    args: { id: v.id("contentAssets") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

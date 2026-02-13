import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// PROJECTS - Portfolio & Project Management
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        featured: v.optional(v.boolean()),
        category: v.optional(v.string()), // Added category filter
        status: v.optional(
            v.union(
                v.literal("discovery"),
                v.literal("design"),
                v.literal("development"),
                v.literal("review"),
                v.literal("completed"),
                v.literal("archived")
            )
        ),
    },
    handler: async (ctx, args) => {
        let projects = await ctx.db.query("projects").order("desc").collect();

        if (args.featured !== undefined) {
            projects = projects.filter(p => p.isFeatured === args.featured);
        }

        if (args.status) {
            projects = projects.filter(p => p.status === args.status);
        }

        if (args.category) {
            projects = projects.filter(p => p.category === args.category);
        }

        // Resolve generic URLs for cover images
        return await Promise.all(projects.map(async (p) => ({
            ...p,
            coverImageUrl: p.coverImage ? await ctx.storage.getUrl(p.coverImage) : null,
        })));
    },
});

export const getFeatured = query({
    args: {},
    handler: async (ctx) => {
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_featured", (q) => q.eq("isFeatured", true))
            .order("desc")
            .collect();

        return await Promise.all(projects.map(async (p) => ({
            ...p,
            coverImageUrl: p.coverImage ? await ctx.storage.getUrl(p.coverImage) : null,
        })));
    },
});

export const getBySlug = query({
    args: { slug: v.string() },
    handler: async (ctx, args) => {
        const project = await ctx.db
            .query("projects")
            .withIndex("by_slug", (q) => q.eq("slug", args.slug))
            .first();

        if (!project) return null;

        return {
            ...project,
            coverImageUrl: project.coverImage ? await ctx.storage.getUrl(project.coverImage) : null,
            imagesUrls: project.images
                ? await Promise.all(project.images.map(id => ctx.storage.getUrl(id)))
                : []
        };
    },
});

export const getById = query({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        const project = await ctx.db.get(args.id);
        if (!project) return null;

        return {
            ...project,
            coverImageUrl: project.coverImage ? await ctx.storage.getUrl(project.coverImage) : null,
            imagesUrls: project.images
                ? await Promise.all(project.images.map(id => ctx.storage.getUrl(id)))
                : []
        };
    },
});

export const getByClient = query({
    args: { clientId: v.id("clients") },
    handler: async (ctx, args) => {
        const projects = await ctx.db
            .query("projects")
            .withIndex("by_client", (q) => q.eq("clientId", args.clientId))
            .collect();

        return await Promise.all(projects.map(async (p) => ({
            ...p,
            coverImageUrl: p.coverImage ? await ctx.storage.getUrl(p.coverImage) : null,
        })));
    },
});

export const create = mutation({
    args: {
        clientId: v.optional(v.id("clients")),
        title: v.string(),
        slug: v.string(),
        tagline: v.optional(v.string()),
        description: v.string(),
        coverImage: v.optional(v.id("_storage")),
        images: v.optional(v.array(v.id("_storage"))),
        category: v.optional(v.string()), // Added category
        metrics: v.optional(v.string()),
        techStack: v.optional(v.array(v.string())),
        liveUrl: v.optional(v.string()),
        isFeatured: v.optional(v.boolean()),
        status: v.optional(
            v.union(
                v.literal("discovery"),
                v.literal("design"),
                v.literal("development"),
                v.literal("review"),
                v.literal("completed"),
                v.literal("archived")
            )
        ),
        progress: v.optional(v.number()),
        startDate: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("projects", {
            clientId: args.clientId,
            title: args.title,
            slug: args.slug,
            tagline: args.tagline,
            description: args.description,
            coverImage: args.coverImage,
            images: args.images,
            category: args.category,
            metrics: args.metrics,
            techStack: args.techStack,
            liveUrl: args.liveUrl,
            isFeatured: args.isFeatured || false,
            status: args.status || "discovery",
            progress: args.progress || 0,
            startDate: args.startDate,
            dueDate: args.dueDate,
            order: args.order,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("projects"),
        clientId: v.optional(v.id("clients")),
        title: v.optional(v.string()),
        slug: v.optional(v.string()),
        tagline: v.optional(v.string()),
        description: v.optional(v.string()),
        coverImage: v.optional(v.id("_storage")),
        images: v.optional(v.array(v.id("_storage"))),
        category: v.optional(v.string()),
        metrics: v.optional(v.string()),
        techStack: v.optional(v.array(v.string())),
        liveUrl: v.optional(v.string()),
        isFeatured: v.optional(v.boolean()),
        status: v.optional(
            v.union(
                v.literal("discovery"),
                v.literal("design"),
                v.literal("development"),
                v.literal("review"),
                v.literal("completed"),
                v.literal("archived")
            )
        ),
        progress: v.optional(v.number()),
        startDate: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        order: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const updateProgress = mutation({
    args: {
        id: v.id("projects"),
        progress: v.number(),
        status: v.optional(
            v.union(
                v.literal("discovery"),
                v.literal("design"),
                v.literal("development"),
                v.literal("review"),
                v.literal("completed"),
                v.literal("archived")
            )
        ),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            progress: args.progress,
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { id: v.id("projects") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════════
// FILE STORAGE
// ═══════════════════════════════════════════════════════════════

export const generateUploadUrl = mutation({
    args: {},
    handler: async (ctx) => {
        return await ctx.storage.generateUploadUrl();
    },
});

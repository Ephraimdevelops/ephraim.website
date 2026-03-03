import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// APPROVAL ROOM — Structured Project Feedback
// ═══════════════════════════════════════════════════════════════

// Submit feedback (approval or revision request)
export const submit = mutation({
    args: {
        projectId: v.id("projects"),
        type: v.union(v.literal("approval"), v.literal("revision")),
        authorType: v.union(v.literal("client"), v.literal("team"), v.literal("admin")),
        authorName: v.string(),
        authorEmail: v.optional(v.string()),
        section: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("projectFeedback", {
            ...args,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

// List feedback for a project
export const listByProject = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("projectFeedback")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .order("desc")
            .collect();
    },
});

// Resolve a revision (admin marks it done)
export const resolve = mutation({
    args: {
        feedbackId: v.id("projectFeedback"),
        resolvedBy: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.feedbackId, {
            status: "resolved",
            resolvedAt: Date.now(),
            resolvedBy: args.resolvedBy,
        });
    },
});

// Acknowledge feedback
export const acknowledge = mutation({
    args: { feedbackId: v.id("projectFeedback") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.feedbackId, { status: "acknowledged" });
    },
});

// Get feedback stats for a project
export const getStats = query({
    args: { projectId: v.id("projects") },
    handler: async (ctx, args) => {
        const all = await ctx.db
            .query("projectFeedback")
            .withIndex("by_project", (q) => q.eq("projectId", args.projectId))
            .collect();

        return {
            total: all.length,
            approvals: all.filter((f) => f.type === "approval").length,
            revisions: all.filter((f) => f.type === "revision").length,
            pendingRevisions: all.filter((f) => f.type === "revision" && f.status === "pending").length,
            resolved: all.filter((f) => f.status === "resolved").length,
        };
    },
});

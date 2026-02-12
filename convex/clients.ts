import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// CLIENTS - CRM Management
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("lead"),
                v.literal("negotiating"),
                v.literal("active"),
                v.literal("retainer"),
                v.literal("archived")
            )
        ),
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("clients")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("clients").order("desc").collect();
    },
});

export const getById = query({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getByMagicToken = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        const client = await ctx.db
            .query("clients")
            .withIndex("by_magic_token", (q) => q.eq("magicLinkToken", args.token))
            .first();

        if (!client) return null;

        // Check if token is expired
        if (client.magicLinkExpiresAt && client.magicLinkExpiresAt < Date.now()) {
            return null;
        }

        return client;
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        company: v.optional(v.string()),
        email: v.string(),
        phone: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("lead"),
                v.literal("negotiating"),
                v.literal("active"),
                v.literal("retainer"),
                v.literal("archived")
            )
        ),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("clients", {
            name: args.name,
            company: args.company,
            email: args.email,
            phone: args.phone,
            status: args.status || "lead",
            notes: args.notes,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("clients"),
        name: v.optional(v.string()),
        company: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        status: v.optional(
            v.union(
                v.literal("lead"),
                v.literal("negotiating"),
                v.literal("active"),
                v.literal("retainer"),
                v.literal("archived")
            )
        ),
        notes: v.optional(v.string()),
        stripeCustomerId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
            updatedAt: Date.now(),
        });
    },
});

export const generateMagicLink = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        // Generate a random token
        const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        let token = "";
        for (let i = 0; i < 32; i++) {
            token += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        // Set expiry to 7 days from now
        const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

        await ctx.db.patch(args.id, {
            magicLinkToken: token,
            magicLinkExpiresAt: expiresAt,
            updatedAt: Date.now(),
        });

        return token;
    },
});

export const remove = mutation({
    args: { id: v.id("clients") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════════
// STATS & ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const clients = await ctx.db.query("clients").collect();

        const stats = {
            total: clients.length,
            lead: 0,
            negotiating: 0,
            active: 0,
            retainer: 0,
            archived: 0,
        };

        clients.forEach((client) => {
            stats[client.status]++;
        });

        return stats;
    },
});

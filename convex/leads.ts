import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// LEADS - Pipeline Management
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(v.string()), // Filter by status
    },
    handler: async (ctx, args) => {
        if (args.status) {
            return await ctx.db
                .query("leads")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("leads").order("desc").collect();
    },
});

export const getById = query({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        company: v.optional(v.string()),
        topic: v.optional(v.string()),
        status: v.optional(v.string()),
        source: v.optional(v.string()), // "web", "referral", "linkedin", "ads"
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        return await ctx.db.insert("leads", {
            name: args.name,
            email: args.email,
            company: args.company,
            topic: args.topic,
            status: args.status || "new",
            source: args.source || "direct",
            notes: args.notes,
            createdAt: now,
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("leads"),
        status: v.string(),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("leads"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        company: v.optional(v.string()),
        topic: v.optional(v.string()),
        status: v.optional(v.string()),
        source: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, {
            ...updates,
        });
    },
});

export const convertToClient = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        const lead = await ctx.db.get(args.id);
        if (!lead) {
            throw new Error("Lead not found");
        }

        // Create client from lead
        const now = Date.now();
        const clientId = await ctx.db.insert("clients", {
            name: lead.name,
            company: lead.company,
            email: lead.email,
            // topic as notes? or separate
            status: "active",
            notes: lead.notes || `Converted from lead. Topic: ${lead.topic}`,
            createdAt: now,
            updatedAt: now,
        });

        // Update lead with conversion
        await ctx.db.patch(args.id, {
            status: "converted",
            convertedClientId: clientId,
        });

        return clientId;
    },
});

export const remove = mutation({
    args: { id: v.id("leads") },
    handler: async (ctx, args) => {
        // Soft delete
        await ctx.db.patch(args.id, {
            deletedAt: Date.now()
        });
    },
});

// ═══════════════════════════════════════════════════════════════
// ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const leads = await ctx.db.query("leads").collect();

        const stats = {
            total: leads.length,
            byStatus: {} as Record<string, number>,
            bySource: {} as Record<string, number>,
            conversionRate: 0,
        };

        let convertedCount = 0;

        leads.forEach((lead) => {
            // Status Stats
            const status = lead.status || "unknown";
            stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

            // Source Stats
            const source = lead.source || "direct";
            stats.bySource[source] = (stats.bySource[source] || 0) + 1;

            if (status === "converted" || status === "won") {
                convertedCount++;
            }
        });

        // Calculate conversion rate
        if (stats.total > 0) {
            stats.conversionRate = Math.round((convertedCount / stats.total) * 100);
        }

        return stats;
    },
});

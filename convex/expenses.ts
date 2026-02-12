import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// EXPENSES - Bookkeeping & Outgoings
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        category: v.optional(
            v.union(
                v.literal("software"),
                v.literal("ads"),
                v.literal("contractors"),
                v.literal("office"),
                v.literal("travel"),
                v.literal("equipment"),
                v.literal("other")
            )
        ),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let expenses = await ctx.db.query("expenses").order("desc").collect();

        if (args.category) {
            expenses = expenses.filter((exp) => exp.category === args.category);
        }

        if (args.startDate) {
            expenses = expenses.filter((exp) => exp.date >= args.startDate!);
        }

        if (args.endDate) {
            expenses = expenses.filter((exp) => exp.date <= args.endDate!);
        }

        return expenses;
    },
});

export const getById = query({
    args: { id: v.id("expenses") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        description: v.string(),
        category: v.union(
            v.literal("software"),
            v.literal("ads"),
            v.literal("contractors"),
            v.literal("office"),
            v.literal("travel"),
            v.literal("equipment"),
            v.literal("other")
        ),
        amount: v.number(),
        currency: v.string(),
        vendor: v.optional(v.string()),
        receiptStorageId: v.optional(v.id("_storage")),
        isTaxDeductible: v.boolean(),
        date: v.number(),
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("expenses", {
            description: args.description,
            category: args.category,
            amount: args.amount,
            currency: args.currency,
            vendor: args.vendor,
            receiptStorageId: args.receiptStorageId,
            isTaxDeductible: args.isTaxDeductible,
            date: args.date,
            clientId: args.clientId,
            projectId: args.projectId,
            createdAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("expenses"),
        description: v.optional(v.string()),
        category: v.optional(
            v.union(
                v.literal("software"),
                v.literal("ads"),
                v.literal("contractors"),
                v.literal("office"),
                v.literal("travel"),
                v.literal("equipment"),
                v.literal("other")
            )
        ),
        amount: v.optional(v.number()),
        currency: v.optional(v.string()),
        vendor: v.optional(v.string()),
        receiptStorageId: v.optional(v.id("_storage")),
        isTaxDeductible: v.optional(v.boolean()),
        date: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, updates);
    },
});

export const remove = mutation({
    args: { id: v.id("expenses") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════════
// EXPENSE ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getStats = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let expenses = await ctx.db.query("expenses").collect();

        const now = Date.now();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startDate = args.startDate || startOfMonth.getTime();
        const endDate = args.endDate || now;

        expenses = expenses.filter(
            (exp) => exp.date >= startDate && exp.date <= endDate
        );

        const stats = {
            total: expenses.reduce((sum, exp) => sum + exp.amount, 0),
            count: expenses.length,
            byCategory: {} as Record<string, number>,
            taxDeductible: 0,
            nonDeductible: 0,
        };

        expenses.forEach((exp) => {
            stats.byCategory[exp.category] =
                (stats.byCategory[exp.category] || 0) + exp.amount;

            if (exp.isTaxDeductible) {
                stats.taxDeductible += exp.amount;
            } else {
                stats.nonDeductible += exp.amount;
            }
        });

        return stats;
    },
});

// ═══════════════════════════════════════════════════════════════
// AD SPEND ROI (Compare to Leads)
// ═══════════════════════════════════════════════════════════════

export const getAdSpendROI = query({
    args: {},
    handler: async (ctx) => {
        const adExpenses = await ctx.db
            .query("expenses")
            .withIndex("by_category", (q) => q.eq("category", "ads"))
            .collect();

        const leads = await ctx.db.query("leads").collect();
        const invoices = await ctx.db.query("invoices").collect();

        // Group by month for the last 6 months
        const now = new Date();
        const roi: Array<{
            month: string;
            adSpend: number;
            leadsGenerated: number;
            revenueGenerated: number;
            roi: number;
        }> = [];

        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthAdSpend = adExpenses
                .filter(
                    (exp) => exp.date >= monthStart.getTime() && exp.date <= monthEnd.getTime()
                )
                .reduce((sum, exp) => sum + exp.amount, 0);

            const monthLeads = leads.filter(
                (lead) =>
                    lead.createdAt >= monthStart.getTime() &&
                    lead.createdAt <= monthEnd.getTime() &&
                    lead.source // Only count attributed leads
            ).length;

            const monthRevenue = invoices
                .filter(
                    (inv) =>
                        inv.paidAt &&
                        inv.paidAt >= monthStart.getTime() &&
                        inv.paidAt <= monthEnd.getTime()
                )
                .reduce((sum, inv) => sum + inv.total, 0);

            roi.push({
                month: monthStart.toLocaleDateString("en-US", { month: "short" }),
                adSpend: monthAdSpend,
                leadsGenerated: monthLeads,
                revenueGenerated: monthRevenue,
                roi: monthAdSpend > 0 ? Math.round((monthRevenue / monthAdSpend) * 100) : 0,
            });
        }

        return roi;
    },
});

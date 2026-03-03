import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════
// EXPENSES — Bookkeeping & Outgoings
// All amounts in integer cents. Auto-creates transaction on insert.
// ═══════════════════════════════════════════════════════════════

const expenseCategoryValidator = v.union(
    v.literal("software"),
    v.literal("ads"),
    v.literal("contractors"),
    v.literal("office"),
    v.literal("travel"),
    v.literal("equipment"),
    v.literal("salary"),
    v.literal("utilities"),
    v.literal("insurance"),
    v.literal("marketing"),
    v.literal("legal"),
    v.literal("taxes"),
    v.literal("other")
);

const paymentMethodValidator = v.optional(v.union(
    v.literal("bank_transfer"),
    v.literal("mobile_money"),
    v.literal("cash"),
    v.literal("mpesa"),
    v.literal("tigo_pesa"),
    v.literal("card"),
    v.literal("other")
));

export const list = query({
    args: {
        category: v.optional(expenseCategoryValidator),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let expenses = await ctx.db.query("expenses").order("desc").collect();

        // Filter out soft-deleted
        expenses = expenses.filter((e) => !e.deletedAt);

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
        category: expenseCategoryValidator,
        amountCents: v.number(),
        currency: v.string(),
        vendor: v.optional(v.string()),
        receiptStorageId: v.optional(v.id("_storage")),
        isTaxDeductible: v.boolean(),
        paymentMethod: paymentMethodValidator,
        isRecurring: v.optional(v.boolean()),
        recurringFrequency: v.optional(v.union(
            v.literal("weekly"),
            v.literal("biweekly"),
            v.literal("monthly"),
            v.literal("quarterly"),
            v.literal("yearly")
        )),
        date: v.number(),
        clientId: v.optional(v.id("clients")),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        // 1. Create the transaction (single source of truth)
        const transactionId = await ctx.db.insert("transactions", {
            type: "expense",
            amountCents: -Math.abs(args.amountCents), // Expenses are negative (outflow)
            currency: args.currency,
            description: args.description,
            category: args.category,
            date: args.date,
            paymentGateway: args.paymentMethod === "mpesa" ? "mpesa"
                : args.paymentMethod === "bank_transfer" ? "bank"
                    : args.paymentMethod === "cash" ? "cash"
                        : "manual",
            createdFrom: "expense",
            isReversal: false,
            createdAt: Date.now(),
        });

        // 2. Create the expense record (business UI table)
        const expenseId = await ctx.db.insert("expenses", {
            description: args.description,
            category: args.category,
            amountCents: args.amountCents,
            currency: args.currency,
            vendor: args.vendor,
            receiptStorageId: args.receiptStorageId,
            isTaxDeductible: args.isTaxDeductible,
            paymentMethod: args.paymentMethod,
            isRecurring: args.isRecurring,
            recurringFrequency: args.recurringFrequency,
            date: args.date,
            clientId: args.clientId,
            projectId: args.projectId,
            transactionId,
            createdAt: Date.now(),
        });

        // Link transaction back to expense
        await ctx.db.patch(expenseId, {}); // No-op, transactionId already set

        return expenseId;
    },
});

export const update = mutation({
    args: {
        id: v.id("expenses"),
        description: v.optional(v.string()),
        category: v.optional(expenseCategoryValidator),
        amountCents: v.optional(v.number()),
        currency: v.optional(v.string()),
        vendor: v.optional(v.string()),
        receiptStorageId: v.optional(v.id("_storage")),
        isTaxDeductible: v.optional(v.boolean()),
        paymentMethod: paymentMethodValidator,
        date: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        const existing = await ctx.db.get(id);
        if (!existing) throw new Error("Expense not found");

        // If amount changed, create a reversal + new transaction
        if (args.amountCents !== undefined && args.amountCents !== existing.amountCents) {
            // Reverse old transaction
            if (existing.transactionId) {
                await ctx.db.insert("transactions", {
                    type: "expense",
                    amountCents: Math.abs(existing.amountCents), // Positive to reverse
                    currency: existing.currency,
                    description: `[REVERSAL] ${existing.description}`,
                    category: existing.category,
                    date: existing.date,
                    createdFrom: "expense",
                    createdFromId: id,
                    isReversal: true,
                    reversesTransactionId: existing.transactionId,
                    createdAt: Date.now(),
                });
            }

            // Create new transaction
            const newTxnId = await ctx.db.insert("transactions", {
                type: "expense",
                amountCents: -Math.abs(args.amountCents),
                currency: args.currency ?? existing.currency,
                description: args.description ?? existing.description,
                category: args.category ?? existing.category,
                date: args.date ?? existing.date,
                createdFrom: "expense",
                createdFromId: id,
                isReversal: false,
                createdAt: Date.now(),
            });

            await ctx.db.patch(id, { ...updates, transactionId: newTxnId });
        } else {
            await ctx.db.patch(id, updates);
        }
    },
});

export const remove = mutation({
    args: { id: v.id("expenses") },
    handler: async (ctx, args) => {
        const expense = await ctx.db.get(args.id);
        if (!expense) throw new Error("Expense not found");

        // Create reversal transaction
        if (expense.transactionId) {
            await ctx.db.insert("transactions", {
                type: "expense",
                amountCents: Math.abs(expense.amountCents), // Positive to reverse
                currency: expense.currency,
                description: `[VOID] ${expense.description}`,
                category: expense.category,
                date: expense.date,
                createdFrom: "expense",
                createdFromId: args.id,
                isReversal: true,
                reversesTransactionId: expense.transactionId,
                createdAt: Date.now(),
            });
        }

        // Soft delete the expense
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
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

        // Filter out soft-deleted
        expenses = expenses.filter((e) => !e.deletedAt);

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
            totalCents: expenses.reduce((sum, exp) => sum + exp.amountCents, 0),
            count: expenses.length,
            byCategory: {} as Record<string, number>,
            taxDeductibleCents: 0,
            nonDeductibleCents: 0,
        };

        expenses.forEach((exp) => {
            stats.byCategory[exp.category] =
                (stats.byCategory[exp.category] || 0) + exp.amountCents;

            if (exp.isTaxDeductible) {
                stats.taxDeductibleCents += exp.amountCents;
            } else {
                stats.nonDeductibleCents += exp.amountCents;
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

        const now = new Date();
        const roi: Array<{
            month: string;
            adSpendCents: number;
            leadsGenerated: number;
            revenueCents: number;
            roi: number;
        }> = [];

        for (let i = 5; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

            const monthAdSpend = adExpenses
                .filter(
                    (exp) =>
                        !exp.deletedAt &&
                        exp.date >= monthStart.getTime() &&
                        exp.date <= monthEnd.getTime()
                )
                .reduce((sum, exp) => sum + exp.amountCents, 0);

            const monthLeads = leads.filter(
                (lead) =>
                    lead.createdAt >= monthStart.getTime() &&
                    lead.createdAt <= monthEnd.getTime() &&
                    lead.source
            ).length;

            const monthRevenue = invoices
                .filter(
                    (inv) =>
                        inv.paidAt &&
                        inv.paidAt >= monthStart.getTime() &&
                        inv.paidAt <= monthEnd.getTime()
                )
                .reduce((sum, inv) => sum + inv.total * 100, 0); // Convert existing dollars to cents

            roi.push({
                month: monthStart.toLocaleDateString("en-US", { month: "short" }),
                adSpendCents: monthAdSpend,
                leadsGenerated: monthLeads,
                revenueCents: monthRevenue,
                roi: monthAdSpend > 0 ? Math.round((monthRevenue / monthAdSpend) * 100) : 0,
            });
        }

        return roi;
    },
});

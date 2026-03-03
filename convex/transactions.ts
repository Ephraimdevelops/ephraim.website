import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// TRANSACTIONS — Immutable Financial Ledger
// RULES:
// 1. APPEND-ONLY: Only createTransaction is exported. No updates. No deletes.
// 2. Corrections use reversal rows (isReversal = true).
// 3. All money is in integer cents (1234 = $12.34).
// 4. This is the SINGLE SOURCE OF TRUTH for all accounting.
// ═══════════════════════════════════════════════════════════════

// ── CREATE (the ONLY write operation) ────────────────────────
export const createTransaction = mutation({
    args: {
        type: v.union(
            v.literal("income"),
            v.literal("expense"),
            v.literal("payment"),
            v.literal("refund"),
            v.literal("adjustment")
        ),
        amountCents: v.number(),
        currency: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        reference: v.optional(v.string()),
        date: v.number(),
        paymentGateway: v.optional(v.union(
            v.literal("manual"),
            v.literal("stripe"),
            v.literal("mpesa"),
            v.literal("bank"),
            v.literal("cash")
        )),
        createdFrom: v.union(
            v.literal("invoice"),
            v.literal("expense"),
            v.literal("payment"),
            v.literal("manual")
        ),
        createdFromId: v.optional(v.string()),
        isReversal: v.boolean(),
        reversesTransactionId: v.optional(v.id("transactions")),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("transactions", {
            ...args,
            createdAt: Date.now(),
        });
    },
});

// ── QUERIES ──────────────────────────────────────────────────

// Paginated ledger view
export const getLedger = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
        type: v.optional(v.union(
            v.literal("income"),
            v.literal("expense"),
            v.literal("payment"),
            v.literal("refund"),
            v.literal("adjustment")
        )),
        limit: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let txns = await ctx.db
            .query("transactions")
            .order("desc")
            .collect();

        if (args.type) {
            txns = txns.filter((t) => t.type === args.type);
        }
        if (args.startDate) {
            txns = txns.filter((t) => t.date >= args.startDate!);
        }
        if (args.endDate) {
            txns = txns.filter((t) => t.date <= args.endDate!);
        }

        const limit = args.limit ?? 50;
        return txns.slice(0, limit);
    },
});

// Recent transactions for dashboard
export const getRecent = query({
    args: { limit: v.optional(v.number()) },
    handler: async (ctx, args) => {
        const txns = await ctx.db
            .query("transactions")
            .order("desc")
            .take(args.limit ?? 10);
        return txns;
    },
});

// ── CASH FLOW (monthly income vs outflow) ─────────────────────
export const getCashFlow = query({
    args: {
        months: v.optional(v.number()), // How many months back (default 6)
    },
    handler: async (ctx, args) => {
        const monthsBack = args.months ?? 6;
        const now = new Date();

        const cashFlow: Array<{
            month: string;
            incomeCents: number;
            expenseCents: number;
            paymentCents: number;
            netCents: number;
        }> = [];

        for (let i = monthsBack - 1; i >= 0; i--) {
            const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);

            const monthTxns = await ctx.db
                .query("transactions")
                .withIndex("by_date")
                .filter((q) =>
                    q.and(
                        q.gte(q.field("date"), monthStart.getTime()),
                        q.lte(q.field("date"), monthEnd.getTime())
                    )
                )
                .collect();

            let incomeCents = 0;
            let expenseCents = 0;
            let paymentCents = 0;

            for (const txn of monthTxns) {
                if (txn.type === "income") incomeCents += txn.amountCents;
                else if (txn.type === "expense") expenseCents += Math.abs(txn.amountCents);
                else if (txn.type === "payment") paymentCents += Math.abs(txn.amountCents);
                else if (txn.type === "refund") incomeCents -= Math.abs(txn.amountCents);
            }

            cashFlow.push({
                month: monthStart.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                incomeCents,
                expenseCents,
                paymentCents,
                netCents: incomeCents - expenseCents - paymentCents,
            });
        }

        return cashFlow;
    },
});

// ── PROFIT & LOSS STATEMENT ──────────────────────────────────
export const getProfitAndLoss = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const now = Date.now();
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        const startDate = args.startDate ?? startOfYear;
        const endDate = args.endDate ?? now;

        const txns = await ctx.db
            .query("transactions")
            .collect();

        const filtered = txns.filter(
            (t) => t.date >= startDate && t.date <= endDate
        );

        // Group by category
        const incomeByCategory: Record<string, number> = {};
        const expenseByCategory: Record<string, number> = {};
        const paymentByCategory: Record<string, number> = {};
        let totalIncomeCents = 0;
        let totalExpenseCents = 0;
        let totalPaymentCents = 0;
        let totalRefundCents = 0;

        for (const txn of filtered) {
            const cat = txn.category || "uncategorized";

            switch (txn.type) {
                case "income":
                    totalIncomeCents += txn.amountCents;
                    incomeByCategory[cat] = (incomeByCategory[cat] || 0) + txn.amountCents;
                    break;
                case "expense":
                    totalExpenseCents += Math.abs(txn.amountCents);
                    expenseByCategory[cat] = (expenseByCategory[cat] || 0) + Math.abs(txn.amountCents);
                    break;
                case "payment":
                    totalPaymentCents += Math.abs(txn.amountCents);
                    paymentByCategory[cat] = (paymentByCategory[cat] || 0) + Math.abs(txn.amountCents);
                    break;
                case "refund":
                    totalRefundCents += Math.abs(txn.amountCents);
                    break;
            }
        }

        const grossRevenueCents = totalIncomeCents - totalRefundCents;
        const totalCostsCents = totalExpenseCents + totalPaymentCents;
        const netProfitCents = grossRevenueCents - totalCostsCents;
        const profitMargin = grossRevenueCents > 0
            ? Math.round((netProfitCents / grossRevenueCents) * 100)
            : 0;

        return {
            period: { startDate, endDate },
            grossRevenueCents,
            totalRefundCents,
            totalExpenseCents,
            totalPaymentCents,
            totalCostsCents,
            netProfitCents,
            profitMargin,
            incomeByCategory,
            expenseByCategory,
            paymentByCategory,
            transactionCount: filtered.length,
        };
    },
});

// ── LEDGER TOTALS (quick summary) ────────────────────────────
export const getTotals = query({
    args: {},
    handler: async (ctx) => {
        const txns = await ctx.db.query("transactions").collect();

        let totalIncomeCents = 0;
        let totalExpenseCents = 0;
        let totalPaymentCents = 0;

        for (const txn of txns) {
            switch (txn.type) {
                case "income":
                    totalIncomeCents += txn.amountCents;
                    break;
                case "expense":
                    totalExpenseCents += Math.abs(txn.amountCents);
                    break;
                case "payment":
                    totalPaymentCents += Math.abs(txn.amountCents);
                    break;
                case "refund":
                    totalIncomeCents -= Math.abs(txn.amountCents);
                    break;
            }
        }

        return {
            totalIncomeCents,
            totalExpenseCents,
            totalPaymentCents,
            balanceCents: totalIncomeCents - totalExpenseCents - totalPaymentCents,
            transactionCount: txns.length,
        };
    },
});

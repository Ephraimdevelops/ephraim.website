import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// PAYMENTS — Outbound Payouts (Payroll, Vendor Bills)
// Auto-creates transaction(type=payment) when completed.
// Enforces: exactly ONE of vendorId or employeeId must be set.
// All amounts in integer cents.
// ═══════════════════════════════════════════════════════════════

const paymentCategoryValidator = v.union(
    v.literal("salary"),
    v.literal("bonus"),
    v.literal("commission"),
    v.literal("freelance"),
    v.literal("reimbursement"),
    v.literal("vendor_bill")
);

const paymentMethodValidator = v.union(
    v.literal("bank_transfer"),
    v.literal("mobile_money"),
    v.literal("cash"),
    v.literal("mpesa"),
    v.literal("tigo_pesa"),
    v.literal("check")
);

export const list = query({
    args: {
        status: v.optional(v.union(
            v.literal("pending"),
            v.literal("processing"),
            v.literal("completed"),
            v.literal("failed")
        )),
        category: v.optional(paymentCategoryValidator),
    },
    handler: async (ctx, args) => {
        let payments = await ctx.db.query("payments").order("desc").collect();

        payments = payments.filter((p) => !p.deletedAt);

        if (args.status) {
            payments = payments.filter((p) => p.status === args.status);
        }
        if (args.category) {
            payments = payments.filter((p) => p.category === args.category);
        }

        return payments;
    },
});

export const getById = query({
    args: { id: v.id("payments") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Upcoming scheduled payments
export const getUpcoming = query({
    args: {},
    handler: async (ctx) => {
        const now = Date.now();
        const payments = await ctx.db
            .query("payments")
            .order("asc")
            .collect();

        return payments.filter(
            (p) =>
                !p.deletedAt &&
                p.status === "pending" &&
                p.scheduledDate &&
                p.scheduledDate >= now
        );
    },
});

export const create = mutation({
    args: {
        vendorId: v.optional(v.id("vendors")),
        employeeId: v.optional(v.string()),
        payeeName: v.string(),
        amountCents: v.number(),
        currency: v.string(),
        description: v.string(),
        category: paymentCategoryValidator,
        paymentMethod: paymentMethodValidator,
        scheduledDate: v.optional(v.number()),
        isRecurring: v.optional(v.boolean()),
        recurringFrequency: v.optional(v.union(
            v.literal("weekly"),
            v.literal("biweekly"),
            v.literal("monthly")
        )),
        projectId: v.optional(v.id("projects")),
        clientId: v.optional(v.id("clients")),
    },
    handler: async (ctx, args) => {
        // Enforce: exactly ONE of vendorId or employeeId
        if (!!args.vendorId === !!args.employeeId) {
            throw new Error("Exactly one of vendorId or employeeId is required");
        }

        return await ctx.db.insert("payments", {
            ...args,
            status: "pending",
            reference: undefined,
            paidAt: undefined,
            transactionId: undefined,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

// Process a payment (mark as completed → auto-create transaction)
export const processPayment = mutation({
    args: {
        id: v.id("payments"),
        reference: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const payment = await ctx.db.get(args.id);
        if (!payment) throw new Error("Payment not found");
        if (payment.status === "completed") throw new Error("Payment already completed");

        const paidAt = Date.now();

        // Resolve payment gateway from method
        const gateway = payment.paymentMethod === "mpesa" ? "mpesa" as const
            : payment.paymentMethod === "bank_transfer" ? "bank" as const
                : payment.paymentMethod === "cash" ? "cash" as const
                    : "manual" as const;

        // Create the transaction (single source of truth)
        const transactionId = await ctx.db.insert("transactions", {
            type: "payment",
            amountCents: -Math.abs(payment.amountCents), // Payments are outflows (negative)
            currency: payment.currency,
            description: `Payment to ${payment.payeeName}: ${payment.description}`,
            category: payment.category,
            date: paidAt,
            paymentGateway: gateway,
            createdFrom: "payment",
            createdFromId: args.id,
            isReversal: false,
            createdAt: paidAt,
        });

        // Update payment record
        await ctx.db.patch(args.id, {
            status: "completed",
            paidAt,
            reference: args.reference,
            transactionId,
            updatedAt: paidAt,
        });

        return transactionId;
    },
});

// Mark as failed
export const markFailed = mutation({
    args: {
        id: v.id("payments"),
        error: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "failed",
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { id: v.id("payments") },
    handler: async (ctx, args) => {
        const payment = await ctx.db.get(args.id);
        if (!payment) throw new Error("Payment not found");

        // If completed, create reversal transaction
        if (payment.status === "completed" && payment.transactionId) {
            await ctx.db.insert("transactions", {
                type: "payment",
                amountCents: Math.abs(payment.amountCents), // Positive to reverse
                currency: payment.currency,
                description: `[VOID] Payment to ${payment.payeeName}`,
                category: payment.category,
                date: Date.now(),
                createdFrom: "payment",
                createdFromId: args.id,
                isReversal: true,
                reversesTransactionId: payment.transactionId,
                createdAt: Date.now(),
            });
        }

        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const getPayrollSummary = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let payments = await ctx.db.query("payments").collect();
        payments = payments.filter((p) => !p.deletedAt && p.status === "completed");

        const now = Date.now();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const startDate = args.startDate ?? startOfMonth.getTime();
        const endDate = args.endDate ?? now;

        if (payments.some((p) => p.paidAt)) {
            payments = payments.filter(
                (p) => p.paidAt && p.paidAt >= startDate && p.paidAt <= endDate
            );
        }

        const totalCents = payments.reduce((sum, p) => sum + p.amountCents, 0);
        const byCategory: Record<string, number> = {};
        const byPayee: Record<string, number> = {};

        for (const p of payments) {
            byCategory[p.category] = (byCategory[p.category] || 0) + p.amountCents;
            byPayee[p.payeeName] = (byPayee[p.payeeName] || 0) + p.amountCents;
        }

        return {
            totalCents,
            count: payments.length,
            byCategory,
            byPayee,
        };
    },
});

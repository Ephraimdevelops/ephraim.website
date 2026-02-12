import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// INVOICES - Income Tracking & CFO Module
// ═══════════════════════════════════════════════════════════════

const invoiceItemValidator = v.object({
    description: v.string(),
    quantity: v.number(),
    unitPrice: v.number(),
    amount: v.number(),
});

export const list = query({
    args: {
        status: v.optional(
            v.union(
                v.literal("draft"),
                v.literal("sent"),
                v.literal("viewed"),
                v.literal("paid"),
                v.literal("overdue"),
                v.literal("cancelled")
            )
        ),
        clientId: v.optional(v.id("clients")),
    },
    handler: async (ctx, args) => {
        if (args.clientId) {
            return await ctx.db
                .query("invoices")
                .withIndex("by_client", (q) => q.eq("clientId", args.clientId!))
                .order("desc")
                .collect();
        }
        if (args.status) {
            return await ctx.db
                .query("invoices")
                .withIndex("by_status", (q) => q.eq("status", args.status!))
                .order("desc")
                .collect();
        }
        return await ctx.db.query("invoices").order("desc").collect();
    },
});

export const getById = query({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const getPublicInvoice = query({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        const invoice = await ctx.db.get(args.id);
        if (!invoice) return null;

        const client = await ctx.db.get(invoice.clientId);
        const settings = await ctx.db.query("taxSettings").first();

        return {
            invoice,
            client,
            settings
        };
    },
});

export const getByInvoiceNumber = query({
    args: { invoiceNumber: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db
            .query("invoices")
            .withIndex("by_invoice_number", (q) =>
                q.eq("invoiceNumber", args.invoiceNumber)
            )
            .first();
    },
});

export const create = mutation({
    args: {
        clientId: v.id("clients"),
        projectId: v.optional(v.id("projects")),
        items: v.array(invoiceItemValidator),
        taxRate: v.number(),
        currency: v.string(),
        dueAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Calculate totals
        const subtotal = args.items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = Math.round(subtotal * args.taxRate * 100) / 100;
        const total = subtotal + taxAmount;

        // Generate invoice number
        const allInvoices = await ctx.db.query("invoices").collect();
        const year = new Date().getFullYear();
        const sequence = allInvoices.length + 1;
        const invoiceNumber = `INV-${year}-${String(sequence).padStart(4, "0")}`;

        const now = Date.now();

        return await ctx.db.insert("invoices", {
            clientId: args.clientId,
            projectId: args.projectId,
            invoiceNumber,
            items: args.items,
            subtotal,
            taxRate: args.taxRate,
            taxAmount,
            total,
            currency: args.currency,
            status: "draft",
            dueAt: args.dueAt,
            createdAt: now,
            updatedAt: now,
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("invoices"),
        items: v.optional(v.array(invoiceItemValidator)),
        taxRate: v.optional(v.number()),
        currency: v.optional(v.string()),
        dueAt: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const invoice = await ctx.db.get(args.id);
        if (!invoice) {
            throw new Error("Invoice not found");
        }

        const items = args.items || invoice.items;
        const taxRate = args.taxRate ?? invoice.taxRate;

        // Recalculate totals
        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const taxAmount = Math.round(subtotal * taxRate * 100) / 100;
        const total = subtotal + taxAmount;

        await ctx.db.patch(args.id, {
            items,
            taxRate,
            subtotal,
            taxAmount,
            total,
            currency: args.currency,
            dueAt: args.dueAt,
            updatedAt: Date.now(),
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("invoices"),
        status: v.union(
            v.literal("draft"),
            v.literal("sent"),
            v.literal("viewed"),
            v.literal("paid"),
            v.literal("overdue"),
            v.literal("cancelled")
        ),
    },
    handler: async (ctx, args) => {
        const updates: Record<string, unknown> = {
            status: args.status,
            updatedAt: Date.now(),
        };

        if (args.status === "sent") {
            updates.issuedAt = Date.now();
        }
        if (args.status === "paid") {
            updates.paidAt = Date.now();
        }

        await ctx.db.patch(args.id, updates);
    },
});

export const markAsPaid = mutation({
    args: {
        id: v.id("invoices"),
        stripePaymentId: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "paid",
            paidAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const remove = mutation({
    args: { id: v.id("invoices") },
    handler: async (ctx, args) => {
        await ctx.db.delete(args.id);
    },
});

// ═══════════════════════════════════════════════════════════════
// FINANCIAL ANALYTICS - The Profit Dial
// ═══════════════════════════════════════════════════════════════

export const getFinancialStats = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        const invoices = await ctx.db.query("invoices").collect();
        const expenses = await ctx.db.query("expenses").collect();

        const now = Date.now();
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);
        const startDate = args.startDate || startOfMonth.getTime();
        const endDate = args.endDate || now;

        // Filter by date range
        const filteredInvoices = invoices.filter(
            (inv) =>
                inv.paidAt && inv.paidAt >= startDate && inv.paidAt <= endDate
        );
        const filteredExpenses = expenses.filter(
            (exp) => exp.date >= startDate && exp.date <= endDate
        );

        // Calculate totals
        const totalRevenue = filteredInvoices.reduce(
            (sum, inv) => sum + inv.total,
            0
        );
        const totalExpenses = filteredExpenses.reduce(
            (sum, exp) => sum + exp.amount,
            0
        );
        const netProfit = totalRevenue - totalExpenses;
        const profitMargin =
            totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

        // Outstanding invoices
        const outstanding = invoices
            .filter((inv) => inv.status === "sent" || inv.status === "overdue")
            .reduce((sum, inv) => sum + inv.total, 0);

        // Overdue invoices
        const overdue = invoices.filter(
            (inv) => inv.status === "overdue" || (inv.dueAt && inv.dueAt < now && inv.status !== "paid")
        );

        return {
            totalRevenue,
            totalExpenses,
            netProfit,
            profitMargin,
            outstanding,
            overdueCount: overdue.length,
            overdueAmount: overdue.reduce((sum, inv) => sum + inv.total, 0),
            invoiceCount: filteredInvoices.length,
        };
    },
});

export const getTaxEstimate = query({
    args: {},
    handler: async (ctx) => {
        // Get tax settings
        const taxSettings = await ctx.db.query("taxSettings").first();
        const taxRate = taxSettings?.defaultTaxRate || 0.3; // Default 30%

        // Calculate year-to-date income
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);

        const invoices = await ctx.db.query("invoices").collect();
        const expenses = await ctx.db.query("expenses").collect();

        const ytdRevenue = invoices
            .filter((inv) => inv.paidAt && inv.paidAt >= startOfYear.getTime())
            .reduce((sum, inv) => sum + inv.total, 0);

        const ytdDeductibleExpenses = expenses
            .filter((exp) => exp.date >= startOfYear.getTime() && exp.isTaxDeductible)
            .reduce((sum, exp) => sum + exp.amount, 0);

        const taxableIncome = ytdRevenue - ytdDeductibleExpenses;
        const estimatedTax = Math.max(0, Math.round(taxableIncome * taxRate));

        return {
            ytdRevenue,
            ytdDeductibleExpenses,
            taxableIncome,
            taxRate,
            estimatedTax,
        };
    },
});

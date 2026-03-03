import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// TIME ENTRIES — Billable Hours Tracking
// KEY FEATURES:
// 1. billRateAtTimeCents freezes rate at log time (rate changes don't affect past)
// 2. invoiceId links approved hours to generated invoices
// 3. "Generate Invoice from Hours" mutation lives here
// ═══════════════════════════════════════════════════════════════

const timeStatusValidator = v.union(
    v.literal("logged"),
    v.literal("approved"),
    v.literal("invoiced")
);

export const list = query({
    args: {
        employeeId: v.optional(v.id("employees")),
        projectId: v.optional(v.id("projects")),
        status: v.optional(timeStatusValidator),
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let entries = await ctx.db.query("timeEntries").order("desc").collect();
        entries = entries.filter((e) => !e.deletedAt);

        if (args.employeeId) entries = entries.filter((e) => e.employeeId === args.employeeId);
        if (args.projectId) entries = entries.filter((e) => e.projectId === args.projectId);
        if (args.status) entries = entries.filter((e) => e.status === args.status);
        if (args.startDate) entries = entries.filter((e) => e.date >= args.startDate!);
        if (args.endDate) entries = entries.filter((e) => e.date <= args.endDate!);

        // Enrich with employee name
        return Promise.all(
            entries.map(async (entry) => {
                const emp = await ctx.db.get(entry.employeeId);
                return { ...entry, employeeName: emp?.name || "Unknown" };
            })
        );
    },
});

export const getById = query({
    args: { id: v.id("timeEntries") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

// Log time — automatically freezes bill rate from employee's current rate
export const logTime = mutation({
    args: {
        employeeId: v.id("employees"),
        taskId: v.optional(v.id("tasks")),
        projectId: v.optional(v.id("projects")),
        description: v.string(),
        hours: v.number(),
        date: v.number(),
        billable: v.boolean(),
    },
    handler: async (ctx, args) => {
        // Freeze the bill rate at log time
        let billRateAtTimeCents: number | undefined = undefined;
        if (args.billable) {
            const employee = await ctx.db.get(args.employeeId);
            if (!employee) throw new Error("Employee not found");
            billRateAtTimeCents = employee.defaultBillRateCents;
            if (!billRateAtTimeCents) {
                throw new Error(`Employee ${employee.name} has no bill rate set. Set a default bill rate first.`);
            }
        }

        return await ctx.db.insert("timeEntries", {
            ...args,
            billRateAtTimeCents,
            status: "logged",
            createdAt: Date.now(),
        });
    },
});

export const approve = mutation({
    args: { id: v.id("timeEntries") },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.id);
        if (!entry) throw new Error("Time entry not found");
        if (entry.status !== "logged") throw new Error("Only logged entries can be approved");

        await ctx.db.patch(args.id, { status: "approved" });
    },
});

export const bulkApprove = mutation({
    args: { ids: v.array(v.id("timeEntries")) },
    handler: async (ctx, args) => {
        let approved = 0;
        for (const id of args.ids) {
            const entry = await ctx.db.get(id);
            if (entry && entry.status === "logged" && !entry.deletedAt) {
                await ctx.db.patch(id, { status: "approved" });
                approved++;
            }
        }
        return { approved };
    },
});

export const remove = mutation({
    args: { id: v.id("timeEntries") },
    handler: async (ctx, args) => {
        const entry = await ctx.db.get(args.id);
        if (!entry) throw new Error("Time entry not found");
        if (entry.status === "invoiced") throw new Error("Cannot delete invoiced time entries");
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// ═══════════════════════════════════════════════════════════════
// 🔑 THE KILLER FEATURE: Generate Invoice from Billable Hours
// Grabs approved billable entries for a project/client,
// creates invoice line items, links back, marks as "invoiced"
// ═══════════════════════════════════════════════════════════════

export const generateInvoiceFromHours = mutation({
    args: {
        projectId: v.optional(v.id("projects")),
        clientId: v.id("clients"),
        currency: v.string(),
        invoiceNumber: v.string(),
        dueInDays: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // 1. Find all approved billable entries
        let entries = await ctx.db
            .query("timeEntries")
            .withIndex("by_status", (q) => q.eq("status", "approved"))
            .collect();

        entries = entries.filter(
            (e) =>
                !e.deletedAt &&
                e.billable &&
                e.billRateAtTimeCents &&
                (!args.projectId || e.projectId === args.projectId)
        );

        if (entries.length === 0) {
            throw new Error("No approved billable hours found for this project/client");
        }

        // 2. Build invoice items (must match schema: description, quantity, unitPrice, amount)
        const items = entries.map((entry) => {
            const totalCents = Math.round(entry.hours * (entry.billRateAtTimeCents || 0));
            return {
                description: `${entry.description} (${entry.hours}h @ ${((entry.billRateAtTimeCents || 0) / 100).toFixed(2)}/hr)`,
                quantity: entry.hours,
                unitPrice: totalCents / 100, // Convert to dollars for invoice
                amount: totalCents / 100,
            };
        });

        const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
        const now = Date.now();
        const dueAt = now + (args.dueInDays || 30) * 24 * 60 * 60 * 1000;

        // 3. Create the invoice
        const invoiceId = await ctx.db.insert("invoices", {
            clientId: args.clientId,
            projectId: args.projectId,
            invoiceNumber: args.invoiceNumber,
            status: "draft",
            items,
            subtotal,
            taxRate: 0,
            taxAmount: 0,
            total: subtotal,
            currency: args.currency,
            issuedAt: now,
            dueAt,
            createdAt: now,
            updatedAt: now,
        });

        // 4. Mark all entries as "invoiced" and link to invoice
        for (const entry of entries) {
            await ctx.db.patch(entry._id, {
                status: "invoiced",
                invoiceId,
            });
        }

        return {
            invoiceId,
            hoursTotal: entries.reduce((sum, e) => sum + e.hours, 0),
            entriesProcessed: entries.length,
            subtotal,
        };
    },
});

// ═══════════════════════════════════════════════════════════════
// TIME ENTRY STATS
// ═══════════════════════════════════════════════════════════════

export const getStats = query({
    args: {
        startDate: v.optional(v.number()),
        endDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        let entries = await ctx.db.query("timeEntries").collect();
        entries = entries.filter((e) => !e.deletedAt);

        if (args.startDate) entries = entries.filter((e) => e.date >= args.startDate!);
        if (args.endDate) entries = entries.filter((e) => e.date <= args.endDate!);

        const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
        const billableHours = entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0);
        const nonBillableHours = totalHours - billableHours;

        const billableRevenueCents = entries
            .filter((e) => e.billable && e.billRateAtTimeCents)
            .reduce((sum, e) => sum + Math.round(e.hours * (e.billRateAtTimeCents || 0)), 0);

        const uninvoicedCents = entries
            .filter((e) => e.billable && e.status === "approved" && e.billRateAtTimeCents)
            .reduce((sum, e) => sum + Math.round(e.hours * (e.billRateAtTimeCents || 0)), 0);

        return {
            totalHours,
            billableHours,
            nonBillableHours,
            billablePercentage: totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0,
            billableRevenueCents,
            uninvoicedCents,
            byStatus: {
                logged: entries.filter((e) => e.status === "logged").length,
                approved: entries.filter((e) => e.status === "approved").length,
                invoiced: entries.filter((e) => e.status === "invoiced").length,
            },
        };
    },
});

// Weekly report — hours per day
export const getWeeklyReport = query({
    args: {
        employeeId: v.optional(v.id("employees")),
        weekStartDate: v.number(), // Monday timestamp
    },
    handler: async (ctx, args) => {
        const weekEnd = args.weekStartDate + 7 * 24 * 60 * 60 * 1000;

        let entries = await ctx.db.query("timeEntries").collect();
        entries = entries.filter(
            (e) =>
                !e.deletedAt &&
                e.date >= args.weekStartDate &&
                e.date < weekEnd &&
                (!args.employeeId || e.employeeId === args.employeeId)
        );

        const days = Array.from({ length: 7 }, (_, i) => {
            const dayStart = args.weekStartDate + i * 24 * 60 * 60 * 1000;
            const dayEnd = dayStart + 24 * 60 * 60 * 1000;
            const dayEntries = entries.filter((e) => e.date >= dayStart && e.date < dayEnd);

            return {
                date: dayStart,
                dayName: new Date(dayStart).toLocaleDateString("en-US", { weekday: "short" }),
                totalHours: dayEntries.reduce((sum, e) => sum + e.hours, 0),
                billableHours: dayEntries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0),
                entries: dayEntries.length,
            };
        });

        return {
            days,
            totalHours: entries.reduce((sum, e) => sum + e.hours, 0),
            billableHours: entries.filter((e) => e.billable).reduce((sum, e) => sum + e.hours, 0),
        };
    },
});

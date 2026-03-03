import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// EMPLOYEES — Minimal v1 (Revenue-focused)
// Supports: bill rates, departments, simple hierarchy
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        status: v.optional(v.union(
            v.literal("active"),
            v.literal("probation"),
            v.literal("on_leave"),
            v.literal("terminated")
        )),
        department: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        let employees = await ctx.db.query("employees").order("desc").collect();
        employees = employees.filter((e) => !e.deletedAt);

        if (args.status) {
            employees = employees.filter((e) => e.status === args.status);
        }
        if (args.department) {
            employees = employees.filter((e) => e.department === args.department);
        }

        return employees;
    },
});

export const getById = query({
    args: { id: v.id("employees") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        role: v.string(),
        title: v.optional(v.string()),
        department: v.optional(v.string()),
        employmentType: v.union(
            v.literal("full_time"),
            v.literal("part_time"),
            v.literal("contract")
        ),
        startDate: v.number(),
        salaryCents: v.optional(v.number()),
        currency: v.optional(v.string()),
        payFrequency: v.optional(v.union(
            v.literal("weekly"),
            v.literal("biweekly"),
            v.literal("monthly")
        )),
        defaultBillRateCents: v.optional(v.number()),
        managerId: v.optional(v.id("employees")),
    },
    handler: async (ctx, args) => {
        // Check for duplicate email
        const existing = await ctx.db
            .query("employees")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();
        if (existing && !existing.deletedAt) {
            throw new Error(`Employee with email ${args.email} already exists`);
        }

        return await ctx.db.insert("employees", {
            ...args,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("employees"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        avatarUrl: v.optional(v.string()),
        role: v.optional(v.string()),
        title: v.optional(v.string()),
        department: v.optional(v.string()),
        employmentType: v.optional(v.union(
            v.literal("full_time"),
            v.literal("part_time"),
            v.literal("contract")
        )),
        salaryCents: v.optional(v.number()),
        currency: v.optional(v.string()),
        payFrequency: v.optional(v.union(
            v.literal("weekly"),
            v.literal("biweekly"),
            v.literal("monthly")
        )),
        defaultBillRateCents: v.optional(v.number()),
        managerId: v.optional(v.id("employees")),
        status: v.optional(v.union(
            v.literal("active"),
            v.literal("probation"),
            v.literal("on_leave"),
            v.literal("terminated")
        )),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("employees") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// ── Quick Stats ──────────────────────────────────────────────
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const employees = await ctx.db.query("employees").collect();
        const active = employees.filter((e) => !e.deletedAt);

        return {
            total: active.length,
            byStatus: {
                active: active.filter((e) => e.status === "active").length,
                probation: active.filter((e) => e.status === "probation").length,
                onLeave: active.filter((e) => e.status === "on_leave").length,
                terminated: active.filter((e) => e.status === "terminated").length,
            },
            byType: {
                fullTime: active.filter((e) => e.employmentType === "full_time").length,
                partTime: active.filter((e) => e.employmentType === "part_time").length,
                contract: active.filter((e) => e.employmentType === "contract").length,
            },
            monthlySalaryCents: active
                .filter((e) => e.status === "active" && e.salaryCents)
                .reduce((sum, e) => sum + (e.salaryCents || 0), 0),
        };
    },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// VENDORS — External Payees (Contractors, Freelancers, Vendors)
// ═══════════════════════════════════════════════════════════════

export const list = query({
    args: {
        type: v.optional(v.union(
            v.literal("contractor"),
            v.literal("vendor"),
            v.literal("freelancer")
        )),
        status: v.optional(v.union(
            v.literal("active"),
            v.literal("inactive")
        )),
    },
    handler: async (ctx, args) => {
        let vendors = await ctx.db.query("vendors").order("desc").collect();

        vendors = vendors.filter((v) => !v.deletedAt);

        if (args.type) {
            vendors = vendors.filter((v) => v.type === args.type);
        }
        if (args.status) {
            vendors = vendors.filter((v) => v.status === args.status);
        }

        return vendors;
    },
});

export const getById = query({
    args: { id: v.id("vendors") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        name: v.string(),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        type: v.union(
            v.literal("contractor"),
            v.literal("vendor"),
            v.literal("freelancer")
        ),
        bankName: v.optional(v.string()),
        accountNumber: v.optional(v.string()),
        mobileMoneyProvider: v.optional(v.union(
            v.literal("mpesa"),
            v.literal("tigo_pesa"),
            v.literal("airtel_money")
        )),
        mobileMoneyNumber: v.optional(v.string()),
        taxId: v.optional(v.string()),
        notes: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("vendors", {
            ...args,
            status: "active",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("vendors"),
        name: v.optional(v.string()),
        email: v.optional(v.string()),
        phone: v.optional(v.string()),
        type: v.optional(v.union(
            v.literal("contractor"),
            v.literal("vendor"),
            v.literal("freelancer")
        )),
        bankName: v.optional(v.string()),
        accountNumber: v.optional(v.string()),
        mobileMoneyProvider: v.optional(v.union(
            v.literal("mpesa"),
            v.literal("tigo_pesa"),
            v.literal("airtel_money")
        )),
        mobileMoneyNumber: v.optional(v.string()),
        taxId: v.optional(v.string()),
        notes: v.optional(v.string()),
        status: v.optional(v.union(v.literal("active"), v.literal("inactive"))),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("vendors") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

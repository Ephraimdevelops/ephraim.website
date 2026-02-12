import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// SETTINGS - Business Profile & Configuration
// ═══════════════════════════════════════════════════════════════

export const get = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("taxSettings").first();
        return settings;
    },
});

export const update = mutation({
    args: {
        businessName: v.optional(v.string()),
        businessAddress: v.optional(v.string()),
        taxIdNumber: v.optional(v.string()),
        logo: v.optional(v.id("_storage")),
        primaryColor: v.optional(v.string()),
        secondaryColor: v.optional(v.string()),
        invoiceFooterText: v.optional(v.string()),
        defaultTaxRate: v.optional(v.number()),
        currency: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("taxSettings").first();

        const data = {
            ...args,
            updatedAt: Date.now(),
        };

        if (existing) {
            await ctx.db.patch(existing._id, data);
        } else {
            // Get current user for userId reference (required by schema)
            const identity = await ctx.auth.getUserIdentity();
            if (!identity) throw new Error("Unauthenticated");

            const user = await ctx.db
                .query("users")
                .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
                .first();

            if (!user) throw new Error("User not found");

            await ctx.db.insert("taxSettings", {
                userId: user._id,
                defaultTaxRate: args.defaultTaxRate || 0,
                fiscalYearStart: "01-01",
                currency: args.currency || "USD",
                ...data,
            });
        }
    },
});

export const generateUploadUrl = mutation(async (ctx) => {
    return await ctx.storage.generateUploadUrl();
});

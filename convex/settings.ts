import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// BRAND DNA — Business Identity & Configuration
// ═══════════════════════════════════════════════════════════════

export const get = query({
    args: {},
    handler: async (ctx) => {
        const settings = await ctx.db.query("taxSettings").first();
        if (!settings) return null;

        // Resolve logo URL for sidebar, invoices, etc.
        let logoUrl: string | null = null;
        if (settings.logo) {
            logoUrl = await ctx.storage.getUrl(settings.logo);
        }

        return { ...settings, logoUrl };
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
        accentColor: v.optional(v.string()),
        tagline: v.optional(v.string()),
        phone: v.optional(v.string()),
        website: v.optional(v.string()),
        socialLinks: v.optional(v.string()),
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

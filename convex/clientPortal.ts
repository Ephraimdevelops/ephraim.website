import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// CLIENT PORTAL — Approval Room
// Public queries authenticated via magic link token
// No Clerk auth required — clients access via ?token=xxx
// ═══════════════════════════════════════════════════════════════

export const getPortalData = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        // Validate magic link token
        const clients = await ctx.db
            .query("clients")
            .withIndex("by_magic_token", (q) => q.eq("magicLinkToken", args.token))
            .collect();

        const client = clients[0];
        if (!client) return null;

        // Check expiry
        if (client.magicLinkExpiresAt && client.magicLinkExpiresAt < Date.now()) {
            return { expired: true, client: { name: client.name } };
        }

        // Get brand settings for portal theming
        const settings = await ctx.db.query("taxSettings").first();
        let logoUrl: string | null = null;
        if (settings?.logo) {
            logoUrl = await ctx.storage.getUrl(settings.logo);
        }

        // Get their projects
        const allProjects = await ctx.db.query("projects").collect();
        const projects = allProjects
            .filter((p) => p.clientId === client._id && !p.deletedAt)
            .map((p) => ({
                _id: p._id,
                title: p.title,
                status: p.status,
                progress: p.progress,
                startDate: p.startDate,
                dueDate: p.dueDate,
                description: p.description,
            }));

        // Get feedback for all client projects
        const allFeedback = await ctx.db.query("projectFeedback").collect();
        const feedbackByProject: Record<string, any[]> = {};
        for (const fb of allFeedback) {
            const pid = fb.projectId as string;
            if (projects.some((p) => p._id === pid)) {
                if (!feedbackByProject[pid]) feedbackByProject[pid] = [];
                feedbackByProject[pid].push({
                    _id: fb._id,
                    type: fb.type,
                    authorType: fb.authorType,
                    authorName: fb.authorName,
                    section: fb.section,
                    description: fb.description,
                    status: fb.status,
                    createdAt: fb.createdAt,
                });
            }
        }

        // Get their invoices
        const allInvoices = await ctx.db.query("invoices").collect();
        const invoices = allInvoices
            .filter((inv) => inv.clientId === client._id && !inv.deletedAt)
            .map((inv) => ({
                _id: inv._id,
                invoiceNumber: inv.invoiceNumber,
                total: inv.total,
                currency: inv.currency,
                status: inv.status,
                issuedAt: inv.issuedAt,
                dueAt: inv.dueAt,
                paidAt: inv.paidAt,
            }));

        // Get their contracts
        const allContracts = await ctx.db.query("contracts").collect();
        const contracts = allContracts
            .filter((c) => c.clientId === client._id && !c.deletedAt)
            .map((c) => ({
                _id: c._id,
                title: c.title,
                status: c.status,
                sentAt: c.sentAt,
                signedAt: c.signedAt,
            }));

        return {
            expired: false,
            client: {
                name: client.name,
                company: client.company,
                avatarUrl: client.avatarUrl,
            },
            brand: {
                name: settings?.businessName || "Ephraim OS",
                logoUrl,
                primaryColor: settings?.primaryColor || "#1A1F36",
                secondaryColor: settings?.secondaryColor || "#3259A8",
                accentColor: settings?.accentColor || "#C9A84C",
                tagline: settings?.tagline || "",
            },
            projects,
            feedbackByProject,
            invoices,
            contracts,
            stats: {
                activeProjects: projects.filter((p) => p.status !== "completed" && p.status !== "archived").length,
                totalInvoiced: invoices.reduce((sum, inv) => sum + inv.total, 0),
                pendingInvoices: invoices.filter((inv) => inv.status === "sent" || inv.status === "overdue").length,
                pendingContracts: contracts.filter((c) => c.status === "sent" || c.status === "viewed").length,
            },
        };
    },
});

// Submit feedback from client portal (approval or revision request)
export const submitFeedback = mutation({
    args: {
        token: v.string(),
        projectId: v.id("projects"),
        type: v.union(v.literal("approval"), v.literal("revision")),
        section: v.optional(v.string()),
        description: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Validate token
        const clients = await ctx.db
            .query("clients")
            .withIndex("by_magic_token", (q) => q.eq("magicLinkToken", args.token))
            .collect();
        const client = clients[0];
        if (!client) throw new Error("Invalid portal access");
        if (client.magicLinkExpiresAt && client.magicLinkExpiresAt < Date.now()) {
            throw new Error("Portal link expired");
        }

        return await ctx.db.insert("projectFeedback", {
            projectId: args.projectId,
            type: args.type,
            authorType: "client",
            authorName: client.name,
            authorEmail: client.email,
            section: args.section,
            description: args.description,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

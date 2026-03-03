import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// LEAVE REQUESTS — PTO with Approval Workflow
// ═══════════════════════════════════════════════════════════════

const leaveTypeValidator = v.union(
    v.literal("vacation"),
    v.literal("sick"),
    v.literal("personal")
);

const leaveStatusValidator = v.union(
    v.literal("pending"),
    v.literal("approved"),
    v.literal("rejected")
);

export const list = query({
    args: {
        employeeId: v.optional(v.id("employees")),
        status: v.optional(leaveStatusValidator),
    },
    handler: async (ctx, args) => {
        let requests = await ctx.db.query("leaveRequests").order("desc").collect();
        requests = requests.filter((r) => !r.deletedAt);

        if (args.employeeId) requests = requests.filter((r) => r.employeeId === args.employeeId);
        if (args.status) requests = requests.filter((r) => r.status === args.status);

        // Enrich with employee name
        return Promise.all(
            requests.map(async (req) => {
                const emp = await ctx.db.get(req.employeeId);
                let approverName;
                if (req.approvedById) {
                    const approver = await ctx.db.get(req.approvedById);
                    approverName = approver?.name;
                }
                return { ...req, employeeName: emp?.name || "Unknown", approverName };
            })
        );
    },
});

export const create = mutation({
    args: {
        employeeId: v.id("employees"),
        type: leaveTypeValidator,
        startDate: v.number(),
        endDate: v.number(),
        reason: v.optional(v.string()),
    },
    handler: async (ctx, args) => {
        // Calculate total days
        const msPerDay = 24 * 60 * 60 * 1000;
        const totalDays = Math.ceil((args.endDate - args.startDate) / msPerDay) + 1;

        if (totalDays <= 0) throw new Error("End date must be after start date");

        return await ctx.db.insert("leaveRequests", {
            ...args,
            totalDays,
            status: "pending",
            createdAt: Date.now(),
        });
    },
});

export const approve = mutation({
    args: {
        id: v.id("leaveRequests"),
        approvedById: v.id("employees"),
    },
    handler: async (ctx, args) => {
        const request = await ctx.db.get(args.id);
        if (!request) throw new Error("Leave request not found");
        if (request.status !== "pending") throw new Error("Can only approve pending requests");

        await ctx.db.patch(args.id, {
            status: "approved",
            approvedById: args.approvedById,
        });

        // Update employee status if leave starts today or is in the past
        if (request.startDate <= Date.now()) {
            await ctx.db.patch(request.employeeId, {
                status: "on_leave",
                updatedAt: Date.now(),
            });
        }
    },
});

export const reject = mutation({
    args: {
        id: v.id("leaveRequests"),
        approvedById: v.id("employees"),
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: "rejected",
            approvedById: args.approvedById,
        });
    },
});

export const remove = mutation({
    args: { id: v.id("leaveRequests") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// Leave balance summary
export const getBalances = query({
    args: { employeeId: v.id("employees") },
    handler: async (ctx, args) => {
        const requests = await ctx.db
            .query("leaveRequests")
            .withIndex("by_employee", (q) => q.eq("employeeId", args.employeeId))
            .collect();

        const approved = requests.filter((r) => !r.deletedAt && r.status === "approved");

        // Calculate days used this year
        const startOfYear = new Date(new Date().getFullYear(), 0, 1).getTime();
        const thisYear = approved.filter((r) => r.startDate >= startOfYear);

        return {
            vacationUsed: thisYear.filter((r) => r.type === "vacation").reduce((sum, r) => sum + r.totalDays, 0),
            sickUsed: thisYear.filter((r) => r.type === "sick").reduce((sum, r) => sum + r.totalDays, 0),
            personalUsed: thisYear.filter((r) => r.type === "personal").reduce((sum, r) => sum + r.totalDays, 0),
            totalUsed: thisYear.reduce((sum, r) => sum + r.totalDays, 0),
            pendingRequests: requests.filter((r) => !r.deletedAt && r.status === "pending").length,
        };
    },
});

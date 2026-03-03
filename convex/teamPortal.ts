import { v } from "convex/values";
import { query, mutation } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// TEAM PORTAL — Employee access via magic link
// ═══════════════════════════════════════════════════════════════

export const getTeamPortalData = query({
    args: { token: v.string() },
    handler: async (ctx, args) => {
        if (!args.token) return null;

        // Find employee by token
        const employees = await ctx.db.query("employees").collect();
        const employee = employees.find((e) => e.magicLinkToken === args.token && !e.deletedAt);
        if (!employee) return null;

        // Check expiry
        if (employee.magicLinkExpiresAt && employee.magicLinkExpiresAt < Date.now()) {
            return { expired: true, employee: { name: employee.name } };
        }

        // Brand settings
        const settings = await ctx.db.query("taxSettings").first();
        let logoUrl: string | null = null;
        if (settings?.logo) {
            logoUrl = await ctx.storage.getUrl(settings.logo);
        }

        // Assigned tasks
        const allTasks = await ctx.db.query("tasks").collect();
        const myTasks = allTasks
            .filter((t) => t.assigneeId === employee._id && !t.deletedAt)
            .map((t) => ({
                _id: t._id,
                title: t.title,
                status: t.status,
                dueDate: t.dueDate,
                projectId: t.projectId,
            }));

        // Get project names for tasks
        const projectIds = [...new Set(myTasks.map((t) => t.projectId).filter(Boolean))];
        const projectNames: Record<string, string> = {};
        for (const pid of projectIds) {
            if (pid) {
                const project = await ctx.db.get(pid);
                if (project) projectNames[pid as string] = (project as any).title;
            }
        }

        // Time entries
        const allTime = await ctx.db.query("timeEntries").collect();
        const myTime = allTime
            .filter((t) => t.employeeId === employee._id)
            .sort((a, b) => b.date - a.date)
            .slice(0, 20)
            .map((t) => ({
                _id: t._id,
                date: t.date,
                hours: t.hours,
                description: t.description,
                billable: t.billable,
            }));

        // Leave balance
        const allLeave = await ctx.db.query("leaveRequests").collect();
        const myLeave = allLeave
            .filter((l) => l.employeeId === employee._id)
            .map((l) => ({
                _id: l._id,
                type: l.type,
                startDate: l.startDate,
                endDate: l.endDate,
                status: l.status,
                totalDays: l.totalDays,
            }));

        const usedLeaveDays = myLeave.filter((l) => l.status === "approved").reduce((sum, l) => sum + (l.totalDays || 0), 0);

        return {
            expired: false,
            employee: {
                name: employee.name,
                role: employee.role,
                email: employee.email,
            },
            brand: {
                name: settings?.businessName || "Ephraim OS",
                logoUrl,
                primaryColor: settings?.primaryColor || "#1A1F36",
                secondaryColor: settings?.secondaryColor || "#3259A8",
                accentColor: settings?.accentColor || "#C9A84C",
            },
            tasks: myTasks,
            projectNames,
            recentTime: myTime,
            leave: myLeave,
            stats: {
                totalTasks: myTasks.length,
                activeTasks: myTasks.filter((t) => t.status !== "done").length,
                hoursThisWeek: myTime
                    .filter((t) => t.date > Date.now() - 7 * 24 * 60 * 60 * 1000)
                    .reduce((sum, t) => sum + t.hours, 0),
                leaveBalance: Math.max(0, 21 - usedLeaveDays), // Assume 21 days/year
            },
        };
    },
});

// Update task status from team portal
export const updateTaskStatus = mutation({
    args: {
        token: v.string(),
        taskId: v.id("tasks"),
        status: v.union(v.literal("todo"), v.literal("in_progress"), v.literal("review"), v.literal("done")),
    },
    handler: async (ctx, args) => {
        // Validate token
        const employees = await ctx.db.query("employees").collect();
        const employee = employees.find((e) => e.magicLinkToken === args.token);
        if (!employee) throw new Error("Invalid access");

        await ctx.db.patch(args.taskId, { status: args.status, updatedAt: Date.now() });
    },
});

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// ═══════════════════════════════════════════════════════════════
// TASKS — Simple Kanban Board
// Columns: todo → in_progress → review → done
// ═══════════════════════════════════════════════════════════════

const taskStatusValidator = v.union(
    v.literal("todo"),
    v.literal("in_progress"),
    v.literal("review"),
    v.literal("done")
);

export const list = query({
    args: {
        status: v.optional(taskStatusValidator),
        assigneeId: v.optional(v.id("employees")),
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        let tasks = await ctx.db.query("tasks").order("desc").collect();
        tasks = tasks.filter((t) => !t.deletedAt);

        if (args.status) {
            tasks = tasks.filter((t) => t.status === args.status);
        }
        if (args.assigneeId) {
            tasks = tasks.filter((t) => t.assigneeId === args.assigneeId);
        }
        if (args.projectId) {
            tasks = tasks.filter((t) => t.projectId === args.projectId);
        }

        return tasks;
    },
});

// Kanban board — grouped by status
export const getKanban = query({
    args: {
        projectId: v.optional(v.id("projects")),
    },
    handler: async (ctx, args) => {
        let tasks = await ctx.db.query("tasks").collect();
        tasks = tasks.filter((t) => !t.deletedAt);

        if (args.projectId) {
            tasks = tasks.filter((t) => t.projectId === args.projectId);
        }

        // Enrich with employee names
        const enriched = await Promise.all(
            tasks.map(async (task) => {
                let assigneeName = undefined;
                if (task.assigneeId) {
                    const emp = await ctx.db.get(task.assigneeId);
                    assigneeName = emp?.name;
                }
                return { ...task, assigneeName };
            })
        );

        return {
            todo: enriched.filter((t) => t.status === "todo"),
            in_progress: enriched.filter((t) => t.status === "in_progress"),
            review: enriched.filter((t) => t.status === "review"),
            done: enriched.filter((t) => t.status === "done"),
        };
    },
});

export const getById = query({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    },
});

export const create = mutation({
    args: {
        title: v.string(),
        assigneeId: v.optional(v.id("employees")),
        projectId: v.optional(v.id("projects")),
        clientId: v.optional(v.id("clients")),
        estimatedHours: v.optional(v.number()),
        dueDate: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        return await ctx.db.insert("tasks", {
            ...args,
            status: "todo",
            createdAt: Date.now(),
            updatedAt: Date.now(),
        });
    },
});

export const updateStatus = mutation({
    args: {
        id: v.id("tasks"),
        status: taskStatusValidator,
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            status: args.status,
            updatedAt: Date.now(),
        });
    },
});

export const update = mutation({
    args: {
        id: v.id("tasks"),
        title: v.optional(v.string()),
        assigneeId: v.optional(v.id("employees")),
        projectId: v.optional(v.id("projects")),
        clientId: v.optional(v.id("clients")),
        estimatedHours: v.optional(v.number()),
        dueDate: v.optional(v.number()),
        status: v.optional(taskStatusValidator),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        await ctx.db.patch(id, { ...updates, updatedAt: Date.now() });
    },
});

export const remove = mutation({
    args: { id: v.id("tasks") },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { deletedAt: Date.now() });
    },
});

// ── Stats ────────────────────────────────────────────────────
export const getStats = query({
    args: {},
    handler: async (ctx) => {
        const tasks = await ctx.db.query("tasks").collect();
        const active = tasks.filter((t) => !t.deletedAt);

        return {
            total: active.length,
            todo: active.filter((t) => t.status === "todo").length,
            inProgress: active.filter((t) => t.status === "in_progress").length,
            review: active.filter((t) => t.status === "review").length,
            done: active.filter((t) => t.status === "done").length,
            overdue: active.filter(
                (t) => t.dueDate && t.dueDate < Date.now() && t.status !== "done"
            ).length,
        };
    },
});

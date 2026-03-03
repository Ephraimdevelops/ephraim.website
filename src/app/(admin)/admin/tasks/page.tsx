"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    CheckCircle2,
    Clock,
    ListTodo,
    Eye,
    AlertTriangle,
    Trash2,
    ArrowRight,
} from "lucide-react";

const COLUMNS = [
    { key: "todo", label: "To Do", icon: ListTodo, color: "border-white/20" },
    { key: "in_progress", label: "In Progress", icon: Clock, color: "border-blue-500/40" },
    { key: "review", label: "Review", icon: Eye, color: "border-purple-500/40" },
    { key: "done", label: "Done", icon: CheckCircle2, color: "border-emerald-500/40" },
] as const;

type ColumnKey = typeof COLUMNS[number]["key"];

export default function TasksPage() {
    const kanban = useQuery(api.tasks.getKanban, {});
    const stats = useQuery(api.tasks.getStats, {});
    const employees = useQuery(api.employees.list, {});
    const projects = useQuery(api.projects.list, {});

    const createTask = useMutation(api.tasks.create);
    const updateStatus = useMutation(api.tasks.updateStatus);
    const removeTask = useMutation(api.tasks.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleStatusChange = async (id: Id<"tasks">, newStatus: ColumnKey) => {
        try {
            await updateStatus({ id, status: newStatus });
        } catch (e) {
            toast.error("Failed to update task");
        }
    };

    if (!kanban || !stats) {
        return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading tasks...</div>;
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Tasks</h1>
                    <p className="text-white/40 mt-1 font-light">Kanban board — drag tasks through stages.</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Task
                </button>
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-6 text-sm text-white/60">
                <span>Total: <b className="text-white">{stats.total}</b></span>
                <span>In Progress: <b className="text-blue-400">{stats.inProgress}</b></span>
                <span>Review: <b className="text-purple-400">{stats.review}</b></span>
                {stats.overdue > 0 && (
                    <span className="flex items-center gap-1 text-red-400">
                        <AlertTriangle className="w-3.5 h-3.5" /> Overdue: <b>{stats.overdue}</b>
                    </span>
                )}
            </div>

            {/* Kanban Board */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {COLUMNS.map((col) => {
                    const tasks = kanban[col.key] || [];
                    const ColIcon = col.icon;
                    return (
                        <div key={col.key} className={`rounded-2xl border-2 ${col.color} bg-white/[0.02] min-h-[300px]`}>
                            {/* Column Header */}
                            <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <ColIcon className="w-4 h-4 text-white/40" />
                                    <span className="text-sm font-medium text-white/80">{col.label}</span>
                                </div>
                                <span className="text-xs text-white/40 bg-white/5 px-2 py-0.5 rounded-full">{tasks.length}</span>
                            </div>

                            {/* Cards */}
                            <div className="p-3 space-y-2">
                                {tasks.map((task: any) => {
                                    const nextStatus = getNextStatus(col.key);
                                    const prevStatus = getPrevStatus(col.key);
                                    return (
                                        <div key={task._id} className="p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                                            <div className="text-sm text-white font-medium">{task.title}</div>
                                            {task.assigneeName && (
                                                <div className="text-xs text-white/40 mt-1">{task.assigneeName}</div>
                                            )}
                                            {task.estimatedHours && (
                                                <div className="text-xs text-white/30 mt-1">{task.estimatedHours}h estimated</div>
                                            )}
                                            {task.dueDate && task.dueDate < Date.now() && task.status !== "done" && (
                                                <div className="text-[10px] text-red-400 mt-1">⚠ Overdue</div>
                                            )}
                                            {/* Move Actions */}
                                            <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                {prevStatus && (
                                                    <button onClick={() => handleStatusChange(task._id, prevStatus)} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/10">
                                                        ← {COLUMNS.find((c) => c.key === prevStatus)?.label}
                                                    </button>
                                                )}
                                                {nextStatus && (
                                                    <button onClick={() => handleStatusChange(task._id, nextStatus)} className="px-2 py-0.5 bg-white/5 rounded text-[10px] text-white/40 hover:text-white hover:bg-white/10 ml-auto flex items-center gap-1">
                                                        {COLUMNS.find((c) => c.key === nextStatus)?.label} <ArrowRight className="w-2.5 h-2.5" />
                                                    </button>
                                                )}
                                                <button onClick={() => { if (confirm("Delete?")) removeTask({ id: task._id }); }} className="p-1 text-white/20 hover:text-red-400 ml-auto">
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Create Dialog */}
            {isDialogOpen && (
                <TaskDialog
                    employees={employees || []}
                    projects={projects || []}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createTask(data);
                            toast.success("Task created");
                            setIsDialogOpen(false);
                        } catch (e) {
                            toast.error("Failed to create task");
                        }
                    }}
                />
            )}
        </div>
    );
}

function getNextStatus(current: ColumnKey): ColumnKey | null {
    const order: ColumnKey[] = ["todo", "in_progress", "review", "done"];
    const idx = order.indexOf(current);
    return idx < order.length - 1 ? order[idx + 1] : null;
}

function getPrevStatus(current: ColumnKey): ColumnKey | null {
    const order: ColumnKey[] = ["todo", "in_progress", "review", "done"];
    const idx = order.indexOf(current);
    return idx > 0 ? order[idx - 1] : null;
}

function TaskDialog({ employees, projects, onClose, onSubmit }: { employees: any[]; projects: any[]; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ title: "", assigneeId: "", projectId: "", estimatedHours: "", dueDate: "" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.title) { toast.error("Title is required"); return; }
        setLoading(true);
        try {
            await onSubmit({
                title: form.title,
                assigneeId: form.assigneeId ? (form.assigneeId as Id<"employees">) : undefined,
                projectId: form.projectId ? (form.projectId as Id<"projects">) : undefined,
                estimatedHours: form.estimatedHours ? parseFloat(form.estimatedHours) : undefined,
                dueDate: form.dueDate ? new Date(form.dueDate).getTime() : undefined,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-serif font-bold text-white mb-6">New Task</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Title *</label>
                        <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="Design landing page" />
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Assignee</label>
                        <select value={form.assigneeId} onChange={(e) => setForm({ ...form, assigneeId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">Unassigned</option>
                            {employees.map((emp) => (<option key={emp._id} value={emp._id} className="bg-[#0a0a0a]">{emp.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Project</label>
                        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">No project</option>
                            {projects.map((p) => (<option key={p._id} value={p._id} className="bg-[#0a0a0a]">{p.name}</option>))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Est. Hours</label>
                            <input type="number" step="0.5" value={form.estimatedHours} onChange={(e) => setForm({ ...form, estimatedHours: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="8" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Due Date</label>
                            <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">{loading ? "Creating..." : "Create Task"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

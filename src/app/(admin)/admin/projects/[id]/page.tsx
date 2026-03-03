"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { Id } from "../../../../../../convex/_generated/dataModel";
import Link from "next/link";
import { useState } from "react";
import {
    ArrowLeft,
    Users,
    Clock,
    DollarSign,
    ListTodo,
    CheckCircle2,
    AlertTriangle,
    Calendar,
} from "lucide-react";

function formatCents(cents: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
    discovery: "bg-purple-500/20 text-purple-400",
    design: "bg-blue-500/20 text-blue-400",
    development: "bg-cyan-500/20 text-cyan-400",
    review: "bg-yellow-500/20 text-yellow-400",
    completed: "bg-emerald-500/20 text-emerald-400",
    archived: "bg-gray-500/20 text-gray-400",
};

const TASK_STATUS_COLORS: Record<string, string> = {
    todo: "bg-gray-500/20 text-gray-400",
    in_progress: "bg-blue-500/20 text-blue-400",
    review: "bg-purple-500/20 text-purple-400",
    done: "bg-emerald-500/20 text-emerald-400",
};

export default function ProjectDetailPage() {
    const params = useParams();
    const id = params.id as Id<"projects">;
    const data = useQuery(api.projects.getProjectDashboard, { id });
    const [tab, setTab] = useState<"overview" | "tasks" | "time" | "financials">("overview");

    if (!data) return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading project...</div>;
    if (!data.project) return <div className="text-center text-white/40 py-12">Project not found.</div>;

    const { project, client, tasks, taskStats, timeEntries, timeStats, invoices, invoiceStats } = data;

    return (
        <div className="space-y-6">
            {/* Back + Header */}
            <Link href="/admin/projects" className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors">
                <ArrowLeft className="w-4 h-4" /> Back to Projects
            </Link>

            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">{project.title}</h1>
                    <div className="flex items-center gap-3 mt-2">
                        {client && <span className="text-sm text-white/60">{client.name}{client.company ? ` · ${client.company}` : ""}</span>}
                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_COLORS[project.status] || ""}`}>{project.status}</span>
                    </div>
                </div>
                <div className="text-right">
                    <div className="text-xs text-white/40">{project.progress}% complete</div>
                    <div className="mt-1 w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${project.progress}%` }} />
                    </div>
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <MiniStat icon={ListTodo} label="Tasks" value={`${taskStats.done}/${taskStats.total}`} color="text-blue-400" />
                <MiniStat icon={Clock} label="Hours" value={`${timeStats.totalHours}h (${timeStats.billableHours}h billable)`} color="text-cyan-400" />
                <MiniStat icon={DollarSign} label="Revenue" value={formatCents(timeStats.revenueCents)} color="text-emerald-400" />
                <MiniStat icon={DollarSign} label="Invoiced" value={formatCents(invoiceStats.totalAmountCents)} color="text-yellow-400" />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
                {(["overview", "tasks", "time", "financials"] as const).map((t) => (
                    <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${tab === t ? "bg-white text-black" : "text-white/60 hover:text-white"}`}>
                        {t}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === "overview" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                        <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">Description</h3>
                        <p className="text-sm text-white/80 leading-relaxed">{project.description || "No description."}</p>
                    </div>
                    <div className="space-y-4">
                        {project.techStack && project.techStack.length > 0 && (
                            <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                                <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Tech Stack</h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.techStack.map((tech: string) => (
                                        <span key={tech} className="px-2 py-1 bg-white/5 rounded-md text-xs text-white/60">{tech}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-3">Dates</h3>
                            <div className="space-y-2 text-sm">
                                {project.startDate && <div className="flex justify-between"><span className="text-white/40">Start</span><span className="text-white/80 font-mono text-xs">{new Date(project.startDate).toLocaleDateString()}</span></div>}
                                {project.dueDate && <div className="flex justify-between"><span className="text-white/40">Due</span><span className={`font-mono text-xs ${project.dueDate < Date.now() && project.status !== "completed" ? "text-red-400" : "text-white/80"}`}>{new Date(project.dueDate).toLocaleDateString()}</span></div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {tab === "tasks" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 text-xs text-white/40">
                        <span className="text-emerald-400">{taskStats.done} done</span> · <span className="text-blue-400">{taskStats.inProgress} in progress</span> · <span className="text-gray-400">{taskStats.todo} todo</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10">
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Task</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Priority</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Due</th>
                            </tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {tasks.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">No tasks linked to this project.</td></tr>}
                                {tasks.map((task: any) => (
                                    <tr key={task._id} className="hover:bg-white/5">
                                        <td className="px-5 py-3 text-sm text-white">{task.title}</td>
                                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${task.priority === "high" ? "bg-red-500/20 text-red-400" : task.priority === "medium" ? "bg-yellow-500/20 text-yellow-400" : "bg-gray-500/20 text-gray-400"}`}>{task.priority}</span></td>
                                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${TASK_STATUS_COLORS[task.status] || ""}`}>{task.status.replace("_", " ")}</span></td>
                                        <td className="px-5 py-3 text-xs text-white/40 font-mono">{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "time" && (
                <div className="space-y-4">
                    <div className="flex items-center gap-4 text-xs text-white/40">
                        <span>{timeStats.totalHours}h total</span> · <span className="text-emerald-400">{timeStats.billableHours}h billable</span> · <span>{formatCents(timeStats.revenueCents)} revenue</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10">
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Person</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Description</th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-white/60 uppercase">Hours</th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-white/60 uppercase">Rate</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                            </tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {timeEntries.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-white/40">No time logged against this project.</td></tr>}
                                {timeEntries.map((entry: any) => (
                                    <tr key={entry._id} className="hover:bg-white/5">
                                        <td className="px-5 py-3 text-sm text-white">{entry.employeeName}</td>
                                        <td className="px-5 py-3 text-sm text-white/60 max-w-xs truncate">{entry.description}</td>
                                        <td className="px-5 py-3 text-right text-sm font-mono text-white">{entry.hours}h</td>
                                        <td className="px-5 py-3 text-right text-xs font-mono text-white/40">{entry.billRateAtTimeCents ? formatCents(entry.billRateAtTimeCents) + "/h" : "—"}</td>
                                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${entry.status === "approved" ? "bg-emerald-500/20 text-emerald-400" : entry.status === "invoiced" ? "bg-blue-500/20 text-blue-400" : "bg-yellow-500/20 text-yellow-400"}`}>{entry.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {tab === "financials" && (
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <MiniStat icon={DollarSign} label="Total Invoiced" value={formatCents(invoiceStats.totalAmountCents)} color="text-white" />
                        <MiniStat icon={CheckCircle2} label="Paid" value={formatCents(invoiceStats.paidCents)} color="text-emerald-400" />
                        <MiniStat icon={AlertTriangle} label="Outstanding" value={formatCents(invoiceStats.outstandingCents)} color="text-yellow-400" />
                    </div>
                    <div className="rounded-2xl border border-white/10 overflow-hidden">
                        <table className="w-full">
                            <thead><tr className="border-b border-white/10">
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Invoice #</th>
                                <th className="px-5 py-3 text-right text-xs font-medium text-white/60 uppercase">Amount</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                                <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Due</th>
                            </tr></thead>
                            <tbody className="divide-y divide-white/5">
                                {invoices.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-white/40">No invoices for this project.</td></tr>}
                                {invoices.map((inv: any) => (
                                    <tr key={inv._id} className="hover:bg-white/5">
                                        <td className="px-5 py-3 text-sm text-white font-mono">{inv.invoiceNumber}</td>
                                        <td className="px-5 py-3 text-right text-sm font-mono text-white">${inv.total?.toFixed(2)}</td>
                                        <td className="px-5 py-3"><span className={`px-2 py-0.5 rounded text-[10px] font-medium ${inv.status === "paid" ? "bg-emerald-500/20 text-emerald-400" : inv.status === "overdue" ? "bg-red-500/20 text-red-400" : "bg-yellow-500/20 text-yellow-400"}`}>{inv.status}</span></td>
                                        <td className="px-5 py-3 text-xs text-white/40 font-mono">{inv.dueAt ? new Date(inv.dueAt).toLocaleDateString() : "—"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}

function MiniStat({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
    return (
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase tracking-wider"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</div>
            <div className={`mt-1 text-lg font-bold ${color}`}>{value}</div>
        </div>
    );
}

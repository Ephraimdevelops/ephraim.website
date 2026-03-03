"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Suspense, useState } from "react";
import {
    ListTodo,
    Timer,
    Palmtree,
    Loader2,
    Shield,
    AlertCircle,
    Clock,
    CheckCircle2,
    Circle,
    ArrowRight,
    Eye,
} from "lucide-react";
import { toast } from "sonner";

export default function TeamPortalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#02040A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/30 animate-spin" /></div>}>
            <TeamContent />
        </Suspense>
    );
}

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
    todo: { label: "To Do", icon: Circle, color: "text-white/40" },
    in_progress: { label: "In Progress", icon: ArrowRight, color: "text-blue-400" },
    review: { label: "Ready for Review", icon: Eye, color: "text-yellow-400" },
    done: { label: "Done", icon: CheckCircle2, color: "text-emerald-400" },
};

function TeamContent() {
    const params = useSearchParams();
    const token = params.get("token") || "";
    const data = useQuery(api.teamPortal.getTeamPortalData, { token });
    const updateStatus = useMutation(api.teamPortal.updateTaskStatus);
    const [activeTab, setActiveTab] = useState<"tasks" | "time" | "leave">("tasks");

    if (!token) return <ErrorPage icon={Shield} title="No access token" message="Use the link shared with you." />;
    if (data === undefined) return <div className="min-h-screen bg-[#02040A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/20 animate-spin" /></div>;
    if (data === null) return <ErrorPage icon={AlertCircle} title="Invalid link" message="This portal link is not valid." />;
    if (data.expired) return <ErrorPage icon={Clock} title="Link expired" message="Request a new team portal link." />;

    const employee = data.employee;
    const brand = data.brand || { name: "Ephraim OS", primaryColor: "#1A1F36", secondaryColor: "#3259A8", accentColor: "#C9A84C", logoUrl: null };
    const tasks = data.tasks || [];
    const projectNames = data.projectNames || {};
    const recentTime = data.recentTime || [];
    const leave = data.leave || [];
    const stats = data.stats || { totalTasks: 0, activeTasks: 0, hoursThisWeek: 0, leaveBalance: 0 };

    const handleStatusChange = async (taskId: string, newStatus: string) => {
        try {
            await updateStatus({ token, taskId: taskId as Id<"tasks">, status: newStatus as any });
            toast.success(`Task marked as ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
        } catch { toast.error("Failed to update"); }
    };

    return (
        <div className="min-h-screen bg-[#02040A]">
            {/* Header */}
            <header className="border-b border-white/[0.06]" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.primaryColor}dd)` }}>
                <div className="max-w-4xl mx-auto px-6 py-6">
                    <div className="flex items-center gap-4">
                        {brand.logoUrl ? (
                            <img src={brand.logoUrl} alt="" className="w-10 h-10 rounded-xl object-contain" />
                        ) : (
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold" style={{ backgroundColor: brand.secondaryColor, color: "white" }}>
                                {brand.name.charAt(0)}
                            </div>
                        )}
                        <div>
                            <h1 className="text-white font-serif text-lg font-bold">{brand.name}</h1>
                            <p className="text-white/40 text-xs">Team Portal</p>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-white text-lg font-medium">{employee.name}</p>
                            <p className="text-white/40 text-xs">{employee.role} · {employee.email}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
                {/* Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard label="Active Tasks" value={stats.activeTasks} color={brand.secondaryColor} />
                    <StatCard label="Total Tasks" value={stats.totalTasks} color="rgba(255,255,255,0.4)" />
                    <StatCard label="Hours This Week" value={stats.hoursThisWeek.toFixed(1)} color={brand.accentColor} />
                    <StatCard label="Leave Balance" value={`${stats.leaveBalance}d`} color="#10b981" />
                </div>

                {/* Tabs */}
                <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
                    {([["tasks", "My Tasks", ListTodo], ["time", "Time Log", Timer], ["leave", "Leave", Palmtree]] as const).map(([key, label, Icon]) => (
                        <button key={key} onClick={() => setActiveTab(key)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-all ${activeTab === key ? "bg-white text-black font-medium" : "text-white/50 hover:text-white"}`}>
                            <Icon className="w-3.5 h-3.5" /> {label}
                        </button>
                    ))}
                </div>

                {/* Tasks Tab */}
                {activeTab === "tasks" && (
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12 text-white/30"><ListTodo className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No tasks assigned</p></div>
                        ) : (
                            tasks.map((task: any) => {
                                const config = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                                return (
                                    <div key={task._id} className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h3 className="text-sm font-medium text-white">{task.title}</h3>
                                                {task.projectId && projectNames[task.projectId] && (
                                                    <p className="text-[11px] text-white/30 mt-0.5">{projectNames[task.projectId]}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {task.priority && (
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-medium ${task.priority === "high" || task.priority === "urgent" ? "bg-red-500/15 text-red-400" : task.priority === "medium" ? "bg-yellow-500/15 text-yellow-400" : "bg-white/5 text-white/30"}`}>
                                                        {task.priority}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Status Switcher */}
                                        <div className="mt-4 flex items-center gap-2">
                                            {(["todo", "in_progress", "review", "done"] as const).map((s) => {
                                                const sc = STATUS_CONFIG[s];
                                                const isActive = task.status === s;
                                                return (
                                                    <button key={s} onClick={() => handleStatusChange(task._id, s)}
                                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all ${isActive ? "bg-white/10 text-white font-medium" : "text-white/30 hover:text-white/60 hover:bg-white/[0.04]"}`}>
                                                        <sc.icon className={`w-3 h-3 ${isActive ? sc.color : ""}`} />
                                                        {sc.label}
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Time Tab */}
                {activeTab === "time" && (
                    <div className="space-y-2">
                        {recentTime.length === 0 ? (
                            <div className="text-center py-12 text-white/30"><Timer className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No time entries</p></div>
                        ) : (
                            recentTime.map((entry: any) => (
                                <div key={entry._id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]">
                                    <div>
                                        <span className="text-sm text-white/70">{entry.description || "Untitled entry"}</span>
                                        <span className="text-xs text-white/30 ml-3">{new Date(entry.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        {entry.billable && <span className="px-2 py-0.5 rounded text-[9px] font-medium bg-emerald-500/15 text-emerald-400">Billable</span>}
                                        <span className="text-sm font-mono text-white">{entry.hours}h</span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Leave Tab */}
                {activeTab === "leave" && (
                    <div className="space-y-2">
                        {leave.length === 0 ? (
                            <div className="text-center py-12 text-white/30"><Palmtree className="w-8 h-8 mx-auto mb-2 opacity-30" /><p>No leave requests</p></div>
                        ) : (
                            leave.map((l: any) => (
                                <div key={l._id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]">
                                    <div>
                                        <span className="text-sm text-white/70 capitalize">{l.type}</span>
                                        <span className="text-xs text-white/30 ml-3">
                                            {new Date(l.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })} — {new Date(l.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                        </span>
                                    </div>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${l.status === "approved" ? "bg-emerald-500/15 text-emerald-400" : l.status === "rejected" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                                        {l.status}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Footer */}
                <div className="text-center py-6 border-t border-white/[0.04] text-[10px] text-white/15">
                    Powered by {brand.name}
                </div>
            </div>
        </div>
    );
}

function ErrorPage({ icon: Icon, title, message }: { icon: any; title: string; message: string }) {
    return (
        <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
            <div className="text-center p-8"><Icon className="w-10 h-10 text-white/20 mx-auto mb-4" /><h2 className="text-xl text-white/60">{title}</h2><p className="text-sm text-white/30 mt-2">{message}</p></div>
        </div>
    );
}

function StatCard({ label, value, color }: { label: string; value: any; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="text-[10px] text-white/30 uppercase tracking-wider">{label}</div>
            <div className="mt-1 text-xl font-bold" style={{ color }}>{value}</div>
        </div>
    );
}

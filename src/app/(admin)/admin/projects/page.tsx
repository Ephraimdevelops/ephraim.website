"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Plus, ArrowUpRight, Calendar, Users, CheckCircle2, Clock, Briefcase } from "lucide-react";
import { ProjectDialog } from "@/components/admin/ProjectDialog";
import Link from "next/link";

const STATUS_CONFIG: Record<string, { label: string; dot: string; bg: string }> = {
    discovery: { label: "Discovery", dot: "bg-purple-400", bg: "from-purple-500/10 to-transparent" },
    design: { label: "Design", dot: "bg-blue-400", bg: "from-blue-500/10 to-transparent" },
    development: { label: "Development", dot: "bg-cyan-400", bg: "from-cyan-500/10 to-transparent" },
    review: { label: "In Review", dot: "bg-yellow-400", bg: "from-yellow-500/10 to-transparent" },
    completed: { label: "Completed", dot: "bg-emerald-400", bg: "from-emerald-500/10 to-transparent" },
    archived: { label: "Archived", dot: "bg-gray-400", bg: "from-gray-500/10 to-transparent" },
};

export default function ProjectsPage() {
    const projects = useQuery(api.projects.list, {}) || [];
    const clients = useQuery(api.clients.list, {}) || [];

    const clientMap = Object.fromEntries(clients.map((c: any) => [c._id, c]));

    const active = projects.filter((p: any) => p.status !== "completed" && p.status !== "archived");
    const completed = projects.filter((p: any) => p.status === "completed" || p.status === "archived");

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Projects</h1>
                    <p className="text-white/40 mt-1 font-light">
                        {active.length} active{completed.length > 0 ? ` · ${completed.length} delivered` : ""}
                    </p>
                </div>
                <ProjectDialog mode="create">
                    <Button className="bg-white text-black hover:bg-white/90 rounded-xl gap-2">
                        <Plus className="w-4 h-4" /> New Project
                    </Button>
                </ProjectDialog>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <QuickStat label="Active" value={active.length} icon={Briefcase} color="text-blue-400" />
                <QuickStat label="In Review" value={projects.filter((p: any) => p.status === "review").length} icon={Clock} color="text-yellow-400" />
                <QuickStat label="Delivered" value={completed.length} icon={CheckCircle2} color="text-emerald-400" />
                <QuickStat label="Total" value={projects.length} icon={Briefcase} color="text-white/60" />
            </div>

            {/* Active Projects */}
            {active.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                        <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">In Progress</h2>
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {active.map((project: any) => (
                            <ProjectCard key={project._id} project={project} client={clientMap[project.clientId]} />
                        ))}
                    </div>
                </section>
            )}

            {/* Completed Projects */}
            {completed.length > 0 && (
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Delivered</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {completed.map((project: any) => (
                            <CompletedCard key={project._id} project={project} client={clientMap[project.clientId]} />
                        ))}
                    </div>
                </section>
            )}

            {projects.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
                        <Briefcase className="w-7 h-7 text-white/20" />
                    </div>
                    <h3 className="text-lg font-medium text-white/60 mb-1">No projects yet</h3>
                    <p className="text-sm text-white/30">Create your first project to start tracking work.</p>
                </div>
            )}
        </div>
    );
}

function ProjectCard({ project, client }: { project: any; client?: any }) {
    const config = STATUS_CONFIG[project.status] || STATUS_CONFIG.discovery;
    const progress = project.status === "completed" ? 100 : (project.progress || 0);
    const isOverdue = project.dueDate && project.dueDate < Date.now() && project.status !== "completed";

    return (
        <Link
            href={`/admin/projects/${project._id}`}
            className={`group relative p-6 rounded-2xl border border-white/[0.08] bg-gradient-to-br ${config.bg} hover:border-white/20 transition-all duration-300 block overflow-hidden`}
        >
            {/* Subtle glow on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative">
                {/* Top row */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0 mr-4">
                        <h3 className="text-lg font-semibold text-white group-hover:text-white transition-colors truncate">
                            {project.title}
                        </h3>
                        {client && (
                            <div className="flex items-center gap-1.5 mt-1">
                                <div className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center text-[8px] text-white/50 font-bold">
                                    {client.name?.charAt(0)}
                                </div>
                                <span className="text-xs text-white/40 truncate">
                                    {client.company || client.name}
                                </span>
                            </div>
                        )}
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-white/10 group-hover:text-white/40 transition-colors flex-shrink-0 mt-1" />
                </div>

                {/* Status + Category */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/[0.06]">
                        <div className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                        <span className="text-[11px] font-medium text-white/60">{config.label}</span>
                    </div>
                    {project.category && (
                        <span className="px-2.5 py-1 rounded-full bg-white/[0.04] text-[11px] text-white/30">
                            {project.category}
                        </span>
                    )}
                    {isOverdue && (
                        <span className="px-2.5 py-1 rounded-full bg-red-500/10 text-[11px] text-red-400 font-medium">
                            Overdue
                        </span>
                    )}
                </div>

                {/* Progress */}
                <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] text-white/25 uppercase tracking-wider">Progress</span>
                        <span className="text-xs font-mono text-white/40">{progress}%</span>
                    </div>
                    <div className="w-full h-1 bg-white/[0.06] rounded-full overflow-hidden">
                        <div
                            className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-white/20 to-white/40"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                {/* Due date */}
                {project.dueDate && (
                    <div className={`flex items-center gap-1.5 mt-3 text-[11px] ${isOverdue ? "text-red-400" : "text-white/25"}`}>
                        <Calendar className="w-3 h-3" />
                        Due {new Date(project.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                )}
            </div>
        </Link>
    );
}

function CompletedCard({ project, client }: { project: any; client?: any }) {
    return (
        <Link
            href={`/admin/projects/${project._id}`}
            className="group p-4 rounded-xl border border-white/[0.06] hover:border-white/15 transition-all duration-200 block"
        >
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white/70 group-hover:text-white transition-colors truncate flex-1 mr-2">
                    {project.title}
                </h3>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400/60 flex-shrink-0" />
            </div>
            <div className="flex items-center gap-2">
                {client && (
                    <span className="text-[11px] text-white/30 truncate">{client.company || client.name}</span>
                )}
                {project.category && (
                    <span className="text-[11px] text-white/20">· {project.category}</span>
                )}
            </div>
        </Link>
    );
}

function QuickStat({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider">
                <Icon className={`w-3.5 h-3.5 ${color}`} />{label}
            </div>
            <div className={`mt-1 text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

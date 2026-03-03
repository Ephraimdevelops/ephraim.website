"use client";

import { useSearchParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { Suspense, useState } from "react";
import {
    Briefcase,
    FileText,
    DollarSign,
    CheckCircle2,
    ScrollText,
    Loader2,
    ThumbsUp,
    RotateCcw,
    ChevronDown,
    ChevronUp,
    Clock,
    Shield,
    AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function ClientPortalPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#02040A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/30 animate-spin" /></div>}>
            <PortalContent />
        </Suspense>
    );
}

function PortalContent() {
    const params = useSearchParams();
    const token = params.get("token") || "";

    const data = useQuery(api.clientPortal.getPortalData, { token });
    const submitFeedback = useMutation(api.clientPortal.submitFeedback);

    const [expandedProject, setExpandedProject] = useState<string | null>(null);
    const [revisionProject, setRevisionProject] = useState<string | null>(null);
    const [revisionSection, setRevisionSection] = useState("");
    const [revisionDescription, setRevisionDescription] = useState("");
    const [submitting, setSubmitting] = useState(false);

    if (!token) {
        return (
            <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
                <div className="text-center p-8"><Shield className="w-10 h-10 text-white/20 mx-auto mb-4" /><h2 className="text-xl text-white/60">No access token provided</h2><p className="text-sm text-white/30 mt-2">Please use the link shared with you.</p></div>
            </div>
        );
    }

    if (data === undefined) {
        return <div className="min-h-screen bg-[#02040A] flex items-center justify-center"><Loader2 className="w-8 h-8 text-white/20 animate-spin" /></div>;
    }

    if (data === null) {
        return (
            <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
                <div className="text-center p-8"><AlertCircle className="w-10 h-10 text-red-400/60 mx-auto mb-4" /><h2 className="text-xl text-white/60">Invalid portal link</h2></div>
            </div>
        );
    }

    if (data.expired) {
        return (
            <div className="min-h-screen bg-[#02040A] flex items-center justify-center">
                <div className="text-center p-8"><Clock className="w-10 h-10 text-yellow-400/60 mx-auto mb-4" /><h2 className="text-xl text-white/60">Link expired</h2><p className="text-sm text-white/30 mt-2">Please request a new portal link.</p></div>
            </div>
        );
    }

    const client = data.client;
    const brand = data.brand || { name: "Ephraim OS", primaryColor: "#1A1F36", secondaryColor: "#3259A8", accentColor: "#C9A84C", logoUrl: null, tagline: "" };
    const projects = data.projects || [];
    const invoices = data.invoices || [];
    const contracts = data.contracts || [];
    const feedbackByProject = data.feedbackByProject || {};
    const stats = data.stats || { activeProjects: 0, totalInvoiced: 0, pendingInvoices: 0, pendingContracts: 0 };

    const handleApprove = async (projectId: string) => {
        setSubmitting(true);
        try {
            await submitFeedback({ token, projectId: projectId as Id<"projects">, type: "approval" });
            toast.success("Project approved!");
        } catch { toast.error("Failed to submit"); }
        finally { setSubmitting(false); }
    };

    const handleRevisionSubmit = async (projectId: string) => {
        if (!revisionDescription.trim()) { toast.error("Please describe what needs changing"); return; }
        setSubmitting(true);
        try {
            await submitFeedback({
                token,
                projectId: projectId as Id<"projects">,
                type: "revision",
                section: revisionSection || undefined,
                description: revisionDescription,
            });
            toast.success("Revision request sent");
            setRevisionProject(null);
            setRevisionSection("");
            setRevisionDescription("");
        } catch { toast.error("Failed to submit"); }
        finally { setSubmitting(false); }
    };

    const formatCurrency = (amount: number) =>
        new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(amount);

    return (
        <div className="min-h-screen bg-[#02040A]">
            {/* Branded Header */}
            <header className="border-b border-white/[0.06]" style={{ background: `linear-gradient(135deg, ${brand.primaryColor}, ${brand.primaryColor}dd)` }}>
                <div className="max-w-5xl mx-auto px-6 py-6">
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
                            {brand.tagline && <p className="text-white/40 text-xs italic">{brand.tagline}</p>}
                        </div>
                    </div>
                    <div className="mt-4 h-0.5 rounded-full opacity-30" style={{ backgroundColor: brand.accentColor }} />
                    <div className="mt-4 flex items-center justify-between">
                        <div>
                            <p className="text-white/40 text-xs uppercase tracking-wider">Client Portal</p>
                            <p className="text-white text-lg font-medium mt-1">{client?.company || client?.name}</p>
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">
                {/* Stats Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <StatCard icon={Briefcase} label="Active Projects" value={stats.activeProjects} color={brand.secondaryColor} />
                    <StatCard icon={DollarSign} label="Total Invoiced" value={formatCurrency(stats.totalInvoiced)} color="#10b981" />
                    <StatCard icon={FileText} label="Pending Invoices" value={stats.pendingInvoices} color="#f59e0b" />
                    <StatCard icon={ScrollText} label="Awaiting Signature" value={stats.pendingContracts} color="#8b5cf6" />
                </div>

                {/* ═══════════════════════════ APPROVAL ROOM ═══════════════════════════ */}
                <section>
                    <div className="flex items-center gap-2 mb-5">
                        <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: brand.accentColor }} />
                        <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Approval Room</h2>
                    </div>

                    <div className="space-y-4">
                        {projects.map((project: any) => {
                            const feedback = feedbackByProject[project._id] || [];
                            const isExpanded = expandedProject === project._id;
                            const isRevising = revisionProject === project._id;
                            const hasApproval = feedback.some((f: any) => f.type === "approval");
                            const pendingRevisions = feedback.filter((f: any) => f.type === "revision" && f.status === "pending");
                            const progress = project.status === "completed" ? 100 : (project.progress || 0);

                            return (
                                <div key={project._id} className="rounded-2xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
                                    {/* Project Stage */}
                                    <div className="p-6">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                                    {hasApproval && (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium" style={{ backgroundColor: brand.accentColor + "20", color: brand.accentColor }}>
                                                            <CheckCircle2 className="w-3 h-3" /> Approved
                                                        </span>
                                                    )}
                                                    {pendingRevisions.length > 0 && (
                                                        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-yellow-500/20 text-yellow-400">
                                                            <RotateCcw className="w-3 h-3" /> {pendingRevisions.length} Revision{pendingRevisions.length > 1 ? "s" : ""}
                                                        </span>
                                                    )}
                                                </div>
                                                {project.description && <p className="text-sm text-white/40 mt-1 line-clamp-2">{project.description}</p>}
                                            </div>
                                            <button onClick={() => setExpandedProject(isExpanded ? null : project._id)} className="p-2 text-white/30 hover:text-white/60">
                                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                            </button>
                                        </div>

                                        {/* Progress */}
                                        <div className="mt-4 space-y-1.5">
                                            <div className="flex justify-between text-[10px] text-white/25 uppercase tracking-wider">
                                                <span>{project.status}</span><span>{progress}%</span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${progress}%`, backgroundColor: brand.secondaryColor }} />
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="mt-5 flex items-center gap-3">
                                            <button
                                                onClick={() => handleApprove(project._id)}
                                                disabled={submitting}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-40"
                                                style={{ backgroundColor: brand.accentColor }}
                                            >
                                                <ThumbsUp className="w-4 h-4" /> Approve
                                            </button>
                                            <button
                                                onClick={() => { setRevisionProject(isRevising ? null : project._id); setRevisionSection(""); setRevisionDescription(""); }}
                                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-white/10 text-white/60 hover:border-white/20 hover:text-white transition-all"
                                            >
                                                <RotateCcw className="w-4 h-4" /> Request Revision
                                            </button>
                                        </div>

                                        {/* Revision Form */}
                                        {isRevising && (
                                            <div className="mt-4 p-5 rounded-xl border border-white/[0.08] bg-white/[0.02] space-y-4">
                                                <p className="text-xs text-white/40 uppercase tracking-wider font-medium">What needs changing?</p>
                                                <div className="space-y-3">
                                                    <div>
                                                        <label className="text-[10px] text-white/30 uppercase tracking-wider">Section (optional)</label>
                                                        <input type="text" value={revisionSection} onChange={(e) => setRevisionSection(e.target.value)}
                                                            className="w-full mt-1 bg-transparent border border-white/[0.08] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/15"
                                                            placeholder="e.g. Header Design, Homepage Copy, Color Palette" />
                                                    </div>
                                                    <div>
                                                        <label className="text-[10px] text-white/30 uppercase tracking-wider">Description</label>
                                                        <textarea value={revisionDescription} onChange={(e) => setRevisionDescription(e.target.value)} rows={3}
                                                            className="w-full mt-1 bg-transparent border border-white/[0.08] rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/15 resize-none"
                                                            placeholder="Please describe specifically what you'd like changed..." />
                                                    </div>
                                                </div>
                                                <div className="flex justify-end gap-2">
                                                    <button onClick={() => setRevisionProject(null)} className="px-4 py-2 text-sm text-white/40 hover:text-white">Cancel</button>
                                                    <button onClick={() => handleRevisionSubmit(project._id)} disabled={submitting}
                                                        className="px-5 py-2 rounded-lg text-sm font-medium text-white disabled:opacity-40" style={{ backgroundColor: brand.secondaryColor }}>
                                                        {submitting ? "Sending..." : "Submit Revision"}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Expanded Feedback History */}
                                    {isExpanded && feedback.length > 0 && (
                                        <div className="px-6 pb-5 border-t border-white/[0.04] pt-4">
                                            <p className="text-[10px] text-white/30 uppercase tracking-wider mb-3">Feedback History</p>
                                            <div className="space-y-2">
                                                {feedback.map((fb: any) => (
                                                    <div key={fb._id} className="flex items-start gap-3 text-xs">
                                                        <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${fb.type === "approval" ? "bg-emerald-500/20" : "bg-yellow-500/20"}`}>
                                                            {fb.type === "approval" ? <ThumbsUp className="w-3 h-3 text-emerald-400" /> : <RotateCcw className="w-3 h-3 text-yellow-400" />}
                                                        </div>
                                                        <div className="flex-1">
                                                            <span className="text-white/60 font-medium">{fb.authorName}</span>
                                                            <span className="text-white/30"> · {fb.type === "approval" ? "Approved" : `Revision: ${fb.section || "General"}`}</span>
                                                            {fb.description && <p className="text-white/40 mt-0.5">{fb.description}</p>}
                                                            <span className="text-white/20">{new Date(fb.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                                        </div>
                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-medium ${fb.status === "resolved" ? "bg-emerald-500/10 text-emerald-400" : fb.status === "acknowledged" ? "bg-blue-500/10 text-blue-400" : "bg-white/5 text-white/30"}`}>
                                                            {fb.status}
                                                        </span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* Invoices */}
                {invoices.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <DollarSign className="w-3.5 h-3.5 text-white/20" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Invoices</h2>
                        </div>
                        <div className="space-y-2">
                            {invoices.map((inv: any) => (
                                <div key={inv._id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06] hover:border-white/10 transition-colors">
                                    <div>
                                        <span className="text-sm text-white font-medium">{inv.invoiceNumber}</span>
                                        <span className="text-xs text-white/30 ml-3">{inv.issuedAt ? new Date(inv.issuedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : ""}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${inv.status === "paid" ? "bg-emerald-500/15 text-emerald-400" : inv.status === "overdue" ? "bg-red-500/15 text-red-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                                            {inv.status}
                                        </span>
                                        <span className="text-sm font-medium text-white">{formatCurrency(inv.total)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Contracts */}
                {contracts.length > 0 && (
                    <section>
                        <div className="flex items-center gap-2 mb-4">
                            <ScrollText className="w-3.5 h-3.5 text-white/20" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Contracts</h2>
                        </div>
                        <div className="space-y-2">
                            {contracts.map((c: any) => (
                                <div key={c._id} className="flex items-center justify-between p-4 rounded-xl border border-white/[0.06]">
                                    <span className="text-sm text-white/70">{c.title}</span>
                                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-medium ${c.status === "signed" ? "bg-emerald-500/15 text-emerald-400" : "bg-yellow-500/15 text-yellow-400"}`}>
                                        {c.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* Footer */}
                <div className="text-center py-6 border-t border-white/[0.04] text-[10px] text-white/15">
                    Powered by {brand.name}
                </div>
            </div>
        </div>
    );
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: any; color: string }) {
    return (
        <div className="p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]">
            <div className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider">
                <Icon className="w-3.5 h-3.5" style={{ color }} />{label}
            </div>
            <div className="mt-1 text-xl font-bold" style={{ color }}>{value}</div>
        </div>
    );
}

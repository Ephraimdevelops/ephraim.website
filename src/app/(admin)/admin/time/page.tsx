"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    Clock,
    Timer,
    DollarSign,
    FileText,
    CheckCircle2,
    XCircle,
    Trash2,
    Zap,
} from "lucide-react";

function formatCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(cents / 100);
}

const STATUS_STYLES: Record<string, { bg: string; text: string }> = {
    logged: { bg: "bg-yellow-500/20", text: "text-yellow-400" },
    approved: { bg: "bg-emerald-500/20", text: "text-emerald-400" },
    invoiced: { bg: "bg-blue-500/20", text: "text-blue-400" },
};

export default function TimePage() {
    const entries = useQuery(api.timeEntries.list, {});
    const stats = useQuery(api.timeEntries.getStats, {});
    const employees = useQuery(api.employees.list, {});
    const projects = useQuery(api.projects.list, {});
    const clients = useQuery(api.clients.list, {});

    const logTime = useMutation(api.timeEntries.logTime);
    const approveEntry = useMutation(api.timeEntries.approve);
    const bulkApprove = useMutation(api.timeEntries.bulkApprove);
    const generateInvoice = useMutation(api.timeEntries.generateInvoiceFromHours);
    const removeEntry = useMutation(api.timeEntries.remove);

    const [isLogOpen, setIsLogOpen] = useState(false);
    const [isInvoiceOpen, setIsInvoiceOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const filtered = entries?.filter(
        (e) => statusFilter === "all" || e.status === statusFilter
    );

    const toggleSelect = (id: string) => {
        const next = new Set(selectedIds);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelectedIds(next);
    };

    const handleBulkApprove = async () => {
        const ids = Array.from(selectedIds) as Id<"timeEntries">[];
        try {
            const result = await bulkApprove({ ids });
            toast.success(`${result.approved} entries approved`);
            setSelectedIds(new Set());
        } catch (e) {
            toast.error("Bulk approve failed");
        }
    };

    if (!entries || !stats) {
        return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading time data...</div>;
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Time Tracking</h1>
                    <p className="text-white/40 mt-1 font-light">Log hours, approve, and generate invoices from billable time.</p>
                </div>
                <div className="flex items-center gap-3">
                    {stats.uninvoicedCents > 0 && (
                        <button onClick={() => setIsInvoiceOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors">
                            <Zap className="w-4 h-4" /> Generate Invoice from Hours
                        </button>
                    )}
                    <button onClick={() => setIsLogOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                        <Plus className="w-4 h-4" /> Log Time
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <StatCard label="Total Hours" value={`${stats.totalHours.toFixed(1)}h`} icon={Clock} color="text-white" />
                <StatCard label="Billable" value={`${stats.billableHours.toFixed(1)}h`} icon={Timer} color="text-emerald-400" />
                <StatCard label="Utilization" value={`${stats.billablePercentage}%`} icon={Zap} color={stats.billablePercentage >= 70 ? "text-emerald-400" : "text-yellow-400"} />
                <StatCard label="Billable Revenue" value={formatCents(stats.billableRevenueCents)} icon={DollarSign} color="text-emerald-400" />
                <StatCard
                    label="Uninvoiced"
                    value={formatCents(stats.uninvoicedCents)}
                    icon={FileText}
                    color={stats.uninvoicedCents > 0 ? "text-yellow-400" : "text-white/40"}
                />
            </div>

            {/* Filters + Bulk Actions */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {["all", "logged", "approved", "invoiced"].map((s) => (
                        <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"}`}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
                {selectedIds.size > 0 && (
                    <button onClick={handleBulkApprove} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve {selectedIds.size} Selected
                    </button>
                )}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-center w-12">
                                <input type="checkbox" className="w-4 h-4 rounded accent-emerald-500" onChange={(e) => {
                                    if (e.target.checked) {
                                        setSelectedIds(new Set(filtered?.filter((e) => e.status === "logged").map((e) => e._id) || []));
                                    } else {
                                        setSelectedIds(new Set());
                                    }
                                }} />
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Employee</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Description</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Hours</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Rate</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Value</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-white/60 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered?.length === 0 && (
                            <tr><td colSpan={8} className="px-6 py-12 text-center text-white/40">No time entries. Click &quot;Log Time&quot; to start.</td></tr>
                        )}
                        {filtered?.map((entry) => {
                            const style = STATUS_STYLES[entry.status] || STATUS_STYLES.logged;
                            const valueCents = entry.billable && entry.billRateAtTimeCents
                                ? Math.round(entry.hours * entry.billRateAtTimeCents)
                                : 0;
                            return (
                                <tr key={entry._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-4 py-3 text-center">
                                        {entry.status === "logged" && (
                                            <input type="checkbox" checked={selectedIds.has(entry._id)} onChange={() => toggleSelect(entry._id)} className="w-4 h-4 rounded accent-emerald-500" />
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-white font-medium">{entry.employeeName}</td>
                                    <td className="px-4 py-3 text-sm text-white/60 max-w-xs truncate">
                                        {entry.description}
                                        {entry.billable && <span className="ml-2 px-1 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] rounded">BILLABLE</span>}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-mono text-white">{entry.hours.toFixed(1)}h</td>
                                    <td className="px-4 py-3 text-sm text-right font-mono text-white/40">
                                        {entry.billRateAtTimeCents ? `${formatCents(entry.billRateAtTimeCents)}/hr` : "—"}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-right font-mono text-emerald-400">
                                        {valueCents > 0 ? formatCents(valueCents) : "—"}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>{entry.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {entry.status === "logged" && (
                                                <button onClick={async () => { await approveEntry({ id: entry._id }); toast.success("Approved"); }} className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-medium hover:bg-emerald-500/30">
                                                    Approve
                                                </button>
                                            )}
                                            {entry.status !== "invoiced" && (
                                                <button onClick={() => { if (confirm("Delete?")) removeEntry({ id: entry._id }); }} className="p-1 text-white/30 hover:text-red-400">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Log Time Dialog */}
            {isLogOpen && (
                <LogTimeDialog
                    employees={employees || []}
                    projects={projects || []}
                    onClose={() => setIsLogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await logTime(data);
                            toast.success("Time logged (bill rate frozen)");
                            setIsLogOpen(false);
                        } catch (e: any) {
                            toast.error(e.message || "Failed to log time");
                        }
                    }}
                />
            )}

            {/* Generate Invoice Dialog */}
            {isInvoiceOpen && (
                <GenerateInvoiceDialog
                    clients={clients || []}
                    projects={projects || []}
                    uninvoicedCents={stats.uninvoicedCents}
                    onClose={() => setIsInvoiceOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            const result = await generateInvoice(data);
                            toast.success(`Invoice generated! ${result.entriesProcessed} entries → $${result.subtotal.toFixed(2)}`);
                            setIsInvoiceOpen(false);
                        } catch (e: any) {
                            toast.error(e.message || "Failed to generate invoice");
                        }
                    }}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: string; icon: any; color: string }) {
    return (
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase tracking-wider"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</div>
            <div className={`mt-2 text-xl font-bold tracking-tight ${color}`}>{value}</div>
        </div>
    );
}

function LogTimeDialog({ employees, projects, onClose, onSubmit }: { employees: any[]; projects: any[]; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ employeeId: "", projectId: "", description: "", hours: "", date: new Date().toISOString().split("T")[0], billable: true });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employeeId || !form.description || !form.hours) { toast.error("Employee, description, and hours are required"); return; }
        setLoading(true);
        try {
            await onSubmit({
                employeeId: form.employeeId as Id<"employees">,
                projectId: form.projectId ? (form.projectId as Id<"projects">) : undefined,
                description: form.description,
                hours: parseFloat(form.hours),
                date: new Date(form.date).getTime(),
                billable: form.billable,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-serif font-bold text-white mb-6">Log Time</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Employee *</label>
                        <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">Select employee...</option>
                            {employees.map((emp) => (<option key={emp._id} value={emp._id} className="bg-[#0a0a0a]">{emp.name} {emp.defaultBillRateCents ? `(${formatCents(emp.defaultBillRateCents)}/hr)` : ""}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Project</label>
                        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">No project</option>
                            {projects.map((p) => (<option key={p._id} value={p._id} className="bg-[#0a0a0a]">{p.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description *</label>
                        <input type="text" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="Designed new landing page" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Hours *</label>
                            <input type="number" step="0.25" min="0.25" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="2.5" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Date *</label>
                            <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" />
                        </div>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.billable} onChange={(e) => setForm({ ...form, billable: e.target.checked })} className="w-4 h-4 rounded accent-emerald-500" />
                        <span className="text-sm text-white/80">Billable (rate frozen at log time)</span>
                    </label>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">{loading ? "Logging..." : "Log Time"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function GenerateInvoiceDialog({ clients, projects, uninvoicedCents, onClose, onSubmit }: { clients: any[]; projects: any[]; uninvoicedCents: number; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({ clientId: "", projectId: "", currency: "USD", invoiceNumber: `INV-${Date.now().toString(36).toUpperCase()}`, dueInDays: "30" });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.clientId) { toast.error("Client is required"); return; }
        setLoading(true);
        try {
            await onSubmit({
                clientId: form.clientId as Id<"clients">,
                projectId: form.projectId ? (form.projectId as Id<"projects">) : undefined,
                currency: form.currency,
                invoiceNumber: form.invoiceNumber,
                dueInDays: parseInt(form.dueInDays) || 30,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-serif font-bold text-white mb-2">⚡ Generate Invoice from Hours</h2>
                <p className="text-sm text-white/40 mb-6">
                    Approved billable hours will be converted into invoice line items.
                    <span className="block mt-1 text-emerald-400 font-mono text-xs">
                        Uninvoiced: {formatCents(uninvoicedCents)}
                    </span>
                </p>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Client *</label>
                        <select value={form.clientId} onChange={(e) => setForm({ ...form, clientId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">Select client...</option>
                            {clients.map((c) => (<option key={c._id} value={c._id} className="bg-[#0a0a0a]">{c.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Project (optional)</label>
                        <select value={form.projectId} onChange={(e) => setForm({ ...form, projectId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">All projects</option>
                            {projects.map((p) => (<option key={p._id} value={p._id} className="bg-[#0a0a0a]">{p.name}</option>))}
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Invoice #</label>
                            <input type="text" value={form.invoiceNumber} onChange={(e) => setForm({ ...form, invoiceNumber: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Due In (days)</label>
                            <input type="number" value={form.dueInDays} onChange={(e) => setForm({ ...form, dueInDays: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" />
                        </div>
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 transition-colors disabled:opacity-50">{loading ? "Generating..." : "⚡ Generate Invoice"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

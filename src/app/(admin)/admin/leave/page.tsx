"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    Calendar,
    CheckCircle2,
    XCircle,
    Clock,
    Palmtree,
    Heart,
    UserCircle,
} from "lucide-react";

const TYPE_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
    annual: { bg: "bg-blue-500/20", text: "text-blue-400", icon: Palmtree },
    sick: { bg: "bg-red-500/20", text: "text-red-400", icon: Heart },
    personal: { bg: "bg-purple-500/20", text: "text-purple-400", icon: UserCircle },
    unpaid: { bg: "bg-gray-500/20", text: "text-gray-400", icon: Clock },
};

const STATUS_STYLES: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    approved: "bg-emerald-500/20 text-emerald-400",
    rejected: "bg-red-500/20 text-red-400",
};

export default function LeavePage() {
    const requests = useQuery(api.leaveRequests.list, {});
    const employees = useQuery(api.employees.list, {});

    const createRequest = useMutation(api.leaveRequests.create);
    const approveRequest = useMutation(api.leaveRequests.approve);
    const rejectRequest = useMutation(api.leaveRequests.reject);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = requests?.filter(
        (r) => statusFilter === "all" || r.status === statusFilter
    );

    const formatDate = (ts: number) => new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

    if (!requests || !employees) {
        return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading leave requests...</div>;
    }

    // Stats
    const pending = requests.filter((r) => r.status === "pending").length;
    const approved = requests.filter((r) => r.status === "approved").length;
    const currentlyOnLeave = requests.filter(
        (r) => r.status === "approved" && r.startDate <= Date.now() && r.endDate >= Date.now()
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Leave Management</h1>
                    <p className="text-white/40 mt-1 font-light">Track time off requests, approvals, and balances.</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4" /> New Request
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Pending" value={pending} icon={Clock} color="text-yellow-400" />
                <StatCard label="Approved" value={approved} icon={CheckCircle2} color="text-emerald-400" />
                <StatCard label="On Leave Now" value={currentlyOnLeave} icon={Palmtree} color="text-blue-400" />
                <StatCard label="Total Requests" value={requests.length} icon={Calendar} color="text-white" />
            </div>

            {/* Filter */}
            <div className="flex items-center gap-2">
                {["all", "pending", "approved", "rejected"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"}`}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Employee</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Type</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Dates</th>
                            <th className="px-5 py-3 text-center text-xs font-medium text-white/60 uppercase">Days</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Reason</th>
                            <th className="px-5 py-3 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                            <th className="px-5 py-3 text-center text-xs font-medium text-white/60 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered?.length === 0 && (
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-white/40">No leave requests found.</td></tr>
                        )}
                        {filtered?.map((req: any) => {
                            const typeStyle = TYPE_STYLES[req.type] || TYPE_STYLES.personal;
                            const empName = employees.find((e) => e._id === req.employeeId)?.name || "Unknown";
                            const totalDays = Math.ceil((req.endDate - req.startDate) / (24 * 60 * 60 * 1000)) + 1;

                            return (
                                <tr key={req._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-5 py-4 text-sm text-white font-medium">{empName}</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${typeStyle.bg} ${typeStyle.text}`}>
                                            <typeStyle.icon className="w-3 h-3" /> {req.type}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-sm text-white/60 font-mono text-xs">
                                        {formatDate(req.startDate)} → {formatDate(req.endDate)}
                                    </td>
                                    <td className="px-5 py-4 text-center text-sm text-white font-bold">{totalDays}</td>
                                    <td className="px-5 py-4 text-sm text-white/50 max-w-xs truncate">{req.reason || "—"}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${STATUS_STYLES[req.status] || ""}`}>{req.status}</span>
                                    </td>
                                    <td className="px-5 py-4 text-center">
                                        {req.status === "pending" && (
                                            <div className="flex items-center justify-center gap-1">
                                                <button onClick={async () => {
                                                    try { await approveRequest({ id: req._id, approvedById: employees[0]?._id }); toast.success("Approved!"); } catch (e) { toast.error("Failed"); }
                                                }} className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-medium hover:bg-emerald-500/30">
                                                    Approve
                                                </button>
                                                <button onClick={async () => {
                                                    try { await rejectRequest({ id: req._id, approvedById: employees[0]?._id }); toast.success("Rejected"); } catch (e) { toast.error("Failed"); }
                                                }} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[10px] font-medium hover:bg-red-500/30">
                                                    Reject
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Dialog */}
            {isDialogOpen && (
                <LeaveDialog
                    employees={employees}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createRequest(data);
                            toast.success("Leave request submitted");
                            setIsDialogOpen(false);
                        } catch (e: any) {
                            toast.error(e.message || "Failed to submit");
                        }
                    }}
                />
            )}
        </div>
    );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: any; color: string }) {
    return (
        <div className="p-4 rounded-2xl border border-white/10 bg-white/5">
            <div className="flex items-center gap-2 text-[10px] text-white/60 uppercase tracking-wider"><Icon className={`w-3.5 h-3.5 ${color}`} />{label}</div>
            <div className={`mt-1.5 text-xl font-bold ${color}`}>{value}</div>
        </div>
    );
}

function LeaveDialog({ employees, onClose, onSubmit }: { employees: any[]; onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        employeeId: "", type: "annual" as "annual" | "sick" | "personal" | "unpaid",
        startDate: "", endDate: "", reason: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.employeeId || !form.startDate || !form.endDate) { toast.error("Employee and dates are required"); return; }
        setLoading(true);
        try {
            await onSubmit({
                employeeId: form.employeeId as Id<"employees">,
                type: form.type,
                startDate: new Date(form.startDate).getTime(),
                endDate: new Date(form.endDate).getTime(),
                reason: form.reason || undefined,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-md">
                <h2 className="text-xl font-serif font-bold text-white mb-6">Request Leave</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Employee *</label>
                        <select value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                            <option value="" className="bg-[#0a0a0a]">Select employee...</option>
                            {employees.map((emp) => (<option key={emp._id} value={emp._id} className="bg-[#0a0a0a]">{emp.name}</option>))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Leave Type *</label>
                        <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as any })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none">
                            <option value="annual" className="bg-[#0a0a0a]">🌴 Annual Leave</option>
                            <option value="sick" className="bg-[#0a0a0a]">❤️ Sick Leave</option>
                            <option value="personal" className="bg-[#0a0a0a]">👤 Personal Leave</option>
                            <option value="unpaid" className="bg-[#0a0a0a]">⏰ Unpaid Leave</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Start Date *</label>
                            <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">End Date *</label>
                            <input type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none" />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Reason</label>
                        <textarea value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} rows={2} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none resize-none" placeholder="Optional reason..." />
                    </div>
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">{loading ? "Submitting..." : "Submit Request"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

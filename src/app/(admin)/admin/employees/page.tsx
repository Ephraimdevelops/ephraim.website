"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    Users,
    Briefcase,
    Clock,
    DollarSign,
    Trash2,
    UserCircle,
} from "lucide-react";

function formatCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency, minimumFractionDigits: 2 }).format(cents / 100);
}

const STATUS_COLORS: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400",
    probation: "bg-yellow-500/20 text-yellow-400",
    on_leave: "bg-blue-500/20 text-blue-400",
    terminated: "bg-red-500/20 text-red-400",
};

const EMP_TYPES: Record<string, string> = {
    full_time: "Full-Time",
    part_time: "Part-Time",
    contract: "Contract",
};

export default function EmployeesPage() {
    const employees = useQuery(api.employees.list, {});
    const stats = useQuery(api.employees.getStats, {});
    const createEmployee = useMutation(api.employees.create);
    const removeEmployee = useMutation(api.employees.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filtered = employees?.filter(
        (e) => statusFilter === "all" || e.status === statusFilter
    );

    const handleDelete = async (id: Id<"employees">) => {
        if (!confirm("Soft-delete this employee?")) return;
        try {
            await removeEmployee({ id });
            toast.success("Employee removed");
        } catch (e) {
            toast.error("Failed to remove employee");
        }
    };

    if (!employees || !stats) {
        return <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">Loading team...</div>;
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Team</h1>
                    <p className="text-white/40 mt-1 font-light">Manage employees, roles, and bill rates.</p>
                </div>
                <button onClick={() => setIsDialogOpen(true)} className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors">
                    <Plus className="w-4 h-4" /> Add Employee
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider"><Users className="w-4 h-4" />Total</div>
                    <div className="mt-2 text-2xl font-bold text-white">{stats.total}</div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider"><Briefcase className="w-4 h-4" />Full-Time</div>
                    <div className="mt-2 text-2xl font-bold text-white">{stats.byType.fullTime}</div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider"><Clock className="w-4 h-4" />Contract</div>
                    <div className="mt-2 text-2xl font-bold text-white">{stats.byType.contract}</div>
                </div>
                <div className="p-5 rounded-2xl border border-white/10 bg-white/5">
                    <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider"><DollarSign className="w-4 h-4" />Monthly Payroll</div>
                    <div className="mt-2 text-2xl font-bold text-emerald-400">{formatCents(stats.monthlySalaryCents)}</div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                {["all", "active", "probation", "on_leave", "terminated"].map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === s ? "bg-white text-black" : "bg-white/5 text-white/60 hover:text-white"}`}>
                        {s === "all" ? "All" : s.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase">Employee</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase">Role</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase">Type</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase">Bill Rate</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-white/60 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filtered?.length === 0 && (
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-white/40">No employees found.</td></tr>
                        )}
                        {filtered?.map((emp) => (
                            <tr key={emp._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
                                            <UserCircle className="w-5 h-5 text-white/40" />
                                        </div>
                                        <div>
                                            <div className="text-sm text-white font-medium">{emp.name}</div>
                                            <div className="text-xs text-white/40">{emp.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-sm text-white/60 capitalize">{emp.role}</td>
                                <td className="px-6 py-4 text-sm text-white/60">{EMP_TYPES[emp.employmentType] || emp.employmentType}</td>
                                <td className="px-6 py-4 text-sm text-right font-mono text-white/80">
                                    {emp.defaultBillRateCents ? `${formatCents(emp.defaultBillRateCents)}/hr` : "—"}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${STATUS_COLORS[emp.status] || ""}`}>
                                        {emp.status.replace("_", " ")}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button onClick={() => handleDelete(emp._id)} className="p-2 text-white/40 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Dialog */}
            {isDialogOpen && (
                <EmployeeDialog
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createEmployee(data);
                            toast.success("Employee added");
                            setIsDialogOpen(false);
                        } catch (e: any) {
                            toast.error(e.message || "Failed to create employee");
                        }
                    }}
                />
            )}
        </div>
    );
}

function EmployeeDialog({ onClose, onSubmit }: { onClose: () => void; onSubmit: (data: any) => Promise<void> }) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        name: "", email: "", phone: "", role: "", title: "", department: "",
        employmentType: "full_time" as "full_time" | "part_time" | "contract",
        startDate: new Date().toISOString().split("T")[0],
        salaryDisplay: "", salaryCents: 0, currency: "USD",
        payFrequency: "monthly" as "weekly" | "biweekly" | "monthly",
        billRateDisplay: "", defaultBillRateCents: 0,
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.name || !form.email || !form.role) { toast.error("Name, email, and role are required"); return; }
        setLoading(true);
        try {
            await onSubmit({
                name: form.name, email: form.email,
                phone: form.phone || undefined, role: form.role,
                title: form.title || undefined, department: form.department || undefined,
                employmentType: form.employmentType,
                startDate: new Date(form.startDate).getTime(),
                salaryCents: form.salaryCents || undefined,
                currency: form.currency || undefined,
                payFrequency: form.payFrequency || undefined,
                defaultBillRateCents: form.defaultBillRateCents || undefined,
            });
        } finally { setLoading(false); }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-serif font-bold text-white mb-6">Add Employee</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Name *" value={form.name} onChange={(v) => setForm({ ...form, name: v })} placeholder="John Doe" />
                        <Field label="Email *" value={form.email} onChange={(v) => setForm({ ...form, email: v })} placeholder="john@example.com" type="email" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Role *" value={form.role} onChange={(v) => setForm({ ...form, role: v })} placeholder="designer, developer..." />
                        <Field label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Senior Designer" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} placeholder="Design, Engineering..." />
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Type *</label>
                            <select value={form.employmentType} onChange={(e) => setForm({ ...form, employmentType: e.target.value as any })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50">
                                <option value="full_time" className="bg-[#0a0a0a]">Full-Time</option>
                                <option value="part_time" className="bg-[#0a0a0a]">Part-Time</option>
                                <option value="contract" className="bg-[#0a0a0a]">Contract</option>
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Monthly Salary</label>
                            <input type="number" step="0.01" value={form.salaryDisplay} onChange={(e) => setForm({ ...form, salaryDisplay: e.target.value, salaryCents: Math.round(parseFloat(e.target.value || "0") * 100) })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="0.00" />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Bill Rate ($/hr)</label>
                            <input type="number" step="0.01" value={form.billRateDisplay} onChange={(e) => setForm({ ...form, billRateDisplay: e.target.value, defaultBillRateCents: Math.round(parseFloat(e.target.value || "0") * 100) })} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder="150.00" />
                        </div>
                    </div>
                    <Field label="Start Date *" value={form.startDate} onChange={(v) => setForm({ ...form, startDate: v })} type="date" />
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors">Cancel</button>
                        <button type="submit" disabled={loading} className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50">{loading ? "Adding..." : "Add Employee"}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
    return (
        <div>
            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</label>
            <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50" placeholder={placeholder} />
        </div>
    );
}

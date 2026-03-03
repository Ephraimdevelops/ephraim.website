"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    CreditCard,
    Clock,
    CheckCircle2,
    AlertTriangle,
    DollarSign,
    Users,
    Trash2,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════

function formatCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

const STATUS_STYLES: Record<string, { bg: string; text: string; icon: any }> = {
    pending: { bg: "bg-yellow-500/20", text: "text-yellow-400", icon: Clock },
    processing: { bg: "bg-blue-500/20", text: "text-blue-400", icon: CreditCard },
    completed: { bg: "bg-emerald-500/20", text: "text-emerald-400", icon: CheckCircle2 },
    failed: { bg: "bg-red-500/20", text: "text-red-400", icon: AlertTriangle },
};

const PAYMENT_CATEGORIES = [
    { value: "salary", label: "Salary" },
    { value: "bonus", label: "Bonus" },
    { value: "commission", label: "Commission" },
    { value: "freelance", label: "Freelance" },
    { value: "reimbursement", label: "Reimbursement" },
    { value: "vendor_bill", label: "Vendor Bill" },
] as const;

const PAYMENT_METHODS = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "cash", label: "Cash" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "tigo_pesa", label: "Tigo Pesa" },
    { value: "check", label: "Check" },
] as const;

type PaymentCategory = typeof PAYMENT_CATEGORIES[number]["value"];
type PaymentMethod = typeof PAYMENT_METHODS[number]["value"];

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function PaymentsPage() {
    const payments = useQuery(api.payments.list, {});
    const upcoming = useQuery(api.payments.getUpcoming, {});
    const summary = useQuery(api.payments.getPayrollSummary, {});
    const vendors = useQuery(api.vendors.list, {});

    const createPayment = useMutation(api.payments.create);
    const processPayment = useMutation(api.payments.processPayment);
    const removePayment = useMutation(api.payments.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>("all");

    const filteredPayments = payments?.filter(
        (p) => statusFilter === "all" || p.status === statusFilter
    );

    const handleProcess = async (id: Id<"payments">) => {
        const ref = prompt("Enter payment reference (bank/M-Pesa confirmation):");
        if (ref === null) return;
        try {
            await processPayment({ id, reference: ref || undefined });
            toast.success("Payment processed. Transaction logged to ledger.");
        } catch (e: any) {
            toast.error(e.message || "Failed to process payment");
        }
    };

    const handleDelete = async (id: Id<"payments">) => {
        if (!confirm("Delete this payment?")) return;
        try {
            await removePayment({ id });
            toast.success("Payment deleted");
        } catch (e) {
            toast.error("Failed to delete payment");
        }
    };

    if (!payments) {
        return (
            <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">
                Loading payment data...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        Payments & Payroll
                    </h1>
                    <p className="text-white/40 mt-1 font-light">
                        Manage outbound payments to staff, contractors, and vendors.
                    </p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Payment
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <DollarSign className="w-4 h-4" />
                        Total Paid (Period)
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white tracking-tight">
                        {formatCents(summary?.totalCents || 0)}
                    </div>
                    <div className="mt-1 text-sm text-white/40">{summary?.count || 0} payments</div>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <Clock className="w-4 h-4 text-yellow-400" />
                        Upcoming
                    </div>
                    <div className="mt-3 text-3xl font-bold text-yellow-400 tracking-tight">
                        {upcoming?.length || 0}
                    </div>
                    <div className="mt-1 text-sm text-white/40">scheduled payments</div>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <Users className="w-4 h-4" />
                        Vendors
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white tracking-tight">
                        {vendors?.length || 0}
                    </div>
                    <div className="mt-1 text-sm text-white/40">active payees</div>
                </div>
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-2">
                {["all", "pending", "processing", "completed", "failed"].map((status) => (
                    <button
                        key={status}
                        onClick={() => setStatusFilter(status)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${statusFilter === status
                                ? "bg-white text-black"
                                : "bg-white/5 text-white/60 hover:text-white"
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {/* Payments Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Payee</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Method</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredPayments?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                                    No payments found.
                                </td>
                            </tr>
                        )}
                        {filteredPayments?.map((payment) => {
                            const statusStyle = STATUS_STYLES[payment.status] || STATUS_STYLES.pending;
                            const StatusIcon = statusStyle.icon;
                            return (
                                <tr key={payment._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-white font-medium">{payment.payeeName}</div>
                                        <div className="text-xs text-white/40 mt-0.5">{payment.description}</div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60 capitalize">
                                        {payment.category.replace("_", " ")}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60 capitalize">
                                        {payment.paymentMethod.replace("_", " ")}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-mono text-red-400">
                                        {formatCents(payment.amountCents, payment.currency)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium ${statusStyle.bg} ${statusStyle.text}`}>
                                            <StatusIcon className="w-3 h-3" />
                                            {payment.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {payment.status === "pending" && (
                                                <button
                                                    onClick={() => handleProcess(payment._id)}
                                                    className="px-3 py-1 bg-emerald-500/20 text-emerald-400 rounded-lg text-xs font-medium hover:bg-emerald-500/30 transition-colors"
                                                >
                                                    Process
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(payment._id)}
                                                className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                                title="Delete"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Create Payment Dialog */}
            {isDialogOpen && (
                <PaymentDialog
                    vendors={vendors || []}
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createPayment(data);
                            toast.success("Payment created");
                            setIsDialogOpen(false);
                        } catch (e: any) {
                            toast.error(e.message || "Failed to create payment");
                        }
                    }}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// PAYMENT DIALOG
// ═══════════════════════════════════════════════════════════════

function PaymentDialog({
    vendors,
    onClose,
    onSubmit,
}: {
    vendors: any[];
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        payeeName: "",
        vendorId: "" as string,
        amountDisplay: "",
        amountCents: 0,
        currency: "USD",
        description: "",
        category: "vendor_bill" as PaymentCategory,
        paymentMethod: "bank_transfer" as PaymentMethod,
        scheduledDate: "",
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.payeeName || !form.amountCents || !form.description) {
            toast.error("Payee name, amount, and description are required");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({
                vendorId: form.vendorId ? (form.vendorId as Id<"vendors">) : undefined,
                payeeName: form.payeeName,
                amountCents: form.amountCents,
                currency: form.currency,
                description: form.description,
                category: form.category,
                paymentMethod: form.paymentMethod,
                scheduledDate: form.scheduledDate ? new Date(form.scheduledDate).getTime() : undefined,
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-serif font-bold text-white mb-6">New Payment</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Vendor Select */}
                    {vendors.length > 0 && (
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Select Vendor (optional)</label>
                            <select
                                value={form.vendorId}
                                onChange={(e) => {
                                    const vendor = vendors.find((v) => v._id === e.target.value);
                                    setForm({
                                        ...form,
                                        vendorId: e.target.value,
                                        payeeName: vendor?.name || form.payeeName,
                                    });
                                }}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            >
                                <option value="" className="bg-[#0a0a0a]">Manual entry</option>
                                {vendors.map((v) => (
                                    <option key={v._id} value={v._id} className="bg-[#0a0a0a]">
                                        {v.name} ({v.type})
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Payee Name */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Payee Name *</label>
                        <input
                            type="text"
                            value={form.payeeName}
                            onChange={(e) => setForm({ ...form, payeeName: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            placeholder="e.g. John Doe"
                        />
                    </div>

                    {/* Amount + Currency */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Amount *</label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={form.amountDisplay}
                                onChange={(e) => setForm({
                                    ...form,
                                    amountDisplay: e.target.value,
                                    amountCents: Math.round(parseFloat(e.target.value || "0") * 100),
                                })}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                                placeholder="0.00"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Currency</label>
                            <select
                                value={form.currency}
                                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            >
                                <option value="USD" className="bg-[#0a0a0a]">USD</option>
                                <option value="TZS" className="bg-[#0a0a0a]">TZS</option>
                                <option value="EUR" className="bg-[#0a0a0a]">EUR</option>
                            </select>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description *</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            placeholder="e.g. February salary, Logo design"
                        />
                    </div>

                    {/* Category + Method */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Category *</label>
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value as PaymentCategory })}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            >
                                {PAYMENT_CATEGORIES.map((c) => (
                                    <option key={c.value} value={c.value} className="bg-[#0a0a0a]">{c.label}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Method *</label>
                            <select
                                value={form.paymentMethod}
                                onChange={(e) => setForm({ ...form, paymentMethod: e.target.value as PaymentMethod })}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            >
                                {PAYMENT_METHODS.map((m) => (
                                    <option key={m.value} value={m.value} className="bg-[#0a0a0a]">{m.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Scheduled Date */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Scheduled Date (optional)</label>
                        <input
                            type="date"
                            value={form.scheduledDate}
                            onChange={(e) => setForm({ ...form, scheduledDate: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2.5 text-sm text-white/60 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
                        >
                            {loading ? "Creating..." : "Create Payment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";
import {
    Plus,
    Filter,
    DollarSign,
    TrendingDown,
    Receipt,
    Trash2,
    Edit,
    Upload,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// EXPENSE CATEGORIES
// ═══════════════════════════════════════════════════════════════

const CATEGORIES = [
    { value: "software", label: "Software", color: "#8B5CF6" },
    { value: "ads", label: "Advertising", color: "#F59E0B" },
    { value: "contractors", label: "Contractors", color: "#10B981" },
    { value: "office", label: "Office", color: "#6366F1" },
    { value: "travel", label: "Travel", color: "#EC4899" },
    { value: "equipment", label: "Equipment", color: "#14B8A6" },
    { value: "salary", label: "Salary", color: "#3B82F6" },
    { value: "utilities", label: "Utilities", color: "#F97316" },
    { value: "insurance", label: "Insurance", color: "#A855F7" },
    { value: "marketing", label: "Marketing", color: "#EF4444" },
    { value: "legal", label: "Legal", color: "#78716C" },
    { value: "taxes", label: "Taxes", color: "#DC2626" },
    { value: "other", label: "Other", color: "#6B7280" },
] as const;

const PAYMENT_METHODS = [
    { value: "bank_transfer", label: "Bank Transfer" },
    { value: "mobile_money", label: "Mobile Money" },
    { value: "cash", label: "Cash" },
    { value: "mpesa", label: "M-Pesa" },
    { value: "tigo_pesa", label: "Tigo Pesa" },
    { value: "card", label: "Card" },
    { value: "other", label: "Other" },
] as const;

type CategoryValue = typeof CATEGORIES[number]["value"];

// ═══════════════════════════════════════════════════════════════
// HELPER: Format cents to currency
// ═══════════════════════════════════════════════════════════════
function formatCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

// ═══════════════════════════════════════════════════════════════
// MAIN PAGE
// ═══════════════════════════════════════════════════════════════

export default function ExpensesPage() {
    const expenses = useQuery(api.expenses.list, {});
    const stats = useQuery(api.expenses.getStats, {});
    const createExpense = useMutation(api.expenses.create);
    const removeExpense = useMutation(api.expenses.remove);

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<CategoryValue | "all">("all");

    // Filter expenses by selected category
    const filteredExpenses = expenses?.filter(
        (e) => selectedCategory === "all" || e.category === selectedCategory
    );

    const handleDelete = async (id: Id<"expenses">) => {
        if (!confirm("Delete this expense? A reversal transaction will be created.")) return;
        try {
            await removeExpense({ id });
            toast.success("Expense deleted (reversal logged)");
        } catch (e) {
            toast.error("Failed to delete expense");
        }
    };

    if (!expenses || !stats) {
        return (
            <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">
                Loading expense data...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        Expense Tracker
                    </h1>
                    <p className="text-white/40 mt-1 font-light">
                        Track every cent. All expenses auto-log to the ledger.
                    </p>
                </div>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-colors"
                >
                    <Plus className="w-4 h-4" />
                    New Expense
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <DollarSign className="w-4 h-4" />
                        Total This Month
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white tracking-tight">
                        {formatCents(stats.totalCents)}
                    </div>
                    <div className="mt-1 text-sm text-white/40">{stats.count} expenses</div>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <TrendingDown className="w-4 h-4 text-green-400" />
                        Tax Deductible
                    </div>
                    <div className="mt-3 text-3xl font-bold text-emerald-400 tracking-tight">
                        {formatCents(stats.taxDeductibleCents)}
                    </div>
                </div>
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/60 uppercase tracking-wider">
                        <Receipt className="w-4 h-4" />
                        Categories
                    </div>
                    <div className="mt-3 text-3xl font-bold text-white tracking-tight">
                        {Object.keys(stats.byCategory).length}
                    </div>
                    <div className="mt-1 text-sm text-white/40">active categories</div>
                </div>
            </div>

            {/* Category Breakdown Bar */}
            {stats.totalCents > 0 && (
                <div className="p-6 rounded-2xl border border-white/10 bg-white/5">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4">By Category</h3>
                    <div className="flex rounded-full overflow-hidden h-4">
                        {Object.entries(stats.byCategory).map(([cat, amount]) => {
                            const catInfo = CATEGORIES.find((c) => c.value === cat);
                            const pct = (amount / stats.totalCents) * 100;
                            return (
                                <div
                                    key={cat}
                                    title={`${catInfo?.label || cat}: ${formatCents(amount)} (${pct.toFixed(1)}%)`}
                                    className="transition-all hover:opacity-80"
                                    style={{
                                        width: `${pct}%`,
                                        backgroundColor: catInfo?.color || "#6B7280",
                                        minWidth: pct > 0 ? "4px" : "0px",
                                    }}
                                />
                            );
                        })}
                    </div>
                    <div className="flex flex-wrap gap-3 mt-3">
                        {Object.entries(stats.byCategory).map(([cat, amount]) => {
                            const catInfo = CATEGORIES.find((c) => c.value === cat);
                            return (
                                <div key={cat} className="flex items-center gap-2 text-xs text-white/60">
                                    <div
                                        className="w-2 h-2 rounded-full"
                                        style={{ backgroundColor: catInfo?.color || "#6B7280" }}
                                    />
                                    {catInfo?.label || cat}: {formatCents(amount)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Category Filter */}
            <div className="flex items-center gap-2 flex-wrap">
                <Filter className="w-4 h-4 text-white/40" />
                <button
                    onClick={() => setSelectedCategory("all")}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === "all"
                            ? "bg-white text-black"
                            : "bg-white/5 text-white/60 hover:text-white"
                        }`}
                >
                    All
                </button>
                {CATEGORIES.map((cat) => (
                    <button
                        key={cat.value}
                        onClick={() => setSelectedCategory(cat.value)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedCategory === cat.value
                                ? "bg-white text-black"
                                : "bg-white/5 text-white/60 hover:text-white"
                            }`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Expense Table */}
            <div className="rounded-2xl border border-white/10 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Description</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Vendor</th>
                            <th className="px-6 py-4 text-right text-xs font-medium text-white/60 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-white/60 uppercase tracking-wider">Date</th>
                            <th className="px-6 py-4 text-center text-xs font-medium text-white/60 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredExpenses?.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                                    No expenses found. Click &quot;New Expense&quot; to get started.
                                </td>
                            </tr>
                        )}
                        {filteredExpenses?.map((expense) => {
                            const catInfo = CATEGORIES.find((c) => c.value === expense.category);
                            return (
                                <tr key={expense._id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 text-sm text-white font-medium">
                                        {expense.description}
                                        {expense.isTaxDeductible && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 text-[10px] font-mono rounded">
                                                TAX
                                            </span>
                                        )}
                                        {expense.isRecurring && (
                                            <span className="ml-2 px-1.5 py-0.5 bg-blue-500/20 text-blue-400 text-[10px] font-mono rounded">
                                                RECURRING
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className="px-2 py-1 rounded-md text-xs font-medium"
                                            style={{
                                                backgroundColor: `${catInfo?.color}20`,
                                                color: catInfo?.color,
                                            }}
                                        >
                                            {catInfo?.label || expense.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60">
                                        {expense.vendor || "—"}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-right font-mono text-red-400">
                                        {formatCents(expense.amountCents, expense.currency)}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-white/60">
                                        {new Date(expense.date).toLocaleDateString("en-US", {
                                            month: "short",
                                            day: "numeric",
                                            year: "numeric",
                                        })}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => handleDelete(expense._id)}
                                            className="p-2 text-white/40 hover:text-red-400 transition-colors"
                                            title="Delete expense"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Add Expense Dialog */}
            {isDialogOpen && (
                <ExpenseDialog
                    onClose={() => setIsDialogOpen(false)}
                    onSubmit={async (data) => {
                        try {
                            await createExpense(data);
                            toast.success("Expense created (transaction logged)");
                            setIsDialogOpen(false);
                        } catch (e) {
                            toast.error("Failed to create expense");
                        }
                    }}
                />
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// EXPENSE DIALOG
// ═══════════════════════════════════════════════════════════════

function ExpenseDialog({
    onClose,
    onSubmit,
}: {
    onClose: () => void;
    onSubmit: (data: any) => Promise<void>;
}) {
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        description: "",
        category: "other" as CategoryValue,
        amountCents: 0,
        amountDisplay: "",
        currency: "USD",
        vendor: "",
        isTaxDeductible: false,
        paymentMethod: undefined as any,
        isRecurring: false,
        recurringFrequency: undefined as any,
        date: new Date().toISOString().split("T")[0],
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.description || !form.amountCents) {
            toast.error("Description and amount are required");
            return;
        }
        setLoading(true);
        try {
            await onSubmit({
                description: form.description,
                category: form.category,
                amountCents: form.amountCents,
                currency: form.currency,
                vendor: form.vendor || undefined,
                isTaxDeductible: form.isTaxDeductible,
                paymentMethod: form.paymentMethod || undefined,
                isRecurring: form.isRecurring || undefined,
                recurringFrequency: form.recurringFrequency || undefined,
                date: new Date(form.date).getTime(),
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <h2 className="text-xl font-serif font-bold text-white mb-6">New Expense</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Description */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Description *</label>
                        <input
                            type="text"
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            placeholder="e.g. AWS hosting, Adobe subscription"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Category *</label>
                        <select
                            value={form.category}
                            onChange={(e) => setForm({ ...form, category: e.target.value as CategoryValue })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value} className="bg-[#0a0a0a]">
                                    {cat.label}
                                </option>
                            ))}
                        </select>
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
                                onChange={(e) => {
                                    const val = e.target.value;
                                    setForm({
                                        ...form,
                                        amountDisplay: val,
                                        amountCents: Math.round(parseFloat(val || "0") * 100),
                                    });
                                }}
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
                                <option value="GBP" className="bg-[#0a0a0a]">GBP</option>
                            </select>
                        </div>
                    </div>

                    {/* Vendor */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Vendor</label>
                        <input
                            type="text"
                            value={form.vendor}
                            onChange={(e) => setForm({ ...form, vendor: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            placeholder="e.g. Amazon, Figma"
                        />
                    </div>

                    {/* Payment Method */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Payment Method</label>
                        <select
                            value={form.paymentMethod || ""}
                            onChange={(e) => setForm({ ...form, paymentMethod: e.target.value || undefined })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                        >
                            <option value="" className="bg-[#0a0a0a]">Select...</option>
                            {PAYMENT_METHODS.map((pm) => (
                                <option key={pm.value} value={pm.value} className="bg-[#0a0a0a]">
                                    {pm.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Date */}
                    <div>
                        <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Date *</label>
                        <input
                            type="date"
                            value={form.date}
                            onChange={(e) => setForm({ ...form, date: e.target.value })}
                            className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                        />
                    </div>

                    {/* Toggles */}
                    <div className="flex items-center gap-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isTaxDeductible}
                                onChange={(e) => setForm({ ...form, isTaxDeductible: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-emerald-500"
                            />
                            <span className="text-sm text-white/80">Tax Deductible</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.isRecurring}
                                onChange={(e) => setForm({ ...form, isRecurring: e.target.checked })}
                                className="w-4 h-4 rounded border-white/20 bg-white/5 accent-blue-500"
                            />
                            <span className="text-sm text-white/80">Recurring</span>
                        </label>
                    </div>

                    {/* Recurring Frequency */}
                    {form.isRecurring && (
                        <div>
                            <label className="text-xs font-medium text-white/60 uppercase tracking-wider">Frequency</label>
                            <select
                                value={form.recurringFrequency || ""}
                                onChange={(e) => setForm({ ...form, recurringFrequency: e.target.value || undefined })}
                                className="mt-2 w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00D4FF]/50"
                            >
                                <option value="" className="bg-[#0a0a0a]">Select frequency</option>
                                <option value="weekly" className="bg-[#0a0a0a]">Weekly</option>
                                <option value="biweekly" className="bg-[#0a0a0a]">Bi-Weekly</option>
                                <option value="monthly" className="bg-[#0a0a0a]">Monthly</option>
                                <option value="quarterly" className="bg-[#0a0a0a]">Quarterly</option>
                                <option value="yearly" className="bg-[#0a0a0a]">Yearly</option>
                            </select>
                        </div>
                    )}

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
                            {loading ? "Saving..." : "Create Expense"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

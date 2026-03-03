"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState } from "react";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
} from "lucide-react";

// ═══════════════════════════════════════════════════════════════
// HELPER
// ═══════════════════════════════════════════════════════════════

function formatCents(cents: number, currency = "USD"): string {
    return new Intl.NumberFormat("en-US", {
        style: "currency",
        currency,
        minimumFractionDigits: 2,
    }).format(cents / 100);
}

// ═══════════════════════════════════════════════════════════════
// FINANCE REPORTS PAGE
// ═══════════════════════════════════════════════════════════════

export default function FinanceReportsPage() {
    const pnl = useQuery(api.transactions.getProfitAndLoss, {});
    const cashFlow = useQuery(api.transactions.getCashFlow, { months: 6 });
    const totals = useQuery(api.transactions.getTotals, {});
    const recentTxns = useQuery(api.transactions.getRecent, { limit: 20 });

    const [tab, setTab] = useState<"pnl" | "cashflow" | "ledger">("pnl");

    if (!pnl || !cashFlow || !totals) {
        return (
            <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">
                Crunching numbers...
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                    Financial Reports
                </h1>
                <p className="text-white/40 mt-1 font-light">
                    All data from the immutable transaction ledger — the single source of truth.
                </p>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <SummaryCard
                    label="Gross Revenue"
                    value={formatCents(pnl.grossRevenueCents)}
                    icon={TrendingUp}
                    color="text-emerald-400"
                />
                <SummaryCard
                    label="Total Costs"
                    value={formatCents(pnl.totalCostsCents)}
                    icon={TrendingDown}
                    color="text-red-400"
                />
                <SummaryCard
                    label="Net Profit"
                    value={formatCents(pnl.netProfitCents)}
                    icon={DollarSign}
                    color={pnl.netProfitCents >= 0 ? "text-emerald-400" : "text-red-400"}
                />
                <SummaryCard
                    label="Profit Margin"
                    value={`${pnl.profitMargin}%`}
                    icon={BarChart3}
                    color={pnl.profitMargin >= 0 ? "text-emerald-400" : "text-red-400"}
                />
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
                {[
                    { key: "pnl", label: "P&L Statement" },
                    { key: "cashflow", label: "Cash Flow" },
                    { key: "ledger", label: "Transaction Ledger" },
                ].map((t) => (
                    <button
                        key={t.key}
                        onClick={() => setTab(t.key as any)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t.key
                                ? "bg-white text-black"
                                : "text-white/60 hover:text-white"
                            }`}
                    >
                        {t.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {tab === "pnl" && <ProfitAndLoss pnl={pnl} />}
            {tab === "cashflow" && <CashFlowView cashFlow={cashFlow} />}
            {tab === "ledger" && <TransactionLedger txns={recentTxns || []} />}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// SUMMARY CARD
// ═══════════════════════════════════════════════════════════════

function SummaryCard({
    label,
    value,
    icon: Icon,
    color,
}: {
    label: string;
    value: string;
    icon: any;
    color: string;
}) {
    return (
        <div className="p-5 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider">
                <Icon className={`w-4 h-4 ${color}`} />
                {label}
            </div>
            <div className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>
                {value}
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// P&L STATEMENT
// ═══════════════════════════════════════════════════════════════

function ProfitAndLoss({ pnl }: { pnl: any }) {
    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-serif font-bold text-white">Profit & Loss Statement</h3>
                <p className="text-xs text-white/40 mt-1">Year to date • Powered by transaction ledger</p>
            </div>

            <div className="divide-y divide-white/5">
                {/* Revenue */}
                <div className="p-6">
                    <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Revenue</h4>
                    {Object.entries(pnl.incomeByCategory || {}).map(([cat, amount]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center py-2">
                            <span className="text-sm text-white/80 capitalize">{cat}</span>
                            <span className="text-sm font-mono text-emerald-400">{formatCents(amount)}</span>
                        </div>
                    ))}
                    {Object.keys(pnl.incomeByCategory || {}).length === 0 && (
                        <div className="text-sm text-white/30 py-2">No income recorded yet</div>
                    )}
                    <div className="flex justify-between items-center py-3 mt-2 border-t border-white/10">
                        <span className="text-sm font-medium text-white">Gross Revenue</span>
                        <span className="text-sm font-mono font-bold text-emerald-400">{formatCents(pnl.grossRevenueCents)}</span>
                    </div>
                </div>

                {/* Expenses */}
                <div className="p-6">
                    <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Expenses</h4>
                    {Object.entries(pnl.expenseByCategory || {}).map(([cat, amount]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center py-2">
                            <span className="text-sm text-white/80 capitalize">{cat}</span>
                            <span className="text-sm font-mono text-red-400">({formatCents(amount)})</span>
                        </div>
                    ))}
                    {Object.keys(pnl.expenseByCategory || {}).length === 0 && (
                        <div className="text-sm text-white/30 py-2">No expenses recorded yet</div>
                    )}
                    <div className="flex justify-between items-center py-3 mt-2 border-t border-white/10">
                        <span className="text-sm font-medium text-white">Total Expenses</span>
                        <span className="text-sm font-mono font-bold text-red-400">({formatCents(pnl.totalExpenseCents)})</span>
                    </div>
                </div>

                {/* Payments */}
                <div className="p-6">
                    <h4 className="text-xs font-medium text-white/60 uppercase tracking-wider mb-4">Outbound Payments</h4>
                    {Object.entries(pnl.paymentByCategory || {}).map(([cat, amount]: [string, any]) => (
                        <div key={cat} className="flex justify-between items-center py-2">
                            <span className="text-sm text-white/80 capitalize">{cat.replace("_", " ")}</span>
                            <span className="text-sm font-mono text-orange-400">({formatCents(amount)})</span>
                        </div>
                    ))}
                    {Object.keys(pnl.paymentByCategory || {}).length === 0 && (
                        <div className="text-sm text-white/30 py-2">No payments recorded yet</div>
                    )}
                </div>

                {/* Net Profit */}
                <div className="p-6 bg-white/5">
                    <div className="flex justify-between items-center">
                        <span className="text-lg font-serif font-bold text-white">Net Profit</span>
                        <span className={`text-xl font-mono font-bold ${pnl.netProfitCents >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {formatCents(pnl.netProfitCents)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                        <span className="text-sm text-white/40">Margin</span>
                        <span className={`text-sm font-mono ${pnl.profitMargin >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                            {pnl.profitMargin}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// CASH FLOW VIEW
// ═══════════════════════════════════════════════════════════════

function CashFlowView({ cashFlow }: { cashFlow: any[] }) {
    const maxVal = Math.max(...cashFlow.map((m) => Math.max(m.incomeCents, m.expenseCents + m.paymentCents, 1)));

    return (
        <div className="rounded-2xl border border-white/10 p-6">
            <h3 className="text-lg font-serif font-bold text-white mb-6">Cash Flow — Last 6 Months</h3>

            {/* Bar Chart */}
            <div className="flex items-end gap-4 h-48 mb-6">
                {cashFlow.map((m, i) => {
                    const incomeH = maxVal > 0 ? (m.incomeCents / maxVal) * 100 : 0;
                    const expenseH = maxVal > 0 ? ((m.expenseCents + m.paymentCents) / maxVal) * 100 : 0;
                    return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div className="w-full flex gap-1 items-end h-40">
                                <div
                                    className="flex-1 bg-emerald-500/40 rounded-t-md transition-all"
                                    style={{ height: `${incomeH}%`, minHeight: "2px" }}
                                    title={`Income: ${formatCents(m.incomeCents)}`}
                                />
                                <div
                                    className="flex-1 bg-red-500/40 rounded-t-md transition-all"
                                    style={{ height: `${expenseH}%`, minHeight: "2px" }}
                                    title={`Outflow: ${formatCents(m.expenseCents + m.paymentCents)}`}
                                />
                            </div>
                            <span className="text-[10px] text-white/40 font-mono">{m.month}</span>
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-6 text-xs text-white/60">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-emerald-500/40" />
                    Income
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded bg-red-500/40" />
                    Outflow (Expenses + Payments)
                </div>
            </div>

            {/* Monthly Table */}
            <div className="mt-6 rounded-xl border border-white/5 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-white/10">
                            <th className="px-4 py-3 text-left text-xs font-medium text-white/60 uppercase">Month</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Income</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Expenses</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Payments</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-white/60 uppercase">Net</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {cashFlow.map((m, i) => (
                            <tr key={i} className="hover:bg-white/5">
                                <td className="px-4 py-3 text-sm text-white font-mono">{m.month}</td>
                                <td className="px-4 py-3 text-sm text-right font-mono text-emerald-400">{formatCents(m.incomeCents)}</td>
                                <td className="px-4 py-3 text-sm text-right font-mono text-red-400">{formatCents(m.expenseCents)}</td>
                                <td className="px-4 py-3 text-sm text-right font-mono text-orange-400">{formatCents(m.paymentCents)}</td>
                                <td className={`px-4 py-3 text-sm text-right font-mono font-bold ${m.netCents >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {formatCents(m.netCents)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// TRANSACTION LEDGER
// ═══════════════════════════════════════════════════════════════

function TransactionLedger({ txns }: { txns: any[] }) {
    const typeStyles: Record<string, { bg: string; text: string; arrow: any }> = {
        income: { bg: "bg-emerald-500/20", text: "text-emerald-400", arrow: ArrowUpRight },
        expense: { bg: "bg-red-500/20", text: "text-red-400", arrow: ArrowDownRight },
        payment: { bg: "bg-orange-500/20", text: "text-orange-400", arrow: ArrowDownRight },
        refund: { bg: "bg-purple-500/20", text: "text-purple-400", arrow: ArrowUpRight },
        adjustment: { bg: "bg-gray-500/20", text: "text-gray-400", arrow: ArrowUpRight },
    };

    return (
        <div className="rounded-2xl border border-white/10 overflow-hidden">
            <div className="p-6 border-b border-white/10">
                <h3 className="text-lg font-serif font-bold text-white">Transaction Ledger</h3>
                <p className="text-xs text-white/40 mt-1">Immutable • Append-only • Most recent 20</p>
            </div>
            <table className="w-full">
                <thead>
                    <tr className="border-b border-white/10">
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Description</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Source</th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-white/60 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-white/60 uppercase">Date</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {txns.length === 0 && (
                        <tr>
                            <td colSpan={5} className="px-6 py-12 text-center text-white/40">
                                No transactions yet. Create an expense, payment, or mark an invoice as paid.
                            </td>
                        </tr>
                    )}
                    {txns.map((txn) => {
                        const style = typeStyles[txn.type] || typeStyles.adjustment;
                        const ArrowIcon = style.arrow;
                        return (
                            <tr key={txn._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-3">
                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${style.bg} ${style.text}`}>
                                        <ArrowIcon className="w-3 h-3" />
                                        {txn.type}
                                        {txn.isReversal && " ↩"}
                                    </span>
                                </td>
                                <td className="px-6 py-3 text-sm text-white/80 max-w-xs truncate">{txn.description}</td>
                                <td className="px-6 py-3 text-xs text-white/40 font-mono">{txn.createdFrom}</td>
                                <td className={`px-6 py-3 text-sm text-right font-mono ${txn.amountCents >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                                    {formatCents(txn.amountCents, txn.currency)}
                                </td>
                                <td className="px-6 py-3 text-xs text-white/40">
                                    {new Date(txn.date).toLocaleDateString("en-US", {
                                        month: "short",
                                        day: "numeric",
                                    })}
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

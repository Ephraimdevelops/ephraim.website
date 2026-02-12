"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { ProfitDial } from "@/components/admin/finance/ProfitDial";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet } from "lucide-react";

export default function FinancePage() {
    const stats = useQuery(api.invoices.getFinancialStats, {});
    const taxStats = useQuery(api.invoices.getTaxEstimate, {});

    // Loading State
    if (!stats || !taxStats) {
        return (
            <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">
                Calculating financial trajectory...
            </div>
        );
    }

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: "USD",
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                    Financial Command
                </h1>
                <p className="text-white/40 mt-1 font-light">
                    Real-time profit tracking and tax estimation.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* The Profit Dial */}
                <div className="col-span-1">
                    <ProfitDial
                        current={stats.totalRevenue}
                        target={100000} // TODO: Make configurable
                        label="Revenue YTD"
                    />
                </div>

                {/* Key Metrics */}
                <div className="col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                    {/* Net Profit Card */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                                <Wallet className="w-4 h-4" />
                                Net Profit
                            </h3>
                            <div className="mt-4 text-4xl font-bold text-white tracking-tight">
                                {formatCurrency(stats.netProfit)}
                            </div>
                            <div className="mt-2 text-sm text-emerald-400 flex items-center gap-1">
                                <ArrowUpRight className="w-3 h-3" />
                                {stats.profitMargin}% Margin
                            </div>
                        </div>
                        <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 rounded-full"
                                style={{ width: `${Math.min(100, stats.profitMargin)}%` }}
                            />
                        </div>
                    </div>

                    {/* Expenses Card */}
                    <div className="p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm flex flex-col justify-between">
                        <div>
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider flex items-center gap-2">
                                <ArrowDownRight className="w-4 h-4 text-red-400" />
                                Expenses
                            </h3>
                            <div className="mt-4 text-4xl font-bold text-white tracking-tight">
                                {formatCurrency(stats.totalExpenses)}
                            </div>
                            <div className="mt-2 text-sm text-white/40">
                                Operating Costs
                            </div>
                        </div>
                    </div>

                    {/* Tax Estimator */}
                    <div className="md:col-span-2 p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/20 to-transparent">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-sm font-medium text-blue-200/80 uppercase tracking-wider">
                                    Est. Tax Liability
                                </h3>
                                <div className="mt-2 text-2xl font-bold text-white">
                                    {formatCurrency(taxStats.estimatedTax)}
                                </div>
                                <div className="text-xs text-blue-200/40 mt-1">
                                    Based on {(taxStats.taxRate * 100).toFixed(0)}% effective rate
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm text-white/60">Taxable Income</div>
                                <div className="text-lg font-mono text-white">
                                    {formatCurrency(taxStats.taxableIncome)}
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* Recent Activity Section placeholder */}
            <div className="pt-8 border-t border-white/10">
                <h3 className="text-lg font-medium text-white mb-4">Recent Transactions</h3>
                <div className="rounded-xl border border-white/10 bg-white/5 p-8 text-center text-white/40">
                    Transactions list will appear here.
                </div>
            </div>

        </div>
    );
}

"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { format } from "date-fns";
import {
    Plus,
    FileText,
    MoreHorizontal,
    CheckCircle2,
    Clock,
    XCircle,
    Download
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function InvoicesPage() {
    const invoices = useQuery(api.invoices.list, {});
    const markAsPaid = useMutation(api.invoices.markAsPaid);

    const [loadingId, setLoadingId] = useState<string | null>(null);

    const handleMarkPaid = async (id: any) => {
        setLoadingId(id);
        await markAsPaid({ id });
        setLoadingId(null);
    };

    const formatCurrency = (amount: number, currency: string) => {
        return new Intl.NumberFormat("en-US", {
            style: "currency",
            currency: currency,
        }).format(amount);
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "paid": return "text-emerald-500 bg-emerald-500/10 border-emerald-500/20";
            case "overdue": return "text-red-500 bg-red-500/10 border-red-500/20";
            case "sent": return "text-blue-500 bg-blue-500/10 border-blue-500/20";
            case "draft": return "text-white/40 bg-white/5 border-white/10";
            default: return "text-white/40";
        }
    };

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        Invoices
                    </h1>
                    <p className="text-white/40 mt-1 font-light">
                        Manage billing and client agreements.
                    </p>
                </div>
                <Link
                    href="/admin/invoices/new"
                    className="flex items-center gap-2 px-4 py-2 bg-[#3259A8] hover:bg-[#264280] text-white rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20"
                >
                    <Plus className="w-4 h-4" />
                    New Invoice
                </Link>
            </div>

            <div className="rounded-xl border border-white/10 bg-[#0A0C14]/50 backdrop-blur-md overflow-hidden">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 text-white/60 font-medium">
                        <tr>
                            <th className="px-6 py-4">Invoice #</th>
                            <th className="px-6 py-4">Client</th>
                            <th className="px-6 py-4">Date</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {!invoices ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-8 text-center text-white/40 animate-pulse">
                                    Loading invoices...
                                </td>
                            </tr>
                        ) : invoices.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-white/40">
                                    <FileText className="w-8 h-8 mx-auto mb-3 opacity-20" />
                                    No invoices found. Create one to get paid.
                                </td>
                            </tr>
                        ) : (
                            invoices.map((inv: any) => (
                                <tr
                                    key={inv._id}
                                    className="hover:bg-white/5 transition-colors group"
                                >
                                    <td className="px-6 py-4 font-mono text-white/80">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="px-6 py-4 text-white">
                                        {/* Accessing client name requires a separate query or join. 
                        For now, showing ID or we need to fetch clients. 
                        Let's just show 'Client' placeholder if we can't join easily 
                        without a more complex query. 
                        Actually, Convex doesn't do joins. We usually fetch clients separately.
                        I'll just show 'Client' for now or the ID in tooltip.
                    */}
                                        <span title={inv.clientId}>Client {inv.clientId.slice(0, 4)}...</span>
                                    </td>
                                    <td className="px-6 py-4 text-white/60">
                                        {format(new Date(inv.createdAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-white">
                                        {formatCurrency(inv.total, inv.currency)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(inv.status)}`}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                        {inv.status !== 'paid' && (
                                            <button
                                                onClick={() => handleMarkPaid(inv._id)}
                                                disabled={loadingId === inv._id}
                                                className="p-1.5 hover:bg-emerald-500/10 text-emerald-500/60 hover:text-emerald-500 rounded transition-colors"
                                                title="Mark as Paid"
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button className="p-1.5 hover:bg-white/10 text-white/40 hover:text-white/80 rounded transition-colors" title="Download PDF">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

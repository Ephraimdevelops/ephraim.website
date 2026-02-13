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
    Download,
    Loader2,
    RefreshCcw,
    Send
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner"; // Assuming sonner is used, if not we'll use a basic alert or standard toast
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function InvoicesPage() {
    const invoices = useQuery(api.invoices.list, {});
    const updateStatus = useMutation(api.invoices.updateStatus);
    const markAsPaid = useMutation(api.invoices.markAsPaid);

    const [processingId, setProcessingId] = useState<string | null>(null);

    const handleStatusChange = async (id: Id<"invoices">, status: string) => {
        setProcessingId(id);
        try {
            await updateStatus({ id, status: status as any });
            toast.success(`Invoice status updated to ${status}`);
        } catch (error) {
            toast.error("Failed to update status");
            console.error(error);
        } finally {
            setProcessingId(null);
        }
    };

    const handleDownload = (invoice: any) => {
        // For now, since we don't have a real PDF generator, we'll mock this or print.
        // In a real app, this would fetch a signed URL or trigger a server-side PDF generation.
        toast.info("Downloading PDF...");
        // Placeholder for future PDF generation logic
        // window.open(`/api/invoices/${invoice._id}/pdf`, '_blank');
        setTimeout(() => {
            toast.success("Download started (Mock)");
        }, 1000);
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
            case "cancelled": return "text-gray-500 bg-gray-500/10 border-gray-500/20";
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
                                        <span title={inv.clientId} className="text-white/80">
                                            {/* Ideally fetch client name here */}
                                            Client {inv.clientId.slice(0, 4)}...
                                        </span>
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
                                    <td className="px-6 py-4 text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-white/10 text-white/60">
                                                    <span className="sr-only">Open menu</span>
                                                    {processingId === inv._id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <MoreHorizontal className="w-4 h-4" />
                                                    )}
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="bg-[#0A0C14] border-white/10 text-white">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem
                                                    onClick={() => handleDownload(inv)}
                                                    className="hover:bg-white/5 cursor-pointer"
                                                >
                                                    <Download className="mr-2 h-4 w-4" />
                                                    Download PDF
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuLabel>Update Status</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => handleStatusChange(inv._id, 'paid')} className="hover:bg-white/5 cursor-pointer">
                                                    <CheckCircle2 className="mr-2 h-4 w-4 text-emerald-500" />
                                                    Mark as Paid
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(inv._id, 'sent')} className="hover:bg-white/5 cursor-pointer">
                                                    <Send className="mr-2 h-4 w-4 text-blue-500" />
                                                    Mark as Sent
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(inv._id, 'overdue')} className="hover:bg-white/5 cursor-pointer">
                                                    <Clock className="mr-2 h-4 w-4 text-red-500" />
                                                    Mark as Overdue
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleStatusChange(inv._id, 'cancelled')} className="hover:bg-white/5 cursor-pointer">
                                                    <XCircle className="mr-2 h-4 w-4 text-gray-500" />
                                                    Mark as Cancelled
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator className="bg-white/10" />
                                                <DropdownMenuItem asChild className="hover:bg-white/5 cursor-pointer">
                                                    <Link href={`/admin/invoices/${inv._id}/edit`}>
                                                        Edit Invoice
                                                    </Link>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
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

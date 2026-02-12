"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { Download, Printer } from "lucide-react";

export default function PublicInvoicePage() {
    const params = useParams();
    const id = params.id as any; // Cast to any to avoid type issues with Id

    // Fetch Invoice + Client + Settings
    const data = useQuery(api.invoices.getPublicInvoice, { id });

    if (data === undefined) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-400">Loading invoice...</div>;
    }

    if (data === null) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center text-gray-500">Invoice not found or invalid link.</div>;
    }

    const { invoice, client, settings } = data;
    const primaryColor = settings?.primaryColor || "#000000";

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-gray-100 py-10 print:bg-white print:py-0">

            {/* Toolbar (Hidden when printing) */}
            <div className="max-w-4xl mx-auto mb-6 flex justify-end gap-3 print:hidden px-4">
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
                >
                    <Printer className="w-4 h-4" />
                    Print
                </button>
                <button
                    onClick={handlePrint}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 shadow-lg transition-all"
                >
                    <Download className="w-4 h-4" />
                    Download PDF
                </button>
            </div>

            {/* Invoice Paper */}
            <div className="max-w-4xl mx-auto bg-white shadow-2xl rounded-xl print:shadow-none print:rounded-none overflow-hidden">

                {/* Header Strip with Brand Color */}
                <div className="h-2 w-full" style={{ backgroundColor: primaryColor }} />

                <div className="p-12 print:p-8">

                    {/* Header: Logo & Invoice Info */}
                    <div className="flex justify-between items-start mb-16">
                        <div className="space-y-4">
                            {settings?.logo ? (
                                <img
                                    src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${settings.logo}`}
                                    alt="Logo"
                                    className="h-16 object-contain"
                                />
                            ) : (
                                <div className="text-2xl font-bold text-gray-900">{settings?.businessName || "Business Name"}</div>
                            )}

                            <div className="text-sm text-gray-500 leading-relaxed">
                                {settings?.businessName}<br />
                                {settings?.businessAddress?.split('\n').map((line, i) => (
                                    <span key={i}>{line}<br /></span>
                                ))}
                                {settings?.taxIdNumber && <span>Tax ID: {settings.taxIdNumber}</span>}
                            </div>
                        </div>

                        <div className="text-right">
                            <h1 className="text-4xl font-light text-gray-900 mb-2">INVOICE</h1>
                            <div className="text-gray-500 font-mono">{invoice.invoiceNumber}</div>

                            <div className="mt-8 space-y-1 text-sm">
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-400">Issued</span>
                                    <span className="font-medium text-gray-900">
                                        {format(invoice.issuedAt || invoice.createdAt, "MMM dd, yyyy")}
                                    </span>
                                </div>
                                <div className="flex justify-end gap-4">
                                    <span className="text-gray-400">Due</span>
                                    <span className="font-medium text-gray-900">
                                        {invoice.dueAt ? format(invoice.dueAt, "MMM dd, yyyy") : "On Receipt"}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Client Bill To */}
                    <div className="mb-16">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
                        <div className="text-gray-900 font-medium text-lg">
                            {client?.company || client?.name}
                        </div>
                        <div className="text-gray-500 mt-1">
                            {client?.name}<br />
                            {client?.email}
                        </div>
                    </div>

                    {/* Line Items Table */}
                    <table className="w-full mb-12">
                        <thead>
                            <tr className="border-b-2 border-gray-100">
                                <th className="text-left py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider w-1/2">Description</th>
                                <th className="text-center py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Qty</th>
                                <th className="text-right py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Price</th>
                                <th className="text-right py-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoice.items.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-4 text-gray-900 text-sm font-medium">{item.description}</td>
                                    <td className="py-4 text-center text-gray-500 text-sm">{item.quantity}</td>
                                    <td className="py-4 text-right text-gray-500 text-sm font-mono">
                                        ${item.unitPrice.toLocaleString()}
                                    </td>
                                    <td className="py-4 text-right text-gray-900 text-sm font-mono font-medium">
                                        ${item.amount.toLocaleString()}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Totals */}
                    <div className="flex justify-end mb-20">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-gray-900 font-mono">${invoice.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Tax ({(invoice.taxRate * 100).toFixed(0)}%)</span>
                                <span className="text-gray-900 font-mono">${invoice.taxAmount.toLocaleString()}</span>
                            </div>
                            <div className="border-t-2 border-gray-100 pt-3 flex justify-between items-end">
                                <span className="text-gray-900 font-bold">Total</span>
                                <span className="text-2xl font-bold font-mono" style={{ color: primaryColor }}>
                                    ${invoice.total.toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    {settings?.invoiceFooterText && (
                        <div className="border-t border-gray-100 pt-8 text-center text-sm text-gray-400 leading-relaxed">
                            {settings.invoiceFooterText}
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}

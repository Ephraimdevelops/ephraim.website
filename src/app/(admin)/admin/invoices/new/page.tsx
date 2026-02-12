"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../convex/_generated/api";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Plus,
    Trash2,
    Save,
    Calculator,
    Building
} from "lucide-react";
import Link from "next/link";
import { Id } from "../../../../../../convex/_generated/dataModel";

interface LineItem {
    id: string; // Temp ID for UI
    description: string;
    quantity: number;
    unitPrice: number;
    amount: number;
}

export default function NewInvoicePage() {
    const router = useRouter();
    const clients = useQuery(api.clients.list, {});
    const createInvoice = useMutation(api.invoices.create);

    const [clientId, setClientId] = useState<string>("");
    const [taxRate, setTaxRate] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [items, setItems] = useState<LineItem[]>([
        { id: "1", description: "Professional Services", quantity: 1, unitPrice: 0, amount: 0 }
    ]);

    const updateItem = (id: string, field: keyof LineItem, value: string | number) => {
        setItems(prev => prev.map(item => {
            if (item.id !== id) return item;

            const updates = { [field]: value };

            // Auto-calc amount if qty or price changes
            if (field === 'quantity' || field === 'unitPrice') {
                const qty = field === 'quantity' ? Number(value) : item.quantity;
                const price = field === 'unitPrice' ? Number(value) : item.unitPrice;
                return { ...item, ...updates, amount: qty * price };
            }

            return { ...item, ...updates };
        }));
    };

    const addItem = () => {
        setItems(prev => [
            ...prev,
            { id: Date.now().toString(), description: "", quantity: 1, unitPrice: 0, amount: 0 }
        ]);
    };

    const removeItem = (id: string) => {
        if (items.length === 1) return;
        setItems(prev => prev.filter(item => item.id !== id));
    };

    // Totals
    const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = subtotal * taxRate;
    const total = subtotal + taxAmount;

    const handleSubmit = async () => {
        if (!clientId) return alert("Please select a client");

        setIsSubmitting(true);
        try {
            await createInvoice({
                clientId: clientId as Id<"clients">,
                items: items.map(({ description, quantity, unitPrice, amount }) => ({
                    description,
                    quantity,
                    unitPrice,
                    amount
                })),
                taxRate,
                currency: "USD",
                dueAt: Date.now() + (30 * 24 * 60 * 60 * 1000), // Net 30 default
            });
            router.push("/admin/invoices");
        } catch (error) {
            console.error(error);
            alert("Failed to create invoice");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link
                    href="/admin/invoices"
                    className="p-2 hover:bg-white/10 rounded-lg text-white/60 hover:text-white transition-colors"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-white tracking-tight">New Invoice</h1>
                    <p className="text-white/40 text-sm">Drafting a new agreement.</p>
                </div>
            </div>

            <div className="bg-[#0A0C14]/50 border border-white/10 rounded-xl p-8 backdrop-blur-md space-y-8">

                {/* Client Selection */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-white/60">Client</label>
                    <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                        <select
                            className="w-full bg-white/5 border border-white/10 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 appearance-none"
                            value={clientId}
                            onChange={(e) => setClientId(e.target.value)}
                        >
                            <option value="" disabled>Select a client...</option>
                            {clients?.map((client: any) => (
                                <option key={client._id} value={client._id}>
                                    {client.name} {client.company ? `(${client.company})` : ''}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Line Items */}
                <div className="space-y-4">
                    <label className="text-sm font-medium text-white/60 flex items-center justify-between">
                        <span>Line Items</span>
                        <span className="text-xs text-white/30">Currency: USD</span>
                    </label>

                    <div className="space-y-3">
                        {items.map((item) => (
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-start group">
                                <div className="col-span-6">
                                    <input
                                        type="text"
                                        placeholder="Description"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500"
                                        value={item.description}
                                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Qty"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 text-center"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-sm text-white focus:outline-none focus:border-blue-500 text-right"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(item.id, 'unitPrice', Number(e.target.value))}
                                    />
                                </div>
                                <div className="col-span-2 flex items-center gap-3">
                                    <div className="flex-1 bg-transparent border-none text-right text-white/60 text-sm py-3 font-mono">
                                        ${item.amount.toLocaleString()}
                                    </div>
                                    <button
                                        onClick={() => removeItem(item.id)}
                                        className="text-white/20 hover:text-red-400 transition-colors p-1"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button
                        onClick={addItem}
                        className="flex items-center gap-2 text-sm text-[#3259A8] hover:text-[#4B70BF] transition-colors mt-2"
                    >
                        <Plus className="w-4 h-4" />
                        Add Line Item
                    </button>
                </div>

                {/* Summary */}
                <div className="border-t border-white/10 pt-6 flex justify-end">
                    <div className="w-64 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-white/60">Subtotal</span>
                            <span className="text-white">${subtotal.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm items-center">
                            <span className="text-white/60 flex items-center gap-2">
                                Tax Rate
                                <input
                                    type="number"
                                    className="w-16 bg-white/5 border border-white/10 rounded px-1 py-0.5 text-center text-xs"
                                    value={taxRate * 100}
                                    onChange={(e) => setTaxRate(Number(e.target.value) / 100)}
                                />
                                %
                            </span>
                            <span className="text-white">${taxAmount.toLocaleString()}</span>
                        </div>
                        <div className="border-t border-white/10 pt-3 flex justify-between font-bold text-lg">
                            <span className="text-white">Total</span>
                            <span className="text-emerald-400">${total.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

            </div>

            {/* Actions */}
            <div className="flex justify-end gap-4">
                <Link
                    href="/admin/invoices"
                    className="px-6 py-3 border border-white/10 rounded-xl text-white/60 hover:bg-white/5 hover:text-white transition-all"
                >
                    Cancel
                </Link>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-[#3259A8] hover:bg-[#264280] text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50"
                >
                    {isSubmitting ? (
                        <span className="animate-pulse">Processing...</span>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Create Invoice
                        </>
                    )}
                </button>
            </div>

        </div>
    );
}

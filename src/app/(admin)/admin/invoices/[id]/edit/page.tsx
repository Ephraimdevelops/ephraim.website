"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../convex/_generated/dataModel";
import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export default function EditInvoicePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const invoiceId = id as Id<"invoices">;

    // Fetch existing invoice
    const invoice = useQuery(api.invoices.getById, { id: invoiceId });
    const updateInvoice = useMutation(api.invoices.update);
    const clients = useQuery(api.clients.list, {});
    const projects = useQuery(api.projects.list, {});

    const router = useRouter();
    const [loading, setLoading] = useState(false);

    // Form State
    // We initialize state only when invoice is loaded
    const [clientId, setClientId] = useState<string>("");
    const [projectId, setProjectId] = useState<string>("none"); // Use "none" for optional
    const [currency, setCurrency] = useState("USD");
    const [taxRate, setTaxRate] = useState(0);
    const [items, setItems] = useState<{ description: string; quantity: number; unitPrice: number; amount: number }[]>([
        { description: "", quantity: 1, unitPrice: 0, amount: 0 }
    ]);
    const [dueAt, setDueAt] = useState<string>("");

    // Populate form when invoice loads
    useEffect(() => {
        if (invoice) {
            setClientId(invoice.clientId);
            setProjectId(invoice.projectId || "none");
            setCurrency(invoice.currency);
            setTaxRate(invoice.taxRate);
            setItems(invoice.items);
            if (invoice.dueAt) {
                setDueAt(new Date(invoice.dueAt).toISOString().split('T')[0]);
            }
        }
    }, [invoice]);

    const calculateItemAmount = (quantity: number, price: number) => {
        return quantity * price;
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        // @ts-ignore
        newItems[index][field] = value;

        if (field === "quantity" || field === "unitPrice") {
            newItems[index].amount = calculateItemAmount(newItems[index].quantity, newItems[index].unitPrice);
        }

        setItems(newItems);
    };

    const addItem = () => {
        setItems([...items, { description: "", quantity: 1, unitPrice: 0, amount: 0 }]);
    };

    const removeItem = (index: number) => {
        const newItems = items.filter((_, i) => i !== index);
        setItems(newItems);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await updateInvoice({
                id: invoiceId,
                items,
                taxRate,
                currency,
                dueAt: dueAt ? new Date(dueAt).getTime() : undefined,
            });
            toast.success("Invoice updated successfully");
            router.push("/admin/invoices");
        } catch (error) {
            toast.error("Failed to update invoice");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (invoice === undefined) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
        );
    }

    if (invoice === null) {
        return <div>Invoice not found</div>;
    }

    return (
        <div className="max-w-4xl mx-auto pb-20">
            <div className="mb-8 flex items-center gap-4">
                <Link href="/admin/invoices" className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Edit Invoice</h1>
                    <p className="text-white/40">{invoice.invoiceNumber}</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Check if editing restricted fields is wise; for now we only allow editing content, not client/project as that changes context heavily */}

                <div className="rounded-xl border border-white/10 bg-[#0A0C14]/50 backdrop-blur-md p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Client (Read Only)</Label>
                            <div className="px-3 py-2 bg-white/5 border border-white/10 rounded-md text-white/50">
                                {/* Display Client Name or ID */}
                                {clients?.find(c => c._id === clientId)?.name || "Loading..."}
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label>Due Date</Label>
                            <Input
                                type="date"
                                value={dueAt}
                                onChange={(e) => setDueAt(e.target.value)}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label>Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="bg-white/5 border-white/10">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="USD">USD ($)</SelectItem>
                                    <SelectItem value="EUR">EUR (€)</SelectItem>
                                    <SelectItem value="GBP">GBP (£)</SelectItem>
                                    <SelectItem value="TZS">TZS (TSh)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>Tax Rate (0.1 = 10%)</Label>
                            <Input
                                type="number"
                                step="0.01"
                                value={taxRate}
                                onChange={(e) => setTaxRate(parseFloat(e.target.value))}
                                className="bg-white/5 border-white/10"
                            />
                        </div>
                    </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-[#0A0C14]/50 backdrop-blur-md p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-medium text-white">Line Items</h2>
                        <Button type="button" variant="outline" size="sm" onClick={addItem} className="border-white/10 bg-white/5 hover:bg-white/10">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div key={index} className="grid grid-cols-12 gap-4 items-end bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="col-span-12 md:col-span-6 space-y-2">
                                    <Label className="text-xs">Description</Label>
                                    <Input
                                        value={item.description}
                                        onChange={(e) => handleItemChange(index, "description", e.target.value)}
                                        className="bg-[#0A0C14] border-white/10"
                                        placeholder="Service or product name"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2 space-y-2">
                                    <Label className="text-xs">Qty</Label>
                                    <Input
                                        type="number"
                                        min="1"
                                        value={item.quantity}
                                        onChange={(e) => handleItemChange(index, "quantity", parseFloat(e.target.value))}
                                        className="bg-[#0A0C14] border-white/10"
                                    />
                                </div>
                                <div className="col-span-6 md:col-span-2 space-y-2">
                                    <Label className="text-xs">Price</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={item.unitPrice}
                                        onChange={(e) => handleItemChange(index, "unitPrice", parseFloat(e.target.value))}
                                        className="bg-[#0A0C14] border-white/10"
                                    />
                                </div>

                                <div className="col-span-10 md:col-span-1 space-y-2">
                                    <Label className="text-xs">Total</Label>
                                    <div className="h-10 px-3 flex items-center text-sm font-mono text-white/60">
                                        {item.amount.toFixed(2)}
                                    </div>
                                </div>

                                <div className="col-span-2 md:col-span-1 flex justify-end">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 flex justify-end">
                        <div className="w-full max-w-xs space-y-3">
                            <div className="flex justify-between text-sm text-white/60">
                                <span>Subtotal</span>
                                <span>{currency} {items.reduce((s, i) => s + i.amount, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-sm text-white/60">
                                <span>Tax ({(taxRate * 100).toFixed(0)}%)</span>
                                <span>{currency} {(items.reduce((s, i) => s + i.amount, 0) * taxRate).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-white pt-3 border-t border-white/10">
                                <span>Total</span>
                                <span>{currency} {(items.reduce((s, i) => s + i.amount, 0) * (1 + taxRate)).toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-4">
                    <Button type="button" variant="ghost" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading} className="bg-[#3259A8] hover:bg-[#264280] text-white">
                        {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Save Changes
                    </Button>
                </div>
            </form>
        </div>
    );
}

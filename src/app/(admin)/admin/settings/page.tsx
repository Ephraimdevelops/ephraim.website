"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Save, Upload, Building, Palette, FileText } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";

export default function SettingsPage() {
    const settings = useQuery(api.settings.get);
    const updateSettings = useMutation(api.settings.update);
    const generateUploadUrl = useMutation(api.settings.generateUploadUrl);

    const [logoId, setLogoId] = useState<Id<"_storage"> | undefined>(undefined);
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [taxIdNumber, setTaxIdNumber] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#000000");
    const [invoiceFooterText, setInvoiceFooterText] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    useEffect(() => {
        if (settings) {
            setLogoId(settings.logo);
            setBusinessName(settings.businessName || "");
            setBusinessAddress(settings.businessAddress || "");
            setTaxIdNumber(settings.taxIdNumber || "");
            setPrimaryColor(settings.primaryColor || "#3259A8");
            setInvoiceFooterText(settings.invoiceFooterText || "");
        }
    }, [settings]);

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const postUrl = await generateUploadUrl();
            const result = await fetch(postUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });
            const { storageId } = await result.json();
            setLogoId(storageId);
            setIsDirty(true);
        } catch (error) {
            console.error(error);
            alert("Upload failed.");
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings({
                logo: logoId,
                businessName,
                businessAddress,
                taxIdNumber,
                primaryColor,
                invoiceFooterText,
            });
            setIsDirty(false);
            alert("Settings saved!");
        } catch (error) {
            console.error(error);
            alert("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    if (settings === undefined) return <div className="text-white/40 animate-pulse">Loading settings...</div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Business Profile</h1>
                <p className="text-white/40 mt-1 font-light">
                    Manage your brand identity and invoice settings.
                </p>
            </div>

            <div className="bg-[#0A0C14]/50 border border-white/10 rounded-xl p-8 backdrop-blur-md space-y-12">

                {/* Brand Identity Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <Palette className="w-5 h-5 text-blue-400" />
                        <h2 className="text-lg font-medium text-white">Brand Identity</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Logo Upload */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Logo</label>
                            <div className="flex items-center gap-4">
                                <div className="w-24 h-24 rounded-lg border border-white/10 bg-white/5 flex items-center justify-center overflow-hidden relative group">
                                    {logoId ? (
                                        <img
                                            src={`${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${logoId}`}
                                            alt="Logo"
                                            className="w-full h-full object-contain"
                                        />
                                    ) : (
                                        <Building className="w-8 h-8 text-white/20" />
                                    )}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleLogoUpload}
                                        className="absolute inset-0 opacity-0 cursor-pointer"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                        <Upload className="w-4 h-4 text-white" />
                                    </div>
                                </div>
                                <div className="text-xs text-white/40">
                                    Upload your company logo.<br />
                                    Recommended: 400x400 PNG.
                                </div>
                            </div>
                        </div>

                        {/* Brand Color */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Brand Color</label>
                            <div className="flex items-center gap-3">
                                <input
                                    type="color"
                                    value={primaryColor}
                                    onChange={(e) => {
                                        setPrimaryColor(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="w-12 h-12 rounded-lg cursor-pointer bg-transparent border-none p-0"
                                />
                                <input
                                    type="text"
                                    value={primaryColor}
                                    onChange={(e) => {
                                        setPrimaryColor(e.target.value);
                                        setIsDirty(true);
                                    }}
                                    className="bg-white/5 border border-white/10 rounded-lg py-3 px-4 text-white focus:outline-none focus:border-blue-500 font-mono"
                                />
                            </div>
                            <p className="text-xs text-white/40">Used for accents on invoices and documents.</p>
                        </div>
                    </div>
                </section>

                {/* Company Details Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <Building className="w-5 h-5 text-purple-400" />
                        <h2 className="text-lg font-medium text-white">Company Details</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Business Name</label>
                            <input
                                type="text"
                                value={businessName}
                                onChange={(e) => {
                                    setBusinessName(e.target.value);
                                    setIsDirty(true);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="Acme Corp, LLC"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/60">Tax ID / VAT Number</label>
                            <input
                                type="text"
                                value={taxIdNumber}
                                onChange={(e) => {
                                    setTaxIdNumber(e.target.value);
                                    setIsDirty(true);
                                }}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="US-123456789"
                            />
                        </div>

                        <div className="col-span-1 md:col-span-2 space-y-2">
                            <label className="text-sm font-medium text-white/60">Business Address</label>
                            <textarea
                                value={businessAddress}
                                onChange={(e) => {
                                    setBusinessAddress(e.target.value);
                                    setIsDirty(true);
                                }}
                                rows={3}
                                className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                                placeholder="1234 Innovation Dr, Silicon Valley, CA 94025"
                            />
                        </div>
                    </div>
                </section>

                {/* Invoice Customization */}
                <section className="space-y-6">
                    <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                        <FileText className="w-5 h-5 text-emerald-400" />
                        <h2 className="text-lg font-medium text-white">Invoice Footer</h2>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-white/60">Footer Text</label>
                        <textarea
                            value={invoiceFooterText}
                            onChange={(e) => {
                                setInvoiceFooterText(e.target.value);
                                setIsDirty(true);
                            }}
                            rows={2}
                            className="w-full bg-white/5 border border-white/10 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
                            placeholder="Thank you for your business! Please pay within 30 days."
                        />
                        <p className="text-xs text-white/40">Appears at the bottom of every invoice.</p>
                    </div>
                </section>

                {/* Save Button */}
                <div className="flex justify-end pt-6 border-t border-white/10">
                    <button
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className="flex items-center gap-2 px-8 py-3 bg-[#3259A8] hover:bg-[#264280] text-white rounded-xl transition-all shadow-lg shadow-blue-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSaving ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>

            </div>
        </div>
    );
}

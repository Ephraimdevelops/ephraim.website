"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../../convex/_generated/api";
import { useState, useEffect } from "react";
import { Save, Upload, Building, Palette, FileText, Globe, Phone, Link2, Sparkles } from "lucide-react";
import { Id } from "../../../../../convex/_generated/dataModel";
import { toast } from "sonner";

export default function SettingsPage() {
    const settings = useQuery(api.settings.get);
    const updateSettings = useMutation(api.settings.update);
    const generateUploadUrl = useMutation(api.settings.generateUploadUrl);

    const [logoId, setLogoId] = useState<Id<"_storage"> | undefined>(undefined);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [businessName, setBusinessName] = useState("");
    const [businessAddress, setBusinessAddress] = useState("");
    const [taxIdNumber, setTaxIdNumber] = useState("");
    const [primaryColor, setPrimaryColor] = useState("#1A1F36");
    const [secondaryColor, setSecondaryColor] = useState("#3259A8");
    const [accentColor, setAccentColor] = useState("#C9A84C");
    const [tagline, setTagline] = useState("");
    const [phone, setPhone] = useState("");
    const [website, setWebsite] = useState("");
    const [invoiceFooterText, setInvoiceFooterText] = useState("");

    const [isSaving, setIsSaving] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [activeTab, setActiveTab] = useState<"identity" | "details" | "preview">("identity");

    useEffect(() => {
        if (settings) {
            setLogoId(settings.logo);
            setLogoPreview(settings.logoUrl || null);
            setBusinessName(settings.businessName || "");
            setBusinessAddress(settings.businessAddress || "");
            setTaxIdNumber(settings.taxIdNumber || "");
            setPrimaryColor(settings.primaryColor || "#1A1F36");
            setSecondaryColor(settings.secondaryColor || "#3259A8");
            setAccentColor(settings.accentColor || "#C9A84C");
            setTagline(settings.tagline || "");
            setPhone(settings.phone || "");
            setWebsite(settings.website || "");
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
            setLogoPreview(URL.createObjectURL(file));
            setIsDirty(true);
            toast.success("Logo uploaded");
        } catch {
            toast.error("Upload failed");
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
                secondaryColor,
                accentColor,
                tagline,
                phone,
                website,
                invoiceFooterText,
            });
            setIsDirty(false);
            toast.success("Brand DNA saved");
        } catch {
            toast.error("Failed to save");
        } finally {
            setIsSaving(false);
        }
    };

    const dirty = (fn: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        fn(e.target.value);
        setIsDirty(true);
    };

    if (settings === undefined) return <div className="text-white/40 animate-pulse py-12 text-center">Loading Brand DNA...</div>;

    return (
        <div className="max-w-5xl mx-auto space-y-8 pb-20">

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Brand DNA</h1>
                    <p className="text-white/40 mt-1 font-light">Establish your identity. Every document, portal, and invoice carries this DNA.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={!isDirty || isSaving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-xl text-sm font-medium hover:bg-white/90 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                    <Save className="w-4 h-4" />
                    {isSaving ? "Saving..." : "Save DNA"}
                </button>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 w-fit">
                {([["identity", "Identity"], ["details", "Details"], ["preview", "Brand Board"]] as const).map(([key, label]) => (
                    <button key={key} onClick={() => setActiveTab(key)} className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === key ? "bg-white text-black" : "text-white/50 hover:text-white"}`}>
                        {label}
                    </button>
                ))}
            </div>

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* IDENTITY TAB */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "identity" && (
                <div className="space-y-8">
                    {/* Logo + Name Row */}
                    <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-6">
                            <Sparkles className="w-4 h-4 text-white/30" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Mark & Name</h2>
                        </div>
                        <div className="flex items-start gap-8">
                            {/* Logo */}
                            <div className="space-y-3">
                                <div className="w-28 h-28 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.03] flex items-center justify-center overflow-hidden relative group cursor-pointer">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                                    ) : (
                                        <Building className="w-10 h-10 text-white/15" />
                                    )}
                                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-2xl">
                                        <Upload className="w-5 h-5 text-white" />
                                    </div>
                                </div>
                                <p className="text-[10px] text-white/25 text-center">400×400 PNG</p>
                            </div>
                            {/* Name + Tagline */}
                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-[10px] text-white/30 uppercase tracking-wider">Business Name</label>
                                    <input type="text" value={businessName} onChange={dirty(setBusinessName)}
                                        className="w-full mt-1 bg-transparent border-b border-white/10 py-2 text-xl font-serif text-white focus:outline-none focus:border-white/30 placeholder:text-white/15"
                                        placeholder="Your Agency Name" />
                                </div>
                                <div>
                                    <label className="text-[10px] text-white/30 uppercase tracking-wider">Tagline</label>
                                    <input type="text" value={tagline} onChange={dirty(setTagline)}
                                        className="w-full mt-1 bg-transparent border-b border-white/10 py-2 text-sm text-white/70 focus:outline-none focus:border-white/30 italic placeholder:text-white/15"
                                        placeholder="Design that moves markets." />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Color System */}
                    <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-6">
                            <Palette className="w-4 h-4 text-white/30" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Color System</h2>
                        </div>
                        <div className="grid grid-cols-3 gap-6">
                            <ColorPicker label="Primary" description="Deep backgrounds, headers" value={primaryColor} onChange={(v) => { setPrimaryColor(v); setIsDirty(true); }} />
                            <ColorPicker label="Secondary" description="Buttons, links, accents" value={secondaryColor} onChange={(v) => { setSecondaryColor(v); setIsDirty(true); }} />
                            <ColorPicker label="Accent" description="Highlights, badges, stamps" value={accentColor} onChange={(v) => { setAccentColor(v); setIsDirty(true); }} />
                        </div>

                        {/* Live Swatch Strip */}
                        <div className="mt-6 flex items-center gap-2">
                            <div className="h-8 flex-1 rounded-l-xl" style={{ backgroundColor: primaryColor }} />
                            <div className="h-8 flex-1" style={{ backgroundColor: secondaryColor }} />
                            <div className="h-8 flex-1 rounded-r-xl" style={{ backgroundColor: accentColor }} />
                        </div>
                        <p className="text-[10px] text-white/20 mt-2 text-center">Your palette in harmony</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* DETAILS TAB */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "details" && (
                <div className="space-y-8">
                    {/* Contact */}
                    <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-6">
                            <Globe className="w-4 h-4 text-white/30" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Contact & Presence</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <FieldInput label="Phone" icon={Phone} value={phone} onChange={dirty(setPhone)} placeholder="+255 123 456 789" />
                            <FieldInput label="Website" icon={Link2} value={website} onChange={dirty(setWebsite)} placeholder="https://youragency.com" />
                            <FieldInput label="Tax ID / VAT" icon={FileText} value={taxIdNumber} onChange={dirty(setTaxIdNumber)} placeholder="TZ-123456789" />
                        </div>
                    </div>

                    {/* Address */}
                    <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-6">
                            <Building className="w-4 h-4 text-white/30" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Business Address</h2>
                        </div>
                        <textarea value={businessAddress} onChange={dirty(setBusinessAddress)} rows={3}
                            className="w-full bg-transparent border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/15 resize-none"
                            placeholder="1234 Innovation Dr, Dar es Salaam, Tanzania" />
                    </div>

                    {/* Invoice Footer */}
                    <div className="p-8 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                        <div className="flex items-center gap-2 mb-6">
                            <FileText className="w-4 h-4 text-white/30" />
                            <h2 className="text-xs font-medium text-white/40 uppercase tracking-[0.15em]">Invoice Footer</h2>
                        </div>
                        <textarea value={invoiceFooterText} onChange={dirty(setInvoiceFooterText)} rows={2}
                            className="w-full bg-transparent border border-white/[0.08] rounded-xl p-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/15 resize-none"
                            placeholder="Thank you for your business. Payment due within 30 days." />
                        <p className="text-[10px] text-white/20 mt-2">Appears at the bottom of every invoice.</p>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════════════════════════════ */}
            {/* BRAND BOARD PREVIEW TAB */}
            {/* ═══════════════════════════════════════════════════════════════ */}
            {activeTab === "preview" && (
                <div className="space-y-6">
                    <p className="text-xs text-white/30">Live preview of how your brand appears across the system.</p>

                    {/* Invoice Preview */}
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="px-6 py-3 bg-white/5">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">Invoice Header</span>
                        </div>
                        <div className="p-8 bg-white rounded-b-2xl">
                            <div className="h-1 rounded-full mb-6" style={{ backgroundColor: primaryColor }} />
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="w-12 h-12 rounded-lg object-contain" />
                                    ) : (
                                        <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-lg font-bold" style={{ backgroundColor: primaryColor }}>
                                            {businessName.charAt(0) || "E"}
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-lg font-bold" style={{ color: primaryColor }}>{businessName || "Your Agency"}</div>
                                        {tagline && <div className="text-xs text-gray-400 italic">{tagline}</div>}
                                        <div className="text-xs text-gray-500 mt-1 whitespace-pre-line">{businessAddress || "123 Agency St, Suite 100"}</div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold" style={{ color: primaryColor }}>INVOICE</div>
                                    <div className="text-xs text-gray-400 mt-1">#INV-2026-001</div>
                                </div>
                            </div>
                            {/* Mini table */}
                            <div className="mt-6 rounded-lg overflow-hidden border border-gray-100">
                                <div className="px-4 py-2 text-xs font-medium text-white" style={{ backgroundColor: secondaryColor }}>
                                    <div className="flex justify-between"><span>Description</span><span>Amount</span></div>
                                </div>
                                <div className="px-4 py-3 text-xs text-gray-600 flex justify-between border-b border-gray-50">
                                    <span>Strategy & Design Services</span><span>$4,500.00</span>
                                </div>
                                <div className="px-4 py-3 text-xs flex justify-between">
                                    <span className="font-bold" style={{ color: primaryColor }}>Total</span>
                                    <span className="font-bold" style={{ color: primaryColor }}>$4,500.00</span>
                                </div>
                            </div>
                            {/* PAID stamp */}
                            <div className="mt-4 flex justify-end">
                                <span className="px-4 py-1.5 rounded-lg text-xs font-bold tracking-wider" style={{ backgroundColor: accentColor + "20", color: accentColor }}>
                                    ■ PAID
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Button & Badge Preview */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">Buttons</span>
                            <div className="mt-4 flex items-center gap-3">
                                <button className="px-4 py-2 rounded-lg text-sm text-white font-medium" style={{ backgroundColor: secondaryColor }}>Primary Action</button>
                                <button className="px-4 py-2 rounded-lg text-sm font-medium border" style={{ borderColor: secondaryColor, color: secondaryColor }}>Secondary</button>
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/[0.08] bg-white/[0.02]">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">Badges</span>
                            <div className="mt-4 flex items-center gap-2">
                                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: accentColor + "20", color: accentColor }}>Approved</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: secondaryColor + "20", color: secondaryColor }}>In Progress</span>
                                <span className="px-3 py-1 rounded-full text-xs font-medium" style={{ backgroundColor: primaryColor + "30", color: primaryColor.startsWith("#1") || primaryColor.startsWith("#0") ? "#ffffff" : primaryColor }}>Archived</span>
                            </div>
                        </div>
                    </div>

                    {/* Portal Preview */}
                    <div className="rounded-2xl border border-white/[0.08] overflow-hidden">
                        <div className="px-6 py-3 bg-white/5">
                            <span className="text-[10px] text-white/30 uppercase tracking-wider">Client Portal Header</span>
                        </div>
                        <div className="p-6" style={{ backgroundColor: primaryColor }}>
                            <div className="flex items-center gap-3">
                                {logoPreview ? (
                                    <img src={logoPreview} alt="" className="w-8 h-8 rounded-lg object-contain" />
                                ) : (
                                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold" style={{ backgroundColor: secondaryColor, color: "white" }}>
                                        {businessName.charAt(0) || "E"}
                                    </div>
                                )}
                                <div>
                                    <div className="text-white font-medium text-sm">{businessName || "Your Agency"}</div>
                                    {tagline && <div className="text-white/50 text-[10px]">{tagline}</div>}
                                </div>
                            </div>
                            <div className="mt-4 h-0.5 rounded-full" style={{ backgroundColor: accentColor }} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

function ColorPicker({ label, description, value, onChange }: { label: string; description: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="space-y-3">
            <div>
                <div className="text-sm font-medium text-white/60">{label}</div>
                <div className="text-[10px] text-white/25">{description}</div>
            </div>
            <div className="flex items-center gap-3">
                <div className="relative">
                    <div className="w-14 h-14 rounded-xl shadow-lg cursor-pointer border border-white/10" style={{ backgroundColor: value }} />
                    <input
                        type="color" value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <input
                    type="text" value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/[0.08] rounded-lg py-2 px-3 text-sm text-white/60 font-mono focus:outline-none focus:border-white/20"
                />
            </div>
        </div>
    );
}

function FieldInput({ label, icon: Icon, value, onChange, placeholder }: { label: string; icon: any; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder: string }) {
    return (
        <div className="space-y-1.5">
            <label className="flex items-center gap-1.5 text-[10px] text-white/30 uppercase tracking-wider">
                <Icon className="w-3 h-3" /> {label}
            </label>
            <input type="text" value={value} onChange={onChange} placeholder={placeholder}
                className="w-full bg-transparent border border-white/[0.08] rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white/20 placeholder:text-white/15" />
        </div>
    );
}

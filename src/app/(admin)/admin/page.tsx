"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import Link from "next/link";
import {
    DollarSign,
    Users,
    ListTodo,
    Timer,
    Sparkles,
    Share2,
    TrendingUp,
    Clock,
    Zap,
    FileText,
    ArrowUpRight,
    AlertTriangle,
    CheckCircle2,
    CalendarDays,
} from "lucide-react";

function formatCents(cents: number): string {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: 0 }).format(cents / 100);
}

export default function AdminDashboardPage() {
    // Finance — use P&L for MTD metrics, invoiceStats for outstanding
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const pnl = useQuery(api.transactions.getProfitAndLoss, { startDate: startOfMonth.getTime() });
    const invoiceStats = useQuery(api.invoices.getFinancialStats, {});

    // HR
    const employeeStats = useQuery(api.employees.getStats, {});
    const taskStats = useQuery(api.tasks.getStats, {});
    const timeStats = useQuery(api.timeEntries.getStats, {});

    // Content
    const contentStats = useQuery(api.contentAssets.getStats, {});
    const socialStats = useQuery(api.socialPosts.getStats, {});

    const loading = !pnl || !employeeStats || !taskStats || !timeStats;

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">Command Center</h1>
                <p className="text-white/40 mt-1 font-light">
                    {new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                </p>
            </div>

            {loading ? (
                <div className="h-64 flex items-center justify-center text-white/30 animate-pulse">Loading metrics...</div>
            ) : (
                <>
                    {/* Row 1: Revenue KPIs */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <KPICard label="Revenue MTD" value={formatCents(pnl.grossRevenueCents)} icon={DollarSign} color="text-emerald-400" href="/admin/finance/reports" />
                        <KPICard label="Costs MTD" value={formatCents(pnl.totalCostsCents)} icon={TrendingUp} color="text-red-400" href="/admin/expenses" />
                        <KPICard label="Net Profit" value={formatCents(pnl.netProfitCents)} icon={Zap} color={pnl.netProfitCents >= 0 ? "text-emerald-400" : "text-red-400"} href="/admin/finance/reports" subtitle={`${pnl.profitMargin}% margin`} />
                        <KPICard label="Outstanding" value={`$${Math.round(invoiceStats?.outstanding || 0).toLocaleString()}`} icon={FileText} color="text-yellow-400" href="/admin/invoices" subtitle={`${invoiceStats?.overdueCount || 0} overdue`} />
                    </div>

                    {/* Row 2: Operations Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <SectionCard title="Team" icon={Users} href="/admin/employees" stats={[
                            { label: "Active", value: employeeStats.byStatus?.active || 0, color: "text-emerald-400" },
                            { label: "Total", value: employeeStats.total || 0 },
                            { label: "Payroll", value: formatCents(employeeStats.monthlySalaryCents || 0), color: "text-white/60" },
                        ]} />
                        <SectionCard title="Tasks" icon={ListTodo} href="/admin/tasks" stats={[
                            { label: "In Progress", value: taskStats.inProgress || 0, color: "text-blue-400" },
                            { label: "Review", value: taskStats.review || 0, color: "text-purple-400" },
                            { label: "Overdue", value: taskStats.overdue || 0, color: taskStats.overdue ? "text-red-400" : "text-white/30" },
                        ]} />
                        <SectionCard title="Time & Billing" icon={Timer} href="/admin/time" stats={[
                            { label: "Utilization", value: `${timeStats.billablePercentage || 0}%`, color: (timeStats.billablePercentage || 0) >= 70 ? "text-emerald-400" : "text-yellow-400" },
                            { label: "Billable Rev", value: formatCents(timeStats.billableRevenueCents || 0), color: "text-emerald-400" },
                            { label: "Uninvoiced", value: formatCents(timeStats.uninvoicedCents || 0), color: (timeStats.uninvoicedCents || 0) > 0 ? "text-yellow-400" : "text-white/30" },
                        ]} />
                    </div>

                    {/* Row 3: Content & Distribution */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <SectionCard title="AI Studio" icon={Sparkles} href="/admin/content/studio" stats={[
                            { label: "Assets", value: contentStats?.total || 0 },
                            { label: "Images", value: contentStats?.byType?.image || 0, color: "text-purple-400" },
                            { label: "AI Spend", value: formatCents(contentStats?.totalCostCents || 0), color: "text-white/60" },
                        ]} />
                        <SectionCard title="Social" icon={Share2} href="/admin/content/social" stats={[
                            { label: "Scheduled", value: socialStats?.scheduled || 0, color: "text-yellow-400" },
                            { label: "Published", value: socialStats?.published || 0, color: "text-emerald-400" },
                            { label: "Failed", value: socialStats?.failed || 0, color: socialStats?.failed ? "text-red-400" : "text-white/30" },
                        ]} />
                    </div>

                    {/* Row 4: Alerts & Quick Actions */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-4 h-4" /> Attention Required
                            </h3>
                            <div className="space-y-2">
                                {(timeStats.uninvoicedCents || 0) > 0 && <AlertItem text={`${formatCents(timeStats.uninvoicedCents || 0)} in uninvoiced billable hours`} href="/admin/time" color="text-yellow-400" />}
                                {(taskStats.overdue || 0) > 0 && <AlertItem text={`${taskStats.overdue} overdue task${taskStats.overdue > 1 ? "s" : ""}`} href="/admin/tasks" color="text-red-400" />}
                                {(invoiceStats?.overdueCount || 0) > 0 && <AlertItem text={`${invoiceStats?.overdueCount} overdue invoice${(invoiceStats?.overdueCount || 0) > 1 ? "s" : ""}`} href="/admin/invoices" color="text-red-400" />}
                                {(socialStats?.failed || 0) > 0 && <AlertItem text={`${socialStats?.failed} failed social post${(socialStats?.failed || 0) > 1 ? "s" : ""}`} href="/admin/content/social" color="text-red-400" />}
                                {!(timeStats.uninvoicedCents) && !(taskStats.overdue) && !(invoiceStats?.overdueCount) && !(socialStats?.failed) && (
                                    <div className="flex items-center gap-2 text-sm text-emerald-400"><CheckCircle2 className="w-4 h-4" /> All clear — no action needed</div>
                                )}
                            </div>
                        </div>
                        <div className="p-6 rounded-2xl border border-white/10 bg-white/[0.02]">
                            <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <Zap className="w-4 h-4" /> Quick Actions
                            </h3>
                            <div className="grid grid-cols-2 gap-2">
                                <QuickAction href="/admin/invoices/new" label="New Invoice" icon={FileText} />
                                <QuickAction href="/admin/time" label="Log Time" icon={Clock} />
                                <QuickAction href="/admin/content/studio" label="Generate AI" icon={Sparkles} />
                                <QuickAction href="/admin/content/social" label="Schedule Post" icon={CalendarDays} />
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}

function KPICard({ label, value, icon: Icon, color, href, subtitle }: { label: string; value: string; icon: any; color: string; href: string; subtitle?: string }) {
    return (
        <Link href={href} className="group p-5 rounded-2xl border border-white/10 bg-white/5 hover:border-white/20 transition-all">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-white/60 uppercase tracking-wider"><Icon className={`w-4 h-4 ${color}`} />{label}</div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <div className={`mt-2 text-2xl font-bold tracking-tight ${color}`}>{value}</div>
            {subtitle && <div className="mt-1 text-xs text-white/40">{subtitle}</div>}
        </Link>
    );
}

function SectionCard({ title, icon: Icon, href, stats }: { title: string; icon: any; href: string; stats: Array<{ label: string; value: string | number; color?: string }> }) {
    return (
        <Link href={href} className="group p-5 rounded-2xl border border-white/10 bg-white/[0.02] hover:border-white/20 transition-all">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2"><Icon className="w-4 h-4 text-white/40" /><span className="text-sm font-medium text-white">{title}</span></div>
                <ArrowUpRight className="w-3.5 h-3.5 text-white/20 group-hover:text-white/60 transition-colors" />
            </div>
            <div className="grid grid-cols-3 gap-3">
                {stats.map((stat) => (
                    <div key={stat.label}>
                        <div className="text-[10px] text-white/40 uppercase tracking-wider">{stat.label}</div>
                        <div className={`mt-0.5 text-lg font-bold ${stat.color || "text-white"}`}>{stat.value}</div>
                    </div>
                ))}
            </div>
        </Link>
    );
}

function AlertItem({ text, href, color }: { text: string; href: string; color: string }) {
    return <Link href={href} className={`flex items-center gap-2 text-sm ${color} hover:underline`}><div className="w-1.5 h-1.5 rounded-full bg-current" />{text}</Link>;
}

function QuickAction({ href, label, icon: Icon }: { href: string; label: string; icon: any }) {
    return <Link href={href} className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-all"><Icon className="w-4 h-4" /> {label}</Link>;
}

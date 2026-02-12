export default function AdminDashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                    Transmission Received.
                </h1>
                <p className="text-white/40 mt-1 font-light">
                    System operational. All metrics nominal.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Placeholder Widget */}
                <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Revenue MTD</h3>
                    <div className="mt-2 text-3xl font-bold text-white">$15,400</div>
                    <div className="mt-1 text-xs text-emerald-400">+12% from last month</div>
                </div>

                {/* Placeholder Widget */}
                <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Active Leads</h3>
                    <div className="mt-2 text-3xl font-bold text-white">8</div>
                    <div className="mt-1 text-xs text-white/40">3 proposals sent</div>
                </div>

                {/* Placeholder Widget */}
                <div className="p-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm">
                    <h3 className="text-sm font-medium text-white/60 uppercase tracking-wider">Upcoming</h3>
                    <div className="mt-2 text-3xl font-bold text-white">2</div>
                    <div className="mt-1 text-xs text-blue-400">Next: Discovery Call 2pm</div>
                </div>
            </div>

            <div className="p-8 rounded-xl border border-white/5 bg-gradient-to-br from-white/5 to-transparent text-center">
                <p className="text-white/20 italic">
                    "The future is not something we enter. The future is something we create."
                </p>
            </div>
        </div>
    );
}

import { BookingsTable } from "@/components/admin/BookingsTable";
import { Download, RefreshCw } from "lucide-react";

export default function BookingsPage() {
    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-serif font-bold text-white tracking-tight">
                        Bookings
                    </h1>
                    <p className="text-white/40 mt-1 font-light">
                        Manage upcoming time slots and client sessions.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-white/80 rounded-lg text-km transition-all border border-white/5">
                        <RefreshCw className="w-4 h-4" />
                        Sync
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-[#3259A8] hover:bg-[#264280] text-white rounded-lg text-sm transition-all shadow-lg shadow-blue-900/20">
                        <Download className="w-4 h-4" />
                        Export CSV
                    </button>
                </div>
            </div>

            <BookingsTable />
        </div>
    );
}

"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { format } from "date-fns";
import {
    MoreHorizontal,
    Calendar,
    Clock,
    Mail,
    Video,
    CheckCircle2,
    XCircle,
    AlertCircle
} from "lucide-react";

export function BookingsTable() {
    const bookings = useQuery(api.bookings.getAllBookings);

    if (bookings === undefined) {
        return (
            <div className="flex items-center justify-center h-64 text-white/40 animate-pulse">
                Loading connection to mainframe...
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-64 text-white/40 border border-white/10 rounded-lg bg-white/5">
                <Calendar className="w-12 h-12 mb-4 opacity-20" />
                <p>No bookings found in the void.</p>
            </div>
        );
    }

    return (
        <div className="rounded-xl border border-white/10 bg-[#0A0C14]/50 backdrop-blur-md overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-white/5 text-white/60 font-medium">
                    <tr>
                        <th className="px-6 py-4">Guest</th>
                        <th className="px-6 py-4">Topic</th>
                        <th className="px-6 py-4">Date & Time</th>
                        <th className="px-6 py-4">Context</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                    {bookings.map((booking) => {
                        const startDate = new Date(booking.startTime);
                        const isPast = startDate < new Date();

                        return (
                            <tr
                                key={booking._id}
                                className="hover:bg-white/5 transition-colors group"
                            >
                                <td className="px-6 py-4">
                                    <div className="font-medium text-white">{booking.name}</div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
                                        <Mail className="w-3 h-3" />
                                        {booking.email}
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#3259A8]/20 text-[#3259A8] border border-[#3259A8]/30">
                                        {booking.topic}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2 text-white/80">
                                        <Calendar className="w-4 h-4 text-white/40" />
                                        {format(startDate, "MMM d, yyyy")}
                                    </div>
                                    <div className="flex items-center gap-2 text-white/40 text-xs mt-1">
                                        <Clock className="w-3 h-3" />
                                        {format(startDate, "h:mm a")} (UTC)
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {/* Context would be Gatekeeper data if we had it */}
                                    <span className="text-white/20 italic">No extra context</span>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-2">
                                        {booking.status === "confirmed" && (
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        )}
                                        {booking.status === "cancelled" && (
                                            <XCircle className="w-4 h-4 text-red-500" />
                                        )}
                                        <span className={`capitalize ${booking.status === "confirmed" ? "text-emerald-500" : "text-white/40"
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white">
                                        <MoreHorizontal className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}

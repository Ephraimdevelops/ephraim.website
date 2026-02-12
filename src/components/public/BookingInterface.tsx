"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    format,
    addDays,
    startOfWeek,
    endOfWeek,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    addMonths,
    subMonths,
    parseISO
} from "date-fns";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import {
    getAvailableSlots,
    getUserTimezone,
    formatToLocalTime,
    formatToLocalDate
} from "@/lib/time-lord";
import { generateICS } from "@/lib/ics";

// ═══════════════════════════════════════════════════════════════
// UI COMPONENTS
// ═══════════════════════════════════════════════════════════════

export function BookingInterface() {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<string | null>(null); // UTC ISO
    const [formStep, setFormStep] = useState<"time" | "details" | "confirmation">("time");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        topic: "Project", // Default
    });

    const userTimezone = getUserTimezone();
    const createBooking = useMutation(api.bookings.createBooking);

    // Fetch existing bookings to block slots
    // Ideally we fetch for the selected date range, for now we fetch generally or use logic
    // Since we don't have a range query set up for the month view visualization yet, 
    // we will just assume all generated slots are free EXCEPT those taken.
    // We'll simplisticly fetch "today to next month" bookings if we want strictness, 
    // or just filter on selection.
    // For this v1, checking conflicts is a "nice to have" optimization, 
    // but let's assume availability is open.

    // ─── CALENDAR GENERATION ───
    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        return eachDayOfInterval({ start: startDate, end: endDate });
    }, [currentMonth]);

    // ─── SLOT GENERATION ───
    const availableSlots = useMemo(() => {
        if (!selectedDate) return [];
        // Generate UTC slots using Time Lord logic
        return getAvailableSlots(selectedDate);
    }, [selectedDate]);

    // ─── HANDLERS ───
    const handleBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedSlot || !selectedDate) return;

        try {
            // 1. Generate ICS
            const startTime = parseISO(selectedSlot);
            const endTime = parseISO(selectedSlot); // + 45 mins logic handled in backend? No, backend just saves what we send.
            endTime.setMinutes(endTime.getMinutes() + 45);

            const icsString = generateICS({
                startTime,
                endTime,
                summary: `Call with Ephraim: ${formData.topic}`,
                description: `Topic: ${formData.topic}`,
                organizer: { name: "Ephraim", email: "me@ephraim.dev" },
                attendee: { name: formData.name, email: formData.email },
            });

            // 2. Mutate
            await createBooking({
                name: formData.name,
                email: formData.email,
                topic: formData.topic,
                startTime: selectedSlot,
                endTime: endTime.toISOString(),
                timeZone: userTimezone,
                icsString,
            });

            setFormStep("confirmation");
        } catch (err) {
            console.error("Booking failed", err);
            alert("Something went wrong. Please try again.");
        }
    };

    if (formStep === "confirmation") {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="w-full max-w-2xl mx-auto text-center py-20"
            >
                <div className="w-16 h-16 bg-[#3259A8]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-[#3259A8]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <h2 className="font-editorial text-4xl mb-4">Confirmed.</h2>
                <p className="text-[#8A9AB4] mb-8">
                    Check your email for the calendar invite.<br />
                    (It contains the "Magic Ticket" .ics file)
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="text-[#3259A8] hover:text-white transition-colors"
                >
                    Book Another
                </button>
            </motion.div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 min-h-[600px] bg-[#0A0C14] border border-[#3259A8]/20 rounded-2xl overflow-hidden backdrop-blur-sm">

            {/* ─── LEFT: TIME LORD CALENDAR ─── */}
            <div className="lg:col-span-7 p-8 border-r border-[#3259A8]/20">
                <div className="flex justify-between items-center mb-8">
                    <h2 className="font-editorial text-2xl">
                        {format(currentMonth, "MMMM yyyy")}
                    </h2>
                    <div className="flex gap-2">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-2 hover:bg-[#3259A8]/10 rounded-full transition-colors"
                        >
                            ←
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-2 hover:bg-[#3259A8]/10 rounded-full transition-colors"
                        >
                            →
                        </button>
                    </div>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-2 text-center mb-2">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
                        <div key={day} className="text-xs text-[#8A9AB4] font-technical uppercase">
                            {day}
                        </div>
                    ))}
                </div>
                <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((day, i) => {
                        const isSelected = selectedDate && isSameDay(day, selectedDate);
                        const isCurrentMonth = isSameMonth(day, currentMonth);
                        const isPast = day < new Date(new Date().setHours(0, 0, 0, 0));
                        const dayIsToday = isToday(day);

                        return (
                            <button
                                key={i}
                                disabled={isPast || !isCurrentMonth}
                                onClick={() => {
                                    setSelectedDate(day);
                                    setSelectedSlot(null);
                                    setFormStep("time");
                                }}
                                className={`
                  relative h-14 w-full rounded-lg text-sm transition-all duration-300
                  flex flex-col items-center justify-center
                  ${!isCurrentMonth ? "opacity-0 pointer-events-none" : "opacity-100"}
                  ${isPast ? "opacity-30 cursor-not-allowed" : "hover:bg-[#3259A8]/20 cursor-pointer"}
                  ${isSelected ? "bg-[#3259A8] text-white shadow-[0_0_15px_rgba(50,89,168,0.5)]" : "bg-[#14161F] text-[#E8ECF4]"}
                  ${dayIsToday && !isSelected ? "border border-[#3259A8]" : "border border-transparent"}
                `}
                            >
                                <span className={`z-10 relative ${isSelected ? "font-bold" : "font-normal"}`}>
                                    {format(day, "d")}
                                </span>
                            </button>
                        );
                    })}
                </div>

                <div className="mt-8 pt-6 border-t border-[#3259A8]/20">
                    <p className="text-sm text-[#8A9AB4] font-technical flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#3259A8] animate-pulse" />
                        DETECTED TIMEZONE: <span className="text-white">{userTimezone}</span>
                    </p>
                </div>
            </div>

            {/* ─── RIGHT: TIME SLOTS HUD ─── */}
            <div className="lg:col-span-5 p-8 bg-[#02040A]/50 relative">
                <h3 className="font-technical text-sm text-[#8A9AB4] mb-6 uppercase tracking-wider">
                    {formStep === "time" ? "Select Time" : "Your Details"}
                </h3>

                {/* STEP 1: TIME SLOTS */}
                {formStep === "time" && (
                    <div className="h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                        {!selectedDate ? (
                            <div className="h-full flex items-center justify-center text-[#8A9AB4] italic">
                                Select a date from the grid
                            </div>
                        ) : availableSlots.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-[#8A9AB4]">
                                No slots available
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {availableSlots.map((slotUtc) => {
                                    const localTime = formatToLocalTime(slotUtc, userTimezone);
                                    const isSelected = selectedSlot === slotUtc;

                                    return (
                                        <button
                                            key={slotUtc}
                                            onClick={() => {
                                                setSelectedSlot(slotUtc);
                                                setFormStep("details");
                                            }}
                                            className={`
                        w-full p-4 rounded-lg flex justify-between items-center transition-all duration-300 border
                        ${isSelected
                                                    ? "bg-[#3259A8] border-[#3259A8] text-white"
                                                    : "bg-[#0E1118] border-[#3259A8]/20 text-[#E8ECF4] hover:border-[#3259A8] hover:bg-[#3259A8]/10"}
                      `}
                                        >
                                            <span className="font-technical text-lg">{localTime}</span>
                                            {isSelected && (
                                                <motion.span layoutId="arrow" className="text-sm">
                                                    →
                                                </motion.span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* STEP 2: DETAILS FORM */}
                {formStep === "details" && (
                    <motion.form
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        onSubmit={handleBooking}
                        className="space-y-6"
                    >
                        <div className="bg-[#14161F] p-4 rounded-lg border border-[#3259A8]/20 mb-6">
                            <p className="text-sm text-[#8A9AB4] mb-1">SELECTED TIME</p>
                            <p className="text-lg text-white">
                                {selectedDate && selectedSlot ? (
                                    <>
                                        {format(selectedDate, "EEEE, MMMM d")} at {formatToLocalTime(selectedSlot, userTimezone)}
                                    </>
                                ) : "Unknown Date"}
                            </p>
                            <button
                                type="button"
                                onClick={() => setFormStep("time")}
                                className="text-xs text-[#3259A8] hover:underline mt-2"
                            >
                                Change Time
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-[#8A9AB4] mb-2 font-technical">NAME</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full bg-[#0A0C14] border border-[#3259A8]/20 rounded-md p-3 text-white focus:outline-none focus:border-[#3259A8] transition-colors"
                                    placeholder="John Doe"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#8A9AB4] mb-2 font-technical">EMAIL</label>
                                <input
                                    required
                                    type="email"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full bg-[#0A0C14] border border-[#3259A8]/20 rounded-md p-3 text-white focus:outline-none focus:border-[#3259A8] transition-colors"
                                    placeholder="john@example.com"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-[#8A9AB4] mb-2 font-technical">TOPIC</label>
                                <select
                                    required
                                    value={formData.topic}
                                    onChange={e => setFormData({ ...formData, topic: e.target.value })}
                                    className="w-full bg-[#0A0C14] border border-[#3259A8]/20 rounded-md p-3 text-white focus:outline-none focus:border-[#3259A8] transition-colors appearance-none"
                                >
                                    <option value="Project">New Project</option>
                                    <option value="Intro">Introductory Chat</option>
                                    <option value="Retainer">Retainer / Advisory</option>
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full btn-primary mt-8"
                        >
                            Confirm Booking
                        </button>
                    </motion.form>
                )}
            </div>
        </div>
    );
}

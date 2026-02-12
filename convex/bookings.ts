import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal, api } from "./_generated/api";

// ═══════════════════════════════════════════════════════════════
// BOOKING MUTATIONS
// ═══════════════════════════════════════════════════════════════

/**
 * Create a new booking
 * 1. Creates/Updates Lead
 * 2. Creates Booking
 * 3. Schedules Email Action
 */
export const createBooking = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        topic: v.string(),
        startTime: v.string(), // UTC ISO
        endTime: v.string(),   // UTC ISO
        timeZone: v.string(),  // User's timezone (for email formatting if needed, though we use standard formats)
        icsString: v.string(), // Pre-generated ICS string from frontend
    },
    handler: async (ctx, args) => {
        // 1. Handle Lead (Find or Create)
        const existingLead = await ctx.db
            .query("leads")
            .withIndex("by_email", (q) => q.eq("email", args.email))
            .first();

        let leadId = existingLead?._id;

        if (!existingLead) {
            leadId = await ctx.db.insert("leads", {
                name: args.name,
                email: args.email,
                topic: args.topic,
                status: "new",
                source: "website_booking",
                createdAt: Date.now(),
            });
        }

        // 2. Create Booking
        const meetingUrl = "https://meet.google.com/abc-defg-hij"; // TODO: Integration logic or placeholder

        const bookingId = await ctx.db.insert("bookings", {
            leadId,
            name: args.name,
            email: args.email,
            topic: args.topic,
            startTime: args.startTime,
            endTime: args.endTime,
            status: "confirmed",
            rescheduleCount: 0,
            meetingUrl,
            createdAt: Date.now(),
        });

        // 3. Trigger Email Action
        // We format the local time for the email body here or let the frontend pass it. 
        // Capturing it from frontend is safer to match what they saw.
        // For now, let's just pass the UTC time and handling logic to the action? 
        // No, actions run in Node, timezone handling is tricky there too.
        // Let's rely on the ICS attachment for the "True" time.
        // For the email text, we'll try to display a friendly string if possible, or just the date.

        await ctx.scheduler.runAfter(0, api.email.sendBookingEmail, {
            to: args.email,
            name: args.name,
            topic: args.topic,
            startTime: args.startTime, // Passing UTC string, email template will show raw string or we format better?
            meetingUrl,
            icsString: args.icsString,
        });

        return bookingId;
    },
});

/**
 * Get Bookings for a Date Range
 * Used to block off unavailable slots
 */
export const getBookings = query({
    args: {
        start: v.string(), // ISO String
        end: v.string(),   // ISO String
    },
    handler: async (ctx, args) => {
        // Simple range query would be better if we indexed purely by number timestamp, 
        // but string ISO is fine for range if format is strict.
        // Since we only index `by_startTime`, we can grab all future bookings and filter in memory 
        // (assuming volume is low for a portfolio) or use a range query if supported on string index.

        // Convex supports range queries on string indexes.
        const bookings = await ctx.db
            .query("bookings")
            .withIndex("by_startTime", (q) =>
                q.gte("startTime", args.start).lt("startTime", args.end)
            )
            .filter((q) => q.neq(q.field("status"), "cancelled"))
            .collect();

        return bookings.map((b) => ({
            startTime: b.startTime,
            endTime: b.endTime,
        }));
    },
});

/**
 * Get All Bookings (Admin)
 * used for the admin dashboard
 */
export const getAllBookings = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("bookings")
            .withIndex("by_startTime")
            .order("desc")
            .collect();
    },
});

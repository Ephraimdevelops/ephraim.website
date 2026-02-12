"use node";

import { action } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

// Initialize inside handler to avoid build-time env errors
// const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * Send Booking Confirmation Email
 * Includes:
 * - Professional HTML template
 * - .ics calendar attachment (The "Magic Ticket")
 */
export const sendBookingEmail = action({
    args: {
        to: v.string(),
        name: v.string(),
        topic: v.string(),
        startTime: v.string(), // Local formatted time for email body
        meetingUrl: v.string(),
        icsString: v.string(), // The generated ICS file content
    },
    handler: async (ctx, args) => {
        if (!process.env.RESEND_API_KEY) {
            console.error("Missing RESEND_API_KEY");
            return; // Or throw
        }

        // Initialize here
        const resend = new Resend(process.env.RESEND_API_KEY);

        try {
            const { data, error } = await resend.emails.send({
                from: "Ephraim <me@ephraim.dev>", // TODO: User needs to verify domain
                to: [args.to],
                subject: `Confirmed: ${args.topic} with Ephraim`,
                html: `
          <div style="font-family: sans-serif; color: #1a1a1a; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #3259A8;">Meeting Confirmed</h1>
            <p>Hi ${args.name},</p>
            <p>Your <strong>${args.topic}</strong> session is confirmed.</p>
            
            <div style="background: #f4f4f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-weight: bold;">${args.startTime}</p>
              <p style="margin: 10px 0 0;">📍 Google Meet: <a href="${args.meetingUrl}">${args.meetingUrl}</a></p>
            </div>
            
            <p>A calendar invitation has been attached to this email. Please add it to your calendar to ensure timezone synchronization.</p>
            
            <p>Looking forward to it,<br/>Ephraim</p>
          </div>
        `,
                attachments: [
                    {
                        filename: "meeting.ics",
                        content: args.icsString,
                    },
                ],
            });

            if (error) {
                console.error("Resend error:", error);
                throw new Error("Failed to send email");
            }

            return data;
        } catch (err) {
            console.error(err);
            throw new Error("Failed to send email");
        }
    },
});

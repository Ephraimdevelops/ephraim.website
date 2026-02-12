import { format } from "date-fns";

/**
 * Generates an iCalendar (.ics) string for a meeting
 * This "Magic Ticket" allows dates to be added to Outlook/Google Calendar instantly.
 */
interface ICSParams {
    startTime: Date;
    endTime: Date;
    summary: string;
    description: string;
    location?: string;
    organizer: {
        name: string;
        email: string;
    };
    attendee: {
        name: string;
        email: string;
    };
}

export function generateICS({
    startTime,
    endTime,
    summary,
    description,
    location = "Google Meet",
    organizer,
    attendee,
}: ICSParams): string {
    const formatDate = (date: Date) => {
        return date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    };

    const now = formatDate(new Date());
    const start = formatDate(startTime);
    const end = formatDate(endTime);

    const icsLines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//Ephraim OS//Booking System//EN",
        "CALSCALE:GREGORIAN",
        "METHOD:REQUEST",
        "BEGIN:VEVENT",
        `UID:${now}-${attendee.email}`,
        `DTSTAMP:${now}`,
        `DTSTART:${start}`,
        `DTEND:${end}`,
        `SUMMARY:${summary}`,
        `DESCRIPTION:${description}`,
        `LOCATION:${location}`,
        `ORGANIZER;CN=${organizer.name}:mailto:${organizer.email}`,
        `ATTENDEE;RSVP=TRUE;CN=${attendee.name};PARTSTAT=NEEDS-ACTION;ROLE=REQ-PARTICIPANT:mailto:${attendee.email}`,
        "STATUS:CONFIRMED",
        "END:VEVENT",
        "END:VCALENDAR",
    ];

    return icsLines.join("\r\n");
}

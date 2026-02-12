import { addMinutes, setHours, setMinutes, format } from "date-fns";
import { formatInTimeZone, toZonedTime } from "date-fns-tz";

// ═══════════════════════════════════════════════════════════════
// THE TIME LORD ENGINE
// Handles strict UTC conversion for global scheduling
// ═══════════════════════════════════════════════════════════════

// Hardcoded Availability: Mon-Fri, 10 AM - 6 PM EAT (UTC+3)
const BUSINESS_hours_START = 10; // 10 AM EAT
const BUSINESS_hours_END = 18;   // 6 PM EAT
const TIMEZONE_EAT = "Africa/Dar_es_Salaam";

/**
 * Generate available time slots for a given date date
 * Returns UTC ISO strings
 */
export function getAvailableSlots(date: Date): string[] {
    const slots: string[] = [];

    // Create start time in EAT
    // We use date-fns-tz to ensure we are setting hours in specific timezone
    const zonedDate = toZonedTime(date, TIMEZONE_EAT);

    // Start at 10 AM EAT
    let currentSlot = setMinutes(setHours(zonedDate, BUSINESS_hours_START), 0);

    // End at 6 PM EAT
    const endOfDay = setMinutes(setHours(zonedDate, BUSINESS_hours_END), 0);

    // Generate 45 min slots with 15 min buffer
    while (currentSlot < endOfDay) {
        // Convert back to UTC ISO string for storage/transport
        slots.push(currentSlot.toISOString());

        // Add 1 hour (45 min meeting + 15 min break)
        currentSlot = addMinutes(currentSlot, 60);
    }

    return slots;
}

/**
 * Detect User's Timezone
 */
export function getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

/**
 * Format a UTC date to the User's Local Time
 */
export function formatToLocalTime(isoString: string, timezone: string): string {
    const date = new Date(isoString);
    return formatInTimeZone(date, timezone, "h:mm a");
}

/**
 * Format a UTC date to the User's Local Date (e.g., "Mon, Oct 5")
 * Important because 9 PM EAT might be "Tue" but "Mon" in NY.
 */
export function formatToLocalDate(isoString: string, timezone: string): string {
    const date = new Date(isoString);
    return formatInTimeZone(date, timezone, "EEE, MMM d");
}

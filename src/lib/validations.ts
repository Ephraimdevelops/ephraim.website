import { z } from "zod";

// ═══════════════════════════════════════════════════════════════
// EPHRAIM OS - ZOD VALIDATION SCHEMAS
// Server-side validation for all public forms
// Never trust frontend validation alone
// ═══════════════════════════════════════════════════════════════

/**
 * Contact Form / Lead Capture
 */
export const leadSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long")
        .regex(/^[a-zA-Z\s'-]+$/, "Name contains invalid characters"),

    email: z
        .string()
        .email("Invalid email address")
        .max(255, "Email is too long")
        .toLowerCase(),

    company: z
        .string()
        .max(100, "Company name is too long")
        .optional(),

    phone: z
        .string()
        .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")
        .max(20, "Phone number is too long")
        .optional(),

    projectType: z
        .enum(["website", "webapp", "mobile", "branding", "consulting", "other"])
        .optional(),

    budget: z
        .enum(["under5k", "5k-10k", "10k-25k", "25k-50k", "50k+", "unsure"])
        .optional(),

    message: z
        .string()
        .min(10, "Message must be at least 10 characters")
        .max(2000, "Message is too long")
        .optional(),

    // UTM Attribution (pass-through, no strict validation)
    utmSource: z.string().max(100).optional(),
    utmMedium: z.string().max(100).optional(),
    utmCampaign: z.string().max(100).optional(),
    referrer: z.string().max(500).optional(),
});

export type LeadInput = z.infer<typeof leadSchema>;

/**
 * Booking / Calendar
 */
export const bookingSchema = z.object({
    guestName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),

    guestEmail: z
        .string()
        .email("Invalid email address")
        .max(255, "Email is too long")
        .toLowerCase(),

    guestPhone: z
        .string()
        .regex(/^[\d\s\-+()]+$/, "Invalid phone number format")
        .max(20, "Phone number is too long")
        .optional(),

    date: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),

    startTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),

    endTime: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)"),

    timezone: z.string().max(50),

    meetingType: z.enum(["discovery", "consultation", "followup"]),

    notes: z.string().max(1000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;

/**
 * Newsletter Subscription
 */
export const subscriberSchema = z.object({
    email: z
        .string()
        .email("Invalid email address")
        .max(255, "Email is too long")
        .toLowerCase(),

    name: z
        .string()
        .max(100, "Name is too long")
        .optional(),

    source: z.string().max(50).optional(),

    preferences: z.array(z.string().max(50)).max(10).optional(),
});

export type SubscriberInput = z.infer<typeof subscriberSchema>;

/**
 * Contract Signature
 */
export const signatureSchema = z.object({
    signatureData: z
        .string()
        .min(100, "Signature data is too short")
        .max(100000, "Signature data is too large"),

    signerName: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(100, "Name is too long"),

    signerEmail: z
        .string()
        .email("Invalid email address")
        .max(255, "Email is too long")
        .toLowerCase(),
});

export type SignatureInput = z.infer<typeof signatureSchema>;

/**
 * Invoice Line Item
 */
export const invoiceItemSchema = z.object({
    description: z.string().min(1).max(500),
    quantity: z.number().positive().max(10000),
    unitPrice: z.number().nonnegative().max(10000000),
    amount: z.number().nonnegative().max(100000000),
});

export type InvoiceItem = z.infer<typeof invoiceItemSchema>;

/**
 * Expense Entry
 */
export const expenseSchema = z.object({
    description: z.string().min(1).max(500),
    category: z.enum([
        "software",
        "ads",
        "contractors",
        "office",
        "travel",
        "equipment",
        "other",
    ]),
    amount: z.number().positive().max(10000000),
    currency: z.string().length(3).toUpperCase(),
    vendor: z.string().max(200).optional(),
    isTaxDeductible: z.boolean(),
    date: z.number().positive(),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

// ═══════════════════════════════════════════════════════════════
// VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════

/**
 * Safely validate input and return result with errors
 */
export function validateInput<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
    const result = schema.safeParse(data);

    if (result.success) {
        return { success: true, data: result.data };
    }

    const errors = result.error.issues.map(
        (err) => `${err.path.join(".")}: ${err.message}`
    );

    return { success: false, errors };
}

/**
 * Sanitize string to prevent XSS
 */
export function sanitizeString(str: string): string {
    return str
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;")
        .trim();
}

/**
 * Check if email looks suspicious (disposable/temporary)
 */
const SUSPICIOUS_DOMAINS = [
    "tempmail",
    "throwaway",
    "mailinator",
    "guerrillamail",
    "10minutemail",
    "yopmail",
    "fakeinbox",
];

export function isSuspiciousEmail(email: string): boolean {
    const domain = email.split("@")[1]?.toLowerCase() || "";
    return SUSPICIOUS_DOMAINS.some((sus) => domain.includes(sus));
}

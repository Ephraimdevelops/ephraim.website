import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// ═══════════════════════════════════════════════════════════════
// EPHRAIM OS - THE "GOD SCHEMA"
// With Resilience Protocols: Soft Deletes, Rate Limiting
// ═══════════════════════════════════════════════════════════════

export default defineSchema({
  // ═══════════════════════════════════════════════════════════════
  // 1. ADMIN PROFILES
  // ═══════════════════════════════════════════════════════════════
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("admin"), v.literal("client")),
    avatarUrl: v.optional(v.string()),
    currentStatus: v.optional(v.string()),
    timezone: v.optional(v.string()),
    // Google Calendar OAuth
    googleAccessToken: v.optional(v.string()),
    googleRefreshToken: v.optional(v.string()),
    googleCalendarId: v.optional(v.string()),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 2. CRM - CLIENTS (The Rolodex)
  // ═══════════════════════════════════════════════════════════════
  clients: defineTable({
    name: v.string(),
    company: v.optional(v.string()),
    email: v.string(),
    phone: v.optional(v.string()),
    status: v.union(
      v.literal("lead"),
      v.literal("negotiating"),
      v.literal("active"),
      v.literal("retainer"),
      v.literal("archived")
    ),
    magicLinkToken: v.optional(v.string()),
    magicLinkExpiresAt: v.optional(v.number()),
    stripeCustomerId: v.optional(v.string()),
    notes: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_magic_token", ["magicLinkToken"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 3. LEADS (Ad Attribution + Pipeline)
  // ═══════════════════════════════════════════════════════════════
  // LEADS (Potential Clients)
  leads: defineTable({
    name: v.string(),
    email: v.string(),
    company: v.optional(v.string()),
    topic: v.optional(v.string()), // "Project", "Intro", "Retainer"
    status: v.string(), // "new", "contacted", "qualified", "converted", "archived"
    source: v.optional(v.string()), // "web", "referral", "linkedin"
    notes: v.optional(v.string()),
    lastContactedAt: v.optional(v.number()),
    convertedClientId: v.optional(v.id("clients")), // If they become a client
    createdAt: v.number(), // Added createdAt as it's common and useful
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]) // Added index for createdAt
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 5. BOOKINGS (Internal Calendly Replacement)
  // ═══════════════════════════════════════════════════════════════
  // BOOKINGS (The Time Lord System)
  bookings: defineTable({
    leadId: v.optional(v.id("leads")),
    clientId: v.optional(v.id("clients")), // Could be existing client

    name: v.string(),
    email: v.string(),
    topic: v.string(),

    startTime: v.string(), // UTC ISO String
    endTime: v.string(),   // UTC ISO String

    status: v.string(), // "confirmed", "rescheduled", "cancelled", "completed"
    rescheduleCount: v.number(),

    meetingUrl: v.optional(v.string()), // Google Meet / Zoom

    calendarEventId: v.optional(v.string()), // Google Calendar Event ID
    createdAt: v.number(), // Added createdAt as it's common and useful
    deletedAt: v.optional(v.number()),
  })
    .index("by_startTime", ["startTime"])
    .index("by_email", ["email"])
    .index("by_created", ["createdAt"]) // Added index for createdAt
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 4. PROJECTS (Active Work + Portfolio)
  // ═══════════════════════════════════════════════════════════════
  projects: defineTable({
    clientId: v.optional(v.id("clients")),
    title: v.string(),
    slug: v.string(),
    tagline: v.optional(v.string()),
    description: v.string(),
    coverImage: v.optional(v.id("_storage")),
    images: v.optional(v.array(v.id("_storage"))),
    metrics: v.optional(v.string()),
    techStack: v.optional(v.array(v.string())),
    liveUrl: v.optional(v.string()),
    isFeatured: v.boolean(),
    status: v.union(
      v.literal("discovery"),
      v.literal("design"),
      v.literal("development"),
      v.literal("review"),
      v.literal("completed"),
      v.literal("archived")
    ),
    progress: v.number(),
    startDate: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    order: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_slug", ["slug"])
    .index("by_featured", ["isFeatured"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),


  // ═══════════════════════════════════════════════════════════════
  // 6. CONTRACTS (Legal + eSign)
  // ═══════════════════════════════════════════════════════════════
  contracts: defineTable({
    clientId: v.id("clients"),
    title: v.string(),
    htmlContent: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("signed"),
      v.literal("expired"),
      v.literal("declined")
    ),
    signatureData: v.optional(v.string()),
    signedAt: v.optional(v.number()),
    signerName: v.optional(v.string()),
    signerEmail: v.optional(v.string()),
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    signLinkToken: v.optional(v.string()),
    signLinkExpiresAt: v.optional(v.number()),
    sentAt: v.optional(v.number()),
    expiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_sign_token", ["signLinkToken"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 7. INVOICES (Income)
  // ═══════════════════════════════════════════════════════════════
  invoices: defineTable({
    clientId: v.id("clients"),
    projectId: v.optional(v.id("projects")),
    invoiceNumber: v.string(),
    items: v.array(
      v.object({
        description: v.string(),
        quantity: v.number(),
        unitPrice: v.number(),
        amount: v.number(),
      })
    ),
    subtotal: v.number(),
    taxRate: v.number(),
    taxAmount: v.number(),
    total: v.number(),
    currency: v.string(),
    status: v.union(
      v.literal("draft"),
      v.literal("sent"),
      v.literal("viewed"),
      v.literal("paid"),
      v.literal("overdue"),
      v.literal("cancelled")
    ),
    issuedAt: v.optional(v.number()),
    dueAt: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    stripeInvoiceId: v.optional(v.string()),
    stripePaymentUrl: v.optional(v.string()),
    pdfStorageId: v.optional(v.id("_storage")),
    createdAt: v.number(),
    updatedAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_status", ["status"])
    .index("by_invoice_number", ["invoiceNumber"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 8. EXPENSES (Outgoings)
  // ═══════════════════════════════════════════════════════════════
  expenses: defineTable({
    description: v.string(),
    category: v.union(
      v.literal("software"),
      v.literal("ads"),
      v.literal("contractors"),
      v.literal("office"),
      v.literal("travel"),
      v.literal("equipment"),
      v.literal("other")
    ),
    amount: v.number(),
    currency: v.string(),
    vendor: v.optional(v.string()),
    receiptStorageId: v.optional(v.id("_storage")),
    isTaxDeductible: v.boolean(),
    date: v.number(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_category", ["category"])
    .index("by_date", ["date"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 9. TAX SETTINGS (Configuration)
  // ═══════════════════════════════════════════════════════════════
  taxSettings: defineTable({
    userId: v.id("users"),
    defaultTaxRate: v.number(),
    fiscalYearStart: v.string(),
    currency: v.string(),
    taxIdNumber: v.optional(v.string()),
    businessName: v.optional(v.string()),
    businessAddress: v.optional(v.string()),
    logo: v.optional(v.id("_storage")),
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    invoiceFooterText: v.optional(v.string()),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ═══════════════════════════════════════════════════════════════
  // 10. COMMUNICATIONS (Unified Inbox)
  // ═══════════════════════════════════════════════════════════════
  communications: defineTable({
    clientId: v.optional(v.id("clients")),
    leadId: v.optional(v.id("leads")),
    channel: v.union(
      v.literal("email"),
      v.literal("whatsapp"),
      v.literal("form"),
      v.literal("call"),
      v.literal("zoom"),
      v.literal("note")
    ),
    direction: v.union(v.literal("inbound"), v.literal("outbound")),
    subject: v.optional(v.string()),
    content: v.string(),
    isDraft: v.boolean(),
    isAiGenerated: v.boolean(),
    sentAt: v.optional(v.number()),
    sentVia: v.optional(v.string()),
    fromEmail: v.optional(v.string()),
    toEmail: v.optional(v.string()),
    messageId: v.optional(v.string()),
    metadata: v.optional(v.string()),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_lead", ["leadId"])
    .index("by_channel", ["channel"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 11. VIDEO UPDATES (Loom Embeds)
  // ═══════════════════════════════════════════════════════════════
  videoUpdates: defineTable({
    clientId: v.id("clients"),
    projectId: v.optional(v.id("projects")),
    title: v.string(),
    description: v.optional(v.string()),
    embedUrl: v.string(),
    thumbnailUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    viewedAt: v.optional(v.number()),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_project", ["projectId"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 12. BLOG POSTS (Content Engine)
  // ═══════════════════════════════════════════════════════════════
  posts: defineTable({
    title: v.string(),
    slug: v.string(),
    excerpt: v.optional(v.string()),
    content: v.string(),
    coverImage: v.optional(v.id("_storage")),
    tags: v.optional(v.array(v.string())),
    category: v.optional(v.string()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("archived")
    ),
    metaTitle: v.optional(v.string()),
    metaDescription: v.optional(v.string()),
    viewCount: v.number(),
    publishedAt: v.optional(v.number()),
    scheduledAt: v.optional(v.number()),
    isPremium: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_slug", ["slug"])
    .index("by_status", ["status"])
    .index("by_published", ["publishedAt"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 13. NEWSLETTER SUBSCRIBERS
  // ═══════════════════════════════════════════════════════════════
  subscribers: defineTable({
    email: v.string(),
    name: v.optional(v.string()),
    status: v.union(
      v.literal("active"),
      v.literal("unsubscribed"),
      v.literal("bounced")
    ),
    source: v.optional(v.string()),
    preferences: v.optional(v.array(v.string())),
    verifiedAt: v.optional(v.number()),
    unsubscribedAt: v.optional(v.number()),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 14. DOCUMENTS (The Vault)
  // ═══════════════════════════════════════════════════════════════
  documents: defineTable({
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    name: v.string(),
    type: v.union(
      v.literal("brief"),
      v.literal("contract"),
      v.literal("asset"),
      v.literal("invoice"),
      v.literal("receipt"),
      v.literal("proposal"),
      v.literal("other")
    ),
    storageId: v.id("_storage"),
    mimeType: v.string(),
    size: v.number(),
    isClientVisible: v.boolean(),
    uploadedBy: v.union(v.literal("admin"), v.literal("client")),
    createdAt: v.number(),
    // RESILIENCE: Soft Delete
    deletedAt: v.optional(v.number()),
  })
    .index("by_client", ["clientId"])
    .index("by_project", ["projectId"])
    .index("by_type", ["type"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 15. RATE LIMITS (Spam Shield)
  // Tracks submissions to prevent bot abuse
  // ═══════════════════════════════════════════════════════════════
  rateLimits: defineTable({
    identifier: v.string(), // IP address or fingerprint
    action: v.string(), // "contact_form", "booking", "newsletter"
    count: v.number(),
    windowStart: v.number(), // Timestamp of window start
    expiresAt: v.number(), // When to reset
  })
    .index("by_identifier_action", ["identifier", "action"])
    .index("by_expires", ["expiresAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 16. AUDIT LOG (Flight Recorder)
  // Tracks critical actions for debugging
  // ═══════════════════════════════════════════════════════════════
  auditLogs: defineTable({
    action: v.string(), // "invoice.created", "contract.signed", etc.
    entityType: v.string(), // "invoice", "contract", "client"
    entityId: v.optional(v.string()),
    userId: v.optional(v.id("users")),
    metadata: v.optional(v.string()), // JSON with details
    ipAddress: v.optional(v.string()),
    userAgent: v.optional(v.string()),
    success: v.boolean(),
    error: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_action", ["action"])
    .index("by_entity", ["entityType", "entityId"])
    .index("by_created", ["createdAt"]),
});

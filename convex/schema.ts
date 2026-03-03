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
    role: v.union(v.literal("admin"), v.literal("manager"), v.literal("staff"), v.literal("client")),
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
    category: v.optional(v.string()), // Added category
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
      v.literal("salary"),
      v.literal("utilities"),
      v.literal("insurance"),
      v.literal("marketing"),
      v.literal("legal"),
      v.literal("taxes"),
      v.literal("other")
    ),
    amountCents: v.number(), // Store as integer cents (1234 = $12.34)
    currency: v.string(),
    vendor: v.optional(v.string()),
    receiptStorageId: v.optional(v.id("_storage")),
    isTaxDeductible: v.boolean(),
    paymentMethod: v.optional(v.union(
      v.literal("bank_transfer"),
      v.literal("mobile_money"),
      v.literal("cash"),
      v.literal("mpesa"),
      v.literal("tigo_pesa"),
      v.literal("card"),
      v.literal("other")
    )),
    // Recurring
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly"),
      v.literal("quarterly"),
      v.literal("yearly")
    )),
    date: v.number(),
    clientId: v.optional(v.id("clients")),
    projectId: v.optional(v.id("projects")),
    // Links to ledger
    transactionId: v.optional(v.id("transactions")),
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
    // Brand DNA — 3-color system
    primaryColor: v.optional(v.string()),
    secondaryColor: v.optional(v.string()),
    accentColor: v.optional(v.string()),
    // About
    tagline: v.optional(v.string()),
    phone: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(v.string()), // JSON string of { linkedin, instagram, twitter, etc }
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

  // ═══════════════════════════════════════════════════════════════
  // 17. TRANSACTIONS (Immutable Financial Ledger)
  // APPEND-ONLY: Never update or delete rows.
  // Corrections use reversal rows (isReversal = true).
  // This is the SINGLE SOURCE OF TRUTH for all accounting.
  // P&L = SUM(transactions). Cash flow = SUM(transactions by date).
  // ═══════════════════════════════════════════════════════════════
  transactions: defineTable({
    type: v.union(
      v.literal("income"),
      v.literal("expense"),
      v.literal("payment"),
      v.literal("refund"),
      v.literal("adjustment")
    ),
    amountCents: v.number(), // Integer cents (1234 = $12.34). Positive = inflow, negative = outflow.
    currency: v.string(),
    description: v.string(),
    category: v.optional(v.string()),
    reference: v.optional(v.string()), // Bank ref, M-Pesa confirmation, etc.
    date: v.number(), // When the financial event occurred
    paymentGateway: v.optional(v.union(
      v.literal("manual"),
      v.literal("stripe"),
      v.literal("mpesa"),
      v.literal("bank"),
      v.literal("cash")
    )),
    // Source tracking
    createdFrom: v.union(
      v.literal("invoice"),
      v.literal("expense"),
      v.literal("payment"),
      v.literal("manual")
    ),
    createdFromId: v.optional(v.string()), // ID of the source document
    isReversal: v.boolean(), // true = correction/void of a previous transaction
    reversesTransactionId: v.optional(v.id("transactions")),
    createdAt: v.number(),
  })
    .index("by_date", ["date"])
    .index("by_type", ["type"])
    .index("by_createdFrom", ["createdFrom"])
    .index("by_created", ["createdAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 18. VENDORS (External Payees — Contractors, Freelancers)
  // ═══════════════════════════════════════════════════════════════
  vendors: defineTable({
    name: v.string(),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    type: v.union(
      v.literal("contractor"),
      v.literal("vendor"),
      v.literal("freelancer")
    ),
    // Bank Details (TZ-ready)
    bankName: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    mobileMoneyProvider: v.optional(v.union(
      v.literal("mpesa"),
      v.literal("tigo_pesa"),
      v.literal("airtel_money")
    )),
    mobileMoneyNumber: v.optional(v.string()),
    taxId: v.optional(v.string()),
    notes: v.optional(v.string()),
    status: v.union(v.literal("active"), v.literal("inactive")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 19. PAYMENTS (Outbound Payouts — Payroll, Vendor Bills)
  // Auto-creates transaction(type=payment) on completion.
  // ═══════════════════════════════════════════════════════════════
  payments: defineTable({
    // Exactly ONE of these must be set
    vendorId: v.optional(v.id("vendors")),
    employeeId: v.optional(v.string()), // Will become v.id("employees") in Phase B
    payeeName: v.string(), // Denormalized for quick display
    // Amount
    amountCents: v.number(), // Integer cents
    currency: v.string(),
    description: v.string(),
    category: v.union(
      v.literal("salary"),
      v.literal("bonus"),
      v.literal("commission"),
      v.literal("freelance"),
      v.literal("reimbursement"),
      v.literal("vendor_bill")
    ),
    paymentMethod: v.union(
      v.literal("bank_transfer"),
      v.literal("mobile_money"),
      v.literal("cash"),
      v.literal("mpesa"),
      v.literal("tigo_pesa"),
      v.literal("check")
    ),
    status: v.union(
      v.literal("pending"),
      v.literal("processing"),
      v.literal("completed"),
      v.literal("failed")
    ),
    reference: v.optional(v.string()), // Bank ref / M-Pesa confirmation
    scheduledDate: v.optional(v.number()),
    paidAt: v.optional(v.number()),
    // Recurring
    isRecurring: v.optional(v.boolean()),
    recurringFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    )),
    // Billable links
    projectId: v.optional(v.id("projects")),
    clientId: v.optional(v.id("clients")),
    // Ledger link
    transactionId: v.optional(v.id("transactions")),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_vendor", ["vendorId"])
    .index("by_category", ["category"])
    .index("by_scheduled", ["scheduledDate"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 20. JOBS (Background Task Tracker)
  // Tracks async operations: AI gen, publishing, payroll, exports
  // ═══════════════════════════════════════════════════════════════
  jobs: defineTable({
    type: v.string(), // "ai_generation", "social_publish", "payroll_run", "report_export"
    status: v.union(
      v.literal("queued"),
      v.literal("running"),
      v.literal("completed"),
      v.literal("failed")
    ),
    relatedId: v.optional(v.string()), // ID of the entity this job relates to
    metadata: v.optional(v.string()), // JSON with job-specific data
    error: v.optional(v.string()),
    startedAt: v.optional(v.number()),
    finishedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_type", ["type"])
    .index("by_status", ["status"])
    .index("by_created", ["createdAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 21. MONTHLY BALANCE SNAPSHOTS (Performance Cache)
  // Pre-computed monthly totals so historical P&L is instant.
  // Current month always computed live from transactions.
  // ═══════════════════════════════════════════════════════════════
  monthlySnapshots: defineTable({
    month: v.string(), // "2026-01", "2026-02"
    currency: v.string(),
    incomeCents: v.number(),
    expenseCents: v.number(),
    paymentCents: v.number(),
    netCents: v.number(), // income - expenses - payments
    transactionCount: v.number(),
    closingBalanceCents: v.number(), // Running total through this month
    computedAt: v.number(),
  })
    .index("by_month", ["month"]),

  // ═══════════════════════════════════════════════════════════════
  // 22. EMPLOYEES (Minimal v1 — Revenue-focused)
  // ═══════════════════════════════════════════════════════════════
  employees: defineTable({
    name: v.string(),
    email: v.string(),
    phone: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    role: v.string(), // e.g. "designer", "developer", "project_manager"
    title: v.optional(v.string()), // e.g. "Senior Designer"
    department: v.optional(v.string()), // String, not FK
    employmentType: v.union(
      v.literal("full_time"),
      v.literal("part_time"),
      v.literal("contract")
    ),
    startDate: v.number(),
    salaryCents: v.optional(v.number()), // Monthly salary in cents
    currency: v.optional(v.string()),
    payFrequency: v.optional(v.union(
      v.literal("weekly"),
      v.literal("biweekly"),
      v.literal("monthly")
    )),
    defaultBillRateCents: v.optional(v.number()), // Hourly bill rate in cents for time entries
    managerId: v.optional(v.id("employees")), // Self-ref for simple hierarchy
    status: v.union(
      v.literal("active"),
      v.literal("probation"),
      v.literal("on_leave"),
      v.literal("terminated")
    ),
    // Team Portal access
    magicLinkToken: v.optional(v.string()),
    magicLinkExpiresAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status"])
    .index("by_department", ["department"])
    .index("by_magic_token", ["magicLinkToken"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 23. TASKS (Simple Kanban — Revenue-focused)
  // ═══════════════════════════════════════════════════════════════
  tasks: defineTable({
    title: v.string(),
    assigneeId: v.optional(v.id("employees")),
    projectId: v.optional(v.id("projects")),
    clientId: v.optional(v.id("clients")),
    status: v.union(
      v.literal("todo"),
      v.literal("in_progress"),
      v.literal("review"),
      v.literal("done")
    ),
    estimatedHours: v.optional(v.number()),
    dueDate: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_assignee", ["assigneeId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 24. TIME ENTRIES (Billable Hours → Invoice)
  // KEY: invoiceId links approved billable hours to generated invoices
  // KEY: billRateAtTimeCents freezes the rate when logged (rates change)
  // ═══════════════════════════════════════════════════════════════
  timeEntries: defineTable({
    employeeId: v.id("employees"),
    taskId: v.optional(v.id("tasks")),
    projectId: v.optional(v.id("projects")),
    description: v.string(),
    hours: v.number(), // Decimal hours (e.g. 2.5)
    date: v.number(),
    billable: v.boolean(),
    billRateAtTimeCents: v.optional(v.number()), // Frozen rate at log time (never changes)
    status: v.union(
      v.literal("logged"),
      v.literal("approved"),
      v.literal("invoiced")
    ),
    invoiceId: v.optional(v.id("invoices")), // Set when "Generate Invoice from Hours" runs
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_project", ["projectId"])
    .index("by_status", ["status"])
    .index("by_date", ["date"])
    .index("by_invoice", ["invoiceId"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 25. LEAVE REQUESTS
  // ═══════════════════════════════════════════════════════════════
  leaveRequests: defineTable({
    employeeId: v.id("employees"),
    type: v.union(
      v.literal("vacation"),
      v.literal("sick"),
      v.literal("personal")
    ),
    startDate: v.number(),
    endDate: v.number(),
    totalDays: v.number(),
    reason: v.optional(v.string()),
    status: v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
    ),
    approvedById: v.optional(v.id("employees")),
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_employee", ["employeeId"])
    .index("by_status", ["status"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 26. CONTENT ASSETS (AI Studio — with cost tracking)
  // Tracks every AI-generated image, video, text with provider costs
  // ═══════════════════════════════════════════════════════════════
  contentAssets: defineTable({
    type: v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("text"),
      v.literal("audio"),
      v.literal("blog_post"),
      v.literal("social_post"),
      v.literal("pitch_deck"),
      v.literal("company_brief"),
      v.literal("email_campaign")
    ),
    // AI Brand Voice
    brandVoice: v.optional(v.union(
      v.literal("corporate_authority"),
      v.literal("luxury_lifestyle"),
      v.literal("bold_startup"),
      v.literal("empathetic_guide"),
      v.literal("technical_expert")
    )),
    title: v.string(),
    slug: v.optional(v.string()),
    prompt: v.optional(v.string()), // Original generation prompt
    negativePrompt: v.optional(v.string()),
    provider: v.optional(v.string()), // "openai", "anthropic", "midjourney"
    model: v.optional(v.string()), // "dall-e-3", "gpt-4o", "claude-3-5"
    // Output
    outputUrl: v.optional(v.string()), // External URL 
    storageId: v.optional(v.id("_storage")), // Convex file storage (Images/PDFs)
    thumbnailUrl: v.optional(v.string()),
    outputText: v.optional(v.string()), // For plain text generation (Social Captions)
    richOutput: v.optional(v.string()), // For Rich Editor (Blogs, Emails, Letterheads) HTML
    // Rich Editor Meta
    authorName: v.optional(v.string()),
    isFeatured: v.optional(v.boolean()),
    // Dimensions / metadata
    width: v.optional(v.number()),
    height: v.optional(v.number()),
    durationSeconds: v.optional(v.number()), // For video/audio
    fileSizeBytes: v.optional(v.number()),
    // Intelligence & Token Config (Critical for Agency P&L)
    promptTokens: v.optional(v.number()),
    completionTokens: v.optional(v.number()),
    costCents: v.optional(v.number()), // Actual API cost in cents
    // Status
    status: v.union(
      v.literal("generating"),
      v.literal("draft"), // Used when editing rich text
      v.literal("scheduled"),
      v.literal("published"),
      v.literal("completed"), // Used for images/videos
      v.literal("failed")
    ),
    error: v.optional(v.string()),
    // Relations
    projectId: v.optional(v.id("projects")),
    createdBy: v.optional(v.string()), // Clerk userId
    createdAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_type", ["type"])
    .index("by_provider", ["provider"])
    .index("by_status", ["status"])
    .index("by_project", ["projectId"])
    .index("by_slug", ["slug"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 27. SOCIAL ACCOUNTS (OAuth'd platforms)
  // ═══════════════════════════════════════════════════════════════
  socialAccounts: defineTable({
    platform: v.union(
      v.literal("instagram"),
      v.literal("linkedin"),
      v.literal("twitter"),
      v.literal("facebook"),
      v.literal("tiktok")
    ),
    accountName: v.string(), // Display name
    accountId: v.string(), // Platform-specific ID
    // Multi-business support
    businessName: v.string(), // "Ephraim Creative", "Client X Agency"
    businessId: v.optional(v.string()), // Unique key per business
    accessToken: v.optional(v.string()), // Encrypted in production
    refreshToken: v.optional(v.string()),
    tokenExpiresAt: v.optional(v.number()),
    avatarUrl: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_platform", ["platform"])
    .index("by_active", ["isActive"])
    .index("by_business", ["businessName"]),

  // ═══════════════════════════════════════════════════════════════
  // 28. SOCIAL POSTS (Scheduled content publishing)
  // ═══════════════════════════════════════════════════════════════
  socialPosts: defineTable({
    caption: v.string(),
    contentAssetId: v.optional(v.id("contentAssets")), // Link to AI-generated content
    mediaUrl: v.optional(v.string()), // Direct media URL
    mediaType: v.optional(v.union(
      v.literal("image"),
      v.literal("video"),
      v.literal("carousel")
    )),
    // Multi-platform targeting
    targetPlatforms: v.array(v.string()), // ["instagram", "linkedin"]
    // Scheduling
    scheduledAt: v.optional(v.number()), // Null = draft
    publishedAt: v.optional(v.number()),
    status: v.union(
      v.literal("draft"),
      v.literal("scheduled"),
      v.literal("publishing"),
      v.literal("published"),
      v.literal("failed")
    ),
    // Results per platform
    publishResults: v.optional(v.array(v.object({
      platform: v.string(),
      success: v.boolean(),
      postId: v.optional(v.string()),
      error: v.optional(v.string()),
      publishedAt: v.optional(v.number()),
    }))),
    // Relations
    socialAccountIds: v.optional(v.array(v.id("socialAccounts"))),
    projectId: v.optional(v.id("projects")),
    createdBy: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    deletedAt: v.optional(v.number()),
  })
    .index("by_status", ["status"])
    .index("by_scheduled", ["scheduledAt"])
    .index("by_project", ["projectId"])
    .index("by_deleted", ["deletedAt"]),

  // ═══════════════════════════════════════════════════════════════
  // 29. PROJECT FEEDBACK (Approval Room)
  // ═══════════════════════════════════════════════════════════════
  projectFeedback: defineTable({
    projectId: v.id("projects"),
    type: v.union(v.literal("approval"), v.literal("revision")),
    // Who gave the feedback
    authorType: v.union(v.literal("client"), v.literal("team"), v.literal("admin")),
    authorName: v.string(),
    authorEmail: v.optional(v.string()),
    // Structured revision fields (not open chat)
    section: v.optional(v.string()), // "Header Design", "Copy", "Colors", etc.
    description: v.optional(v.string()), // What needs changing
    // Status tracking
    status: v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("resolved")
    ),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_type", ["type"])
    .index("by_status", ["status"]),
});

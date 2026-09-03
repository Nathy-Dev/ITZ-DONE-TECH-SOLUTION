import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    instructorId: v.id("users"),
    duration: v.string(),
    thumbnailUrl: v.string(), // Legacy URL or media asset ID
    thumbnailMediaId: v.optional(v.id("mediaAssets")),
    category: v.string(),
    level: v.string(),
    studentsEnrolled: v.number(),
    rating: v.number(),
    isPublished: v.optional(v.boolean()), // Deprecated, use status
    status: v.optional(v.string()), // "draft", "in_review", "published", "rejected"
    rejectionReason: v.optional(v.string()),
    publishedAt: v.optional(v.number()),
  }).index("by_title", ["title"])
    .index("by_published_category", ["isPublished", "category"])
    .index("by_status_category", ["status", "category"])
    .searchIndex("search_courses", {
      searchField: "title",
      filterFields: ["category", "isPublished", "status"],
    }),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    password: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    providerId: v.string(),
    role: v.optional(v.string()), // "learner", "instructor", or "admin"
  })
    .index("by_provider_id", ["providerId"])
    .index("by_email", ["email"]),
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    status: v.string(), // "active", "completed", "cancelled"
    enrolledAt: v.number(),
    lastLessonId: v.optional(v.id("lessons")),
    lastViewedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),
  progress: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    lessonId: v.id("lessons"),
    completedAt: v.number(),
  })
    .index("by_user_lesson", ["userId", "lessonId"])
    .index("by_user_course", ["userId", "courseId"]),
  sections: defineTable({
    courseId: v.id("courses"),
    title: v.string(),
    order: v.number(),
  }).index("by_course", ["courseId"]),
  lessons: defineTable({
    sectionId: v.id("sections"),
    title: v.string(),
    content: v.optional(v.string()), // Markdown or HTML content
    videoUrl: v.optional(v.string()), // Legacy external URL; new uploads use videoAssetId
    videoAssetId: v.optional(v.id("mediaAssets")),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
  }).index("by_section", ["sectionId"]),
  // Provider-neutral media metadata. Binary content is never stored in Convex.
  mediaAssets: defineTable({
    courseId: v.optional(v.id("courses")),
    lessonId: v.optional(v.id("lessons")),
    ownerId: v.id("users"),
    kind: v.string(), // video | document | image | avatar
    provider: v.string(), // cloudflare_stream | cloudflare_r2
    providerAssetId: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    originalName: v.string(),
    mimeType: v.string(),
    sizeBytes: v.number(),
    durationSeconds: v.optional(v.number()),
    status: v.string(), // pending | processing | ready | failed | deleting | deleted
    visibility: v.string(), // private | public
    checksum: v.optional(v.string()),
    failureReason: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    deletedAt: v.optional(v.number()),
  })
    .index("by_course", ["courseId"])
    .index("by_lesson", ["lessonId"])
    .index("by_owner", ["ownerId"])
    .index("by_provider_asset", ["provider", "providerAssetId"])
    .index("by_status", ["status"]),
  // Retained only for compatibility with pre-media-schema development records.
  courseMedia: defineTable({
    courseId: v.id("courses"),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(),
    size: v.number(),
    url: v.optional(v.string())
  }).index("by_course", ["courseId"]),
  waitlist: defineTable({
    email: v.string(),
    type: v.string(), // "business" or "mentorship"
  }).index("by_email_type", ["email", "type"]),
  reviews: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    rating: v.number(),
    comment: v.string(),
    createdAt: v.number(),
  })
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),
  discussions: defineTable({
    userId: v.id("users"),
    lessonId: v.id("lessons"),
    content: v.string(),
    parentMessageId: v.optional(v.id("discussions")),
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_parent", ["parentMessageId"]),
  certificates: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    certificateId: v.string(),
    issuedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_course", ["courseId"])
    .index("by_user_course", ["userId", "courseId"]),

  mentorProfiles: defineTable({
    userId: v.id("users"),
    bio: v.string(),
    expertise: v.array(v.string()),
    hourlyRate: v.number(),
    isAvailable: v.boolean(),
    rating: v.optional(v.number()),
    totalSessions: v.optional(v.number()),
    createdAt: v.number(),
  }).index("by_user", ["userId"])
    .index("by_availability", ["isAvailable"]),

  // ─── Payments (Flutterwave) ────────────────────────────────────────────
  payments: defineTable({
    txRef: v.string(), // Unique transaction reference (ITZDONE-<random>-<ts>)
    userId: v.id("users"),
    items: v.array(
      v.object({
        courseId: v.id("courses"),
        title: v.string(),
        price: v.number(), // Snapshot of price at purchase time
        instructorId: v.id("users"),
      })
    ),
    amountExpected: v.number(), // Server-computed from DB prices (never client)
    amountPaid: v.optional(v.number()),
    currency: v.string(), // "NGN"
    status: v.string(), // "pending" | "successful" | "failed" | "cancelled"
    flutterwaveTransactionId: v.optional(v.number()),
    paymentMethod: v.optional(v.string()), // e.g. "card", "bank_transfer"
    createdAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_tx_ref", ["txRef"])
    .index("by_user", ["userId"])
    .index("by_status", ["status"]),

  // ─── Instructor earnings (60/40 revenue split) ─────────────────────────
  earnings: defineTable({
    instructorId: v.id("users"),
    paymentId: v.id("payments"),
    courseId: v.id("courses"),
    studentId: v.id("users"),
    coursePrice: v.number(),
    instructorAmount: v.number(), // 60% of course price
    platformAmount: v.number(), // 40% to ITZ-DONE
    status: v.string(), // "available" | "processing" | "paid"
    payoutId: v.optional(v.id("payouts")),
    createdAt: v.number(),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_payment", ["paymentId"])
    .index("by_instructor_status", ["instructorId", "status"])
    .index("by_payout", ["payoutId"]),

  // ─── Tutor local bank accounts (for receiving payouts) ─────────────────
  payoutAccounts: defineTable({
    userId: v.id("users"),
    bankName: v.string(),
    bankCode: v.string(), // Flutterwave bank code
    accountNumber: v.string(),
    accountName: v.string(), // Resolved via Flutterwave account verification
    isVerified: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  // ─── Payouts to instructors ────────────────────────────────────────────
  payouts: defineTable({
    instructorId: v.id("users"),
    amount: v.number(),
    status: v.string(), // "requested" | "processing" | "paid" | "failed"
    reference: v.string(), // Unique payout reference
    earningIds: v.array(v.id("earnings")),
    bankName: v.optional(v.string()),
    bankCode: v.optional(v.string()),
    accountNumber: v.optional(v.string()),
    accountName: v.optional(v.string()),
    flutterwaveTransferId: v.optional(v.number()),
    failureReason: v.optional(v.string()),
    requestedAt: v.number(),
    processedAt: v.optional(v.number()),
  })
    .index("by_instructor", ["instructorId"])
    .index("by_status", ["status"]),
});

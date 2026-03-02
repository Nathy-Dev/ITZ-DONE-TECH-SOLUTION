import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    price: v.number(),
    instructorId: v.string(),
    duration: v.string(),
    thumbnailUrl: v.string(),
    category: v.string(),
    level: v.string(),
    studentsEnrolled: v.number(),
    rating: v.number(),
  }).index("by_title", ["title"]),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    password: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    providerId: v.string(),
  })
    .index("by_provider_id", ["providerId"])
    .index("by_email", ["email"]),
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    status: v.string(), // "active", "completed", "cancelled"
  }),
});

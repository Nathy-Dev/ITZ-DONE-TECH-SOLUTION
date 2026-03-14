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
    isPublished: v.boolean(),
    publishedAt: v.optional(v.number()),
  }).index("by_title", ["title"]),
  users: defineTable({
    name: v.string(),
    email: v.string(),
    profileImage: v.optional(v.string()),
    bio: v.optional(v.string()),
    password: v.optional(v.string()),
    emailVerified: v.optional(v.string()),
    providerId: v.string(),
    role: v.optional(v.string()), // "learner" or "instructor"
  })
    .index("by_provider_id", ["providerId"])
    .index("by_email", ["email"]),
  enrollments: defineTable({
    userId: v.id("users"),
    courseId: v.id("courses"),
    status: v.string(), // "active", "completed", "cancelled"
    enrolledAt: v.number(),
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
    videoUrl: v.optional(v.string()),
    duration: v.optional(v.string()),
    order: v.number(),
    isFree: v.boolean(),
  }).index("by_section", ["sectionId"]),
  courseMedia: defineTable({
    courseId: v.id("courses"),
    storageId: v.id("_storage"),
    name: v.string(),
    type: v.string(), 
    size: v.number(),
    url: v.string(),
  }).index("by_course", ["courseId"]),
});

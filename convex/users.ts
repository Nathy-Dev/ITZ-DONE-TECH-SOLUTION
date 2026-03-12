import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUserByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();
  },
});

export const getUserByProviderId = query({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();
  },
});

export const createOrUpdateUser = mutation({
  args: {
    providerId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
    role: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // 1. Try to find user by providerId (OAuth case)
    let user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    // 2. If not found, try to find by email (Link OAuth to existing Credentials or vice-versa)
    if (!user) {
      user = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", args.email))
        .unique();
    }

    if (user) {
      // Update existing user
      await ctx.db.patch(user._id, {
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        // If this is a new provider for this email, link it? 
        // For now we trust Auth.js handles the mapping, but we ensure we don't duplicate.
      });
    } else {
      // Create new user
      await ctx.db.insert("users", {
        providerId: args.providerId,
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
        role: args.role ?? "learner",
      });
    }
  },
});

export const registerUser = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (existingUser) {
      throw new Error("User already exists");
    }

    return await ctx.db.insert("users", {
      email: args.email,
      password: args.password,
      name: args.name,
      providerId: args.email, // Use email as providerId for uniqueness
    });
  },
});

export const deleteUser = mutation({
  args: { providerId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    if (user) {
      await ctx.db.delete(user._id);
    }
  },
});

export const updateUserRole = mutation({
  args: { 
    providerId: v.string(),
    role: v.string() 
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    if (!user) {
      throw new Error("User not found");
    }

    await ctx.db.patch(user._id, {
      role: args.role,
    });
    
    return args.role;
  },
});

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

export const createOrUpdateUser = mutation({
  args: {
    providerId: v.string(),
    email: v.string(),
    name: v.string(),
    profileImage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_provider_id", (q) => q.eq("providerId", args.providerId))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
      });
    } else {
      await ctx.db.insert("users", {
        providerId: args.providerId,
        name: args.name,
        email: args.email,
        profileImage: args.profileImage,
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
      providerId: "credentials", // Fixed provider ID for credentials users
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

import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const joinWaitlist = mutation({
  args: {
    email: v.string(),
    type: v.string(), // "business" or "mentorship"
  },
  handler: async (ctx, args) => {
    // Check if email already exists for this type
    const existing = await ctx.db
      .query("waitlist")
      .withIndex("by_email_type", (q) => 
        q.eq("email", args.email).eq("type", args.type)
      )
      .first();

    if (existing) {
      throw new Error("You are already on the waitlist for this program.");
    }

    // Insert new waitlist entry
    const id = await ctx.db.insert("waitlist", {
      email: args.email,
      type: args.type,
    });
    
    return id;
  },
});

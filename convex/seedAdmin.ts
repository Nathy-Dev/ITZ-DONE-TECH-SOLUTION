import { mutation } from "./_generated/server";
import { v } from "convex/values";

// Run this via: npx convex run seedAdmin:bootstrapAdmin -d '{"email": "your-email@example.com"}'
export const bootstrapAdmin = mutation({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email))
      .unique();

    if (!user) {
      throw new Error(`User with email ${args.email} not found.`);
    }

    await ctx.db.patch(user._id, { role: "admin" });
    return `Successfully promoted ${args.email} to admin.`;
  },
});

import { mutation } from "./_generated/server";

export const cleanupDuplicateUsers = mutation({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    const emailGroups = new Map<string, any[]>();

    // Group users by email
    for (const user of allUsers) {
      const email = user.email.toLowerCase();
      if (!emailGroups.has(email)) {
        emailGroups.set(email, []);
      }
      emailGroups.get(email)!.push(user);
    }

    let mergedCount = 0;
    let deletedCount = 0;

    for (const [email, users] of emailGroups.entries()) {
      if (users.length > 1) {
        // Find the primary user: Prefer OAuth (providerId !== email) over Credentials
        // If both are same type, prefer the one that has more data or the first one
        let primaryIndex = users.findIndex(u => u.providerId !== u.email && u.providerId !== "credentials");
        
        if (primaryIndex === -1) {
          primaryIndex = 0; // Default to the first one
        }

        const primary = users[primaryIndex];
        const others = users.filter((_, i) => i !== primaryIndex);

        console.log(`Merging ${others.length} users into primary ${primary._id} for email ${email}`);

        const updates: any = {};

        for (const other of others) {
          // Merge password if primary doesn't have one
          if (!primary.password && other.password) {
            updates.password = other.password;
            primary.password = other.password; // Update local copy for next iteration
          }
          // Merge role if primary doesn't have one or if other has "instructor"
          if (!primary.role || (other.role === "instructor" && primary.role !== "instructor")) {
            updates.role = other.role;
            primary.role = other.role;
          }
          // Merge name/image if missing
          if (!primary.name && other.name) updates.name = other.name;
          if (!primary.profileImage && other.profileImage) updates.profileImage = other.profileImage;

          // Delete the redundant record
          await ctx.db.delete(other._id);
          deletedCount++;
        }

        if (Object.keys(updates).length > 0) {
          await ctx.db.patch(primary._id, updates);
          mergedCount++;
        }
      }
    }

    return {
      message: "Cleanup complete",
      mergedCount,
      deletedCount,
    };
  },
});

import { query } from "./_generated/server";

export const checkDuplicateEmails = query({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const emails = users.map(u => u.email);
    const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);
    
    const duplicateGroups = duplicates.map(email => ({
      email,
      users: users.filter(u => u.email === email).map(u => ({
        id: u._id,
        providerId: u.providerId,
        name: u.name
      }))
    }));

    return {
      total: users.length,
      duplicateCount: duplicates.length,
      duplicateGroups
    };
  },
});

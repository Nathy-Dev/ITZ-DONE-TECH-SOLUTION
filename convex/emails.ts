import { internalAction } from "./_generated/server";
import { v } from "convex/values";
import { Resend } from "resend";

export const sendCourseStatusEmail = internalAction({
  args: {
    email: v.string(),
    courseTitle: v.string(),
    status: v.string(), // "published" or "rejected"
    rejectionReason: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Only send if API key exists, otherwise log it (for local testing without key)
    if (!process.env.RESEND_API_KEY) {
      console.warn("RESEND_API_KEY is not set. Email not sent.");
      console.log(`Would have sent ${args.status} email to ${args.email} for course: ${args.courseTitle}`);
      return;
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    const isPublished = args.status === "published";
    const subject = isPublished 
      ? `🎉 Your course "${args.courseTitle}" is now live!`
      : `Action Required: Updates needed for "${args.courseTitle}"`;

    const html = isPublished
      ? `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #1e40af;">Congratulations!</h2>
          <p>Your course <strong>"${args.courseTitle}"</strong> has been approved by our review team and is now live on the platform.</p>
          <p>Students can now enroll and start learning from your content.</p>
          <p>Keep up the great work!</p>
          <p>- The ITZ-DONE Team</p>
        </div>
      `
      : `
        <div style="font-family: sans-serif; max-w: 600px; margin: 0 auto;">
          <h2 style="color: #991b1b;">Review Feedback</h2>
          <p>Thank you for submitting <strong>"${args.courseTitle}"</strong> for review.</p>
          <p>Our team has reviewed your course and requested some changes before it can be published.</p>
          <div style="background-color: #fef2f2; padding: 16px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0;"><strong>Feedback:</strong> ${args.rejectionReason || "Please review the course guidelines."}</p>
          </div>
          <p>Please make the requested changes and submit the course for review again.</p>
          <p>- The ITZ-DONE Team</p>
        </div>
      `;

    try {
      await resend.emails.send({
        from: "ITZ-DONE Team <noreply@itzdone.tech>", // Note: User needs to verify this domain in Resend
        to: args.email,
        subject: subject,
        html: html,
      });
      console.log(`Successfully sent email to ${args.email}`);
    } catch (error) {
      console.error("Failed to send email:", error);
    }
  },
});

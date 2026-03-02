import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { ConvexHttpClient } from "convex/browser";
import { api } from "convex/_generated/api";

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    GitHub, 
    Google,
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
        if (!convexUrl) {
          console.error("NEXT_PUBLIC_CONVEX_URL is not defined");
          return null;
        }
        const convex = new ConvexHttpClient(convexUrl);

        const user = await convex.query(api.users.getUserByEmail, {
          email: credentials.email as string,
        });

        if (!user || !user.password) return null;

        const isPasswordCorrect = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isPasswordCorrect) return null;

        return {
          id: user.providerId,
          name: user.name,
          email: user.email,
          image: user.profileImage,
        };
      },
    }),
  ],
  trustHost: true,
  callbacks: {
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
      }
      return session;
    },
  },
});

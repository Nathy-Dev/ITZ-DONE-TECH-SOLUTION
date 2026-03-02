import NextAuth from "next-auth";
import { NextRequest } from "next/server";
import authConfig from "./auth.config";

const { auth } = NextAuth(authConfig);

export const runtime = "edge";

export const proxy = (...args: any[]) => auth(...args);
export default auth;

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|login|register|$).*)"],
};

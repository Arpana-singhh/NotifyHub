import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password", "/verify-account"];
const ADMIN_ROUTES = ["/admin"];

export async function proxy(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    const isPublicRoute = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
    const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));

    // Logged-in user trying to visit public routes → redirect to role home
    if (token && isPublicRoute) {
        const dest = token.role === "admin" ? "/admin" : "/dashboard";
        return NextResponse.redirect(new URL(dest, req.url));
    }

    // Not logged in trying to visit protected route → redirect to login
    if (!token && !isPublicRoute) {
        return NextResponse.redirect(new URL("/login", req.url));
    }

    // Logged-in user with role 'user' trying to visit admin routes → redirect to dashboard
    if (token && isAdminRoute && token.role !== "admin") {
        return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)"],
};

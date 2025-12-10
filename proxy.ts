import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

/**
 * 路由代理处理器
 * 处理认证保护和路由重定向
 * Requirements: 4.4
 */
export async function proxy(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.AUTH_SECRET });
  const isLoggedIn = !!token;
  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/login";

  // 未认证用户访问后台路由时重定向到登录页
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已认证用户访问登录页时重定向到后台
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login"],
};

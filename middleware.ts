import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * 简单的认证中间件
 * 通过检查 session cookie 来验证用户登录状态
 */
export function middleware(req: NextRequest) {
  const sessionCookie = req.cookies.get("session");
  let isLoggedIn = false;

  if (sessionCookie?.value) {
    try {
      const sessionData = JSON.parse(
        Buffer.from(sessionCookie.value, "base64").toString()
      );
      // 检查是否过期
      isLoggedIn = sessionData.exp > Date.now();
    } catch {
      isLoggedIn = false;
    }
  }

  const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");
  const isLoginPage = req.nextUrl.pathname === "/login";
  const isRegisterPage = req.nextUrl.pathname === "/register";

  // 未认证用户访问后台路由时重定向到登录页
  if (isAdminRoute && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 已认证用户访问登录/注册页时重定向到后台
  if ((isLoginPage || isRegisterPage) && isLoggedIn) {
    return NextResponse.redirect(new URL("/admin", req.nextUrl.origin));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/login", "/register"],
};

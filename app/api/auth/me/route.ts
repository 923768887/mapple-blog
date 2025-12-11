import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * 获取当前用户信息
 * GET /api/auth/me
 */
export async function GET() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return NextResponse.json({ user: null });
    }

    // 解析 session
    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // 检查是否过期
    if (sessionData.exp < Date.now()) {
      cookieStore.delete("session");
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: sessionData.userId,
        email: sessionData.email,
        name: sessionData.name,
        role: sessionData.role,
      },
    });
  } catch {
    return NextResponse.json({ user: null });
  }
}

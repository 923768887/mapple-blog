import { NextResponse } from "next/server";
import { cookies } from "next/headers";

/**
 * 登出 API
 * POST /api/auth/logout
 */
export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("session");

  return NextResponse.json({ success: true });
}

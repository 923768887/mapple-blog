import { cookies } from "next/headers";

/**
 * 用户 Session 类型
 */
export interface UserSession {
  userId: string;
  email: string;
  name: string | null;
  role: string;
}

/**
 * 获取当前登录用户（服务端使用）
 */
export async function getSession(): Promise<UserSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    if (!sessionCookie?.value) {
      return null;
    }

    const sessionData = JSON.parse(
      Buffer.from(sessionCookie.value, "base64").toString()
    );

    // 检查是否过期
    if (sessionData.exp < Date.now()) {
      return null;
    }

    return {
      userId: sessionData.userId,
      email: sessionData.email,
      name: sessionData.name,
      role: sessionData.role,
    };
  } catch {
    return null;
  }
}

/**
 * 检查用户是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const session = await getSession();
  return session !== null;
}

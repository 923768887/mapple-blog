import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // 使用标准 pg Pool，配置适合 Supabase 的连接池参数
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 3, // Supabase 免费版连接数有限，设置较小值
    idleTimeoutMillis: 20000,
    connectionTimeoutMillis: 10000,
  });
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// 确保复用 Prisma 实例
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

globalForPrisma.prisma = prisma;

export default prisma;

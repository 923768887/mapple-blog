import { PrismaClient } from "@/lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
};

function createPrismaClient(): PrismaClient {
  // 配置连接池，限制最大连接数以适应 Serverless 环境
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 5, // 最大连接数，Serverless 环境建议设置较小值
    idleTimeoutMillis: 30000, // 空闲连接超时时间
    connectionTimeoutMillis: 10000, // 连接超时时间
  });
  
  globalForPrisma.pool = pool;
  
  const adapter = new PrismaPg(pool);
  return new PrismaClient({ adapter });
}

// 确保在开发和生产环境都复用 Prisma 实例
export const prisma: PrismaClient = globalForPrisma.prisma ?? createPrismaClient();

// 在所有环境中都缓存 Prisma 实例，避免创建过多连接
globalForPrisma.prisma = prisma;

export default prisma;

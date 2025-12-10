import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // 属性测试默认运行 100 次迭代
    testTimeout: 30000,
    // 包含测试文件的模式
    include: ['**/*.test.ts', '**/*.spec.ts'],
    // 排除 node_modules
    exclude: ['node_modules', '.next'],
  },
});

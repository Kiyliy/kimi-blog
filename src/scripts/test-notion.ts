#!/usr/bin/env node

/**
 * 测试Notion集成的命令行脚本
 * 
 * 使用方法: 
 * 1. 编译TypeScript: npx tsc src/scripts/test-notion.ts
 * 2. 运行: node src/scripts/test-notion.js
 */

import { runTest } from '../tests/notion-public.test';

console.log('正在测试Notion公开页面访问...');
runTest()
  .then(() => {
    console.log('测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('测试过程中发生错误:', error);
    process.exit(1);
  }); 
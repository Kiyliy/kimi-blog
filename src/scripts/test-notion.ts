#!/usr/bin/env node

/**
 * 测试Notion集成的命令行脚本
 * 
 * 使用方法: 
 * npm run test:notion
 */

// 确保能够读取环境变量
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const { runTest } = require('../tests/notion-public.test');

console.log('正在测试Notion公开页面访问...');
console.log(`使用的环境变量: DATA_SOURCE=${process.env.DATA_SOURCE}, NOTION_PUBLIC_PAGE_ID=${process.env.NOTION_PUBLIC_PAGE_ID}`);
runTest()
  .then(() => {
    console.log('测试完成');
    process.exit(0);
  })
  .catch((error) => {
    console.error('测试过程中发生错误:', error);
    process.exit(1);
  }); 
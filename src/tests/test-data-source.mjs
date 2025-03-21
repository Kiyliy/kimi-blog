#!/usr/bin/env node
/**
 * 测试数据源切换
 * 验证环境变量和数据源切换功能
 */
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// 加载环境变量
dotenv.config({ path: '.env.local' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testDataSource() {
  console.log('=== 测试数据源配置 ===');
  
  // 打印环境变量
  console.log('环境变量:');
  console.log('NEXT_PUBLIC_DATA_SOURCE =', process.env.NEXT_PUBLIC_DATA_SOURCE);
  console.log('NEXT_PUBLIC_NOTION_PAGE_ID =', process.env.NEXT_PUBLIC_NOTION_PAGE_ID);
  
  // 动态导入数据源模块
  try {
    const { getDataSource, getAllPosts } = await import('../middleware/posts.js');
    
    // 获取数据源类型
    const source = await getDataSource();
    console.log('\n当前数据源类型:', source);
    
    // 根据数据源获取文章
    console.log('\n尝试获取文章:');
    const posts = await getAllPosts();
    console.log(`获取到 ${posts.length} 篇文章:`);
    
    if (posts.length > 0) {
      posts.forEach((post, index) => {
        console.log(`${index + 1}. ${post.title} (${post.slug})`);
      });
    } else {
      console.log('没有获取到文章');
    }
    
    return { success: true, source, postsCount: posts.length };
  } catch (error) {
    console.error('测试失败:', error);
    return { success: false, error: error.message };
  }
}

// 运行测试
testDataSource()
  .then(result => {
    console.log('\n=== 测试结果 ===');
    console.log(result.success ? '测试成功' : '测试失败');
    process.exit(0);
  })
  .catch(error => {
    console.error('执行出错:', error);
    process.exit(1);
  }); 
#!/usr/bin/env node
/**
 * 测试notion-content模块
 * 验证从Notion获取博客文章并格式化的功能
 * 
 * 使用方法: node src/tests/test-notion-content.mjs [Notion页面URL或ID]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { fetchNotionPage, extractPageId, analyzeNotionData, extractBlogPost } from '../lib/notion-client-api.mjs';

// 加载环境变量
dotenv.config();

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, 'outputs');

// 获取命令行参数或环境变量中的Notion页面ID
const notionPageIdOrUrl = process.argv[2] || process.env.NOTION_PUBLIC_PAGE_ID || '1bd00c01c1608010ae44f4305a2be2db';

// 确保输出目录存在
function ensureOutputDirExists() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 创建输出目录: ${outputDir}`);
  }
}

// 保存内容到文件
function saveToFile(filename, content) {
  try {
    const filePath = path.join(outputDir, filename);
    fs.writeFileSync(filePath, content);
    console.log(`💾 内容已保存到: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`❌ 保存文件失败: ${error instanceof Error ? error.message : String(error)}`);
    return false;
  }
}

// 从Notion获取博客文章
async function getBlogPosts() {
  try {
    // 直接使用notion-client-api的函数
    console.log('正在获取博客文章列表...');
    
    // 使用环境变量NOTION_PUBLIC_PAGE_ID或命令行参数
    // 如果直接传递页面ID，则设置环境变量
    const pageId = extractPageId(notionPageIdOrUrl);
    console.log(`使用页面ID: ${pageId}`);
    
    // 获取页面数据
    const recordMap = await fetchNotionPage(pageId);
    if (!recordMap) {
      console.log('❌ 获取页面数据失败');
      return { success: false, error: '获取页面数据失败' };
    }
    
    console.log('✅ 已获取页面数据');
    
    // 分析页面数据
    const analysis = analyzeNotionData(recordMap);
    if (!analysis || !analysis.success) {
      console.log('❌ 分析页面数据失败');
      return { success: false, error: '分析页面数据失败' };
    }
    
    console.log(`✅ 页面标题: ${analysis.title}`);
    console.log(`✅ 块数量: ${analysis.blockCount}`);
    
    // 提取博客文章
    const blogPost = extractBlogPost(recordMap);
    if (!blogPost) {
      console.log('❌ 提取博客文章失败');
      return { success: false, error: '提取博客文章失败' };
    }
    
    console.log(`✅ 文章标题: ${blogPost.title}`);
    console.log(`✅ 内容块数量: ${blogPost.contentBlocks.length}`);
    
    // 保存原始数据
    saveToFile(`notion-data-${pageId}-${new Date().toISOString().replace(/[:\.]/g, '-')}.json`,
      JSON.stringify(recordMap, null, 2));
    
    // 保存分析结果
    saveToFile(`notion-analysis-${pageId}-${new Date().toISOString().replace(/[:\.]/g, '-')}.json`,
      JSON.stringify(analysis, null, 2));
    
    // 保存博客文章
    saveToFile(`blog-post-${pageId}-${new Date().toISOString().replace(/[:\.]/g, '-')}.json`,
      JSON.stringify(blogPost, null, 2));
    
    return { success: true, recordMap, analysis, blogPost };
  } catch (error) {
    console.error('❌ 获取博客文章失败:', error);
    return { success: false, error };
  }
}

// 主函数
async function main() {
  console.log('====================================');
  console.log('Notion博客内容获取测试');
  console.log('====================================');
  
  // 确保输出目录存在
  ensureOutputDirExists();
  
  // 获取博客文章
  const result = await getBlogPosts();
  
  console.log('\n====================================');
  console.log(result.success ? '测试成功完成' : '测试失败');
  console.log('====================================');
}

// 运行主函数
main()
  .then(() => console.log('脚本执行完毕'))
  .catch(error => console.error('脚本执行出错:', error)); 
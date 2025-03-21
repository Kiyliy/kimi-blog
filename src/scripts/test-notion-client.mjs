#!/usr/bin/env node
/**
 * Notion客户端API测试脚本
 * 用于测试从公共Notion页面获取数据
 * 
 * 使用方法: node src/scripts/test-notion-client.mjs [Notion页面URL或ID]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import * as notionApi from '../lib/notion-client-api.mjs';

// 加载环境变量
dotenv.config();

// 获取当前文件目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../tests/outputs');

// 获取命令行参数或环境变量中的Notion页面ID
const notionPageIdOrUrl = process.argv[2] || process.env.NOTION_PUBLIC_PAGE_ID || '1bd00c01c1608010ae44f4305a2be2db';

// 确保输出目录存在
function ensureOutputDirExists() {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 创建输出目录: ${outputDir}`);
  }
}

// 保存结果到文件
function saveToFile(filename, content) {
  const filePath = path.join(outputDir, filename);
  fs.writeFileSync(filePath, content);
  console.log(`💾 结果已保存到: ${filePath}`);
}

// 显示集合数据
function displayCollection(collection) {
  if (!collection) {
    console.log('❌ 未找到集合数据');
    return;
  }
  
  console.log(`\n📊 集合名称: ${collection.name}`);
  console.log(`📄 包含 ${collection.pages.length} 个页面`);
  
  // 显示集合架构
  console.log('\n📋 集合字段:');
  Object.entries(collection.schema).forEach(([key, schema]) => {
    console.log(`  - ${schema.name} (${schema.type})`);
  });
  
  // 显示页面列表
  console.log('\n📑 页面列表:');
  collection.pages.forEach((page, index) => {
    console.log(`  ${index + 1}. ${page.title}`);
  });
}

// 显示博客文章数据
function displayBlogPost(post) {
  if (!post) {
    console.log('❌ 未找到博客文章数据');
    return;
  }
  
  console.log(`\n📝 文章标题: ${post.title}`);
  
  // 显示属性
  console.log('\n📋 文章属性:');
  Object.entries(post.properties).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value}`);
  });
  
  // 显示内容块数量
  console.log(`\n📄 包含 ${post.contentBlocks.length} 个内容块`);
  
  // 显示内容块类型统计
  const blockTypes = {};
  post.contentBlocks.forEach(block => {
    if (block.type) {
      blockTypes[block.type] = (blockTypes[block.type] || 0) + 1;
    }
  });
  
  console.log('\n📊 内容块类型统计:');
  Object.entries(blockTypes).forEach(([type, count]) => {
    console.log(`  - ${type}: ${count}`);
  });
}

// 主函数
async function main() {
  console.log('====================================');
  console.log('Notion客户端API测试');
  console.log('====================================');
  
  // 确保输出目录存在
  ensureOutputDirExists();
  
  try {
    // 提取并格式化页面ID
    const pageId = notionApi.extractPageId(notionPageIdOrUrl);
    console.log(`🔍 提取的页面ID: ${pageId}`);
    
    // 获取页面数据
    console.log(`\n📥 正在获取Notion页面数据...`);
    const recordMap = await notionApi.fetchNotionPage(pageId);
    
    if (!recordMap) {
      console.log('❌ 获取页面数据失败');
      return;
    }
    
    console.log('✅ 成功获取页面数据!');
    
    // 分析页面数据
    const analysis = notionApi.analyzeNotionData(recordMap);
    
    if (!analysis.success) {
      console.log(`❌ 分析页面数据失败: ${analysis.message}`);
      return;
    }
    
    // 显示基本信息
    console.log(`\n📑 页面标题: ${analysis.title}`);
    console.log(`📊 包含 ${analysis.blockCount} 个块`);
    
    console.log('\n📊 块类型统计:');
    Object.entries(analysis.blockTypes).forEach(([type, count]) => {
      console.log(`  - ${type}: ${count}`);
    });
    
    // 检查是否包含集合
    if (analysis.blockTypes.collection_view) {
      console.log('\n🗃️ 检测到集合/数据库...');
      
      // 提取集合数据
      const collection = notionApi.extractCollection(recordMap);
      displayCollection(collection);
      
      // 保存集合数据
      const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
      saveToFile(
        `notion-collection-${pageId}-${timestamp}.json`,
        JSON.stringify(collection, null, 2)
      );
    }
    
    // 检查是否是博客文章
    if (analysis.blockTypes.page && !analysis.blockTypes.collection_view) {
      console.log('\n📝 检测到博客文章...');
      
      // 提取文章数据
      const blogPost = notionApi.extractBlogPost(recordMap);
      displayBlogPost(blogPost);
      
      // 保存博客文章数据
      const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
      saveToFile(
        `notion-blog-post-${pageId}-${timestamp}.json`,
        JSON.stringify(blogPost, null, 2)
      );
    }
    
    // 保存完整数据
    const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
    saveToFile(
      `notion-full-data-${pageId}-${timestamp}.json`,
      JSON.stringify(recordMap, null, 2)
    );
    
    console.log('\n✅ 测试完成!');
  } catch (error) {
    console.error('❌ 测试过程中出错:', error);
  }
  
  console.log('\n====================================');
  console.log('测试结束');
  console.log('====================================');
}

// 运行主函数
main()
  .then(() => console.log('脚本执行完毕'))
  .catch(error => console.error('脚本执行出错:', error)); 
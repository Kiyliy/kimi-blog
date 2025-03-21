#!/usr/bin/env node
/**
 * Notion页面数据获取工具
 * 使用方法：node notion-fetch.mjs [页面ID]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { NotionAPI } from 'notion-client';
import dotenv from 'dotenv';

// 加载.env文件
dotenv.config();

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 初始化Notion API客户端
const notion = new NotionAPI();

// 获取命令行参数或使用环境变量
const notionPageId = process.argv[2] || process.env.NOTION_PUBLIC_PAGE_ID || '1bd00c01c1608010ae44f4305a2be2db';

// 输出目录
const outputDir = path.join(__dirname, 'notion-data');

// 确保输出目录存在
function ensureOutputDirExists() {
  if (!fs.existsSync(outputDir)) {
    try {
      fs.mkdirSync(outputDir, { recursive: true });
      console.log(`📁 创建输出目录: ${outputDir}`);
    } catch (error) {
      console.error(`❌ 创建输出目录失败: ${error instanceof Error ? error.message : String(error)}`);
    }
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

// 格式化Notion页面ID（移除所有非字母数字字符）
function formatPageId(pageId) {
  return pageId.replace(/-/g, '').replace(/\//g, '');
}

// 提取页面ID（支持URL格式）
function extractPageId(input) {
  // 处理完整URL格式
  if (input.includes('notion.so')) {
    // 匹配形如 notion.so/[workspace/]title-pageId 的URL
    const match = input.match(/notion\.so\/(?:[^\/]+\/)?(?:[^-]+-)?([-a-zA-Z0-9]+)(?:\?|$)/);
    if (match && match[1]) {
      return formatPageId(match[1]);
    }
  }
  
  // 处理短URL格式
  if (input.includes('notion.site')) {
    const match = input.match(/notion\.site\/(?:[^-]+-)?([-a-zA-Z0-9]+)(?:\?|$)/);
    if (match && match[1]) {
      return formatPageId(match[1]);
    }
  }
  
  // 如果是UUID格式（包含或不包含连字符）
  const uuidMatch = input.match(/([a-f0-9]{8}[-]?[a-f0-9]{4}[-]?[a-f0-9]{4}[-]?[a-f0-9]{4}[-]?[a-f0-9]{12})/i);
  if (uuidMatch && uuidMatch[1]) {
    return formatPageId(uuidMatch[1]);
  }
  
  // 移除页面ID中的破折号
  return formatPageId(input);
}

// 获取页面详细内容
async function fetchNotionPage(pageId) {
  const formattedPageId = extractPageId(pageId);
  console.log(`使用页面ID: ${formattedPageId}`);
  
  try {
    console.log('正在获取页面数据...');
    return await notion.getPage(formattedPageId);
  } catch (error) {
    console.error('❌ 获取页面数据失败:', error);
    return null;
  }
}

// 分析页面数据
function analyzePageData(recordMap) {
  if (!recordMap || !recordMap.block) {
    return {
      success: false,
      message: '未获取到有效数据'
    };
  }
  
  const blockIds = Object.keys(recordMap.block || {});
  
  if (blockIds.length === 0) {
    return {
      success: false,
      message: '获取到的块数量为0'
    };
  }
  
  // 查找页面根块
  const rootBlockId = Object.keys(recordMap.block).find(
    (id) => recordMap.block[id]?.value?.type === 'page'
  );
  
  const rootBlock = rootBlockId ? recordMap.block[rootBlockId]?.value : null;
  const pageTitle = rootBlock ? 
    (rootBlock.properties?.title?.[0]?.[0] || 'Untitled') : 
    'Untitled';
  
  // 获取块类型统计
  const blockTypes = {};
  Object.values(recordMap.block || {}).forEach(block => {
    if (block && block.value && block.value.type) {
      const type = block.value.type;
      blockTypes[type] = (blockTypes[type] || 0) + 1;
    }
  });
  
  return {
    success: true,
    title: pageTitle,
    blockCount: blockIds.length,
    blockTypes,
    otherData: Object.keys(recordMap)
      .filter(key => key !== 'block')
      .reduce((acc, key) => {
        acc[key] = Object.keys(recordMap[key] || {}).length;
        return acc;
      }, {})
  };
}

// 主函数
async function main() {
  console.log('====================================');
  console.log('Notion页面数据获取工具');
  console.log('====================================');
  
  // 确保输出目录存在
  ensureOutputDirExists();
  
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
  
  try {
    // 提取和格式化页面ID
    const formattedPageId = extractPageId(notionPageId);
    
    // 获取页面数据
    const recordMap = await fetchNotionPage(formattedPageId);
    if (!recordMap) {
      console.log('❌ 无法获取页面数据');
      return;
    }
    
    console.log('✅ 成功获取页面数据!');
    
    // 分析页面数据
    const analysis = analyzePageData(recordMap);
    
    if (analysis.success) {
      console.log(`📄 页面标题: ${analysis.title}`);
      console.log(`📊 获取到 ${analysis.blockCount} 个块`);
      
      console.log('📊 块类型统计:');
      Object.entries(analysis.blockTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
      
      // 保存数据到JSON文件
      const jsonFilename = `notion-data-${formattedPageId}-${timestamp}.json`;
      saveToFile(jsonFilename, JSON.stringify(recordMap, null, 2));
      
      // 保存简化分析结果
      const analysisContent = `
# Notion页面分析报告
生成时间: ${new Date().toLocaleString()}
页面ID: ${formattedPageId}
页面标题: ${analysis.title}

## 块统计
总块数: ${analysis.blockCount}

## 块类型分布
${Object.entries(analysis.blockTypes)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## 其他数据
${Object.entries(analysis.otherData)
  .map(([key, count]) => `- ${key}: ${count} 项`)
  .join('\n')}
      `;
      
      saveToFile(`notion-analysis-${formattedPageId}-${timestamp}.md`, analysisContent);
      
      console.log('\n✅ 数据获取和分析成功完成!');
    } else {
      console.log(`⚠️ ${analysis.message}`);
    }
  } catch (error) {
    console.error('❌ 处理过程中出错:', error);
  }
  
  console.log('\n====================================');
  console.log('处理完成');
  console.log('====================================');
}

// 运行主函数
main()
  .then(() => console.log('脚本执行完毕'))
  .catch(error => console.error('脚本执行出错:', error)); 
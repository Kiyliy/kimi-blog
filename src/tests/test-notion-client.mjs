/**
 * 使用非官方Notion API客户端获取公开页面
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

// Notion页面ID - 从URL中获取
const notionPageId = process.env.NOTION_PUBLIC_PAGE_ID || '1bd00c01c1608010ae44f4305a2be2db';

// 输出目录
const outputDir = path.join(__dirname, 'outputs');

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

// 主函数
async function getNotionPage() {
  console.log('====================================');
  console.log('开始获取公开Notion页面数据');
  console.log('====================================');
  
  // 确保输出目录存在
  ensureOutputDirExists();
  
  console.log(`使用页面ID: ${notionPageId}`);
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');
  
  try {
    console.log('正在获取页面数据...');
    // 使用notion-client获取页面数据
    const recordMap = await notion.getPage(notionPageId);
    
    console.log('✅ 成功获取页面数据!');
    
    // 分析返回的数据
    const blockIds = Object.keys(recordMap.block || {});
    console.log(`📊 获取到 ${blockIds.length} 个块`);
    
    if (blockIds.length > 0) {
      // 获取页面标题
      const rootBlockId = Object.keys(recordMap.block).find(
        (id) => recordMap.block[id]?.value?.type === 'page'
      );
      
      const rootBlock = rootBlockId ? recordMap.block[rootBlockId]?.value : null;
      const pageTitle = rootBlock ? 
        (rootBlock.properties?.title?.[0]?.[0] || 'Untitled') : 
        'Untitled';
      
      console.log(`📄 页面标题: ${pageTitle}`);
      
      // 获取块类型统计
      const blockTypes = {};
      Object.values(recordMap.block || {}).forEach(block => {
        if (block && block.value && block.value.type) {
          const type = block.value.type;
          blockTypes[type] = (blockTypes[type] || 0) + 1;
        }
      });
      
      console.log('📊 块类型统计:');
      Object.entries(blockTypes).forEach(([type, count]) => {
        console.log(`  - ${type}: ${count}`);
      });
      
      // 保存数据到JSON文件
      const jsonFilename = `notion-client-data-${notionPageId}-${timestamp}.json`;
      saveToFile(jsonFilename, JSON.stringify(recordMap, null, 2));
      
      // 保存简化分析结果
      const analysisContent = `
# Notion页面分析报告 (notion-client)
生成时间: ${new Date().toLocaleString()}
页面ID: ${notionPageId}
页面标题: ${pageTitle}

## 块统计
总块数: ${blockIds.length}

## 块类型分布
${Object.entries(blockTypes)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## 其他数据
${Object.keys(recordMap)
  .filter(key => key !== 'block')
  .map(key => `- ${key}: ${Object.keys(recordMap[key] || {}).length} 项`)
  .join('\n')}
      `;
      
      saveToFile(`notion-client-analysis-${notionPageId}-${timestamp}.md`, analysisContent);
    } else {
      console.log('⚠️ 获取到的块数量为0，可能是页面ID不正确或页面不是公开的');
    }
  } catch (error) {
    console.error('❌ 获取页面数据失败:', error);
  }
  
  console.log('\n====================================');
  console.log('测试完成');
  console.log('====================================');
}

// 运行主函数
getNotionPage()
  .then(() => console.log('测试执行完毕'))
  .catch(error => console.error('测试执行出错:', error)); 
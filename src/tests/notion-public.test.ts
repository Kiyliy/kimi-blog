/**
 * 测试工具：用于测试公开Notion页面的访问
 * 并将结果保存到本地文件，方便分析
 */
const fs = require('fs');
const path = require('path');
const { fetchPublicNotionPage, extractNotionPageData } = require('../lib/notion-public');

// 从环境变量获取Notion页面ID
const notionPageId = process.env.NOTION_PUBLIC_PAGE_ID || '';

// 创建输出目录
const outputDir = path.join(__dirname, '../../test-output');

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

async function runTest() {
  console.log('====================================');
  console.log('开始测试公开Notion页面访问');
  console.log('====================================');

  // 确保输出目录存在
  ensureOutputDirExists();

  // 检查是否配置了页面ID
  if (!notionPageId) {
    console.error('❌ 未配置NOTION_PUBLIC_PAGE_ID环境变量，测试中止');
    return;
  }

  console.log(`使用页面ID: ${notionPageId}`);
  const timestamp = new Date().toISOString().replace(/[:\.]/g, '-');

  // 测试1: 获取原始HTML
  console.log('\n测试1: 获取公开Notion页面HTML');
  console.log('-----------------------------------');
  const htmlResult = await fetchPublicNotionPage(notionPageId);
  
  if (htmlResult.success && htmlResult.data) {
    console.log('✅ 成功获取页面HTML');
    console.log(`📝 HTML长度: ${htmlResult.data.length} 字符`);
    // 打印前100个字符作为预览
    console.log(`📄 预览: ${htmlResult.data.substring(0, 100)}...`);
    
    // 保存HTML到文件
    const htmlFilename = `notion-page-${notionPageId}-${timestamp}.html`;
    saveToFile(htmlFilename, htmlResult.data);
    
    // 保存HTML分析报告
    const analysisContent = `
# Notion页面HTML分析报告
生成时间: ${new Date().toLocaleString()}
页面ID: ${notionPageId}
HTML长度: ${htmlResult.data.length} 字符

## 关键数据检查
- 标题: ${htmlResult.data.match(/<title>(.*?)<\/title>/)?.[1] || '未找到'}
- 包含Redux数据: ${htmlResult.data.includes('__REDUX_STATE__') ? '是' : '否'}
- 包含Next.js数据: ${htmlResult.data.includes('__NEXT_DATA__') ? '是' : '否'}
- 包含initial数据: ${htmlResult.data.includes('__INITIAL_DATA__') ? '是' : '否'}
- 主要内容区域: ${htmlResult.data.match(/<main[^>]*>/i) ? '找到' : '未找到'}

## 脚本标签分析
${htmlResult.data.match(/<script[^>]*>([\s\S]*?)<\/script>/g)?.length || 0} 个脚本标签

## 常见数据变量检查
${[
  'window.__REDUX_STATE__',
  'window.__INITIAL_DATA__',
  'window.__PRELOADED_STATE__',
  'window.__INITIAL_STATE__',
  '__NEXT_DATA__'
].map(varName => `- ${varName}: ${htmlResult.data.includes(varName) ? '存在' : '不存在'}`).join('\n')}
    `;
    
    saveToFile(`notion-page-${notionPageId}-analysis-${timestamp}.md`, analysisContent);
  } else {
    console.log('❌ 获取页面HTML失败');
    console.log(`🔴 错误信息: ${htmlResult.message}`);
  }

  // 测试2: 提取页面JSON数据
  console.log('\n测试2: 提取Notion页面数据');
  console.log('-----------------------------------');
  const dataResult = await extractNotionPageData(notionPageId);
  
  if (dataResult.success && dataResult.data) {
    console.log('✅ 成功提取页面数据');
    // 分析提取到的数据结构
    const keys = Object.keys(dataResult.data);
    console.log(`📊 数据包含以下键: ${keys.join(', ')}`);
    
    // 保存JSON数据到文件
    const jsonFilename = `notion-data-${notionPageId}-${timestamp}.json`;
    saveToFile(jsonFilename, JSON.stringify(dataResult.data, null, 2));
    
    // 如果有blockMap，分析块数量并保存块信息
    if (dataResult.data.blockMap) {
      const blockCount = Object.keys(dataResult.data.blockMap).length;
      console.log(`📦 页面包含 ${blockCount} 个块`);
      
      // 保存前10个块的数据作为样本
      const sampleBlocks = Object.entries(dataResult.data.blockMap)
        .slice(0, 10)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});
      
      saveToFile(`notion-blocks-sample-${notionPageId}-${timestamp}.json`, 
                JSON.stringify(sampleBlocks, null, 2));
    }
    
    // 如果有部分提取，保存提取内容
    if (dataResult.data.isPartialExtraction) {
      console.log('⚠️ 仅提取了部分内容');
      console.log(`📑 页面标题: ${dataResult.data.title}`);
      
      // 保存提取的内容
      saveToFile(`notion-partial-content-${notionPageId}-${timestamp}.html`, 
                dataResult.data.content || '');
    }
  } else {
    console.log('❌ 提取页面数据失败');
    console.log(`🔴 错误信息: ${dataResult.message}`);
  }

  console.log('\n====================================');
  console.log('测试完成');
  console.log(`💾 所有测试结果已保存到 ${outputDir}`);
  console.log('====================================');
}

// 如果直接运行此文件，则执行测试
if (require.main === module) {
  runTest().catch(error => {
    console.error('测试执行失败:', error);
    process.exit(1);
  });
}

// 导出测试函数以便在命令行运行
module.exports = { runTest }; 
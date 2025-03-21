/**
 * 测试工具：用于测试公开Notion页面的访问
 */
import { fetchPublicNotionPage, extractNotionPageData } from '../lib/notion-public';

// Notion页面ID
const notionPageId = '1bd00c01c1608010ae44f4305a2be2db'; // 使用您提供的页面ID

async function runTest() {
  console.log('====================================');
  console.log('开始测试公开Notion页面访问');
  console.log('====================================');

  // 测试1: 获取原始HTML
  console.log('\n测试1: 获取公开Notion页面HTML');
  console.log('-----------------------------------');
  const htmlResult = await fetchPublicNotionPage(notionPageId);
  
  if (htmlResult.success) {
    console.log('✅ 成功获取页面HTML');
    console.log(`📝 HTML长度: ${htmlResult.data?.length} 字符`);
    // 打印前100个字符作为预览
    console.log(`📄 预览: ${htmlResult.data?.substring(0, 100)}...`);
  } else {
    console.log('❌ 获取页面HTML失败');
    console.log(`🔴 错误信息: ${htmlResult.message}`);
  }

  // 测试2: 提取页面JSON数据
  console.log('\n测试2: 提取Notion页面数据');
  console.log('-----------------------------------');
  const dataResult = await extractNotionPageData(notionPageId);
  
  if (dataResult.success) {
    console.log('✅ 成功提取页面数据');
    // 分析提取到的数据结构
    if (dataResult.data) {
      const keys = Object.keys(dataResult.data);
      console.log(`📊 数据包含以下键: ${keys.join(', ')}`);
      
      // 如果有blockMap，分析块数量
      if (dataResult.data.blockMap) {
        const blockCount = Object.keys(dataResult.data.blockMap).length;
        console.log(`📦 页面包含 ${blockCount} 个块`);
      }
    }
  } else {
    console.log('❌ 提取页面数据失败');
    console.log(`🔴 错误信息: ${dataResult.message}`);
  }

  console.log('\n====================================');
  console.log('测试完成');
  console.log('====================================');
}

// 导出测试函数以便在命令行运行
export { runTest };

// 如果直接运行此文件，则执行测试
if (typeof require !== 'undefined' && require.main === module) {
  runTest();
} 
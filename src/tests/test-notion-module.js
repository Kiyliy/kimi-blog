/**
 * 测试改进后的Notion模块
 */
const dotenv = require('dotenv');
// 加载环境变量
dotenv.config({ path: '.env.local' });

// 导入Notion模块
const notionPublic = require('./src/lib/notion-public.js');

// 获取页面ID
const notionPageId = process.env.NOTION_PUBLIC_PAGE_ID;
console.log(`使用Notion页面ID: ${notionPageId}`);

if (!notionPageId) {
  console.error('错误: 未设置NOTION_PUBLIC_PAGE_ID环境变量');
  process.exit(1);
}

// 主测试函数
const runTest = async () => {
  console.log("====================================");
  console.log("测试Notion公开页面访问模块");
  console.log("====================================\n");

  // 使用模块获取页面数据
  console.log("从Notion获取公开页面数据...");
  
  try {
    // 使用我们的模块提取数据
    const result = await notionPublic.extractNotionPageData(notionPageId);
    
    if (result.success) {
      console.log("✅ 成功获取数据");
      console.log(`📝 信息: ${result.message}`);
      
      // 分析提取的数据
      if (result.data.isPartialExtraction) {
        console.log("📊 提取了部分数据 (HTML内容)");
        console.log(`📑 页面标题: ${result.data.title}`);
        console.log(`📄 内容长度: ${result.data.content.length} 字符`);
      } else {
        // 输出数据结构信息
        console.log("📊 提取了完整JSON数据");
        console.log("📊 数据结构包含以下键:");
        Object.keys(result.data).forEach(key => {
          console.log(`  - ${key}`);
        });
        
        // 如果有blockMap，显示块信息
        if (result.data.blockMap) {
          const blockCount = Object.keys(result.data.blockMap).length;
          console.log(`📦 页面包含 ${blockCount} 个块`);
        }
      }
    } else {
      console.log("❌ 获取数据失败");
      console.log(`🔴 错误信息: ${result.message}`);
    }
  } catch (error) {
    console.log("❌ 测试执行出错");
    console.log(`🔴 错误信息: ${error.message}`);
  }
  
  console.log("\n====================================");
  console.log("测试完成");
  console.log("====================================");
};

// 运行测试
runTest()
  .then(() => console.log('测试执行完毕'))
  .catch(error => console.error('测试执行出错:', error)); 
/**
 * 简单的Notion页面访问测试脚本
 */
const dotenv = require('dotenv');
// 加载环境变量
dotenv.config({ path: '.env.local' });

// 获取页面ID
const notionPageId = process.env.NOTION_PUBLIC_PAGE_ID;
console.log(`使用Notion页面ID: ${notionPageId}`);

if (!notionPageId) {
  console.error('错误: 未设置NOTION_PUBLIC_PAGE_ID环境变量');
  process.exit(1);
}

// 测试函数：获取公开Notion页面
const fetchPublicNotionPage = async (pageId) => {
  try {
    console.log(`访问URL: https://www.notion.so/${pageId}`);
    const response = await fetch(`https://www.notion.so/${pageId}`);
    
    if (!response.ok) {
      throw new Error(`HTTP错误! 状态码: ${response.status}`);
    }
    
    const html = await response.text();
    console.log("✅ 成功获取页面HTML");
    console.log(`📝 HTML长度: ${html.length} 字符`);
    console.log(`📄 预览: ${html.substring(0, 100)}...`);
    
    // 添加更多HTML信息，帮助调试
    console.log("\n调试信息:");
    // 查找可能包含数据的脚本标签
    const scriptTags = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptTags && scriptTags.length > 0) {
      console.log(`找到 ${scriptTags.length} 个脚本标签`);
      
      // 检查是否存在window.__REDUX_STATE__
      const reduxStateMatch = html.match(/window\.__REDUX_STATE__\s*=\s*({.*});/);
      if (reduxStateMatch) {
        console.log("找到 window.__REDUX_STATE__");
      } else {
        console.log("未找到 window.__REDUX_STATE__");
      }
      
      // 检查其他可能的数据变量
      const possibleDataVars = [
        "window.__INITIAL_DATA__",
        "window.__PRELOADED_STATE__",
        "window.__INITIAL_STATE__",
        "window.__APOLLO_STATE__",
        "__NEXT_DATA__"
      ];
      
      for (const varName of possibleDataVars) {
        const match = html.includes(varName);
        if (match) {
          console.log(`找到可能的数据变量: ${varName}`);
        }
      }
    } else {
      console.log("未找到脚本标签");
    }
    
    return html;
  } catch (error) {
    console.error('获取公开Notion页面失败:', error);
    return {
      success: false,
      data: null,
      message: error.message || '未知错误'
    };
  }
}

// 测试函数：提取Notion页面中的数据
const extractNotionPageData = (html) => {
  try {
    // 使用正则表达式查找包含数据的脚本
    // Notion 通常在window.__REDUX_STATE__或类似变量中存储数据
    
    // 尝试匹配window.__REDUX_STATE__
    const reduxMatch = html.match(/window\.__REDUX_STATE__\s*=\s*({.*?});<\/script>/s);
    if (reduxMatch && reduxMatch[1]) {
      const jsonStr = reduxMatch[1];
      return JSON.parse(jsonStr);
    }
    
    // 尝试匹配可能存在的其他数据变量
    const dataPatterns = [
      /window\.__INITIAL_DATA__\s*=\s*({.*?});<\/script>/s,
      /window\.__PRELOADED_STATE__\s*=\s*({.*?});<\/script>/s,
      /window\.__INITIAL_STATE__\s*=\s*({.*?});<\/script>/s,
      /__NEXT_DATA__\s*=\s*({.*?});<\/script>/s,
      /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/s
    ];
    
    for (const pattern of dataPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        const jsonStr = match[1];
        try {
          return JSON.parse(jsonStr);
        } catch (e) {
          console.log(`尝试解析 ${pattern} 失败，继续尝试其他模式`);
        }
      }
    }
    
    // 如果仍未找到，尝试找出所有script标签内容
    console.log("未找到标准数据格式，尝试分析所有脚本标签...");
    const scriptContents = html.match(/<script[^>]*>([\s\S]*?)<\/script>/g);
    if (scriptContents) {
      // 查找包含"block"或"page"关键词的脚本
      for (const script of scriptContents) {
        if (script.includes('block') || script.includes('page') || script.includes('notion')) {
          console.log("找到可能包含数据的脚本");
          // 这里我们不尝试解析，只返回找到脚本的信息
          return { found: true, message: "找到可能包含数据的脚本，但无法自动解析" };
        }
      }
    }
    
    throw new Error("无法从页面中提取数据");
  } catch (error) {
    console.error('提取页面数据失败:', error);
    throw error;
  }
};

// 主测试函数
const runTest = async () => {
  console.log("====================================");
  console.log("开始测试公开Notion页面访问");
  console.log("====================================\n");

  // 测试1: 获取页面
  console.log("测试1: 获取公开Notion页面HTML");
  console.log("-----------------------------------");
  
  try {
    // 尝试获取页面
    const html = await fetchPublicNotionPage(notionPageId);
    
    console.log("\n-----------------------------------");
    
    // 测试2: 提取数据
    try {
      const data = extractNotionPageData(html);
      console.log("✅ 成功提取页面数据");
      
      // 分析数据
      if (data.found) {
        console.log(`📊 ${data.message}`);
      } else if (data.blockMap) {
        console.log(`📊 数据中包含 blockMap`);
        console.log(`📊 块数量: ${Object.keys(data.blockMap).length}`);
      } else {
        console.log("📊 数据结构:", Object.keys(data).join(", "));
      }
    } catch (error) {
      console.log("❌ 提取页面数据失败");
      console.log(`🔴 错误信息: ${error.message}`);
    }
  } catch (error) {
    console.log("❌ 获取页面HTML失败");
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
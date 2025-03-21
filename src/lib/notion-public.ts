/**
 * 用于获取公开发布的Notion页面内容
 * 对于已公开发布的Notion页面，无需API密钥即可访问
 */

// 通过fetch获取公开Notion页面
export async function fetchPublicNotionPage(pageId: string) {
  try {
    // 构建公开页面的URL
    const url = `https://notion.so/${pageId}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`无法获取Notion页面: ${response.status}`);
    }
    
    const html = await response.text();
    return {
      success: true,
      data: html,
      message: '获取公开Notion页面成功'
    };
  } catch (error) {
    console.error('获取公开Notion页面失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '未知错误'
    };
  }
}

// 获取Notion公开页面的JSON数据
// Notion公开页面中包含一个window.__REDUX_STATE__脚本标签，包含页面数据
export async function extractNotionPageData(pageId: string) {
  const result = await fetchPublicNotionPage(pageId);
  
  if (!result.success || !result.data) {
    return {
      success: false,
      data: null,
      message: '获取页面失败'
    };
  }
  
  try {
    // 尝试提取JSON数据
    const html = result.data;
    const match = html.match(/window\.__REDUX_STATE__ = (.+);<\/script>/);
    
    if (!match || !match[1]) {
      return {
        success: false,
        data: null,
        message: '无法从页面中提取数据'
      };
    }
    
    // 解析JSON数据
    const jsonData = JSON.parse(match[1]);
    return {
      success: true,
      data: jsonData,
      message: '成功提取Notion页面数据'
    };
  } catch (error) {
    console.error('解析Notion数据失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '解析数据时发生未知错误'
    };
  }
} 
/**
 * 用于获取公开发布的Notion页面内容
 * 对于已公开发布的Notion页面，无需API密钥即可访问
 */

/**
 * 获取公开Notion页面的HTML内容
 * @param {string} pageId - Notion页面ID
 * @returns {Promise<Object>} 包含页面HTML内容的结果对象
 */
async function fetchPublicNotionPage(pageId: string) {
  try {
    // 构建公开页面的URL - 必须使用完整域名
    const url = `https://www.notion.so/${pageId}`;
    
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

/**
 * 提取Notion公开页面的JSON数据
 * @param {string} pageId - Notion页面ID
 * @returns {Promise<Object>} 包含提取的JSON数据的结果对象
 */
async function extractNotionPageData(pageId: string) {
  const result = await fetchPublicNotionPage(pageId);
  
  if (!result.success || !result.data) {
    return {
      success: false,
      data: null,
      message: '获取页面失败'
    };
  }
  
  try {
    // 获取HTML内容
    const html = result.data;
    
    // 尝试多种模式提取数据
    // 1. 尝试匹配window.__REDUX_STATE__
    const reduxMatch = html.match(/window\.__REDUX_STATE__\s*=\s*({.*?});<\/script>/);
    if (reduxMatch && reduxMatch[1]) {
      try {
        const jsonData = JSON.parse(reduxMatch[1]);
        return {
          success: true,
          data: jsonData,
          message: '成功提取Notion页面数据 (REDUX_STATE)'
        };
      } catch (err) {
        // 解析失败，继续尝试其他方法
        console.log('解析REDUX_STATE失败，尝试其他模式');
      }
    }
    
    // 2. 尝试其他可能的数据变量模式
    const dataPatterns = [
      { pattern: /window\.__INITIAL_DATA__\s*=\s*({.*?});<\/script>/, name: 'INITIAL_DATA' },
      { pattern: /window\.__PRELOADED_STATE__\s*=\s*({.*?});<\/script>/, name: 'PRELOADED_STATE' },
      { pattern: /window\.__INITIAL_STATE__\s*=\s*({.*?});<\/script>/, name: 'INITIAL_STATE' },
      { pattern: /__NEXT_DATA__\s*=\s*({.*?});<\/script>/, name: 'NEXT_DATA' },
      { pattern: /<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/, name: 'NEXT_DATA_SCRIPT' }
    ];
    
    for (const { pattern, name } of dataPatterns) {
      const match = html.match(pattern);
      if (match && match[1]) {
        try {
          const jsonData = JSON.parse(match[1]);
          return {
            success: true,
            data: jsonData,
            message: `成功提取Notion页面数据 (${name})`
          };
        } catch (err) {
          // 继续尝试下一个模式
          console.log(`解析${name}失败，尝试其他模式`);
        }
      }
    }
    
    // 3. 如果以上方法都失败，尝试提取页面的基本信息
    // 提取标题
    const titleMatch = html.match(/<title>(.*?)<\/title>/);
    const title = titleMatch ? titleMatch[1] : 'Notion Page';
    
    // 提取页面内容
    // 尝试查找主要内容区域
    const mainContentMatch = html.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    const mainContent = mainContentMatch ? mainContentMatch[1] : '';
    
    if (mainContent) {
      return {
        success: true,
        data: {
          title,
          content: mainContent,
          isPartialExtraction: true
        },
        message: '提取了部分Notion页面内容'
      };
    }
    
    return {
      success: false,
      data: null,
      message: '无法从页面中提取数据，可能是Notion页面结构已更改'
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

export { fetchPublicNotionPage, extractNotionPageData };
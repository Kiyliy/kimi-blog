/**
 * 用于获取公开发布的Notion页面内容
 * 对于已公开发布的Notion页面，无需API密钥即可访问
 * 使用notion-client库实现
 */
import { fetchNotionPage, extractPageId, formatPageId, analyzeNotionData, extractBlogPost } from './notion-client-api.mjs';

// 导入或定义所需类型
interface NotionAnalysis {
  success: boolean;
  message?: string;
  title?: string;
  blockCount?: number;
  blockTypes?: Record<string, number>;
  otherData?: Record<string, number>;
}

/**
 * 获取公开Notion页面数据
 * @param {string} pageId - Notion页面ID或URL
 * @returns {Promise<Object>} 包含页面数据的结果对象
 */
async function fetchPublicNotionPage(pageId: string) {
  try {
    // 使用notion-client-api中的fetchNotionPage函数
    const formattedPageId = extractPageId(pageId);
    const recordMap = await fetchNotionPage(formattedPageId);
    
    if (!recordMap) {
      return {
        success: false,
        data: null,
        message: '获取页面数据失败'
      };
    }
    
    return {
      success: true,
      data: recordMap,
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
  try {
    const formattedPageId = extractPageId(pageId);
    // 使用notion-client-api中的fetchNotionPage函数获取页面数据
    const recordMap = await fetchNotionPage(formattedPageId);
    
    if (!recordMap) {
      return {
        success: false,
        data: null,
        message: '获取页面数据失败'
      };
    }
    
    // 分析页面数据
    const analysis = analyzeNotionData(recordMap) as NotionAnalysis;
    if (!analysis || !analysis.success) {
      return {
        success: false,
        data: null,
        message: analysis?.message || '分析页面数据失败'
      };
    }
    
    // 尝试提取博客文章
    const blogPost = extractBlogPost(recordMap);
    
    return {
      success: true,
      data: recordMap,
      analysis: analysis,
      blogPost: blogPost,
      message: '成功提取Notion页面数据'
    };
  } catch (error) {
    console.error('提取Notion数据失败:', error);
    return {
      success: false,
      data: null,
      message: error instanceof Error ? error.message : '解析数据时发生未知错误'
    };
  }
}

// 导出全部函数，保持向后兼容性
export { 
  fetchPublicNotionPage, 
  extractNotionPageData,
  // 重新导出notion-client-api中的函数
  fetchNotionPage,
  extractPageId,
  formatPageId,
  analyzeNotionData,
  extractBlogPost
};
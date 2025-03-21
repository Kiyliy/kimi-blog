/**
 * Notion非官方API客户端集成
 * 用于获取公共Notion页面内容
 */
import { NotionAPI } from 'notion-client';

/**
 * Notion API实例
 */
const notion = new NotionAPI();

/**
 * 格式化Notion页面ID（移除所有非字母数字字符）
 * @param {string} pageId - 原始页面ID
 * @returns {string} 格式化后的页面ID
 */
export function formatPageId(pageId) {
  return pageId.replace(/-/g, '').replace(/\//g, '');
}

/**
 * 从URL或ID字符串中提取Notion页面ID
 * @param {string} input - Notion URL或页面ID
 * @returns {string} 提取并格式化后的页面ID
 */
export function extractPageId(input) {
  if (!input) {
    throw new Error('页面ID或URL不能为空');
  }

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

/**
 * 获取Notion页面数据
 * @param {string} pageId - Notion页面ID或URL
 * @returns {Promise<object|null>} Notion页面数据或null（如果获取失败）
 */
export async function fetchNotionPage(pageId) {
  try {
    const formattedPageId = extractPageId(pageId);
    return await notion.getPage(formattedPageId);
  } catch (error) {
    console.error(`获取Notion页面数据失败: ${error.message || error}`);
    return null;
  }
}

/**
 * 分析Notion页面数据
 * @param {object} recordMap - Notion API返回的记录映射
 * @returns {object} 分析结果对象
 */
export function analyzeNotionData(recordMap) {
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

/**
 * 从Notion页面提取文章内容（用于博客等场景）
 * @param {object} recordMap - Notion API返回的记录映射
 * @returns {object|null} 提取的博客文章内容或null（如果提取失败）
 */
export function extractBlogPost(recordMap) {
  try {
    if (!recordMap || !recordMap.block) {
      return null;
    }
    
    // 分析页面数据
    const analysis = analyzeNotionData(recordMap);
    if (!analysis.success) {
      return null;
    }
    
    // 查找页面根块
    const rootBlockId = Object.keys(recordMap.block).find(
      (id) => recordMap.block[id]?.value?.type === 'page'
    );
    
    if (!rootBlockId) {
      return null;
    }
    
    const rootBlock = recordMap.block[rootBlockId].value;
    
    // 提取标题和属性
    const title = rootBlock.properties?.title?.[0]?.[0] || 'Untitled';
    
    // 提取其他元数据（假设是个博客文章）
    const properties = {};
    if (rootBlock.properties) {
      // 复制所有属性（去除title）
      Object.entries(rootBlock.properties).forEach(([key, value]) => {
        if (key !== 'title' && Array.isArray(value) && value.length > 0) {
          // 大多数属性是这种格式 [["value"]]
          properties[key] = value[0][0];
        }
      });
    }
    
    // 获取内容块
    const contentBlocks = [];
    if (rootBlock.content) {
      rootBlock.content.forEach(blockId => {
        const block = recordMap.block[blockId];
        if (block && block.value) {
          contentBlocks.push(block.value);
        }
      });
    }
    
    return {
      id: rootBlockId,
      title,
      properties,
      contentBlocks,
      recordMap // 保留完整recordMap以便后续渲染
    };
  } catch (error) {
    console.error(`提取博客文章内容失败: ${error.message || error}`);
    return null;
  }
}

/**
 * 提取Notion集合（数据库）内容
 * @param {object} recordMap - Notion API返回的记录映射
 * @returns {object|null} 提取的集合内容或null（如果提取失败）
 */
export function extractCollection(recordMap) {
  try {
    if (!recordMap || !recordMap.block || !recordMap.collection) {
      return null;
    }
    
    // 查找collection_view类型的块
    const collectionViewBlockId = Object.keys(recordMap.block).find(
      (id) => recordMap.block[id]?.value?.type === 'collection_view'
    );
    
    if (!collectionViewBlockId) {
      return null;
    }
    
    const collectionViewBlock = recordMap.block[collectionViewBlockId].value;
    const collectionId = collectionViewBlock.format?.collection_pointer?.id;
    
    if (!collectionId || !recordMap.collection[collectionId]) {
      return null;
    }
    
    const collection = recordMap.collection[collectionId].value;
    
    // 获取集合名称
    const name = collection.name?.[0]?.[0] || 'Unnamed Collection';
    
    // 获取集合schema（列定义）
    const schema = collection.schema || {};
    
    // 获取集合中的页面
    const pages = [];
    
    // 查找属于该集合的页面
    Object.values(recordMap.block).forEach(block => {
      if (block.value && 
          block.value.type === 'page' && 
          block.value.parent_id === collectionId &&
          block.value.parent_table === 'collection') {
        
        const pageData = {
          id: block.value.id,
          title: block.value.properties?.title?.[0]?.[0] || 'Untitled',
          properties: {}
        };
        
        // 提取页面属性
        if (block.value.properties) {
          Object.entries(block.value.properties).forEach(([key, value]) => {
            if (key !== 'title' && Array.isArray(value) && value.length > 0) {
              pageData.properties[key] = value[0][0];
            }
          });
        }
        
        pages.push(pageData);
      }
    });
    
    return {
      id: collectionId,
      name,
      schema,
      pages,
      viewIds: collectionViewBlock.view_ids || [],
      recordMap // 保留完整recordMap以便后续渲染
    };
  } catch (error) {
    console.error(`提取集合内容失败: ${error.message || error}`);
    return null;
  }
}

export default {
  fetchNotionPage,
  extractPageId,
  formatPageId,
  analyzeNotionData,
  extractBlogPost,
  extractCollection
}; 
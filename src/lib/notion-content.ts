import { fetchNotionPage, analyzeNotionData, extractBlogPost } from './notion-client-api.mjs';
import { Post, PostListItem } from '@/types/post';

// 添加Notion API类型定义
interface NotionBlock {
  value: {
    id: string;
    type: string;
    properties?: any;
    format?: any;
    content?: string[];
    created_time?: number;
    parent_table?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface NotionRecordMap {
  block: {
    [key: string]: NotionBlock;
  };
  collection?: any;
  collection_view?: any;
  [key: string]: any;
}

interface NotionAnalysis {
  success: boolean;
  message?: string;
  title?: string;
  blockCount?: number;
  blockTypes?: Record<string, number>;
  otherData?: Record<string, number>;
}

interface NotionBlogPost {
  id: string;
  title: string;
  properties: Record<string, any>;
  contentBlocks: any[];
  recordMap: NotionRecordMap;
}

// 使用环境变量获取Notion页面ID
const NOTION_PAGE_ID = process.env.NOTION_PUBLIC_PAGE_ID || '';

// 从公开Notion页面获取数据的实现
export async function getPostsFromPublicNotion(): Promise<PostListItem[]> {
  try {
    // 检查配置
    if (!NOTION_PAGE_ID) {
      console.error('未配置NOTION_PUBLIC_PAGE_ID环境变量');
      return [];
    }
    
    // 使用notion-client-api获取数据
    const recordMap = await fetchNotionPage(NOTION_PAGE_ID) as NotionRecordMap | null;
    
    if (!recordMap) {
      console.error('从Notion获取博客数据失败');
      return [];
    }
    
    // 分析获取到的数据
    const analysis = analyzeNotionData(recordMap) as NotionAnalysis;
    if (!analysis || !analysis.success) {
      console.error('分析Notion数据失败:', analysis?.message || '未知错误');
      return [];
    }

    // 提取文章列表
    const posts: PostListItem[] = [];
    
    // 处理包含页面内容的块
    Object.entries(recordMap.block || {}).forEach(([blockId, block]) => {
      // 只处理子页面类型的块（排除父页面）
      if (block?.value?.type === 'page' && block.value.parent_table !== 'space') {
        // 提取博客文章信息
        const properties = block.value.properties || {};
        const title = properties.title?.[0]?.[0] || '无标题';
        
        // 构建文章项
        const post: PostListItem = {
          slug: blockId,
          title: title,
          date: formatDate(block.value.created_time || Date.now()),
          excerpt: extractExcerpt(block, recordMap.block) || '无摘要',
          coverImage: block.value.format?.page_cover || null,
          tags: extractTags(block, recordMap) || [],
          category: extractCategory(block, recordMap) || '未分类',
        };
        
        posts.push(post);
      }
    });
    
    return posts;
  } catch (error) {
    console.error('处理Notion数据时发生错误:', error);
    return [];
  }
}

// 获取单个文章详情
export async function getPostDetailFromPublicNotion(slug: string): Promise<Post | null> {
  try {
    // 检查配置
    if (!NOTION_PAGE_ID) {
      console.error('未配置NOTION_PUBLIC_PAGE_ID环境变量');
      return null;
    }
    
    // 直接使用文章页面ID获取详情数据
    const recordMap = await fetchNotionPage(slug) as NotionRecordMap | null;
    
    if (!recordMap) {
      console.error('从Notion获取文章详情失败');
      return null;
    }

    // 提取文章数据
    const blogPost = extractBlogPost(recordMap) as NotionBlogPost | null;
    if (!blogPost) {
      console.error('无法提取文章数据');
      return null;
    }
    
    // 构建文章对象
    const post: Post = {
      slug: slug,
      title: blogPost.title,
      date: formatDate(blogPost.recordMap.block[blogPost.id]?.value?.created_time || Date.now()),
      excerpt: extractExcerpt(blogPost.recordMap.block[blogPost.id], blogPost.recordMap.block) || '无摘要',
      content: buildContentFromBlocks(blogPost.id, blogPost.recordMap.block),
      coverImage: blogPost.recordMap.block[blogPost.id]?.value?.format?.page_cover || null,
      tags: extractTags(blogPost.recordMap.block[blogPost.id], blogPost.recordMap) || [],
      category: extractCategory(blogPost.recordMap.block[blogPost.id], blogPost.recordMap) || '未分类',
      author: {
        name: '博客作者', // 默认作者名
      },
    };
    
    return post;
  } catch (error) {
    console.error('获取Notion文章详情时发生错误:', error);
    return null;
  }
}

// 辅助函数：格式化日期
function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0]; // 返回YYYY-MM-DD格式
}

// 辅助函数：提取摘要
function extractExcerpt(block: NotionBlock, blockMap: Record<string, NotionBlock>): string | null {
  // 适配新的Notion API数据结构
  try {
    // 查找包含文本的第一个子块
    const contentBlockIds = block.value.content || [];
    
    for (const blockId of contentBlockIds) {
      const contentBlock = blockMap[blockId];
      if (contentBlock?.value?.type === 'text' && contentBlock.value.properties?.title) {
        return contentBlock.value.properties.title[0][0];
      }
      
      // 处理段落、引用等包含文本的块
      if (contentBlock?.value?.properties?.title) {
        return contentBlock.value.properties.title[0][0];
      }
    }
    
    // 如果没有找到合适的子块，尝试从当前块的属性中提取
    if (block.value.properties?.description) {
      return block.value.properties.description[0][0];
    }
    
    return null;
  } catch (error) {
    console.error('提取摘要时发生错误:', error);
    return null;
  }
}

// 辅助函数：提取标签
function extractTags(block: NotionBlock, recordMap: NotionRecordMap): string[] {
  // 适配新的Notion API数据结构
  try {
    // 尝试从属性中提取标签
    if (block.value.properties?.tags) {
      const tagProperty = block.value.properties.tags;
      if (Array.isArray(tagProperty)) {
        return tagProperty.map(tag => tag[0]).filter(Boolean);
      }
    }
    
    // 检查是否有关联到collection并提取标签字段
    if (block.value.parent_table === 'collection' && block.value.parent_id) {
      const collection = recordMap.collection?.[block.value.parent_id];
      if (collection?.value?.schema) {
        // 查找标签字段
        const tagField = Object.entries(collection.value.schema).find(
          ([_, schema]: [string, any]) => schema.name.toLowerCase() === 'tags' || schema.type === 'multi_select'
        );
        
        if (tagField && block.value.properties?.[tagField[0]]) {
          return block.value.properties[tagField[0]].map((tag: any) => tag[0]).filter(Boolean);
        }
      }
    }
    
    return [];
  } catch (error) {
    console.error('提取标签时发生错误:', error);
    return [];
  }
}

// 辅助函数：提取分类
function extractCategory(block: NotionBlock, recordMap: NotionRecordMap): string | null {
  // 适配新的Notion API数据结构
  try {
    // 尝试从属性中提取分类
    if (block.value.properties?.category) {
      return block.value.properties.category[0][0];
    }
    
    // 检查是否有关联到collection并提取分类字段
    if (block.value.parent_table === 'collection' && block.value.parent_id) {
      const collection = recordMap.collection?.[block.value.parent_id];
      if (collection?.value?.schema) {
        // 查找分类字段
        const categoryField = Object.entries(collection.value.schema).find(
          ([_, schema]: [string, any]) => 
            schema.name.toLowerCase() === 'category' || 
            schema.name.toLowerCase() === '分类' ||
            schema.type === 'select'
        );
        
        if (categoryField && block.value.properties?.[categoryField[0]]) {
          return block.value.properties[categoryField[0]][0][0];
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('提取分类时发生错误:', error);
    return null;
  }
}

// 辅助函数：从块构建内容
function buildContentFromBlocks(pageId: string, blockMap: Record<string, NotionBlock>): string {
  // 适配新的Notion API数据结构
  try {
    let markdown = '';
    const processBlock = (blockId: string, level = 0) => {
      const block = blockMap[blockId];
      if (!block) return;
      
      const { value } = block;
      const indent = ' '.repeat(level * 2);
      
      // 根据块类型处理
      switch (value.type) {
        case 'page':
          // 页面标题已在其他地方处理，这里跳过
          break;
        case 'text':
        case 'paragraph':
          if (value.properties?.title) {
            markdown += `${indent}${value.properties.title[0][0]}\n\n`;
          }
          break;
        case 'header':
          if (value.properties?.title) {
            markdown += `${indent}# ${value.properties.title[0][0]}\n\n`;
          }
          break;
        case 'sub_header':
          if (value.properties?.title) {
            markdown += `${indent}## ${value.properties.title[0][0]}\n\n`;
          }
          break;
        case 'sub_sub_header':
          if (value.properties?.title) {
            markdown += `${indent}### ${value.properties.title[0][0]}\n\n`;
          }
          break;
        case 'bulleted_list':
          if (value.properties?.title) {
            markdown += `${indent}- ${value.properties.title[0][0]}\n`;
          }
          break;
        case 'numbered_list':
          if (value.properties?.title) {
            markdown += `${indent}1. ${value.properties.title[0][0]}\n`;
          }
          break;
        case 'toggle':
          if (value.properties?.title) {
            markdown += `${indent}<details>\n${indent}<summary>${value.properties.title[0][0]}</summary>\n\n`;
            // 处理子内容
            if (value.content) {
              value.content.forEach((childId: string) => {
                processBlock(childId, level + 1);
              });
            }
            markdown += `${indent}</details>\n\n`;
          }
          break;
        case 'to_do':
          if (value.properties?.title) {
            const checked = value.properties.checked && value.properties.checked[0][0] === 'Yes';
            markdown += `${indent}- [${checked ? 'x' : ' '}] ${value.properties.title[0][0]}\n`;
          }
          break;
        case 'divider':
          markdown += `${indent}---\n\n`;
          break;
        case 'quote':
          if (value.properties?.title) {
            markdown += `${indent}> ${value.properties.title[0][0]}\n\n`;
          }
          break;
        case 'callout':
          if (value.properties?.title) {
            const emoji = value.format?.page_icon || '';
            markdown += `${indent}> ${emoji} **${value.properties.title[0][0]}**\n\n`;
          }
          break;
        case 'image':
          if (value.format?.display_source) {
            const caption = value.properties?.caption ? `${value.properties.caption[0][0]}` : 'Image';
            markdown += `${indent}![${caption}](${value.format.display_source})\n\n`;
          }
          break;
        case 'code':
          if (value.properties?.title) {
            const language = value.properties.language ? value.properties.language[0][0] : '';
            markdown += `${indent}\`\`\`${language}\n${value.properties.title[0][0]}\n\`\`\`\n\n`;
          }
          break;
        case 'file':
          if (value.properties?.source) {
            markdown += `${indent}[File](${value.properties.source[0][0]})\n\n`;
          }
          break;
        case 'bookmark':
          if (value.properties?.link) {
            const title = value.properties.title ? value.properties.title[0][0] : value.properties.link[0][0];
            markdown += `${indent}[${title}](${value.properties.link[0][0]})\n\n`;
          }
          break;
        case 'video':
        case 'embed':
          if (value.format?.display_source) {
            markdown += `${indent}<iframe src="${value.format.display_source}" frameborder="0" allowfullscreen></iframe>\n\n`;
          } else if (value.properties?.source) {
            markdown += `${indent}<iframe src="${value.properties.source[0][0]}" frameborder="0" allowfullscreen></iframe>\n\n`;
          }
          break;
        default:
          // 对于其他未处理的块类型，尝试提取文本
          if (value.properties?.title) {
            markdown += `${indent}${value.properties.title[0][0]}\n\n`;
          }
      }
      
      // 如果不是已经在switch中处理了子块的类型，这里处理子块
      if (value.content && 
          value.type !== 'toggle' && // 排除已经在switch中处理子块的类型
          value.type !== 'page') {   // 页面内容在外部处理
        value.content.forEach((childId: string) => {
          processBlock(childId, level + 1);
        });
      }
    };
    
    // 从页面块开始处理
    const pageBlock = blockMap[pageId];
    if (pageBlock && pageBlock.value.content) {
      pageBlock.value.content.forEach((blockId: string) => {
        processBlock(blockId);
      });
    }
    
    return markdown || '无内容';
  } catch (error) {
    console.error('构建内容时发生错误:', error);
    return '无法加载内容';
  }
}

// Add needed exports
export {
  fetchNotionPage,
  analyzeNotionData,
  extractBlogPost
} from './notion-client-api.mjs';

// Export types for use elsewhere in the app
export type {
  NotionBlock,
  NotionRecordMap,
  NotionAnalysis,
  NotionBlogPost
}; 
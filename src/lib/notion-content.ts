import { extractNotionPageData } from './notion-public';
import { Post, PostListItem } from '@/types/post';

// Notion页面ID - 您的公开页面
const NOTION_PAGE_ID = '1bd00c01c1608010ae44f4305a2be2db';

// 从公开Notion页面获取数据的实现
export async function getPostsFromPublicNotion(): Promise<PostListItem[]> {
  try {
    // 提取页面数据
    const result = await extractNotionPageData(NOTION_PAGE_ID);
    
    if (!result.success || !result.data) {
      console.error('从Notion获取博客数据失败:', result.message);
      return [];
    }
    
    // 从Notion数据中提取博客文章
    const data = result.data;
    
    // 提取blockMap中的块数据
    // 注意：每个Notion页面的数据结构可能有所不同，可能需要根据实际情况调整
    const blockMap = data.blockMap || {};
    
    // 筛选出博客文章类型的块
    const posts: PostListItem[] = [];
    
    // 处理包含页面内容的块
    for (const blockId in blockMap) {
      const block = blockMap[blockId];
      
      // 检查是否是博客文章类型的块
      if (block?.value?.type === 'page' && block.value.parent_table !== 'space') {
        // 提取博客文章信息
        const properties = block.value.properties || {};
        const title = properties.title?.[0]?.[0] || '无标题';
        
        // 构建文章项
        const post: PostListItem = {
          slug: blockId,
          title: title,
          date: formatDate(block.value.created_time || Date.now()),
          excerpt: extractExcerpt(block, blockMap) || '无摘要',
          coverImage: block.value.format?.page_cover || null,
          tags: extractTags(block, blockMap) || [],
          category: extractCategory(block, blockMap) || '未分类',
        };
        
        posts.push(post);
      }
    }
    
    return posts;
  } catch (error) {
    console.error('处理Notion数据时发生错误:', error);
    return [];
  }
}

// 获取单个文章详情
export async function getPostDetailFromPublicNotion(slug: string): Promise<Post | null> {
  try {
    // 提取页面数据
    const result = await extractNotionPageData(NOTION_PAGE_ID);
    
    if (!result.success || !result.data) {
      console.error('从Notion获取博客数据失败:', result.message);
      return null;
    }
    
    // 从Notion数据中提取指定文章
    const data = result.data;
    const blockMap = data.blockMap || {};
    
    // 查找指定的块
    const block = blockMap[slug];
    if (!block || block.value.type !== 'page') {
      return null;
    }
    
    // 提取文章内容
    const properties = block.value.properties || {};
    const title = properties.title?.[0]?.[0] || '无标题';
    
    // 构建文章对象
    const post: Post = {
      slug: slug,
      title: title,
      date: formatDate(block.value.created_time || Date.now()),
      excerpt: extractExcerpt(block, blockMap) || '无摘要',
      content: buildContentFromBlocks(slug, blockMap) || '无内容',
      coverImage: block.value.format?.page_cover || null,
      tags: extractTags(block, blockMap) || [],
      category: extractCategory(block, blockMap) || '未分类',
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
function extractExcerpt(block: any, blockMap: any): string | null {
  // 尝试从block的内容中提取摘要
  // 这里是简化实现，实际可能需要根据Notion数据结构调整
  try {
    // 查找包含文本的第一个子块
    const contentBlockIds = block.value.content || [];
    
    for (const blockId of contentBlockIds) {
      const contentBlock = blockMap[blockId];
      if (contentBlock?.value?.type === 'text' && contentBlock.value.properties?.title) {
        return contentBlock.value.properties.title[0][0];
      }
    }
    
    return null;
  } catch (error) {
    console.error('提取摘要时发生错误:', error);
    return null;
  }
}

// 辅助函数：提取标签
function extractTags(block: any, blockMap: any): string[] {
  // 简化实现，实际可能需要根据特定的Notion页面结构调整
  try {
    // 假设标签信息存储在页面的特定属性中
    return [];
  } catch (error) {
    console.error('提取标签时发生错误:', error);
    return [];
  }
}

// 辅助函数：提取分类
function extractCategory(block: any, blockMap: any): string | null {
  // 简化实现，实际可能需要根据特定的Notion页面结构调整
  try {
    return null;
  } catch (error) {
    console.error('提取分类时发生错误:', error);
    return null;
  }
}

// 辅助函数：从块构建内容
function buildContentFromBlocks(pageId: string, blockMap: any): string {
  // 构建Markdown内容的简化实现
  try {
    let markdown = '';
    const processBlock = (blockId: string, level = 0) => {
      const block = blockMap[blockId];
      if (!block) return;
      
      const { value } = block;
      const indent = ' '.repeat(level * 2);
      
      // 根据块类型处理
      switch (value.type) {
        case 'text':
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
        case 'image':
          if (value.format?.display_source) {
            markdown += `${indent}![Image](${value.format.display_source})\n\n`;
          }
          break;
      }
      
      // 处理子块
      if (value.content) {
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
    
    return markdown;
  } catch (error) {
    console.error('构建内容时发生错误:', error);
    return '无法加载内容';
  }
} 
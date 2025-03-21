# Notion API 集成指南

## 概述

本文档详细描述了"优雅博客"与Notion的集成方案，允许直接从Notion数据库获取和展示博客文章内容。这种集成使用户能够在Notion中编写和管理内容，同时在博客前端自动展示这些内容。

## 先决条件

1. **Notion账户** - 需要一个带有博客内容的Notion工作区
2. **Notion API密钥** - 从[Notion开发者页面](https://developers.notion.com/)获取
3. **Notion数据库** - 一个用于存储博客文章的Notion数据库

## Notion数据库结构

博客文章的Notion数据库应包含以下属性：

| 属性名          | 类型        | 描述                                 |
|---------------|------------|--------------------------------------|
| 标题(Title)    | 标题        | 文章标题，必填                        |
| 摘要(Excerpt)  | 文本        | 文章简短描述，显示在文章列表中          |
| 内容(Content)  | 文本/页面内容 | 文章主体内容                          |
| 封面图(Cover)   | 文件/URL    | 文章封面图片                          |
| 发布日期(Date)  | 日期        | 文章发布日期                          |
| 分类(Category) | 选择        | 文章分类                              |
| 标签(Tags)     | 多选        | 文章标签                              |
| 状态(Status)   | 选择        | 发布状态(已发布/草稿)                  |
| 作者(Author)   | 人员        | 文章作者                              |
| 别名(Slug)     | 文本        | 用于URL的唯一标识符                    |

## 实现步骤

### 1. 环境设置

创建`.env.local`文件并添加Notion API密钥和数据库ID：

```
NOTION_API_KEY=secret_xxxxxxxxxxxxxxxxxxxxxxxxx
NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 2. 安装依赖

```bash
npm install @notionhq/client notion-to-md
```

### 3. 创建Notion客户端

`src/lib/notion.ts`:

```typescript
import { Client } from '@notionhq/client';
import { NotionToMarkdown } from 'notion-to-md';

// 初始化Notion客户端
const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// 初始化Notion到Markdown转换器
const n2m = new NotionToMarkdown({ notionClient: notion });

export { notion, n2m };
```

### 4. 修改中间件

修改`src/middleware/posts.ts`以支持从Notion获取数据：

```typescript
import { notion, n2m } from '@/lib/notion';
import { Post, PostListItem } from '@/types/post';

// 从Notion获取所有文章
export async function fetchPostsFromNotion(): Promise<PostListItem[]> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Status',
        select: {
          equals: '已发布',
        },
      },
      sorts: [
        {
          property: 'Date',
          direction: 'descending',
        },
      ],
    });

    return response.results.map((page: any) => {
      const properties = page.properties;
      
      return {
        slug: properties.Slug.rich_text[0]?.plain_text || '',
        title: properties.Title.title[0]?.plain_text || '',
        date: properties.Date.date?.start || '',
        excerpt: properties.Excerpt.rich_text[0]?.plain_text || '',
        coverImage: properties.Cover.files[0]?.file?.url || properties.Cover.files[0]?.external?.url || null,
        tags: properties.Tags.multi_select.map((tag: any) => tag.name),
        category: properties.Category.select?.name || null,
      };
    });
  } catch (error) {
    console.error('Error fetching posts from Notion:', error);
    return [];
  }
}

// 从Notion获取单篇文章
export async function getPostBySlugFromNotion(slug: string): Promise<Post | null> {
  try {
    const databaseId = process.env.NOTION_DATABASE_ID as string;
    const response = await notion.databases.query({
      database_id: databaseId,
      filter: {
        property: 'Slug',
        rich_text: {
          equals: slug,
        },
      },
    });

    if (!response.results.length) {
      return null;
    }

    const page = response.results[0];
    const pageId = page.id;
    const properties = page.properties;
    
    // 将Notion页面内容转换为Markdown
    const mdBlocks = await n2m.pageToMarkdown(pageId);
    const markdown = n2m.toMarkdownString(mdBlocks);

    return {
      slug: properties.Slug.rich_text[0]?.plain_text || '',
      title: properties.Title.title[0]?.plain_text || '',
      date: properties.Date.date?.start || '',
      content: markdown,
      excerpt: properties.Excerpt.rich_text[0]?.plain_text || '',
      coverImage: properties.Cover.files[0]?.file?.url || properties.Cover.files[0]?.external?.url || null,
      tags: properties.Tags.multi_select.map((tag: any) => tag.name),
      category: properties.Category.select?.name || null,
      author: {
        name: properties.Author.people[0]?.name || '博客作者',
      },
    };
  } catch (error) {
    console.error('Error fetching post from Notion:', error);
    return null;
  }
}

// 修改数据源切换函数
export async function getDataSource(): Promise<'local' | 'notion'> {
  // 从环境变量或配置中读取
  return process.env.DATA_SOURCE as 'local' | 'notion' || 'local';
}

// 修改现有函数以支持多数据源
export async function getAllPosts(): Promise<PostListItem[]> {
  const source = await getDataSource();
  
  if (source === 'notion') {
    return fetchPostsFromNotion();
  }
  
  // 原有本地数据源逻辑
  return SAMPLE_POSTS.map(post => ({
    slug: post.slug,
    title: post.title,
    date: post.date,
    excerpt: post.excerpt,
    coverImage: post.coverImage || null,
    tags: post.tags,
    category: post.category,
  }));
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const source = await getDataSource();
  
  if (source === 'notion') {
    return getPostBySlugFromNotion(slug);
  }
  
  // 原有本地数据源逻辑
  const post = SAMPLE_POSTS.find(p => p.slug === slug);
  return post || null;
}
```

## 部署配置

在生产环境中，确保正确设置以下环境变量：

1. `NOTION_API_KEY` - Notion API密钥
2. `NOTION_DATABASE_ID` - Notion数据库ID
3. `DATA_SOURCE=notion` - 设置数据源为Notion

## 性能优化

1. **缓存策略** - 使用增量静态再生成(ISR)缓存Notion数据
2. **预取数据** - 在构建时获取关键页面数据
3. **图片优化** - 使用Next.js图片组件优化Notion图片

## 常见问题

### 权限问题

确保Notion API密钥有权访问目标数据库。在Notion中，需要将集成添加到目标数据库的"连接"中。

### 内容格式问题

Notion的复杂格式（如表格、嵌套块等）可能在转换为Markdown时丢失某些格式。对于关键格式，可以考虑使用HTML块或自定义组件。

### 速率限制

Notion API有速率限制。在高流量站点上，考虑实现缓存和批处理策略以减少API调用。

## 扩展功能

1. **双向同步** - 实现从博客到Notion的内容更新
2. **评论集成** - 将博客评论同步到Notion页面讨论区
3. **自动发布** - 基于Notion中的状态变更自动发布文章 
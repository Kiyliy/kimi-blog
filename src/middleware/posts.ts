// posts.ts 中间件 - 使用静态数据来模拟文章存储
import { Post, PostListItem } from '@/types/post';

// 示例文章数据，用于客户端渲染
const SAMPLE_POSTS: Post[] = [
  {
    slug: 'welcome-to-my-blog',
    title: '欢迎来到我的博客',
    date: '2023-01-01',
    excerpt: '这是我的第一篇博客文章，介绍了这个博客的目的和计划。',
    content: `
      <h1>欢迎来到我的博客</h1>
      <p>这是我的第一篇博客文章。我计划在这里分享我的思考、学习和创作。</p>
      <h2>这个博客的目的</h2>
      <ul>
        <li>记录我的学习历程</li>
        <li>分享我的想法和观点</li>
        <li>展示我的项目和成果</li>
      </ul>
      <p>我希望这个博客能够成为一个持续更新的知识库，记录我的成长轨迹。</p>
      <p>感谢您的访问！</p>
    `,
    category: '公告',
    tags: ['博客', '介绍'],
    author: {
      name: '博客作者',
    },
  },
  {
    slug: 'second-post',
    title: '创建这个博客的技术栈',
    date: '2023-01-02',
    excerpt: '这篇文章介绍了我用来创建这个博客的技术栈和设计决策。',
    content: `
      <h1>创建这个博客的技术栈</h1>
      <p>这个博客使用了以下技术：</p>
      <ul>
        <li><strong>Next.js</strong>: React 框架，支持服务端渲染和静态生成</li>
        <li><strong>TypeScript</strong>: 类型安全的 JavaScript 超集</li>
        <li><strong>Tailwind CSS</strong>: 实用优先的 CSS 框架</li>
        <li><strong>Markdown</strong>: 内容编写格式</li>
      </ul>
      <h2>为什么选择这些技术？</h2>
      <p>Next.js 提供了极佳的开发体验和性能，TypeScript 确保了代码的可靠性，
      而 Tailwind CSS 让我能够快速构建出一致且美观的界面。</p>
      <p>使用 Markdown 则让我专注于内容创作，而不是格式排版。</p>
    `,
    category: '技术',
    tags: ['Next.js', 'React', 'Tailwind CSS'],
    author: {
      name: '博客作者',
    },
  },
  {
    slug: 'third-post',
    title: '墨水点击效果的实现',
    date: '2023-01-03',
    excerpt: '这篇文章详细介绍了博客中墨水点击效果的实现原理和技术细节。',
    content: `
      <h1>墨水点击效果的实现</h1>
      <p>为了给博客添加一些独特的交互体验，我实现了一个墨水点击效果，当用户点击页面时，会有墨水扩散的动画效果。</p>
      <h2>技术实现</h2>
      <p>这个效果主要通过以下步骤实现：</p>
      <ol>
        <li>使用 React Hook 监听全局点击事件</li>
        <li>在点击位置创建一个带动画的 div 元素</li>
        <li>应用 CSS 动画使其从点击位置扩散</li>
        <li>动画结束后自动移除元素</li>
      </ol>
      <p>这种效果增强了用户交互的视觉反馈，同时与博客的整体设计风格相匹配。</p>
    `,
    category: '设计',
    tags: ['CSS', '动画', '用户体验'],
    author: {
      name: '博客作者',
    },
  }
];

// 获取所有文章
export async function getAllPosts(): Promise<PostListItem[]> {
  // 在实际应用中，这里可以从API获取数据
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

// 获取特定文章
export async function getPostBySlug(slug: string): Promise<Post | null> {
  const post = SAMPLE_POSTS.find(p => p.slug === slug);
  return post || null;
}

// 获取所有分类
export async function getAllCategories(): Promise<string[]> {
  const categories = SAMPLE_POSTS.map(post => post.category).filter(Boolean) as string[];
  return Array.from(new Set(categories));
}

// 获取所有标签
export async function getAllTags(): Promise<string[]> {
  const allTags = SAMPLE_POSTS.flatMap(post => post.tags || []);
  return Array.from(new Set(allTags));
}

// 按分类获取文章
export async function getPostsByCategory(category: string): Promise<PostListItem[]> {
  return SAMPLE_POSTS
    .filter(post => post.category === category)
    .map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      coverImage: post.coverImage || null,
      tags: post.tags,
      category: post.category,
    }));
}

// 按标签获取文章
export async function getPostsByTag(tag: string): Promise<PostListItem[]> {
  return SAMPLE_POSTS
    .filter(post => post.tags?.includes(tag))
    .map(post => ({
      slug: post.slug,
      title: post.title,
      date: post.date,
      excerpt: post.excerpt,
      coverImage: post.coverImage || null,
      tags: post.tags,
      category: post.category,
    }));
}

// Notion API 集成的基础设施（占位，未来实现）
export async function fetchPostsFromNotion(): Promise<PostListItem[]> {
  // 这里将实现从 Notion 获取文章的功能
  // 目前返回空数组作为占位
  return [];
}

// 如果需要，可以添加一个中间件切换不同的数据源
export async function getDataSource(): Promise<'local' | 'notion'> {
  // 将来可以从配置或环境变量中获取数据源
  return 'local';
}
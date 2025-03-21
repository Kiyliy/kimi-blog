import Head from 'next/head';
import Layout from '@/components/Layout';

export default function AboutPage() {
  return (
    <>
      <Head>
        <title>关于 | 优雅博客</title>
        <meta name="description" content="关于我和这个博客" />
      </Head>
      <Layout>
        <article className="prose max-w-none">
          <h1 className="font-serif font-bold text-3xl md:text-4xl leading-tight text-ink-dark mb-8">关于</h1>
          
          <section className="mb-10">
            <h2 className="font-serif text-2xl text-ink-dark">关于这个博客</h2>
            <p>这是一个简洁优雅的个人博客，专注于内容创作与分享。设计灵感来源于传统印刷物的美学，采用了简约的双栏布局，淡雅的米色调，以及墨水点击效果，营造出一种安静、舒适的阅读环境。</p>
            <p>这个博客使用现代前端技术栈构建，包括：</p>
            <ul>
              <li><strong>Next.js</strong> - React 框架，支持服务端渲染和静态生成</li>
              <li><strong>TypeScript</strong> - 类型安全的 JavaScript 超集</li>
              <li><strong>Tailwind CSS</strong> - 实用优先的 CSS 框架</li>
              <li><strong>Markdown</strong> - 内容编写格式</li>
            </ul>
          </section>
          
          <section className="mb-10">
            <h2 className="font-serif text-2xl text-ink-dark">关于我</h2>
            <p>我是一名热爱技术和创作的开发者，喜欢探索和分享各种有趣的想法和见解。这个博客是我记录思考、学习和创作的地方。</p>
            <p>我的兴趣领域包括但不限于：</p>
            <ul>
              <li>前端开发和用户体验设计</li>
              <li>人工智能和机器学习</li>
              <li>创意写作和内容创作</li>
              <li>个人知识管理</li>
            </ul>
          </section>
          
          <section>
            <h2 className="font-serif text-2xl text-ink-dark">联系方式</h2>
            <p>如果你对我的文章有任何问题、建议或想法，欢迎通过以下方式联系我：</p>
            <ul>
              <li>电子邮件：<a href="mailto:example@example.com" className="text-ink-dark underline">example@example.com</a></li>
              <li>GitHub：<a href="https://github.com/username" className="text-ink-dark underline" target="_blank" rel="noopener noreferrer">@username</a></li>
              <li>Twitter：<a href="https://twitter.com/username" className="text-ink-dark underline" target="_blank" rel="noopener noreferrer">@username</a></li>
            </ul>
          </section>
        </article>
      </Layout>
    </>
  );
}
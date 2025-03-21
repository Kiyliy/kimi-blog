import Head from 'next/head';
import Layout from '@/components/Layout';
import { useState, useEffect } from 'react';
import { getAllPosts } from '@/middleware/posts';
import PostCard from '@/components/PostCard';
import type { PostListItem } from '@/types/post';

export default function Home({ initialPosts }: { initialPosts: PostListItem[] }) {
  const [posts, setPosts] = useState<PostListItem[]>(initialPosts);
  const [isLoading, setIsLoading] = useState(false);
  
  return (
    <>
      <Head>
        <title>优雅博客</title>
        <meta name="description" content="一个简洁优雅的个人博客" />
      </Head>
      <Layout>
        <div className="space-y-8">
          <header className="mb-10">
            <h1 className="text-3xl font-serif font-bold text-ink-dark">欢迎来到我的博客空间</h1>
            <p className="mt-3 text-ink-light">这里记录着我的思考、学习与创作。</p>
          </header>
          
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-pulse h-4 bg-cream-300 rounded w-1/3"></div>
            </div>
          ) : (
            <div className="space-y-12">
              {posts.length > 0 ? (
                posts.map((post) => <PostCard key={post.slug} post={post} />)
              ) : (
                <div className="text-center py-12 text-ink-light">
                  <p>暂无文章...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const posts = await getAllPosts();
  
  return {
    props: { 
      initialPosts: posts 
    },
    // 增加增量静态再生成，每10分钟重新获取最新文章
    revalidate: 600,
  };
}

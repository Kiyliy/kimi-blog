import Head from 'next/head';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import { getPostsByCategory, getAllCategories } from '@/middleware/posts';
import type { PostListItem } from '@/types/post';

type Props = {
  posts: PostListItem[];
  category: string;
};

export default function CategoryPage({ posts, category }: Props) {
  return (
    <>
      <Head>
        <title>{`${category} | 优雅博客`}</title>
        <meta name="description" content={`${category}分类下的所有文章`} />
      </Head>
      <Layout>
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-ink-dark">分类：{category}</h1>
          <p className="mt-3 text-ink-light">该分类下共有 {posts.length} 篇文章</p>
        </header>
        
        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <div className="text-center py-12 text-ink-light">
              <p>该分类下暂无文章...</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps({ params }: { params: { category: string } }) {
  const category = params.category;
  const posts = await getPostsByCategory(category);
  
  return {
    props: {
      posts,
      category,
    },
    revalidate: 600,
  };
}

export async function getStaticPaths() {
  const categories = await getAllCategories();
  
  return {
    paths: categories.map((category) => ({
      params: {
        category,
      },
    })),
    fallback: 'blocking',
  };
}
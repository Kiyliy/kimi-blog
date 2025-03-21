import Head from 'next/head';
import Layout from '@/components/Layout';
import PostCard from '@/components/PostCard';
import { getPostsByTag, getAllTags } from '@/middleware/posts';
import type { PostListItem } from '@/types/post';

type Props = {
  posts: PostListItem[];
  tag: string;
};

export default function TagPage({ posts, tag }: Props) {
  return (
    <>
      <Head>
        <title>{`#${tag} | 优雅博客`}</title>
        <meta name="description" content={`标签 #${tag} 下的所有文章`} />
      </Head>
      <Layout>
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-ink-dark">标签：#{tag}</h1>
          <p className="mt-3 text-ink-light">该标签下共有 {posts.length} 篇文章</p>
        </header>
        
        <div className="space-y-12">
          {posts.length > 0 ? (
            posts.map((post) => <PostCard key={post.slug} post={post} />)
          ) : (
            <div className="text-center py-12 text-ink-light">
              <p>该标签下暂无文章...</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps({ params }: { params: { tag: string } }) {
  const tag = params.tag;
  const posts = await getPostsByTag(tag);
  
  return {
    props: {
      posts,
      tag,
    },
    revalidate: 600,
  };
}

export async function getStaticPaths() {
  const tags = await getAllTags();
  
  return {
    paths: tags.map((tag) => ({
      params: {
        tag,
      },
    })),
    fallback: 'blocking',
  };
}
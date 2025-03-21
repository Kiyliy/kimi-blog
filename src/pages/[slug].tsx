import Head from 'next/head';
import Layout from '@/components/Layout';
import { getPostBySlug, getAllPosts } from '@/middleware/posts';
import PostBody from '@/components/PostBody';
import PostHeader from '@/components/PostHeader';
import type { Post } from '@/types/post';

type Props = {
  post: Post;
};

export default function PostPage({ post }: Props) {
  return (
    <>
      <Head>
        <title>{`${post.title} | 优雅博客`}</title>
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        {post.coverImage && <meta property="og:image" content={post.coverImage} />}
      </Head>
      <Layout>
        <article className="mb-32">
          <PostHeader
            title={post.title}
            coverImage={post.coverImage}
            date={post.date}
            author={post.author}
            tags={post.tags}
            category={post.category}
          />
          <PostBody content={post.content} />
        </article>
      </Layout>
    </>
  );
}

export async function getStaticProps({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  
  // 如果没有找到文章，返回404
  if (!post) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {
      post,
    },
    // 增加增量静态再生成，每10分钟重新验证
    revalidate: 600,
  };
}

export async function getStaticPaths() {
  const posts = await getAllPosts();
  
  return {
    paths: posts.map((post) => ({
      params: {
        slug: post.slug,
      },
    })),
    fallback: 'blocking', // 使用blocking类型的fallback，以便支持未预渲染的文章
  };
}

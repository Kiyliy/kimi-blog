import Head from 'next/head';
import Link from 'next/link';
import Layout from '@/components/Layout';
import { getAllPosts } from '@/middleware/posts';
import { format, parseISO } from 'date-fns';
import type { PostListItem } from '@/types/post';

type GroupedPosts = {
  [year: string]: PostListItem[];
};

type Props = {
  groupedPosts: GroupedPosts;
  years: string[];
};

export default function ArchivePage({ groupedPosts, years }: Props) {
  return (
    <>
      <Head>
        <title>归档 | 优雅博客</title>
        <meta name="description" content="所有文章的时间线归档" />
      </Head>
      <Layout>
        <header className="mb-10">
          <h1 className="text-3xl font-serif font-bold text-ink-dark">归档</h1>
          <p className="mt-3 text-ink-light">所有文章的时间线视图</p>
        </header>
        
        <div className="space-y-12">
          {years.length > 0 ? (
            years.map((year) => (
              <section key={year} className="mb-8">
                <h2 className="text-2xl font-serif font-bold text-ink-dark mb-4">{year}</h2>
                <ul className="space-y-4">
                  {groupedPosts[year].map((post) => (
                    <li key={post.slug} className="border-l-2 border-cream-300 pl-4 py-1 hover:border-ink-light transition-colors">
                      <time className="block text-sm text-ink-light mb-1">
                        {format(parseISO(post.date), 'MM月dd日')}
                      </time>
                      <Link href={`/${post.slug}`} className="font-medium text-ink-dark hover:underline">
                        {post.title}
                      </Link>
                      {post.category && (
                        <Link href={`/category/${post.category}`} className="ml-2 text-sm text-ink-light hover:underline">
                          {post.category}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </section>
            ))
          ) : (
            <div className="text-center py-12 text-ink-light">
              <p>暂无文章...</p>
            </div>
          )}
        </div>
      </Layout>
    </>
  );
}

export async function getStaticProps() {
  const posts = await getAllPosts();
  
  // 按年份分组文章
  const groupedPosts = posts.reduce((groups: GroupedPosts, post) => {
    const date = parseISO(post.date);
    const year = date.getFullYear().toString();
    
    if (!groups[year]) {
      groups[year] = [];
    }
    
    groups[year].push(post);
    return groups;
  }, {});
  
  // 获取所有年份并按降序排序
  const years = Object.keys(groupedPosts).sort((a, b) => parseInt(b) - parseInt(a));
  
  return {
    props: {
      groupedPosts,
      years,
    },
    revalidate: 600,
  };
}
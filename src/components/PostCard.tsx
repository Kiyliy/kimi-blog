import Link from 'next/link';
import Image from 'next/image';
import { format } from 'date-fns';
import type { Post, PostListItem } from '@/types/post';

// 定义一个通用类型以适配Post或PostListItem
type PostCardProps = {
  post: Post | PostListItem;
};

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="border-b border-cream-300 pb-8 last:border-0">
      <Link href={`/${post.slug}`}>
        <div className="group cursor-pointer">
          {post.coverImage && (
            <div className="mb-4 overflow-hidden rounded-lg transition-all duration-300">
              <Image
                src={post.coverImage}
                alt={post.title}
                width={800}
                height={500}
                className="h-56 w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          )}
          
          <h2 className="font-serif font-bold text-xl text-ink-dark group-hover:underline">
            {post.title}
          </h2>
          
          <div className="flex items-center mt-2 space-x-2 text-sm text-ink-light">
            <time dateTime={format(new Date(post.date), 'yyyy-MM-dd')}>
              {format(new Date(post.date), 'yyyy年MM月dd日')}
            </time>
            {post.tags && post.tags.length > 0 && (
              <>
                <span>•</span>
                <div className="flex space-x-2">
                  {post.tags.slice(0, 2).map((tag) => (
                    <span key={tag} className="bg-cream-200 px-2 py-0.5 rounded-full text-xs">
                      {tag}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>
          
          <p className="mt-3 text-ink-light line-clamp-3">{post.excerpt}</p>
        </div>
      </Link>
    </article>
  );
}

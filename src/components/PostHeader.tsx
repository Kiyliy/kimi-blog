import Image from 'next/image';
import Link from 'next/link';
import { format } from 'date-fns';

type Props = {
  title: string;
  coverImage?: string | null;
  date: string;
  author?: {
    name: string;
    picture?: string | null;
  };
  tags?: string[];
  category?: string;
};

export default function PostHeader({ title, coverImage, date, author, tags, category }: Props) {
  return (
    <header className="mb-12">
      <h1 className="font-serif font-bold text-3xl md:text-4xl leading-tight text-ink-dark mb-4">
        {title}
      </h1>
      
      <div className="flex items-center space-x-3 text-sm text-ink-light mb-6">
        {author && (
          <div className="flex items-center space-x-2">
            {author.picture ? (
              <Image
                src={author.picture}
                alt={author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            ) : (
              <div className="w-6 h-6 bg-cream-300 rounded-full flex items-center justify-center text-ink-light">
                {author.name.charAt(0)}
              </div>
            )}
            <span>{author.name}</span>
          </div>
        )}
        
        <span>•</span>
        
        <time dateTime={format(new Date(date), 'yyyy-MM-dd')}>
          {format(new Date(date), 'yyyy年MM月dd日')}
        </time>
        
        {category && (
          <>
            <span>•</span>
            <Link href={`/category/${category}`} className="hover:underline">
              {category}
            </Link>
          </>
        )}
      </div>
      
      {tags && tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {tags.map((tag) => (
            <Link key={tag} href={`/tag/${tag}`}
                  className="bg-cream-200 px-3 py-1 rounded-full text-xs hover:bg-cream-300 transition-colors duration-200">
              {tag}
            </Link>
          ))}
        </div>
      )}
      
      {coverImage && (
        <div className="mb-8 overflow-hidden rounded-lg">
          <Image
            src={coverImage}
            alt={title}
            width={1200}
            height={630}
            className="w-full h-auto"
          />
        </div>
      )}
    </header>
  );
}

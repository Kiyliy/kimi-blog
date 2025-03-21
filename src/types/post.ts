export interface Post {
  slug: string;
  title: string;
  date: string;
  content: string;
  excerpt: string;
  coverImage?: string | null;
  tags?: string[];
  category?: string;
  author?: {
    name: string;
    picture?: string | null;
  };
}

export interface PostListItem {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  coverImage?: string | null;
  tags?: string[];
  category?: string;
}
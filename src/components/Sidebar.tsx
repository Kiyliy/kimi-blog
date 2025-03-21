import Link from 'next/link';
import { useRouter } from 'next/router';
import { useState, useEffect } from 'react';
import { getAllCategories } from '@/middleware/posts';

export default function Sidebar() {
  const router = useRouter();
  const [categories, setCategories] = useState<string[]>([]);
  
  useEffect(() => {
    async function loadCategories() {
      const cats = await getAllCategories();
      setCategories(cats);
    }
    
    loadCategories();
  }, []);
  
  return (
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <Link href="/" className="block">
          <h1 className="text-2xl font-serif font-bold text-ink-dark">优雅博客</h1>
        </Link>
        <p className="text-sm text-ink-light mt-1">思考 · 学习 · 创作</p>
      </div>
      
      <nav className="flex-grow">
        <ul className="space-y-1">
          <li>
            <Link href="/" 
                  className={`sidebar-link ${router.pathname === '/' ? 'active' : ''}`}>
              首页
            </Link>
          </li>
          
          {categories.length > 0 && (
            <li className="mt-4">
              <h3 className="font-medium text-sm uppercase text-ink-light tracking-wider mb-2 px-3">
                分类
              </h3>
              <ul className="space-y-1">
                {categories.map((category) => (
                  <li key={category}>
                    <Link href={`/category/${category}`}
                          className={`sidebar-link ${
                            router.asPath === `/category/${category}` ? 'active' : ''
                          }`}>
                      {category}
                    </Link>
                  </li>
                ))}
              </ul>
            </li>
          )}
          
          <li className="mt-4">
            <Link href="/archive" 
                  className={`sidebar-link ${router.pathname === '/archive' ? 'active' : ''}`}>
              归档
            </Link>
          </li>
          
          <li>
            <Link href="/about" 
                  className={`sidebar-link ${router.pathname === '/about' ? 'active' : ''}`}>
              关于
            </Link>
          </li>
        </ul>
      </nav>
      
      <div className="mt-auto pt-6 text-sm text-ink-light">
        <p>© {new Date().getFullYear()} 优雅博客</p>
      </div>
    </div>
  );
}

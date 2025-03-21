import '@/styles/globals.css';
import type { AppProps } from 'next/app';
import { useEffect } from 'react';
import { inkEffect } from '@/hooks/useInkEffect';

export default function App({ Component, pageProps }: AppProps) {
  useEffect(() => {
    // Initialize ink effect
    return inkEffect();
  }, []);

  return (
    <div className="min-h-screen bg-cream-100">
      <Component {...pageProps} />
    </div>
  );
}

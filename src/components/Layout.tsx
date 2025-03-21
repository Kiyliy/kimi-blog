import Sidebar from './Sidebar';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="w-64 fixed h-full border-r border-cream-300 bg-cream-100">
        <Sidebar />
      </div>
      
      {/* Main content */}
      <main className="ml-64 flex-1 p-8">
        <div className="max-w-4xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}

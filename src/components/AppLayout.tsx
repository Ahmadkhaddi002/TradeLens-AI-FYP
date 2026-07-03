import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import { Outlet } from 'react-router';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <div className="lg:ml-60 min-h-screen flex flex-col transition-all duration-250">
        <TopNav />
        <main className="flex-1 p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

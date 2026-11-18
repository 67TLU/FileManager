import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { BreadcrumbNav } from './breadcrumb-nav';
import { GlobalSearchBar } from '@/features/search/components/global-search-bar';

export function Header() {
  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
      <SidebarTrigger className="md:hidden">
        <Menu className="h-5 w-5" />
      </SidebarTrigger>

      <BreadcrumbNav />

      <div className="ml-auto flex items-center gap-4">
        {/* Search bar với autocomplete */}
        <GlobalSearchBar />

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </Button>
      </div>
    </header>
  );
}
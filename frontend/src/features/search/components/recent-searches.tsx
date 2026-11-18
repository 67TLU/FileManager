import { useState, useEffect } from 'react';
import { Clock, X, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLocalStorage } from '@/hooks/use-local-storage';

const STORAGE_KEY = 'crms-recent-searches';
const MAX_ITEMS = 10;

interface RecentSearchesProps {
  onSelect: (query: string) => void;
}

export function RecentSearches({ onSelect }: RecentSearchesProps) {
  const [searches, setSearches] = useLocalStorage<string[]>(STORAGE_KEY, []);

  const addSearch = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;

    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_ITEMS);
    });
  };

  const removeSearch = (query: string) => {
    setSearches((prev) => prev.filter((s) => s !== query));
  };

  const clearAll = () => {
    setSearches([]);
  };

  if (searches.length === 0) return null;

  return (
    <div className="border rounded-lg p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          Tìm kiếm gần đây
        </h3>
        <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={clearAll}>
          Xóa tất cả
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {searches.map((search) => (
          <div
            key={search}
            className="group flex items-center gap-1 bg-secondary rounded-md px-2 py-1 text-xs"
          >
            <button
              onClick={() => onSelect(search)}
              className="flex items-center gap-1 hover:text-primary"
            >
              <Search className="h-3 w-3" />
              {search}
            </button>
            <button
              onClick={() => removeSearch(search)}
              className="opacity-0 group-hover:opacity-100 hover:text-destructive transition-opacity"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// Export helper để các component khác có thể lưu search
export function useSaveRecentSearch() {
  const [searches, setSearches] = useLocalStorage<string[]>(STORAGE_KEY, []);

  return (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearches((prev) => {
      const filtered = prev.filter((s) => s !== trimmed);
      return [trimmed, ...filtered].slice(0, MAX_ITEMS);
    });
  };
}
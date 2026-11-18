import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, FileText, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebounce } from '@/hooks/use-debounce';
import { useSearchSuggestions, useRecentResources } from '../hooks/use-search';

export function GlobalSearchBar() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: suggestions = [], isLoading } = useSearchSuggestions(debouncedQuery);
  const { data: recent = [] } = useRecentResources(5);

  // Đóng popover khi query rỗng
  useEffect(() => {
    if (!query) {
      setOpen(false);
    }
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/search?q=${encodeURIComponent(query.trim())}`);
      setOpen(false);
      setQuery('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    navigate(`/search?q=${encodeURIComponent(suggestion)}`);
    setOpen(false);
    setQuery('');
  };

  const handleRecentClick = (item: any) => {
    navigate(`/search?q=${encodeURIComponent(item.name)}`);
    setOpen(false);
    setQuery('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <form onSubmit={handleSubmit} className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            ref={inputRef}
            placeholder="Tìm kiếm tài nguyên..."
            className="w-64 pl-10 pr-10 lg:w-96"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => {
              if (query || recent.length > 0) setOpen(true);
            }}
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setOpen(false);
                inputRef.current?.focus();
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </PopoverTrigger>

      <PopoverContent
        className="w-[400px] p-0"
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        {isLoading ? (
          <div className="flex items-center justify-center p-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : suggestions.length > 0 ? (
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Gợi ý
            </div>
            {suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <Search className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate">{suggestion}</span>
              </button>
            ))}
          </div>
        ) : recent.length > 0 && !query ? (
          <div className="p-2">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
              Truy cập gần đây
            </div>
            {recent.map((item) => (
              <button
                key={item.id}
                onClick={() => handleRecentClick(item)}
                className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
              >
                <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="truncate flex-1 text-left">{item.name}</span>
                {item.folder_name && (
                  <span className="text-xs text-muted-foreground truncate max-w-[100px]">
                    {item.folder_name}
                  </span>
                )}
              </button>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-sm text-muted-foreground">
            Nhập ít nhất 2 ký tự để tìm kiếm
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
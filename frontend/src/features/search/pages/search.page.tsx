import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search as SearchIcon, SlidersHorizontal, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet';

import { SearchFilters,type SearchFiltersState } from '../components/search-filters';
import { SearchResults } from '../components/search-results';
import { RecentSearches, useSaveRecentSearch } from '../components/recent-searches';
import { useAdvancedSearch } from '../hooks/use-search';

const DEFAULT_FILTERS: SearchFiltersState = {
  types: [],
  mimeTypes: [],
  folderIds: [],
  dateFrom: '',
  dateTo: '',
  sizeMin: '',
  sizeMax: '',
};

export function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';

  const [query, setQuery] = useState(initialQuery);
  const [submittedQuery, setSubmittedQuery] = useState(initialQuery);
  const [filters, setFilters] = useState<SearchFiltersState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const saveSearch = useSaveRecentSearch();

  // Build advanced search params
  const advancedParams = {
    query: submittedQuery || undefined,
    filters: {
      types: filters.types.length > 0 ? (filters.types as any) : undefined,
      mimeTypes: filters.mimeTypes.length > 0 ? filters.mimeTypes : undefined,
      folderIds: filters.folderIds.length > 0 ? filters.folderIds : undefined,
      dateRange:
        filters.dateFrom || filters.dateTo
          ? {
              from: filters.dateFrom ? new Date(filters.dateFrom).toISOString() : undefined,
              to: filters.dateTo ? new Date(filters.dateTo).toISOString() : undefined,
            }
          : undefined,
      sizeRange:
        filters.sizeMin || filters.sizeMax
          ? {
              min: filters.sizeMin ? Number(filters.sizeMin) * 1024 * 1024 : undefined,
              max: filters.sizeMax ? Number(filters.sizeMax) * 1024 * 1024 : undefined,
            }
          : undefined,
    },
    page,
    limit,
  };

  const { data, isLoading } = useAdvancedSearch(advancedParams);

  // Handle search submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedQuery(query);
    setPage(1);
    if (query.trim()) {
      saveSearch(query.trim());
      setSearchParams({ q: query.trim() });
    } else {
      setSearchParams({});
    }
  };

  // Handle filter change
  const handleFiltersChange = (newFilters: SearchFiltersState) => {
    setFilters(newFilters);
    setPage(1);
  };

  // Handle recent search select
  const handleRecentSelect = (recentQuery: string) => {
    setQuery(recentQuery);
    setSubmittedQuery(recentQuery);
    setPage(1);
    setSearchParams({ q: recentQuery });
    saveSearch(recentQuery);
  };

  // Clear all
  const handleClearAll = () => {
    setQuery('');
    setSubmittedQuery('');
    setFilters(DEFAULT_FILTERS);
    setPage(1);
    setSearchParams({});
  };

  // Pagination
  const totalPages = data?.pagination?.totalPages || 1;
  const paginationItems = [];
  const maxVisible = 5;

  if (totalPages <= maxVisible) {
    for (let i = 1; i <= totalPages; i++) paginationItems.push(i);
  } else {
    if (page <= 3) {
      paginationItems.push(1, 2, 3, 4, 'ellipsis', totalPages);
    } else if (page >= totalPages - 2) {
      paginationItems.push(1, 'ellipsis', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
    } else {
      paginationItems.push(1, 'ellipsis', page - 1, page, page + 1, 'ellipsis', totalPages);
    }
  }

  const hasActiveFilters =
    filters.types.length > 0 ||
    filters.folderIds.length > 0 ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sizeMin ||
    filters.sizeMax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <SearchIcon className="h-6 w-6" />
          Tìm kiếm
        </h1>
        <p className="text-muted-foreground mt-1">
          Tìm kiếm tài nguyên trong toàn bộ hệ thống
        </p>
      </div>

      {/* Search bar */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Nhập từ khóa tìm kiếm..."
            className="pl-10 pr-10 h-11"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
          {query && (
            <button
              type="button"
              onClick={() => {
                setQuery('');
                setSubmittedQuery('');
                setSearchParams({});
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Mobile filter button */}
        <Sheet>
          <SheetTrigger asChild>
            <Button
              type="button"
              variant="outline"
              className="h-11 md:hidden relative"
            >
              <SlidersHorizontal className="h-4 w-4 mr-2" />
              Bộ lọc
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] flex items-center justify-center">
                  !
                </span>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-[320px] sm:w-[400px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>Bộ lọc tìm kiếm</SheetTitle>
            </SheetHeader>
            <div className="mt-4">
              <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
            </div>
          </SheetContent>
        </Sheet>
      </form>

      {/* Main content */}
      <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
        {/* Left: Filters (desktop) */}
        <div className="hidden md:block">
          <div className="sticky top-4 border rounded-lg p-4">
            <SearchFilters filters={filters} onFiltersChange={handleFiltersChange} />
          </div>
        </div>

        {/* Right: Results */}
        <div className="space-y-4">
          {/* Recent searches */}
          {!submittedQuery && !hasActiveFilters && (
            <RecentSearches onSelect={handleRecentSelect} />
          )}

          {/* Results */}
          <SearchResults
            resources={data?.data || []}
            isLoading={isLoading}
            total={data?.pagination?.total || 0}
            query={submittedQuery}
          />

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>

                {paginationItems.map((item, idx) =>
                  item === 'ellipsis' ? (
                    <PaginationItem key={`ellipsis-${idx}`}>
                      <PaginationEllipsis />
                    </PaginationItem>
                  ) : (
                    <PaginationItem key={item}>
                      <PaginationLink
                        onClick={() => setPage(item as number)}
                        isActive={page === item}
                        className="cursor-pointer"
                      >
                        {item}
                      </PaginationLink>
                    </PaginationItem>
                  )
                )}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className={page === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
      </div>
    </div>
  );
}
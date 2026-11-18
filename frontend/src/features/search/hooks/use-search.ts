import { useQuery } from '@tanstack/react-query';
import { searchApi, type AdvancedSearchParams, type SearchParams, } from '../api/search.api';

/**
 * Hook tìm kiếm cơ bản
 */
export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchApi.search(params),
    enabled: !!params.q || !!params.type || !!params.folderId,
    keepPreviousData: true,
    staleTime: 30 * 1000, // 30 giây
  });
}

/**
 * Hook tìm kiếm nâng cao
 */
export function useAdvancedSearch(params: AdvancedSearchParams) {
  return useQuery({
    queryKey: ['search', 'advanced', params],
    queryFn: () => searchApi.advancedSearch(params),
    enabled: !!params.query || !!params.filters,
    keepPreviousData: true,
    staleTime: 30 * 1000,
  });
}

/**
 * Hook gợi ý tìm kiếm (debounce ở component)
 */
export function useSearchSuggestions(q: string) {
  return useQuery({
    queryKey: ['search', 'suggestions', q],
    queryFn: () => searchApi.getSuggestions(q),
    enabled: q.length >= 2,
    staleTime: 60 * 1000,
  });
}

/**
 * Hook tài nguyên gần đây
 */
export function useRecentResources(limit: number = 10) {
  return useQuery({
    queryKey: ['search', 'recent', limit],
    queryFn: () => searchApi.getRecent(limit),
    staleTime: 60 * 1000,
  });
}
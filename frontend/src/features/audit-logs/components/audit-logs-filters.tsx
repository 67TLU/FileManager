import { useState } from 'react';
import { Search, Filter, X, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ACTION_CATEGORIES } from '../api/audit-logs.api';

export interface AuditLogsFiltersState {
  action: string;
  actorId: string;
  targetType: string;
  dateFrom: Date | null;
  dateTo: Date | null;
}

interface AuditLogsFiltersProps {
  filters: AuditLogsFiltersState;
  onFiltersChange: (filters: AuditLogsFiltersState) => void;
  onSearch: (search: string) => void;
}

export function AuditLogsFilters({
  filters,
  onFiltersChange,
  onSearch,
}: AuditLogsFiltersProps) {
  const [searchInput, setSearchInput] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchInput);
  };

  const clearAll = () => {
    onFiltersChange({
      action: '',
      actorId: '',
      targetType: '',
      dateFrom: null,
      dateTo: null,
    });
    setSearchInput('');
    onSearch('');
  };

  const hasActiveFilters =
    filters.action ||
    filters.actorId ||
    filters.targetType ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4">
      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Tìm kiếm theo tên user, email..."
            className="pl-10"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>
      </form>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Action filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Filter className="h-3.5 w-3.5" />
              Hành động
              {filters.action && <Badge className="ml-1 h-5">{getActionCategory(filters.action)}</Badge>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0" align="start">
            <div className="p-2 space-y-1 max-h-[400px] overflow-y-auto">
              <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                Tất cả hành động
              </div>
              <button
                onClick={() => onFiltersChange({ ...filters, action: '' })}
                className="w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent"
              >
                Tất cả
              </button>
              <Separator className="my-2" />
              {Object.entries(ACTION_CATEGORIES).map(([categoryKey, category]) => (
                <div key={categoryKey}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                    {category.label}
                  </div>
                  {category.actions.map((action) => (
                    <button
                      key={action.value}
                      onClick={() => onFiltersChange({ ...filters, action: action.value })}
                      className={`w-full text-left px-2 py-1.5 text-sm rounded hover:bg-accent ${
                        filters.action === action.value ? 'bg-accent' : ''
                      }`}
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>

        {/* Target type filter */}
        <Select
          value={filters.targetType}
          onValueChange={(value) => onFiltersChange({ ...filters, targetType: value })}
        >
          <SelectTrigger className="w-[150px] h-8">
            <SelectValue placeholder="Loại đối tượng" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="department">Phòng ban</SelectItem>
            <SelectItem value="resource">Tài nguyên</SelectItem>
            <SelectItem value="folder">Thư mục</SelectItem>
            <SelectItem value="invitation">Lời mời</SelectItem>
            <SelectItem value="refresh_token">Session</SelectItem>
          </SelectContent>
        </Select>

        {/* Date range filter */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-2">
              <Calendar className="h-3.5 w-3.5" />
              {filters.dateFrom || filters.dateTo ? (
                <>
                  {filters.dateFrom && format(filters.dateFrom, 'dd/MM/yyyy', { locale: vi })}
                  {filters.dateFrom && filters.dateTo && ' - '}
                  {filters.dateTo && format(filters.dateTo, 'dd/MM/yyyy', { locale: vi })}
                </>
              ) : (
                'Thời gian'
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <div className="p-4 space-y-4">
              <div>
                <label className="text-sm font-medium">Từ ngày</label>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateFrom || undefined}
                  onSelect={(date) => onFiltersChange({ ...filters, dateFrom: date || null })}
                  locale={vi}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Đến ngày</label>
                <CalendarComponent
                  mode="single"
                  selected={filters.dateTo || undefined}
                  onSelect={(date) => onFiltersChange({ ...filters, dateTo: date || null })}
                  locale={vi}
                />
              </div>
            </div>
          </PopoverContent>
        </Popover>

        {/* Clear all */}
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="gap-1">
            <X className="h-3.5 w-3.5" />
            Xóa bộ lọc
          </Button>
        )}
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.action && (
            <Badge variant="secondary" className="gap-1">
              Hành động: {getActionLabel(filters.action)}
              <button onClick={() => onFiltersChange({ ...filters, action: '' })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          {filters.targetType && (
            <Badge variant="secondary" className="gap-1">
              Loại: {filters.targetType}
              <button onClick={() => onFiltersChange({ ...filters, targetType: '' })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          {filters.dateFrom && (
            <Badge variant="secondary" className="gap-1">
              Từ: {format(filters.dateFrom, 'dd/MM/yyyy', { locale: vi })}
              <button onClick={() => onFiltersChange({ ...filters, dateFrom: null })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="gap-1">
              Đến: {format(filters.dateTo, 'dd/MM/yyyy', { locale: vi })}
              <button onClick={() => onFiltersChange({ ...filters, dateTo: null })}>
                <X className="h-3 w-3 ml-1" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}

// Helper functions
function getActionCategory(action: string): string {
  const category = Object.entries(ACTION_CATEGORIES).find(([, cat]) =>
    cat.actions.some((a) => a.value === action)
  );
  return category ? category[1].label : '';
}

function getActionLabel(action: string): string {
  for (const category of Object.values(ACTION_CATEGORIES)) {
    const found = category.actions.find((a) => a.value === action);
    if (found) return found.label;
  }
  return action;
}
import { useState } from 'react';
import {
  File,
  FileText,
  Image,
  Film,
  FileSpreadsheet,
  Presentation,
  FileCode,
  Link as LinkIcon,
  StickyNote,
  Calendar,
  HardDrive,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useFolderTree } from '@/features/resources/hooks/use-folder-tree';
import type { FolderNode } from '@/features/resources/api/resources.api';

export interface SearchFiltersState {
  types: string[];
  mimeTypes: string[];
  folderIds: string[];
  dateFrom: string;
  dateTo: string;
  sizeMin: string;
  sizeMax: string;
}

interface SearchFiltersProps {
  filters: SearchFiltersState;
  onFiltersChange: (filters: SearchFiltersState) => void;
}

const FILE_TYPES = [
  { value: 'pdf', label: 'PDF', icon: FileText, color: 'text-red-500' },
  { value: 'docx', label: 'Word', icon: FileText, color: 'text-blue-600' },
  { value: 'xlsx', label: 'Excel', icon: FileSpreadsheet, color: 'text-green-600' },
  { value: 'pptx', label: 'PowerPoint', icon: Presentation, color: 'text-orange-500' },
  { value: 'image', label: 'Hình ảnh', icon: Image, color: 'text-green-500' },
  { value: 'video', label: 'Video', icon: Film, color: 'text-purple-500' },
  { value: 'json', label: 'JSON/Code', icon: FileCode, color: 'text-cyan-500' },
  { value: 'link', label: 'Liên kết', icon: LinkIcon, color: 'text-blue-500' },
  { value: 'note', label: 'Ghi chú', icon: StickyNote, color: 'text-yellow-500' },
];

const MIME_TYPE_MAP: Record<string, string[]> = {
  pdf: ['application/pdf'],
  docx: ['application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  xlsx: ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
  pptx: ['application/vnd.openxmlformats-officedocument.presentationml.presentation'],
  image: ['image/jpeg', 'image/png', 'image/gif'],
  video: ['video/mp4'],
  json: ['application/json', 'text/plain'],
};

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const { data: folderTreeData } = useFolderTree();

  const toggleType = (type: string) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter((t) => t !== type)
      : [...filters.types, type];

    // Map types to mimeTypes
    const newMimeTypes = newTypes.flatMap((t) => MIME_TYPE_MAP[t] || []);

    onFiltersChange({
      ...filters,
      types: newTypes,
      mimeTypes: newMimeTypes,
    });
  };

  const toggleFolder = (folderId: string) => {
    const newFolderIds = filters.folderIds.includes(folderId)
      ? filters.folderIds.filter((id) => id !== folderId)
      : [...filters.folderIds, folderId];

    onFiltersChange({ ...filters, folderIds: newFolderIds });
  };

  const clearAll = () => {
    onFiltersChange({
      types: [],
      mimeTypes: [],
      folderIds: [],
      dateFrom: '',
      dateTo: '',
      sizeMin: '',
      sizeMax: '',
    });
  };

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
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Bộ lọc</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAll} className="h-7 text-xs">
            <X className="h-3 w-3 mr-1" />
            Xóa tất cả
          </Button>
        )}
      </div>

      {/* File Types */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Loại file</Label>
        <div className="flex flex-wrap gap-2">
          {FILE_TYPES.map((type) => {
            const isActive = filters.types.includes(type.value);
            return (
              <button
                key={type.value}
                onClick={() => toggleType(type.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'hover:bg-accent border-border'
                }`}
              >
                <type.icon className={`h-3.5 w-3.5 ${isActive ? '' : type.color}`} />
                {type.label}
              </button>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Date Range */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" />
          Thời gian tạo
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="date"
            value={filters.dateFrom}
            onChange={(e) => onFiltersChange({ ...filters, dateFrom: e.target.value })}
            placeholder="Từ ngày"
            className="h-8 text-xs"
          />
          <Input
            type="date"
            value={filters.dateTo}
            onChange={(e) => onFiltersChange({ ...filters, dateTo: e.target.value })}
            placeholder="Đến ngày"
            className="h-8 text-xs"
          />
        </div>
      </div>

      <Separator />

      {/* Size Range */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1.5">
          <HardDrive className="h-3.5 w-3.5" />
          Kích thước (MB)
        </Label>
        <div className="grid grid-cols-2 gap-2">
          <Input
            type="number"
            value={filters.sizeMin}
            onChange={(e) => onFiltersChange({ ...filters, sizeMin: e.target.value })}
            placeholder="Tối thiểu"
            className="h-8 text-xs"
            min="0"
          />
          <Input
            type="number"
            value={filters.sizeMax}
            onChange={(e) => onFiltersChange({ ...filters, sizeMax: e.target.value })}
            placeholder="Tối đa"
            className="h-8 text-xs"
            min="0"
          />
        </div>
      </div>

      <Separator />

      {/* Folders */}
      <div>
        <Label className="text-xs text-muted-foreground mb-2 block">Thư mục</Label>
        <div className="max-h-48 overflow-y-auto border rounded-md p-2 space-y-1">
          {folderTreeData?.tree ? (
            <FolderTreeCheckboxes
              nodes={folderTreeData.tree}
              selectedIds={filters.folderIds}
              onToggle={toggleFolder}
              level={0}
            />
          ) : (
            <p className="text-xs text-muted-foreground p-2">Chưa có thư mục</p>
          )}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <>
          <Separator />
          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">
              Bộ lọc đang áp dụng
            </Label>
            <div className="flex flex-wrap gap-1">
              {filters.types.map((type) => (
                <Badge key={type} variant="secondary" className="text-xs">
                  {FILE_TYPES.find((t) => t.value === type)?.label}
                  <button
                    onClick={() => toggleType(type)}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
              {filters.dateFrom && (
                <Badge variant="secondary" className="text-xs">
                  Từ {filters.dateFrom}
                  <button
                    onClick={() => onFiltersChange({ ...filters, dateFrom: '' })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
              {filters.dateTo && (
                <Badge variant="secondary" className="text-xs">
                  Đến {filters.dateTo}
                  <button
                    onClick={() => onFiltersChange({ ...filters, dateTo: '' })}
                    className="ml-1 hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Recursive folder tree with checkboxes
function FolderTreeCheckboxes({
  nodes,
  selectedIds,
  onToggle,
  level,
}: {
  nodes: FolderNode[];
  selectedIds: string[];
  onToggle: (id: string) => void;
  level: number;
}) {
  return (
    <>
      {nodes.map((node) => (
        <div key={node.id}>
          <label
            className="flex items-center gap-2 py-1 px-1 rounded hover:bg-accent/50 cursor-pointer text-xs"
            style={{ paddingLeft: `${level * 12 + 4}px` }}
          >
            <input
              type="checkbox"
              checked={selectedIds.includes(node.id)}
              onChange={() => onToggle(node.id)}
              className="rounded"
            />
            <span className="truncate">{node.name}</span>
          </label>
          {node.children.length > 0 && (
            <FolderTreeCheckboxes
              nodes={node.children}
              selectedIds={selectedIds}
              onToggle={onToggle}
              level={level + 1}
            />
          )}
        </div>
      ))}
    </>
  );
}
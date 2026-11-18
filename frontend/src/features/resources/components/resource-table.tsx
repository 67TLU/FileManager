import { File, FileText, Image, Film, FileSpreadsheet, Presentation, FileCode, Link as LinkIcon, StickyNote, MoreVertical } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatFileSize, formatDate } from '@/lib/utils';
import type { Resource } from '../api/resources.api';

interface ResourceTableProps {
  resources: Resource[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onOpen: (resource: Resource) => void;
  onDownload: (resource: Resource) => void;
  onTrash: (resource: Resource) => void;
}

function getFileIcon(mimeType: string | null, type: string) {
  if (type === 'link') return <LinkIcon className="h-4 w-4 text-blue-500" />;
  if (type === 'note') return <StickyNote className="h-4 w-4 text-yellow-500" />;
  if (!mimeType) return <File className="h-4 w-4 text-gray-500" />;

  if (mimeType.startsWith('image/')) return <Image className="h-4 w-4 text-green-500" />;
  if (mimeType.startsWith('video/')) return <Film className="h-4 w-4 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="h-4 w-4 text-red-500" />;
  if (mimeType.includes('spreadsheet'))
    return <FileSpreadsheet className="h-4 w-4 text-green-600" />;
  if (mimeType.includes('presentation'))
    return <Presentation className="h-4 w-4 text-orange-500" />;
  if (mimeType.includes('json') || mimeType.includes('javascript'))
    return <FileCode className="h-4 w-4 text-cyan-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText className="h-4 w-4 text-blue-600" />;

  return <File className="h-4 w-4 text-gray-500" />;
}

export function ResourceTable({
  resources,
  selectedIds,
  onSelect,
  onSelectAll,
  onOpen,
  onDownload,
  onTrash,
}: ResourceTableProps) {
  const allSelected = resources.length > 0 && selectedIds.size === resources.length;
  const someSelected = selectedIds.size > 0 && selectedIds.size < resources.length;

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-12">
            <Checkbox
              checked={allSelected}
              onCheckedChange={(checked) => onSelectAll(!!checked)}
              aria-label="Chọn tất cả"
            />
          </TableHead>
          <TableHead>Tên</TableHead>
          <TableHead className="w-32">Người tạo</TableHead>
          <TableHead className="w-24">Kích thước</TableHead>
          <TableHead className="w-40">Ngày tạo</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
              Thư mục này trống
            </TableCell>
          </TableRow>
        ) : (
          resources.map((resource) => (
            <TableRow
              key={resource.id}
              className="cursor-pointer hover:bg-muted/50"
              onClick={() => onOpen(resource)}
            >
              <TableCell onClick={(e) => e.stopPropagation()}>
                <Checkbox
                  checked={selectedIds.has(resource.id)}
                  onCheckedChange={(checked) => onSelect(resource.id, !!checked)}
                />
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-3">
                  {getFileIcon(resource.mime_type, resource.type)}
                  <span className="font-medium truncate max-w-md">
                    {resource.name}
                  </span>
                </div>
              </TableCell>
              <TableCell className="text-muted-foreground">
                {resource.created_by_name || '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {resource.type === 'file' ? formatFileSize(resource.size_bytes) : '—'}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {formatDate(resource.created_at)}
              </TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onDownload(resource)}>
                      Tải xuống
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onTrash(resource)}
                    >
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
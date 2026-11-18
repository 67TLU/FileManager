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
  MoreVertical,
  RotateCcw,
  Trash2,
} from 'lucide-react';
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
import { formatFileSize } from '@/lib/utils';
import type { Resource } from '../api/resources.api';

interface TrashTableProps {
  resources: Resource[];
  selectedIds: Set<string>;
  onSelect: (id: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onRestore: (resource: Resource) => void;
  onPermanentDelete: (resource: Resource) => void;
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

/**
 * Tính số ngày còn lại trước khi file bị xóa vĩnh viễn
 * (Retention policy: 30 ngày theo system_settings)
 */
function getDaysRemaining(trashedAt: string | null): number {
  if (!trashedAt) return 0;
  const trashedDate = new Date(trashedAt);
  const expiryDate = new Date(trashedDate.getTime() + 30 * 24 * 60 * 60 * 1000);
  const now = new Date();
  const diffMs = expiryDate.getTime() - now.getTime();
  return Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
}

export function TrashTable({
  resources,
  selectedIds,
  onSelect,
  onSelectAll,
  onRestore,
  onPermanentDelete,
}: TrashTableProps) {
  const allSelected = resources.length > 0 && selectedIds.size === resources.length;

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
          <TableHead className="w-40">Thư mục gốc</TableHead>
          <TableHead className="w-24">Kích thước</TableHead>
          <TableHead className="w-32">Ngày xóa</TableHead>
          <TableHead className="w-32">Còn lại</TableHead>
          <TableHead className="w-12"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {resources.length === 0 ? (
          <TableRow>
            <TableCell colSpan={7} className="text-center py-12">
              <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Trash2 className="h-12 w-12" />
                <p>Thùng rác trống</p>
                <p className="text-xs">File đã xóa sẽ tự động bị xóa vĩnh viễn sau 30 ngày</p>
              </div>
            </TableCell>
          </TableRow>
        ) : (
          resources.map((resource) => {
            const daysLeft = getDaysRemaining(resource.trashed_at);
            const isExpiringSoon = daysLeft <= 7;

            return (
              <TableRow key={resource.id} className="hover:bg-muted/50">
                <TableCell>
                  <Checkbox
                    checked={selectedIds.has(resource.id)}
                    onCheckedChange={(checked) => onSelect(resource.id, !!checked)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    {getFileIcon(resource.mime_type, resource.type)}
                    <div className="min-w-0">
                      <div className="font-medium truncate max-w-md">{resource.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {resource.type === 'file' ? resource.mime_type : resource.type}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {(resource as any).folder_name || '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {resource.type === 'file' ? formatFileSize(resource.size_bytes) : '—'}
                </TableCell>
                <TableCell className="text-muted-foreground text-sm">
                  {resource.trashed_at
                    ? new Date(resource.trashed_at).toLocaleDateString('vi-VN')
                    : '—'}
                </TableCell>
                <TableCell>
                  <span
                    className={`text-sm font-medium ${
                      isExpiringSoon ? 'text-destructive' : 'text-muted-foreground'
                    }`}
                  >
                    {daysLeft} ngày
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onRestore(resource)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Khôi phục
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onPermanentDelete(resource)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Xóa vĩnh viễn
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}
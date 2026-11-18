import { File, FileText, Image, Film, FileSpreadsheet, Presentation, FileCode, Link as LinkIcon, StickyNote } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { cn, formatFileSize, formatDate } from '@/lib/utils';
import type { Resource } from '../api/resources.api';

interface ResourceCardProps {
  resource: Resource;
  selected: boolean;
  onSelect: (selected: boolean) => void;
  onOpen: () => void;
  onContextMenu: (e: React.MouseEvent) => void;
}

function getFileIcon(mimeType: string | null, type: string) {
  if (type === 'link') return <LinkIcon className="h-8 w-8 text-blue-500" />;
  if (type === 'note') return <StickyNote className="h-8 w-8 text-yellow-500" />;
  if (!mimeType) return <File className="h-8 w-8 text-gray-500" />;

  if (mimeType.startsWith('image/')) return <Image className="h-8 w-8 text-green-500" />;
  if (mimeType.startsWith('video/')) return <Film className="h-8 w-8 text-purple-500" />;
  if (mimeType.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel'))
    return <FileSpreadsheet className="h-8 w-8 text-green-600" />;
  if (mimeType.includes('presentation') || mimeType.includes('powerpoint'))
    return <Presentation className="h-8 w-8 text-orange-500" />;
  if (mimeType.includes('json') || mimeType.includes('javascript') || mimeType.includes('code'))
    return <FileCode className="h-8 w-8 text-cyan-500" />;
  if (mimeType.includes('word') || mimeType.includes('document'))
    return <FileText className="h-8 w-8 text-blue-600" />;

  return <File className="h-8 w-8 text-gray-500" />;
}

export function ResourceCard({
  resource,
  selected,
  onSelect,
  onOpen,
  onContextMenu,
}: ResourceCardProps) {
  return (
    <Card
      className={cn(
        'group relative p-4 cursor-pointer transition-all hover:shadow-md',
        selected && 'ring-2 ring-primary'
      )}
      onClick={onOpen}
      onContextMenu={onContextMenu}
    >
      {/* Checkbox */}
      <div
        className="absolute left-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => e.stopPropagation()}
      >
        <Checkbox
          checked={selected}
          onCheckedChange={onSelect}
        />
      </div>

      {/* Icon */}
      <div className="flex items-center justify-center h-24 mb-3 bg-muted/50 rounded-lg">
        {getFileIcon(resource.mime_type, resource.type)}
      </div>

      {/* Info */}
      <div className="space-y-1">
        <h3 className="font-medium text-sm truncate" title={resource.name}>
          {resource.name}
        </h3>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{formatFileSize(resource.size_bytes)}</span>
          <span>{formatDate(resource.created_at).split(',')[0]}</span>
        </div>
      </div>
    </Card>
  );
}
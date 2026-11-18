import { ChevronRight, ChevronDown, Folder, FolderOpen } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useFolderTree } from '../hooks/use-folder-tree';
import type { FolderNode } from '../api/resources.api';

interface FolderTreeProps {
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
}

export function FolderTree({ selectedFolderId, onSelectFolder }: FolderTreeProps) {
  const { data, isLoading, error } = useFolderTree();

  if (isLoading) {
    return (
      <div className="space-y-2 p-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-8 w-1/2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive">
        Không thể tải cây thư mục
      </div>
    );
  }

  if (!data?.tree.length) {
    return (
      <div className="p-4 text-sm text-muted-foreground">
        Chưa có thư mục nào
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="py-2">
        {data.tree.map((node) => (
          <FolderTreeItem
            key={node.id}
            node={node}
            level={0}
            selectedFolderId={selectedFolderId}
            onSelectFolder={onSelectFolder}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

interface FolderTreeItemProps {
  node: FolderNode;
  level: number;
  selectedFolderId: string | null;
  onSelectFolder: (folderId: string) => void;
}

function FolderTreeItem({
  node,
  level,
  selectedFolderId,
  onSelectFolder,
}: FolderTreeItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedFolderId === node.id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent',
          isSelected && 'bg-accent font-medium'
        )}
        style={{ paddingLeft: `${level * 16 + 8}px` }}
        onClick={() => onSelectFolder(node.id)}
      >
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(!isOpen);
              }}
            >
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        ) : (
          <div className="w-5" />
        )}

        {isOpen ? (
          <FolderOpen className="h-4 w-4 text-amber-500 shrink-0" />
        ) : (
          <Folder className="h-4 w-4 text-amber-500 shrink-0" />
        )}

        <span className="truncate flex-1">{node.name}</span>
      </div>

      {hasChildren && (
        <CollapsibleContent>
          {node.children.map((child) => (
            <FolderTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedFolderId={selectedFolderId}
              onSelectFolder={onSelectFolder}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
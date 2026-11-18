import { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  Users,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import type { DepartmentTreeNode } from '../api/departments.api';

interface DepartmentTreeProps {
  tree: DepartmentTreeNode[];
  selectedId: string | null;
  onSelect: (department: DepartmentTreeNode) => void;
  onEdit: (department: DepartmentTreeNode) => void;
  onDelete: (department: DepartmentTreeNode) => void;
  onManageMembers: (department: DepartmentTreeNode) => void;
}

export function DepartmentTree({
  tree,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onManageMembers,
}: DepartmentTreeProps) {
  if (tree.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <Building2 className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Chưa có phòng ban nào</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {tree.map((node) => (
        <DepartmentTreeItem
          key={node.id}
          node={node}
          level={0}
          selectedId={selectedId}
          onSelect={onSelect}
          onEdit={onEdit}
          onDelete={onDelete}
          onManageMembers={onManageMembers}
        />
      ))}
    </div>
  );
}

interface DepartmentTreeItemProps {
  node: DepartmentTreeNode;
  level: number;
  selectedId: string | null;
  onSelect: (department: DepartmentTreeNode) => void;
  onEdit: (department: DepartmentTreeNode) => void;
  onDelete: (department: DepartmentTreeNode) => void;
  onManageMembers: (department: DepartmentTreeNode) => void;
}

function DepartmentTreeItem({
  node,
  level,
  selectedId,
  onSelect,
  onEdit,
  onDelete,
  onManageMembers,
}: DepartmentTreeItemProps) {
  const [isOpen, setIsOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const isSelected = selectedId === node.id;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          'flex items-center gap-2 rounded-md px-2 py-2 text-sm cursor-pointer hover:bg-accent group',
          isSelected && 'bg-accent font-medium'
        )}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => onSelect(node)}
      >
        {/* Expand/Collapse button */}
        {hasChildren ? (
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0 shrink-0"
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
          <div className="w-5 shrink-0" />
        )}

        {/* Icon */}
        <Building2 className="h-4 w-4 text-blue-500 shrink-0" />

        {/* Name */}
        <span className="truncate flex-1">{node.name}</span>

        {/* Member count */}
        <span className="text-xs text-muted-foreground shrink-0 flex items-center gap-1">
          <Users className="h-3 w-3" />
          {node.member_count}
        </span>

        {/* Actions menu */}
        <div
          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6">
                <MoreVertical className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onManageMembers(node)}>
                Quản lý thành viên
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onEdit(node)}>
                Chỉnh sửa
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => onDelete(node)}
              >
                Xóa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Children */}
      {hasChildren && (
        <CollapsibleContent>
          {node.children.map((child) => (
            <DepartmentTreeItem
              key={child.id}
              node={child}
              level={level + 1}
              selectedId={selectedId}
              onSelect={onSelect}
              onEdit={onEdit}
              onDelete={onDelete}
              onManageMembers={onManageMembers}
            />
          ))}
        </CollapsibleContent>
      )}
    </Collapsible>
  );
}
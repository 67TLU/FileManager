import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import type { FolderNode } from '../api/resources.api';

interface ResourcesBreadcrumbProps {
  path: FolderNode[];
  onNavigate: (folderId: string | null) => void;
}

export function ResourcesBreadcrumb({ path, onNavigate }: ResourcesBreadcrumbProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            className="cursor-pointer flex items-center gap-1"
            onClick={() => onNavigate(null)}
          >
            <Home className="h-3.5 w-3.5" />
            <span>Tất cả</span>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {path.map((folder, index) => {
          const isLast = index === path.length - 1;
          return (
            <BreadcrumbItem key={folder.id}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{folder.name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink
                  className="cursor-pointer"
                  onClick={() => onNavigate(folder.id)}
                >
                  {folder.name}
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
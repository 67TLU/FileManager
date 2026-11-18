import { useQuery } from '@tanstack/react-query';
import { foldersApi, type FolderNode } from '../api/resources.api';

// Company workspace ID (trong seed data)
const COMPANY_WORKSPACE_ID = 'd0000000-0000-4000-8000-000000000001';

export function useFolderTree() {
  return useQuery({
    queryKey: ['folder-tree', COMPANY_WORKSPACE_ID],
    queryFn: () => foldersApi.getTree(COMPANY_WORKSPACE_ID),
    staleTime: 60 * 1000, // 1 phút
  });
}

/**
 * Helper: Tìm folder theo ID trong tree
 */
export function findFolderInTree(
  tree: FolderNode[],
  folderId: string
): FolderNode | null {
  for (const node of tree) {
    if (node.id === folderId) return node;
    const found = findFolderInTree(node.children, folderId);
    if (found) return found;
  }
  return null;
}

/**
 * Helper: Lấy đường dẫn từ root đến folder (cho breadcrumb)
 */
export function getFolderPath(
  tree: FolderNode[],
  folderId: string
): FolderNode[] {
  const path: FolderNode[] = [];

  function search(nodes: FolderNode[], target: string, currentPath: FolderNode[]): boolean {
    for (const node of nodes) {
      const newPath = [...currentPath, node];
      if (node.id === target) {
        path.push(...newPath);
        return true;
      }
      if (search(node.children, target, newPath)) {
        return true;
      }
    }
    return false;
  }

  search(tree, folderId, []);
  return path;
}
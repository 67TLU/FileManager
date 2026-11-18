import { LayoutGrid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DepartmentViewToggleProps {
  view: 'tree' | 'list';
  onViewChange: (view: 'tree' | 'list') => void;
}

export function DepartmentViewToggle({
  view,
  onViewChange,
}: DepartmentViewToggleProps) {
  return (
    <div className="flex border rounded-md">
      <Button
        variant={view === 'tree' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9 rounded-r-none"
        onClick={() => onViewChange('tree')}
      >
        <LayoutGrid className="h-4 w-4" />
      </Button>
      <Button
        variant={view === 'list' ? 'secondary' : 'ghost'}
        size="icon"
        className="h-9 w-9 rounded-l-none"
        onClick={() => onViewChange('list')}
      >
        <List className="h-4 w-4" />
      </Button>
    </div>
  );
}
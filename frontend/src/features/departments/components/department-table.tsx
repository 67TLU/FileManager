import {
  MoreVertical,
  Edit,
  Trash2,
  Users,
  Eye,
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDate } from '@/lib/utils';
import type { Department } from '../api/departments.api';

interface DepartmentTableProps {
  departments: Department[];
  onView: (department: Department) => void;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onManageMembers: (department: Department) => void;
}

export function DepartmentTable({
  departments,
  onView,
  onEdit,
  onDelete,
  onManageMembers,
}: DepartmentTableProps) {
  if (departments.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Không tìm thấy phòng ban nào</p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Tên phòng ban</TableHead>
          <TableHead>Mã</TableHead>
          <TableHead>Quản lý</TableHead>
          <TableHead className="text-center">Thành viên</TableHead>
          <TableHead>Ngày tạo</TableHead>
          <TableHead className="w-[50px]"></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((dept) => (
          <TableRow key={dept.id}>
            <TableCell>
              <div className="font-medium">{dept.name}</div>
              {dept.parent_id && (
                <div className="text-xs text-muted-foreground">
                  Có phòng ban cha
                </div>
              )}
            </TableCell>
            <TableCell>
              <Badge variant="outline">{dept.code}</Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {dept.manager_name || '—'}
            </TableCell>
            <TableCell className="text-center">
              <Badge variant="secondary" className="flex items-center gap-1 w-fit mx-auto">
                <Users className="h-3 w-3" />
                {dept.member_count}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground text-sm">
              {formatDate(dept.created_at).split(',')[0]}
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onView(dept)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Xem chi tiết
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onManageMembers(dept)}>
                    <Users className="mr-2 h-4 w-4" />
                    Quản lý thành viên
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onEdit(dept)}>
                    <Edit className="mr-2 h-4 w-4" />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive"
                    onClick={() => onDelete(dept)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
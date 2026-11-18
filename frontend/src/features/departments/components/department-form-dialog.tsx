import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  useCreateDepartment,
  useUpdateDepartment,
  useDepartments,
} from '../hooks/use-departments';
import type { Department } from '../api/departments.api';

// ============================================================
// SCHEMAS
// ============================================================
const createSchema = z.object({
  code: z
    .string()
    .min(2, 'Mã ít nhất 2 ký tự')
    .max(20, 'Mã tối đa 20 ký tự')
    .regex(/^[A-Z0-9_]+$/, 'Mã chỉ chứa chữ hoa, số và dấu _'),
  name: z.string().min(1, 'Tên không được để trống').max(100),
  parentId: z.string().optional().nullable(),
  managerUserId: z.string().optional().nullable(),
});

const editSchema = z.object({
  name: z.string().min(1, 'Tên không được để trống').max(100),
  managerUserId: z.string().optional().nullable(),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

// ============================================================
// CREATE DIALOG
// ============================================================
interface CreateDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId?: string | null;
}

export function CreateDepartmentDialog({
  open,
  onOpenChange,
  parentId,
}: CreateDepartmentDialogProps) {
  const createMutation = useCreateDepartment();
  const { data: departments = [] } = useDepartments();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      code: '',
      name: '',
      parentId: parentId || null,
      managerUserId: null,
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: CreateFormValues) => {
    try {
      await createMutation.mutateAsync({
        code: data.code,
        name: data.name,
        parentId: data.parentId || null,
        managerUserId: data.managerUserId || null,
      });
      onOpenChange(false);
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo phòng ban mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo phòng ban mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mã phòng ban *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: IT, HR, SALES" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên phòng ban *</FormLabel>
                    <FormControl>
                      <Input placeholder="VD: Phòng IT" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phòng ban cha</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === '' ? null : value)}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Không có (phòng ban gốc)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Không có</SelectItem>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo phòng ban'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// EDIT DIALOG
// ============================================================
interface EditDepartmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department: Department | null;
}

export function EditDepartmentDialog({
  open,
  onOpenChange,
  department,
}: EditDepartmentDialogProps) {
  const updateMutation = useUpdateDepartment();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      name: '',
      managerUserId: null,
    },
  });

  useEffect(() => {
    if (department && open) {
      form.reset({
        name: department.name,
        managerUserId: department.manager_user_id,
      });
    }
  }, [department, open, form]);

  const onSubmit = async (data: EditFormValues) => {
    if (!department) return;
    try {
      await updateMutation.mutateAsync({
        departmentId: department.id,
        data: {
          name: data.name,
          managerUserId: data.managerUserId || null,
        },
      });
      onOpenChange(false);
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh sửa phòng ban</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho {department?.name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên phòng ban</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={updateMutation.isPending}>
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu thay đổi'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
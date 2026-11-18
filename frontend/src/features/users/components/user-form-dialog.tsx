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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  useCreateUser,
  useUpdateUser,
  useDepartments,
  usePositions,
  useRoles,
} from '../hooks/use-users';
import type { User } from '../api/users.api';

// ============================================================
// SCHEMAS
// ============================================================
const createSchema = z.object({
  email: z.string().email('Email không hợp lệ'),
  password: z.string().min(6, 'Mật khẩu ít nhất 6 ký tự'),
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  positionId: z.string().optional(),
  departmentIds: z.array(z.string()).optional(),
  roleIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 vai trò'),
});

const editSchema = z.object({
  fullName: z.string().min(1, 'Họ tên không được để trống'),
  positionId: z.string().optional().nullable(),
  status: z.enum(['active', 'suspended', 'disabled']),
});

type CreateFormValues = z.infer<typeof createSchema>;
type EditFormValues = z.infer<typeof editSchema>;

// ============================================================
// CREATE DIALOG
// ============================================================
interface CreateUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateUserDialog({ open, onOpenChange }: CreateUserDialogProps) {
  const createUserMutation = useCreateUser();
  const { data: departments = [] } = useDepartments();
  const { data: positions = [] } = usePositions();
  const { data: roles = [] } = useRoles();

  const form = useForm<CreateFormValues>({
    resolver: zodResolver(createSchema),
    defaultValues: {
      email: '',
      password: '',
      fullName: '',
      positionId: '',
      departmentIds: [],
      roleIds: [],
    },
  });

  useEffect(() => {
    if (!open) {
      form.reset();
    }
  }, [open, form]);

  const onSubmit = async (data: CreateFormValues) => {
    try {
      await createUserMutation.mutateAsync({
        email: data.email,
        password: data.password,
        fullName: data.fullName,
        positionId: data.positionId || undefined,
        departmentIds: data.departmentIds,
        roleIds: data.roleIds,
      });
      onOpenChange(false);
    } catch {
      // Error handled in mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Tạo tài khoản mới</DialogTitle>
          <DialogDescription>
            Điền thông tin để tạo tài khoản nhân viên mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 -mx-6 px-6">
              <div className="space-y-4 py-2">
                {/* Thông tin cơ bản */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="fullName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Họ và tên *</FormLabel>
                        <FormControl>
                          <Input placeholder="Nguyễn Văn A" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="name@company.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mật khẩu *</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="Tối thiểu 6 ký tự" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator />

                {/* Thông tin tổ chức */}
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="positionId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Chức vụ</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value || ''}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Chọn chức vụ" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {positions.map((p) => (
                              <SelectItem key={p.id} value={p.id}>
                                {p.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Phòng ban */}
                <div>
                  <FormLabel className="mb-2 block">Phòng ban</FormLabel>
                  <div className="border rounded-md p-3 max-h-40 overflow-y-auto space-y-2">
                    {departments.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Chưa có phòng ban</p>
                    ) : (
                      departments.map((dept) => (
                        <div key={dept.id} className="flex items-center space-x-2">
                          <Checkbox
                            id={`dept-${dept.id}`}
                            checked={form.watch('departmentIds')?.includes(dept.id)}
                            onCheckedChange={(checked) => {
                              const current = form.getValues('departmentIds') || [];
                              if (checked) {
                                form.setValue('departmentIds', [...current, dept.id]);
                              } else {
                                form.setValue(
                                  'departmentIds',
                                  current.filter((id) => id !== dept.id)
                                );
                              }
                            }}
                          />
                          <label
                            htmlFor={`dept-${dept.id}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {dept.name}
                          </label>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Roles */}
                <div>
                  <FormLabel className="mb-2 block">Vai trò *</FormLabel>
                  <div className="border rounded-md p-3 space-y-2">
                    {roles.map((role) => (
                      <div key={role.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`role-${role.id}`}
                          checked={form.watch('roleIds')?.includes(role.id)}
                          onCheckedChange={(checked) => {
                            const current = form.getValues('roleIds') || [];
                            if (checked) {
                              form.setValue('roleIds', [...current, role.id]);
                            } else {
                              form.setValue(
                                'roleIds',
                                current.filter((id) => id !== role.id)
                              );
                            }
                          }}
                        />
                        <label
                          htmlFor={`role-${role.id}`}
                          className="text-sm font-medium leading-none cursor-pointer"
                        >
                          {role.name}
                        </label>
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.roleIds && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.roleIds.message}
                    </p>
                  )}
                </div>
              </div>
            </ScrollArea>

            <DialogFooter className="pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Hủy
              </Button>
              <Button type="submit" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo tài khoản'
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
interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
}

export function EditUserDialog({ open, onOpenChange, user }: EditUserDialogProps) {
  const updateUserMutation = useUpdateUser();
  const { data: positions = [] } = usePositions();

  const form = useForm<EditFormValues>({
    resolver: zodResolver(editSchema),
    defaultValues: {
      fullName: '',
      positionId: null,
      status: 'active',
    },
  });

  useEffect(() => {
    if (user && open) {
      form.reset({
        fullName: user.full_name,
        positionId: null, // Cần fetch detail để có position_id
        status: user.status === 'invited' ? 'active' : user.status,
      });
    }
  }, [user, open, form]);

  const onSubmit = async (data: EditFormValues) => {
    if (!user) return;
    try {
      await updateUserMutation.mutateAsync({
        userId: user.id,
        data: {
          fullName: data.fullName,
          positionId: data.positionId,
          status: data.status,
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
          <DialogTitle>Chỉnh sửa thông tin</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho {user?.full_name}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Họ và tên</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="positionId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chức vụ</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange(value === '' ? null : value)}
                    value={field.value || ''}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn chức vụ" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">Không có</SelectItem>
                      {positions.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Trạng thái</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Hoạt động</SelectItem>
                      <SelectItem value="suspended">Tạm khóa</SelectItem>
                      <SelectItem value="disabled">Vô hiệu hóa</SelectItem>
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
              <Button type="submit" disabled={updateUserMutation.isPending}>
                {updateUserMutation.isPending ? (
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
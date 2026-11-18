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
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserDetail, useRoles, useUpdateUser } from '../hooks/use-users';
import type { User } from '../api/users.api';
import { toast } from 'sonner';

const schema = z.object({
  roleIds: z.array(z.string()).min(1, 'Phải chọn ít nhất 1 vai trò'),
});

type FormValues = z.infer<typeof schema>;

interface AssignRolesDialogProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AssignRolesDialog({ user, open, onOpenChange }: AssignRolesDialogProps) {
  const { data: detail, isLoading: isLoadingDetail } = useUserDetail(user?.id || null);
  const { data: roles = [], isLoading: isLoadingRoles } = useRoles();
  const updateUserMutation = useUpdateUser();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { roleIds: [] },
  });

  useEffect(() => {
    if (detail && open) {
      form.reset({
        roleIds: detail.roles.map((r) => r.id),
      });
    }
  }, [detail, open, form]);

  const onSubmit = async (data: FormValues) => {
    if (!user) return;
    try {
      await apiClient.put(`/users/${user.id}/roles`, { roleIds: data.roleIds });
      toast.success('Cập nhật vai trò thành công');
      onOpenChange(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Không thể cập nhật vai trò');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Phân quyền</DialogTitle>
          <DialogDescription>
            Gán vai trò cho {user?.full_name}
          </DialogDescription>
        </DialogHeader>

        {isLoadingDetail || isLoadingRoles ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <ScrollArea className="h-64 border rounded-md p-4">
              <div className="space-y-3">
                {roles.map((role) => (
                  <div key={role.id} className="flex items-start space-x-3">
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
                    <div className="flex-1">
                      <label
                        htmlFor={`role-${role.id}`}
                        className="text-sm font-medium leading-none cursor-pointer"
                      >
                        {role.name}
                      </label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {role.key}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {form.formState.errors.roleIds && (
              <p className="text-sm text-destructive">
                {form.formState.errors.roleIds.message}
              </p>
            )}

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
                  'Lưu vai trò'
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
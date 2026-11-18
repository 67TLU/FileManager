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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useCreateFolder } from '../hooks/use-resources';

const COMPANY_WORKSPACE_ID = 'd0000000-0000-4000-8000-000000000001';

const formSchema = z.object({
  name: z
    .string()
    .min(1, 'Tên thư mục không được để trống')
    .max(255, 'Tên tối đa 255 ký tự')
    .regex(/^[^/\\]+$/, 'Tên không được chứa / hoặc \\'),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateFolderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  parentId: string | null;
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  parentId,
}: CreateFolderDialogProps) {
  const createFolderMutation = useCreateFolder();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { name: '' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      await createFolderMutation.mutateAsync({
        workspaceId: COMPANY_WORKSPACE_ID,
        parentId,
        name: data.name.trim(),
      });
      form.reset();
      onOpenChange(false);
    } catch {
      // Error đã được xử lý trong mutation
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tạo thư mục mới</DialogTitle>
          <DialogDescription>
            Nhập tên cho thư mục mới
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tên thư mục</FormLabel>
                  <FormControl>
                    <Input placeholder="Ví dụ: Tài liệu dự án" autoFocus {...field} />
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
              <Button type="submit" disabled={createFolderMutation.isPending}>
                {createFolderMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Đang tạo...
                  </>
                ) : (
                  'Tạo thư mục'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
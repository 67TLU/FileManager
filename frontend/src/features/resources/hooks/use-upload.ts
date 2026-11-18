import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { resourcesApi } from '../api/resources.api';

interface UploadFile {
  file: File;
  progress: number;
  status: 'pending' | 'uploading' | 'success' | 'error';
  error?: string;
}

export function useUpload(folderId: string) {
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<UploadFile[]>([]);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      await resourcesApi.upload(file, folderId);
    },
    onMutate: (file) => {
      setFiles((prev) => [
        ...prev,
        { file, progress: 0, status: 'uploading' },
      ]);
    },
    onSuccess: (_, file) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file ? { ...f, progress: 100, status: 'success' } : f
        )
      );
    },
    onError: (error: any, file) => {
      setFiles((prev) =>
        prev.map((f) =>
          f.file === file
            ? {
                ...f,
                status: 'error',
                error: error.response?.data?.error?.message || 'Upload thất bại',
              }
            : f
        )
      );
    },
  });

  const addFiles = (newFiles: FileList | File[]) => {
    const fileArray = Array.from(newFiles);
    
    // Validate kích thước (100MB)
    const maxSize = 100 * 1024 * 1024;
    const validFiles = fileArray.filter((file) => {
      if (file.size > maxSize) {
        toast.error(`${file.name} quá lớn (tối đa 100MB)`);
        return false;
      }
      if (file.size === 0) {
        toast.error(`${file.name} là file rỗng`);
        return false;
      }
      return true;
    });

    // Upload từng file
    validFiles.forEach((file) => {
      uploadMutation.mutate(file);
    });
  };

  const clearCompleted = () => {
    setFiles((prev) => prev.filter((f) => f.status !== 'success'));
  };

  const reset = () => {
    setFiles([]);
  };

  // Invalidate resources list khi có file upload thành công
  const hasSuccess = files.some((f) => f.status === 'success');
  if (hasSuccess) {
    queryClient.invalidateQueries({ queryKey: ['resources'] });
  }

  return {
    files,
    addFiles,
    clearCompleted,
    reset,
    isUploading: files.some((f) => f.status === 'uploading'),
  };
}
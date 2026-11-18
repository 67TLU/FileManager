import { useState } from 'react';
import { Upload, FolderPlus, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadDialog } from '@/features/resources/components/upload-dialog';
import { CreateFolderDialog } from '@/features/resources/components/create-folder-dialog';

const COMPANY_WORKSPACE_ID = 'd0000000-0000-4000-8000-000000000001';
const DEFAULT_FOLDER_ID = 'f0000000-0000-4000-8000-000000000001'; // Root folder

export function QuickActions() {
  const [uploadOpen, setUploadOpen] = useState(false);
  const [createFolderOpen, setCreateFolderOpen] = useState(false);

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Thao tác nhanh
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => setUploadOpen(true)}
          >
            <Upload className="h-4 w-4 mr-2" />
            Tải lên tài nguyên
          </Button>
          <Button
            className="w-full justify-start"
            variant="outline"
            onClick={() => setCreateFolderOpen(true)}
          >
            <FolderPlus className="h-4 w-4 mr-2" />
            Tạo thư mục mới
          </Button>
        </CardContent>
      </Card>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        folderId={DEFAULT_FOLDER_ID}
      />

      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        parentId={DEFAULT_FOLDER_ID}
      />
    </>
  );
}
// src/shared/storage/storage.interface.ts

export interface StorageFile {
  key: string;           // Định danh duy nhất (ví dụ: "resources/2026/11/abc123.pdf")
  originalName: string;  // Tên gốc do user upload
  mimeType: string;
  size: number;          // bytes
  checksum?: string;     // SHA-256
  metadata: Record<string, string> | undefined;
}

export interface UploadOptions {
  folder?: string;       // Thư mục logic trong storage
  metadata?: Record<string, string>;
}

export interface StorageDriver {
  /** Upload file từ buffer/stream */
  upload(key: string, data: Buffer | NodeJS.ReadableStream, options?: UploadOptions): Promise<StorageFile>;

  /** Download file về buffer */
  download(key: string): Promise<Buffer>;

  /** Tạo stream để đọc file (dùng cho res.pipe) */
  getStream(key: string): Promise<NodeJS.ReadableStream>;

  /** Xóa file */
  delete(key: string): Promise<void>;

  /** Xóa nhiều file */
  deleteMany(keys: string[]): Promise<void>;

  /** Kiểm tra file tồn tại */
  exists(key: string): Promise<boolean>;

  /** Lấy thông tin file */
  getMetadata(key: string): Promise<StorageFile>;

  /** Tạo URL download (presigned URL với S3, hoặc URL trực tiếp với local) */
  getDownloadUrl(key: string, expiresInSeconds?: number): Promise<string>;

  /** Copy file */
  copy(sourceKey: string, destKey: string): Promise<void>;

  /** Move file */
  move(sourceKey: string, destKey: string): Promise<void>;
}
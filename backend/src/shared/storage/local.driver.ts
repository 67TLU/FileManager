// src/shared/storage/local.driver.ts

import fs from 'fs/promises';
import fsSync from 'fs';
import path from 'path';
import { Readable } from 'stream';
import crypto from 'crypto';
import type { StorageDriver, StorageFile, UploadOptions } from './storage.interface.js';

export class LocalDriver implements StorageDriver {
  private readonly basePath: string;
  private readonly publicBaseUrl: string;

  constructor(basePath: string, publicBaseUrl: string = '/files') {
    this.basePath = path.resolve(basePath);
    this.publicBaseUrl = publicBaseUrl;
    // Đảm bảo thư mục tồn tại
    fsSync.mkdirSync(this.basePath, { recursive: true });
  }

  private getFullPath(key: string): string {
    // Chống path traversal attack
    const normalized = path.normalize(key);
    // Kiểm tra tên file chỉ chứa ký tự hợp lệ (không chứa ../, \\, //)
    if (/[.][.][/|\\]|^\.\.[\\/]/.test(normalized)) {
      throw new Error('Invalid key: path traversal detected');
    }
    const fullPath = path.join(this.basePath, normalized);
    if (!fullPath.startsWith(this.basePath)) {
      throw new Error('Invalid key: path traversal detected');
    }
    return fullPath;
  }

  async upload(
    key: string,
    data: Buffer | NodeJS.ReadableStream,
    options: UploadOptions = {}
  ): Promise<StorageFile> {
    const fullPath = this.getFullPath(key);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });

    const buffer = Buffer.isBuffer(data)
      ? data
      : await this.streamToBuffer(data);

    await fs.writeFile(fullPath, buffer);

    const checksum = crypto.createHash('sha256').update(buffer).digest('hex');
    const stat = await fs.stat(fullPath);

    return {
      key,
      originalName: path.basename(key),
      mimeType: options.metadata?.mimeType || 'application/octet-stream',
      size: stat.size,
      checksum,
      metadata: options.metadata,
    };
  }

  async download(key: string): Promise<Buffer> {
    const fullPath = this.getFullPath(key);
    return await fs.readFile(fullPath);
  }

  async getStream(key: string): Promise<NodeJS.ReadableStream> {
    const fullPath = this.getFullPath(key);
    return fsSync.createReadStream(fullPath);
  }

  async delete(key: string): Promise<void> {
    const fullPath = this.getFullPath(key);
    try {
      await fs.unlink(fullPath);
    } catch (err) {
      if ((err as NodeJS.ErrnoException).code !== 'ENOENT') throw err;
    }
  }

  async deleteMany(keys: string[]): Promise<void> {
    await Promise.all(keys.map((k) => this.delete(k)));
  }

  async exists(key: string): Promise<boolean> {
    const fullPath = this.getFullPath(key);
    try {
      await fs.access(fullPath);
      return true;
    } catch {
      return false;
    }
  }

  async getMetadata(key: string): Promise<StorageFile> {
    const fullPath = this.getFullPath(key);
    const stat = await fs.stat(fullPath);
    return {
      key,
      originalName: path.basename(key),
      mimeType: 'application/octet-stream',
      size: stat.size,
      metadata: undefined,
    };
  }

  async getDownloadUrl(key: string): Promise<string> {
    // Với local: trả về URL qua Express static middleware
    return `${this.publicBaseUrl}/${key}`;
  }

  async copy(sourceKey: string, destKey: string): Promise<void> {
    const src = this.getFullPath(sourceKey);
    const dest = this.getFullPath(destKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.copyFile(src, dest);
  }

  async move(sourceKey: string, destKey: string): Promise<void> {
    const src = this.getFullPath(sourceKey);
    const dest = this.getFullPath(destKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.rename(src, dest);
  }

  private streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', reject);
    });
  }
}
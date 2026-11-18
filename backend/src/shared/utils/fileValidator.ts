import { fileTypeFromBuffer } from 'file-type';
import path from 'path';
import { AppError } from '../middlewares/error.middleware.js';

const BINARY_WHITELIST = new Set([
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'application/zip',
]);
const TEXT_EXT: Record<string, string> = {
  '.json': 'application/json', '.txt': 'text/plain',
  '.csv': 'text/csv', '.md': 'text/markdown',
};
const BLOCKED_EXT = new Set(['.exe', '.bat', '.cmd', '.sh', '.msi', '.dll', '.scr', '.com']);

export async function validateFile(file: Express.Multer.File) {
  if (file.size === 0) throw new AppError(400, 'File rỗng');
  if (file.size > 100 * 1024 * 1024) throw new AppError(413, 'File quá lớn (tối đa 100MB)');

  const ext = path.extname(file.originalname).toLowerCase();
  if (BLOCKED_EXT.has(ext)) throw new AppError(400, `Định dạng bị chặn: ${ext}`);

  const detected = await fileTypeFromBuffer(file.buffer);

  if (!detected) {
    // File text: chỉ chấp nhận nếu extension nằm trong whitelist text
    if (TEXT_EXT[ext]) return { mime: TEXT_EXT[ext], ext: ext.slice(1) };
    throw new AppError(400, 'Không xác định được loại file hoặc loại file không được phép');
  }
  if (BLOCKED_EXT.has(`.${detected.ext}`)) throw new AppError(400, 'File thực thi bị chặn');
  if (!BINARY_WHITELIST.has(detected.mime)) {
    throw new AppError(400, `Loại file không được phép: ${detected.mime}`);
  }
  return detected;
}
import { db } from '../../config/database.js';
import { AppError } from '../../shared/middlewares/error.middleware.js';

const UPDATABLE_KEYS = new Set([
  'upload.max_file_size_bytes',
  'upload.allowed_extensions',
  'upload.blocked_extensions',
  'quota.default_user_bytes',
  'quota.default_department_bytes',
  'trash.retention_days',
  'auth.max_failed_logins',
  'auth.lockout_minutes',
  'auth.refresh_token_ttl_days',
  'sharing.max_link_expiry_days',
]);

const PUBLIC_KEYS = new Set([
  'upload.max_file_size_bytes',
  'upload.allowed_extensions',
  'upload.blocked_extensions',
]);

export class SettingsService {
  async getAllSettings() {
    const settings = await db.selectFrom('system_settings' as any)
      .select(['key', 'value', 'description', 'updated_at'] as any)
      .orderBy('key')
      .execute() as any[];

    const result: Record<string, any> = {};
    for (const s of settings) {
      result[s.key] = {
        value: s.value,
        description: s.description,
        updatedAt: s.updated_at,
      };
    }
    return result;
  }

  async getPublicSettings() {
    const settings = await db.selectFrom('system_settings' as any)
      .select(['key', 'value'] as any)
      .execute() as any[];

    const result: Record<string, any> = {};
    for (const s of settings) {
      if (PUBLIC_KEYS.has(s.key)) {
        result[s.key] = s.value;
      }
    }
    return result;
  }

  async getSettingByKey(key: string) {
    const setting = await db.selectFrom('system_settings' as any)
      .select(['key', 'value', 'description', 'updated_at'] as any)
      .where('key', '=', key)
      .executeTakeFirst() as any;

    if (!setting) throw new AppError(404, 'Setting không tồn tại');
    return setting;
  }

  async updateSettings(settings: Record<string, any>, updatedBy: string) {
    const invalidKeys = Object.keys(settings).filter((k) => !UPDATABLE_KEYS.has(k));
    if (invalidKeys.length > 0) {
      throw new AppError(400, `Các key không hợp lệ: ${invalidKeys.join(', ')}`);
    }

    this.validateSettingsValues(settings);

    const updatedKeys: string[] = [];
    const changes: Record<string, { old: any; new: any }> = {};

    for (const [key, value] of Object.entries(settings)) {
      const oldSetting = await db.selectFrom('system_settings' as any)
        .select('value' as any)
        .where('key', '=', key)
        .executeTakeFirst();

      if (!oldSetting) {
        throw new AppError(404, `Setting '${key}' không tồn tại`);
      }

      await db.updateTable('system_settings' as any)
        .set({
          value: JSON.stringify(value) as any,
          updated_by: updatedBy,
        } as any)
        .where('key', '=', key)
        .execute();

      updatedKeys.push(key);
      changes[key] = { old: (oldSetting as any).value, new: value };
    }

    await db.insertInto('audit_logs').values({
      actor_id: updatedBy,
      action: 'system.settings.update',
      target_type: 'system_settings',
      metadata: JSON.stringify({ changes, updatedKeys }) as any,
    }).execute();

    return { updated: updatedKeys.length, keys: updatedKeys };
  }

  private validateSettingsValues(settings: Record<string, any>) {
    if (settings['upload.max_file_size_bytes'] !== undefined) {
      const val = Number(settings['upload.max_file_size_bytes']);
      if (isNaN(val) || val < 1024 * 1024 || val > 1024 * 1024 * 1024) {
        throw new AppError(400, 'Kích thước file tối đa phải từ 1MB đến 1GB');
      }
    }

    if (settings['upload.allowed_extensions'] !== undefined) {
      if (!Array.isArray(settings['upload.allowed_extensions'])) {
        throw new AppError(400, 'Danh sách extension cho phép phải là array');
      }
    }

    if (settings['quota.default_user_bytes'] !== undefined) {
      const val = Number(settings['quota.default_user_bytes']);
      if (isNaN(val) || val < 100 * 1024 * 1024) {
        throw new AppError(400, 'Quota mặc định phải ít nhất 100MB');
      }
    }

    if (settings['trash.retention_days'] !== undefined) {
      const val = Number(settings['trash.retention_days']);
      if (isNaN(val) || val < 1 || val > 365) {
        throw new AppError(400, 'Thời gian giữ thùng rác phải từ 1-365 ngày');
      }
    }

    if (settings['auth.max_failed_logins'] !== undefined) {
      const val = Number(settings['auth.max_failed_logins']);
      if (isNaN(val) || val < 3 || val > 20) {
        throw new AppError(400, 'Số lần đăng nhập sai tối đa phải từ 3-20');
      }
    }

    if (settings['auth.lockout_minutes'] !== undefined) {
      const val = Number(settings['auth.lockout_minutes']);
      if (isNaN(val) || val < 5 || val > 1440) {
        throw new AppError(400, 'Thời gian khóa phải từ 5-1440 phút');
      }
    }
  }
}
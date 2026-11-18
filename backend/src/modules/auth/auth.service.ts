import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import {db} from '../../config/database.js';

import {env} from '../../config/env.js';

import {AppError} from '../../shared/middlewares/error.middleware.js';

import { sql } from 'kysely';
import {EmailService} from '../../shared/services/email.service.js';


export class AuthService {
  private emailService = new EmailService();
  async forgotPassword(email: string, ipAddress: string, userAgent: string) {
    // 1. Tìm user
    const user = await db.selectFrom('users')
      .select(['id', 'email', 'status'])
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();

    if (!user) {
      // Không throw lỗi để tránh leak thông tin email có tồn tại hay không
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' };
    }

    if (user.status !== 'active') {
      return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' };
    }

    // 2. Tạo token
    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 giờ

    // 3. Lưu token vào DB
    await db.insertInto('password_reset_tokens' as any)
      .values({
        user_id: user.id,
        token_hash: tokenHash,
        expires_at: expiresAt,
        ip: ipAddress,
        user_agent: userAgent,
      } as any)
      .execute();

    // 4. Gửi email
    const resetLink = `${env.FRONTEND_URL}/reset-password?token=${token}`;
    await this.emailService.sendPasswordResetEmail(user.email, resetLink);

    // 5. Audit log
    await db.insertInto('audit_logs')
      .values({
        actor_id: user.id,
        action: 'auth.forgot_password',
        target_type: 'user',
        target_id: user.id,
        metadata: JSON.stringify({ ip: ipAddress }) as any,
      })
      .execute();

    return { message: 'Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu.' };
  }

  async resetPassword(token: string, newPassword: string, ipAddress: string) {
    // 1. Hash token để tìm trong DB
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    
    const resetToken = await db.selectFrom('password_reset_tokens')
      .select(['id', 'user_id', 'expires_at', 'used_at'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    if (!resetToken) {
      throw new AppError(400, 'Token không hợp lệ');
    }

    if (resetToken.used_at) {
      throw new AppError(400, 'Token đã được sử dụng');
    }

    if (new Date(resetToken.expires_at) < new Date()) {
      throw new AppError(400, 'Token đã hết hạn');
    }

    // 2. Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.transaction().execute(async (trx) => {
      // Update password
      await trx.updateTable('users')
        .set({ 
          password_hash: passwordHash,
          failed_logins: 0,
          locked_until: null,
        })
        .where('id', '=', resetToken.user_id)
        .execute();

      // Revoke tất cả refresh tokens (buộc login lại)
      await trx.updateTable('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('user_id', '=', resetToken.user_id)
        .where('revoked_at', 'is', null)
        .execute();

      // Đánh dấu token đã sử dụng
      await (trx as any).updateTable('password_reset_tokens')
        .set({ used_at: new Date() })
        .where('id', '=', resetToken.id)
        .execute();

      // Audit log
      await trx.insertInto('audit_logs')
        .values({
          actor_id: resetToken.user_id,
          action: 'auth.reset_password',
          target_type: 'user',
          target_id: resetToken.user_id,
          metadata: JSON.stringify({ ip: ipAddress }) as any,
        })
        .execute();
    });

    return { message: 'Mật khẩu đã được đặt lại thành công. Vui lòng đăng nhập lại.' };
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    // 1. Lấy user
    const user = await db.selectFrom('users')
      .select(['id', 'password_hash'])
      .where('id', '=', userId)
      .executeTakeFirstOrThrow();

    // 2. Verify current password
    const isMatch = await bcrypt.compare(currentPassword, user.password_hash!);
    if (!isMatch) {
      throw new AppError(400, 'Mật khẩu hiện tại không đúng');
    }

    // 3. Update password
    const passwordHash = await bcrypt.hash(newPassword, 10);
    
    await db.transaction().execute(async (trx) => {
      await trx.updateTable('users')
        .set({ password_hash: passwordHash })
        .where('id', '=', userId)
        .execute();

      // Revoke tất cả refresh tokens trừ token hiện tại (optional)
      await trx.updateTable('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('user_id', '=', userId)
        .where('revoked_at', 'is', null)
        .execute();

      // Audit log
      await trx.insertInto('audit_logs')
        .values({
          actor_id: userId,
          action: 'auth.change_password',
          target_type: 'user',
          target_id: userId,
        })
        .execute();
    });

    return { message: 'Mật khẩu đã được thay đổi thành công' };
  }

  async logoutAllDevices(userId: string) {
    await db.updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('user_id', '=', userId)
      .where('revoked_at', 'is', null)
      .execute();

    // Audit log
    await db.insertInto('audit_logs')
      .values({
        actor_id: userId,
        action: 'auth.logout_all_devices',
        target_type: 'user',
        target_id: userId,
      })
      .execute();

    return { message: 'Đã đăng xuất khỏi tất cả thiết bị' };
  }
  async login(email: string, password: string, ipAddress: string) {
    // 1. Tìm user
    const user = await db.selectFrom('users')
      .select(['id', 'email', 'password_hash', 'full_name', 'status', 'failed_logins', 'locked_until'])
      .where('email', '=', email)
      .where('deleted_at', 'is', null)
      .executeTakeFirst();
    if (!user || !user.password_hash) {
      throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    }

    // 2. Kiểm tra tài khoản có bị khóa không
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      throw new AppError(423, `Tài khoản bị khóa đến ${user.locked_until}`);
    }

    if (user.status !== 'active') {
      throw new AppError(403, 'Tài khoản chưa được kích hoạt hoặc đã bị khóa');
    }

    // 3. Kiểm tra password
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Tăng failed_logins
      const maxFailed = 5;
      const newFailedCount = (user.failed_logins || 0) + 1;
      
      await db.updateTable('users')
        .set({
          failed_logins: newFailedCount,
          ...(newFailedCount >= maxFailed && {
            locked_until: sql`now() + interval '15 minutes'`,
          }),
        })
        .where('id', '=', user.id)
        .execute();

      if (newFailedCount >= maxFailed) {
        throw new AppError(423, 'Tài khoản bị khóa 15 phút do đăng nhập sai quá nhiều lần');
      }

      throw new AppError(401, 'Email hoặc mật khẩu không đúng');
    }

    // 4. Reset failed_logins và tạo tokens
    await db.updateTable('users')
      .set({
        failed_logins: 0,
        locked_until: null,
        last_login_at: new Date(),
      })
      .where('id', '=', user.id)
      .execute();

    const tokens = await this.generateTokens(user.id, user.email, ipAddress);

    return {
      user: { id: user.id, email: user.email, fullName: user.full_name },
      ...tokens,
    };
  }

  async refreshToken(refreshToken: string, ipAddress: string) {
    // 1. Verify token
    let decoded: any;
    try {
      decoded = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET);
    } catch (error) {
      throw new AppError(401, 'Refresh token không hợp lệ hoặc đã hết hạn');
    }

    // 2. Tìm token trong DB
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const storedToken = await db.selectFrom('refresh_tokens')
      .select(['id', 'user_id', 'token_hash', 'family_id', 'expires_at', 'revoked_at'])
      .where('token_hash', '=', tokenHash)
      .executeTakeFirst();

    if (!storedToken) {
      throw new AppError(401, 'Refresh token không tồn tại');
    }

    // 3. Kiểm tra đã bị revoke chưa
    if (storedToken.revoked_at) {
      // Token reuse detection: revoke toàn bộ family
      await db.updateTable('refresh_tokens')
        .set({ revoked_at: new Date() })
        .where('family_id', '=', storedToken.family_id)
        .where('revoked_at', 'is', null)
        .execute();

      throw new AppError(401, 'Refresh token đã bị sử dụng lại - nghi ngờ bị đánh cắp');
    }

    // 4. Kiểm tra hết hạn
    if (new Date(storedToken.expires_at) < new Date()) {
      throw new AppError(401, 'Refresh token đã hết hạn');
    }

    // 5. Revoke token cũ
    await db.updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('id', '=', storedToken.id)
      .execute();

    // 6. Lấy thông tin user
    const user = await db.selectFrom('users')
      .select(['id', 'email', 'full_name'])
      .where('id', '=', storedToken.user_id)
      .where('deleted_at', 'is', null)
      .executeTakeFirstOrThrow();

    // 7. Tạo token mới
    const tokens = await this.generateTokens(user.id, user.email, ipAddress, storedToken.family_id);

    return {
      user: { id: user.id, email: user.email, fullName: user.full_name },
      ...tokens,
    };
  }

  private async generateTokens(userId: string, email: string, ipAddress: string, familyId?: string) {
    const accessToken = jwt.sign(
      { id: userId, email },
      env.JWT_ACCESS_SECRET,
      { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as any
    );

    const refreshToken = jwt.sign(
      { id: userId },
      env.JWT_REFRESH_SECRET,
      { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as any
    );

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const newFamilyId = familyId || crypto.randomUUID();

    await db.insertInto('refresh_tokens')
      .values({
        id: crypto.randomUUID(),
        user_id: userId,
        token_hash: tokenHash,
        family_id: newFamilyId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        ip: ipAddress,
      })
      .execute();

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string) {
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    
    await db.updateTable('refresh_tokens')
      .set({ revoked_at: new Date() })
      .where('token_hash', '=', tokenHash)
      .execute();
  }
}
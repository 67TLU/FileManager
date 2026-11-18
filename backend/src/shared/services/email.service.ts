import nodemailer from 'nodemailer';
import {env} from '../../config/env.js';


const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASS,
  },
});

export class EmailService {
  async sendPasswordResetEmail(email: string, resetLink: string) {
    try {
      await transporter.sendMail({
        from: `"ACME Corp" <${env.SMTP_USER}>`,
        to: email,
        subject: 'Đặt lại mật khẩu của bạn',
        html: `
          <h2>Yêu cầu đặt lại mật khẩu</h2>
          <p>Bạn đã yêu cầu đặt lại mật khẩu. Click vào liên kết bên dưới để tiếp tục:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
          <p>Liên kết này sẽ hết hạn sau 1 giờ.</p>
          <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send password reset email:', error);
    }
  }

  async sendInvitationEmail(email: string, invitationLink: string, inviterName: string) {
    try {
      await transporter.sendMail({
        from: `"ACME Corp" <${env.SMTP_USER}>`,
        to: email,
        subject: `Bạn được mời tham gia ACME Corp`,
        html: `
          <h2>Lời mời tham gia hệ thống</h2>
          <p>${inviterName} đã mời bạn tham gia hệ thống quản lý tài nguyên của ACME Corp.</p>
          <a href="${invitationLink}" style="display: inline-block; padding: 10px 20px; background: #28a745; color: white; text-decoration: none; border-radius: 5px;">Chấp nhận lời mời</a>
          <p>Liên kết này sẽ hết hạn sau 7 ngày.</p>
        `,
      });
    } catch (error) {
      console.error('Failed to send invitation email:', error);
    }
  }
}
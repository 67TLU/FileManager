import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Login: 5 requests/15 phút/IP
export const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: { 
    success: false, 
    error: { message: 'Quá nhiều lần đăng nhập. Vui lòng thử lại sau 15 phút.' } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Forgot password: 3 requests/15 phút/IP
export const forgotPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 3,
  message: { 
    success: false, 
    error: { message: 'Quá nhiều yêu cầu đặt lại mật khẩu. Vui lòng thử lại sau 15 phút.' } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Upload: 20 requests/phút/user
export const uploadLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  keyGenerator: (req) => {
    if ((req as any).user?.id) return (req as any).user.id;
    return ipKeyGenerator(req.ip!);
  },
  message: { 
    success: false, 
    error: { message: 'Quá nhiều lần upload. Vui lòng thử lại sau.' } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// API chung: 100 requests/phút/IP
export const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  message: { 
    success: false, 
    error: { message: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.' } 
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const eventBus = require('./eventBus');
const mailerService = require('../services/mailer.service');

/**
 * Register all domain event handlers.
 * Side-effects (emails) are decoupled from business logic via EventBus.
 */

// user:registered → send email verification OTP
eventBus.on('user:registered', async ({ email, username, otp }) => {
  try {
    console.log(`📧 [Event] user:registered — ${email}`);
    await mailerService.sendMail({
      to: email,
      subject: 'LoginAuth BT02 - Xác minh email của bạn',
      text: `Xin chào ${username}, mã OTP của bạn là: ${otp}. Mã hết hạn sau 10 phút.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 28px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🧠 LoginAuth BT02</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px;">Xác minh địa chỉ email</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Xin chào <strong style="color: #111827;">${username}</strong>, mã OTP để kích hoạt tài khoản của bạn là:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; letter-spacing: 8px; font-weight: 700; color: #4f46e5; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Mã OTP có hiệu lực trong <strong>10 phút</strong>. Không chia sẻ mã này với ai.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[EventBus] user:registered handler error:', err.message);
  }
});

// user:passwordResetOtp → send password reset OTP
eventBus.on('user:passwordResetOtp', async ({ email, username, otp }) => {
  try {
    console.log(`📧 [Event] user:passwordResetOtp — ${email}`);
    await mailerService.sendMail({
      to: email,
      subject: 'LoginAuth BT02 - Đặt lại mật khẩu',
      text: `Xin chào ${username}, mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã hết hạn sau 10 phút.`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto; background: #fff; border-radius: 12px; overflow: hidden; border: 1px solid #e5e7eb;">
          <div style="background: linear-gradient(135deg, #4f46e5, #6366f1); padding: 28px; text-align: center;">
            <h1 style="color: #fff; margin: 0; font-size: 24px;">🔑 LoginAuth BT02</h1>
          </div>
          <div style="padding: 32px;">
            <h2 style="margin: 0 0 12px; color: #111827; font-size: 20px;">Đặt lại mật khẩu</h2>
            <p style="color: #6b7280; margin-bottom: 24px;">Xin chào <strong style="color: #111827;">${username}</strong>, mã OTP đặt lại mật khẩu của bạn là:</p>
            <div style="background: #f3f4f6; border-radius: 8px; padding: 20px; text-align: center; margin-bottom: 24px;">
              <span style="font-size: 36px; letter-spacing: 8px; font-weight: 700; color: #4f46e5; font-family: monospace;">${otp}</span>
            </div>
            <p style="color: #6b7280; font-size: 14px; margin: 0;">Mã OTP có hiệu lực trong <strong>10 phút</strong>. Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.</p>
          </div>
        </div>
      `,
    });
  } catch (err) {
    console.error('[EventBus] user:passwordResetOtp handler error:', err.message);
  }
});

module.exports = eventBus;

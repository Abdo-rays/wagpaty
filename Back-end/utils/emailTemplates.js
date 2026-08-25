const otpEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #FF6B35; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Restaurant App</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h2>أهلاً ${name} 👋</h2>
        <p style="color: #555; font-size: 16px;">استخدم الكود ده عشان تفعّل حسابك:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #FF6B35;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px;">الكود صالح لمدة ${process.env.OTP_EXPIRES_IN_MINUTES} دقايق بس.</p>
        <p style="color: #999; font-size: 12px;">لو معملتش الطلب ده، تجاهل الإيميل ده.</p>
      </div>
    </div>
  `;
};

const resetPasswordEmailTemplate = (name, otp) => {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
      <div style="background-color: #2E294E; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0;">Restaurant App</h1>
      </div>
      <div style="padding: 30px; text-align: center;">
        <h2>أهلاً ${name} 👋</h2>
        <p style="color: #555; font-size: 16px;">وصلنا طلب إعادة تعيين الباسورد بتاعك، استخدم الكود ده:</p>
        <div style="background-color: #f4f4f4; padding: 15px; border-radius: 6px; margin: 20px 0;">
          <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #2E294E;">${otp}</span>
        </div>
        <p style="color: #999; font-size: 14px;">الكود صالح لمدة ${process.env.RESET_PASSWORD_EXPIRES_IN_MINUTES} دقايق بس.</p>
        <p style="color: #999; font-size: 12px;">لو معملتش الطلب ده، تجاهل الإيميل ده وهحافظ على أمان حسابك.</p>
      </div>
    </div>
  `;
};

module.exports = {
  otpEmailTemplate,
  resetPasswordEmailTemplate,
};
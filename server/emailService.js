
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '.env') });

// Lazy transporter - created on first use to ensure dotenv is fully loaded
let _transporter = null;
const getTransporter = () => {
  if (!_transporter) {
    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return _transporter;
};


const wrapHtml = (content) => `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
    <div style="background-color: #4f46e5; padding: 20px; text-align: center; color: white;">
      <h1 style="margin: 0; font-size: 24px;">UniShop</h1>
    </div>
    <div style="padding: 30px; background-color: #ffffff; color: #333333;">
      ${content}
    </div>
    <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 11px; color: #888888;">
      <p>© 2024 UniShop Enterprise.</p>
    </div>
  </div>
`;

const formatCurrency = (value) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
};

export const sendOrderConfirmation = async (order) => {
  if (!order.customerEmail) return;

  const itemsHtml = order.items.map(item => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 10px 0;"><strong>${item.name}</strong></td>
      <td style="padding: 10px 0; text-align: center;">x${item.quantity}</td>
      <td style="padding: 10px 0; text-align: right;">${formatCurrency(item.price * item.quantity)}</td>
    </tr>
  `).join('');

  const html = wrapHtml(`
    <h2 style="color: #4f46e5;">Đặt hàng thành công!</h2>
    <p>Xin chào <strong>${order.customerName}</strong>,</p>
    <p>Đơn hàng <strong>#${order.id}</strong> của bạn đã được tiếp nhận.</p>
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      ${itemsHtml}
    </table>
    <div style="text-align: right; margin-top: 10px;">
      <h3 style="color: #4f46e5;">Tổng cộng: ${formatCurrency(order.total)}</h3>
    </div>
    <p>Địa chỉ giao hàng: ${order.customerAddress}</p>
  `);

  try {
    await getTransporter().sendMail({
      from: '"UniShop" <no-reply@unishop.com>',
      to: order.customerEmail,
      subject: `✅ Xác nhận đơn hàng #${order.id}`,
      html: html
    });
    console.log(`📧 Email sent to ${order.customerEmail}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

export const sendWelcomeEmail = async (customer) => {
  if (!customer.email) return;
  const html = wrapHtml(`
    <h2 style="color: #4f46e5;">Chào mừng đến với UniShop!</h2>
    <p>Xin chào <strong>${customer.name}</strong>,</p>
    <p>Tài khoản của bạn đã được tạo thành công.</p>
    <p>Hãy đăng nhập ngay để trải nghiệm mua sắm tuyệt vời.</p>
  `);
  try {
    await getTransporter().sendMail({
      from: '"UniShop" <welcome@unishop.com>',
      to: customer.email,
      subject: '🎉 Chào mừng bạn gia nhập UniShop!',
      html: html
    });
  } catch (error) {
    console.error('❌ Email sending failed:', error);
  }
};

export const sendVerificationCode = async (email, code) => {
  const html = wrapHtml(`
    <h2 style="color: #4f46e5;">Mã xác thực của bạn</h2>
    <p>Xin chào,</p>
    <p>Mã xác thực để đăng ký tài khoản UniShop của bạn là:</p>
    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #333; background: #f3f4f6; padding: 10px 20px; border-radius: 8px;">${code}</span>
    </div>
    <p>Mã này sẽ hết hạn sau 5 phút. Vui lòng không chia sẻ mã này cho bất kỳ ai.</p>
  `);

  try {
    await getTransporter().sendMail({
      from: '"UniShop" <verify@unishop.com>',
      to: email,
      subject: `🔑 Mã xác thực: ${code}`,
      html: html
    });
    console.log(`📧 Verification code sent to ${email}`);
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
};

export const sendStaffCredentials = async (employee, password) => {
    // Placeholder for staff email if needed
};

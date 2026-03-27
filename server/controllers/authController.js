import { Employee, Customer, VerificationCode } from '../models.js';
import { sendVerificationCode } from '../emailService.js';

export const checkEmail = async (req, res) => {
  const { email } = req.body;
  try {
    const emp = await Employee.findOne({ email });
    const cust = await Customer.findOne({ email });
    if (emp || cust) {
      return res.json({ exists: true });
    }
    res.json({ exists: false });
  } catch (error) {
    res.status(500).json({ error: 'Check email failed' });
  }
};

export const sendCode = async (req, res) => {
  const { email } = req.body;
  const emp = await Employee.findOne({ email });
  const cust = await Customer.findOne({ email });
  if (emp || cust) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
  }

  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

  await VerificationCode.findOneAndUpdate(
    { email },
    { code, expiresAt },
    { upsert: true, new: true }
  );

  try {
    await sendVerificationCode(email, code);
    res.json({ success: true });
  } catch (error) {
    console.error("Email send fail", error);
    res.status(500).json({ success: false, message: "Không thể gửi email" });
  }
};

export const verifyCode = async (req, res) => {
  const { email, code } = req.body;
  const record = await VerificationCode.findOne({ email });

  if (!record) {
    return res.json({ success: false, message: 'Mã không tồn tại hoặc đã hết hạn.' });
  }

  if (new Date() > record.expiresAt) {
    return res.json({ success: false, message: 'Mã đã hết hạn.' });
  }

  if (record.code !== code) {
    return res.json({ success: false, message: 'Mã xác thực không đúng.' });
  }

  await VerificationCode.deleteOne({ email });
  res.json({ success: true });
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const employee = await Employee.findOne({ email });
  if (employee && employee.password === password) {
    if (employee.status === 'LOCKED') return res.status(403).json({ message: 'Account locked' });
    await Employee.findByIdAndUpdate(employee._id, { lastActive: new Date().toISOString() });
    return res.json({ success: true, user: employee, role: employee.role });
  }
  const customer = await Customer.findOne({ email });
  if (customer && customer.password === password) {
    if (customer.status === 'LOCKED') return res.status(403).json({ message: 'Account locked' });
    return res.json({ success: true, user: customer, role: 'CUSTOMER' });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
};

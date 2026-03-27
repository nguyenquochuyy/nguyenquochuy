import mongoose from 'mongoose';
import { Employee, Customer, VerificationCode } from '../models.js';
import { sendVerificationCode } from '../emailService.js';
import bcrypt from 'bcrypt';

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

export const createCustomer = async (req, res) => {
  const { name, email, phone, password, address } = req.body;
  
  try {
    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ success: false, message: 'Email đã được sử dụng.' });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = new Customer({
      id: `cust_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      name,
      email,
      phone,
      password: hashedPassword,
      address: address || '',
      loyaltyPoints: 0,
      wishlist: [],
      joinedAt: new Date().toISOString(),
      status: 'ACTIVE'
    });

    await customer.save();
    
    res.json({ 
      success: true, 
      message: 'Tài khoản khách hàng đã được tạo thành công.',
      customer: {
        id: customer._id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone
      }
    });
  } catch (error) {
    console.error('Create customer error:', error);
    res.status(500).json({ success: false, message: 'Không thể tạo tài khoản.' });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  
  // Check if account is locked
  const employee = await Employee.findOne({ email });
  const customer = await Customer.findOne({ email });
  const user = employee || customer;
  
  if (user && user.status === 'LOCKED') {
    return res.status(403).json({ 
      success: false, 
      message: 'Tài khoản đã bị khóa. Vui lòng liên hệ quản trị viên.',
      isLocked: true
    });
  }

  // Check credentials
  if (employee) {
    const isValidPassword = await bcrypt.compare(password, employee.password);
    if (isValidPassword) {
      // Reset failed attempts on successful login
      await Employee.findByIdAndUpdate(employee._id, { 
        lastActive: new Date().toISOString(),
        failedLoginAttempts: 0,
        lockUntil: null
      });
      return res.json({ success: true, user: employee, role: employee.role });
    }
  }
  
  if (customer) {
    const isValidPassword = await bcrypt.compare(password, customer.password);
    if (isValidPassword) {
      // Reset failed attempts on successful login
      await Customer.findByIdAndUpdate(customer._id, { 
        lastActive: new Date().toISOString(),
        failedLoginAttempts: 0,
        lockUntil: null
      });
      return res.json({ success: true, user: customer, role: 'CUSTOMER' });
    }
  }

  // Handle failed login
  if (user) {
    const maxAttempts = 5;
    const lockTime = 15 * 60 * 1000; // 15 minutes
    
    const updateData = {
      $inc: { failedLoginAttempts: 1 }
    };

    // Check if this is the final attempt before lockout
    if (user.failedLoginAttempts >= maxAttempts - 1) {
      updateData.$set = {
        lockUntil: new Date(Date.now() + lockTime),
        status: 'LOCKED'
      };
    }

    // Update failed attempts
    if (employee) {
      await Employee.findByIdAndUpdate(user._id, updateData);
    } else {
      await Customer.findByIdAndUpdate(user._id, updateData);
    }

    const remainingAttempts = maxAttempts - (user.failedLoginAttempts + 1);
    
    if (remainingAttempts <= 0) {
      return res.status(403).json({ 
        success: false, 
        message: `Tài khoản đã bị khóa trong 15 phút sau ${maxAttempts} lần đăng nhập thất bại.`,
        isLocked: true,
        lockDuration: 15
      });
    } else {
      return res.status(401).json({ 
        success: false, 
        message: `Email hoặc mật khẩu không hợp lệ. Còn ${remainingAttempts} lần thử trước khi khóa tài khoản.`,
        remainingAttempts
      });
    }
  }
  
  res.status(401).json({ success: false, message: 'Invalid credentials' });
};

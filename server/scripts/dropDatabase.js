import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '../../server/.env') });

const dropDatabase = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/unishop';
    console.log(`⏳ Đang kết nối MongoDB để XÓA DỮ LIỆU: ${MONGODB_URI}...`);
    
    await mongoose.connect(MONGODB_URI);
    
    console.log('⚠️ Đang thực hiện Drop Database hiện tại...');
    await mongoose.connection.db.dropDatabase();
    console.log('✅ Đã xóa sạch toàn bộ dữ liệu (Drop thành công).');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Lỗi khi dọn dẹp DB:', error);
    process.exit(1);
  }
};

dropDatabase();

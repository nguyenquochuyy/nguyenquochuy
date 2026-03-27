import express from 'express';
import { checkEmail, login, sendCode, verifyCode } from '../controllers/authController.js';

const router = express.Router();

router.post('/check-email', checkEmail);
router.post('/send-code', sendCode);
router.post('/verify-code', verifyCode);
router.post('/login', login);

export default router;

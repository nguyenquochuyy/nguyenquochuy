import express from 'express';
import systemRoutes from './systemRoutes.js';
import authRoutes from './authRoutes.js';
import shopRoutes from './shopRoutes.js';
import adminRoutes from './adminRoutes.js';

const router = express.Router();

router.get('/', (req, res) => {
    res.send('UniShop MVC API is running');
});

router.use('/api', systemRoutes);
router.use('/api/auth', authRoutes);
router.use('/api', shopRoutes);
router.use('/api', adminRoutes);

export default router;

import express from 'express';
import { getSystemState, updateSettings } from '../controllers/systemController.js';

const router = express.Router();

router.get('/state', getSystemState);
router.post('/settings', updateSettings);

export default router;

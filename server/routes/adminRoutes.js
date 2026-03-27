import express from 'express';
import { 
    adjustInventory, addTransaction, 
    createVoucher, updateVoucher, deleteVoucher,
    createEmployee, updateEmployee 
} from '../controllers/adminController.js';

const router = express.Router();

router.post('/inventory/adjust', adjustInventory);
router.post('/transactions', addTransaction);

router.post('/vouchers', createVoucher);
router.put('/vouchers/:id', updateVoucher);
router.delete('/vouchers/:id', deleteVoucher);

router.post('/employees', createEmployee);
router.put('/employees/:id', updateEmployee);

export default router;

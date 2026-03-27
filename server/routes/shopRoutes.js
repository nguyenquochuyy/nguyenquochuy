import express from 'express';
import { 
    createProduct, updateProduct, deleteProduct,
    createOrder, updateOrderStatus,
    createCustomer, updateCustomer, toggleWishlist,
    createCategory, updateCategory, deleteCategory
} from '../controllers/shopController.js';

const router = express.Router();

// Products
router.post('/products', createProduct);
router.put('/products/:id', updateProduct);
router.delete('/products/:id', deleteProduct);

// Orders
router.post('/orders', createOrder);
router.put('/orders/:id/status', updateOrderStatus);

// Customers
router.post('/customers', createCustomer);
router.put('/customers/:id', updateCustomer);
router.put('/customers/:id/wishlist', toggleWishlist);

// Categories
router.post('/categories', createCategory);
router.put('/categories/:id', updateCategory);
router.delete('/categories/:id', deleteCategory);

export default router;

import { Product, Order, Category, Customer, InventoryLog } from '../models.js';
import { sendOrderConfirmation, sendWelcomeEmail } from '../emailService.js';

// --- PRODUCTS ---
export const createProduct = async (req, res) => {
  const newProduct = new Product({ ...req.body, id: `p${Date.now()}` });
  await newProduct.save();
  if (newProduct.stock > 0 || newProduct.variants.length > 0) {
      const log = new InventoryLog({
          id: `log_${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'IN',
          quantity: newProduct.stock,
          stockBefore: 0,
          stockAfter: newProduct.stock,
          reason: 'Initial Import',
          createdAt: new Date().toISOString()
      });
      await log.save();
  }
  res.json(newProduct);
};

export const updateProduct = async (req, res) => {
  const updated = await Product.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
  res.json(updated);
};

export const deleteProduct = async (req, res) => {
  await Product.findOneAndDelete({ id: req.params.id });
  res.json({ success: true });
};

// --- ORDERS ---
export const createOrder = async (req, res) => {
  const orderData = req.body;
  const newOrder = new Order({ ...orderData, id: `${Date.now()}`, createdAt: new Date().toISOString() });
  await newOrder.save();

  for (const item of orderData.items) {
      const product = await Product.findOne({ id: item.id });
      if (product) {
          if (item.selectedVariantId && product.hasVariants) {
              const variantIndex = product.variants.findIndex(v => v.id === item.selectedVariantId);
              if (variantIndex > -1) {
                  product.variants[variantIndex].stock -= item.quantity;
                  product.stock -= item.quantity;
              }
          } else {
              product.stock -= item.quantity;
          }
          await product.save();
      }
  }

  if (orderData.customerPhone) {
      const earnedPoints = Math.floor(orderData.total / 10000);
      const pointsUsed = orderData.pointsUsed || 0;
      await Customer.findOneAndUpdate(
          { phone: orderData.customerPhone },
          { $inc: { loyaltyPoints: earnedPoints - pointsUsed } }
      );
  }

  sendOrderConfirmation(newOrder).catch(err => console.error("Email Error:", err));
  res.json(newOrder);
};

export const updateOrderStatus = async (req, res) => {
  const { status, userId } = req.body;
  const order = await Order.findOneAndUpdate({ id: req.params.id }, { status, processedBy: userId }, { new: true });
  res.json(order);
};

// --- CUSTOMERS ---
export const createCustomer = async (req, res) => {
    const { email } = req.body;
    if (email) {
        const exists = await Customer.findOne({ email });
        if (exists) return res.status(400).json({ message: 'Email already exists' });
    }
    const cust = new Customer({ ...req.body, id: `cust_${Date.now()}`, joinedAt: new Date().toISOString() });
    await cust.save();
    sendWelcomeEmail(cust).catch(err => console.error("Email Error:", err));
    res.json(cust);
};

export const updateCustomer = async (req, res) => {
    const cust = await Customer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(cust);
};

export const toggleWishlist = async (req, res) => {
    const { productId } = req.body;
    const customer = await Customer.findOne({ id: req.params.id });
    if(customer) {
        if(customer.wishlist.includes(productId)) {
            customer.wishlist = customer.wishlist.filter(id => id !== productId);
        } else {
            customer.wishlist.push(productId);
        }
        await customer.save();
    }
    res.json(customer);
};

// --- CATEGORIES ---
export const createCategory = async (req, res) => {
    const cat = new Category({ ...req.body, id: `c${Date.now()}` });
    await cat.save();
    res.json(cat);
};
export const updateCategory = async (req, res) => {
    const cat = await Category.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(cat);
};
export const deleteCategory = async (req, res) => {
    await Category.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
};

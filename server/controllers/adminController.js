import { Product, InventoryLog, Transaction, FinanceAccount, Voucher, Employee } from '../models.js';

// --- INVENTORY ---
export const adjustInventory = async (req, res) => {
    const { productId, variantId, quantity, type, reason, userId } = req.body;
    const product = await Product.findOne({ id: productId });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    let stockBefore = 0, stockAfter = 0;
    if (variantId && product.hasVariants) {
        const v = product.variants.find(v => v.id === variantId);
        if (v) {
            stockBefore = v.stock;
            v.stock = type === 'IN' ? v.stock + quantity : v.stock - quantity;
            stockAfter = v.stock;
            product.stock = product.variants.reduce((acc, curr) => acc + curr.stock, 0); // Recalculate total
        }
    } else {
        stockBefore = product.stock;
        product.stock = type === 'IN' ? product.stock + quantity : product.stock - quantity;
        stockAfter = product.stock;
    }
    await product.save();

    const log = new InventoryLog({
        id: `log_${Date.now()}`,
        productId, variantId,
        productName: product.name,
        variantName: variantId ? product.variants.find(v=>v.id===variantId)?.name : '',
        type, quantity, stockBefore, stockAfter, reason,
        createdAt: new Date().toISOString(),
        performedBy: userId
    });
    await log.save();
    res.json({ success: true });
};

// --- TRANSACTIONS ---
export const addTransaction = async (req, res) => {
    const tx = new Transaction({ ...req.body, id: `tx_${Date.now()}`, date: new Date().toISOString() });
    await tx.save();
    const adjustment = tx.type === 'INCOME' ? tx.amount : -tx.amount;
    await FinanceAccount.findOneAndUpdate({ id: tx.accountId }, { $inc: { balance: adjustment } });
    res.json(tx);
};

// --- VOUCHERS ---
export const createVoucher = async (req, res) => {
    const voucher = new Voucher({ ...req.body, id: `v${Date.now()}` });
    await voucher.save();
    res.json(voucher);
};
export const updateVoucher = async (req, res) => {
    const v = await Voucher.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(v);
};
export const deleteVoucher = async (req, res) => {
    await Voucher.findOneAndDelete({ id: req.params.id });
    res.json({ success: true });
};

// --- EMPLOYEES ---
export const createEmployee = async (req, res) => {
    const empData = req.body;
    const emp = new Employee({ ...empData, id: `emp_${Date.now()}`, joinedAt: new Date().toISOString() });
    await emp.save();
    res.json(emp);
};
export const updateEmployee = async (req, res) => {
    const emp = await Employee.findOneAndUpdate({ id: req.params.id }, req.body, { new: true });
    res.json(emp);
};

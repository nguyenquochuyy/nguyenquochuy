// Connect to MongoDB and insert fake orders
const { MongoClient } = require('mongodb');

async function seedOrders() {
  const uri = 'mongodb://localhost:27017';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('unishop');
    const collection = db.collection('orders');

    // Clear existing orders
    await collection.deleteMany({});
    console.log('Cleared existing orders');

    // Generate fake orders
    const customerNames = ['Nguyễn Văn An', 'Trần Thị Bình', 'Lê Hoàng Cường', 'Phạm Minh Dung', 'Hồ Thị E', 'Đỗ Văn F', 'Vũ Thị G', 'Ngô Minh Hùng', 'Dương Thị Lan', 'Bùi Văn Minh'];
    const customerAddresses = ['123 Nguyễn Huệ, Q1, TP.HCM', '456 Lê Lợi, Q3, TP.HCM', '789 Hai Bà Trưng, Q5, TP.HCM', '321 Trần Hưng Đạo, Q1, TP.HCM', '654 Pasteur, Q3, TP.HCM'];
    const productNames = ['iPhone 15 Pro Max', 'Samsung Galaxy S24', 'MacBook Air M3', 'iPad Pro M2', 'AirPods Pro 2', 'Apple Watch 9', 'Sony WH-1000XM5', 'Logitech MX Master 3S'];
    const statuses = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'];
    const paymentMethods = ['COD', 'BANKING', 'MOMO', 'VNPAY'];
    const paymentStatuses = ['PENDING', 'PAID', 'FAILED'];
    const shippingMethods = ['Standard', 'Express', 'Same Day'];

    for (let i = 0; i < 50; i++) {
      const timestamp = Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000);
      const orderId = timestamp.toString();
      const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
      const customerPhone = '0' + Math.floor(Math.random() * 1000000000).toString().padStart(9, '0');
      const customerAddress = customerAddresses[Math.floor(Math.random() * customerAddresses.length)];
      const customerEmail = `customer${i}@example.com`;
      
      const numItems = Math.floor(Math.random() * 5) + 1;
      const items = [];
      let subtotal = 0;
      for (let j = 0; j < numItems; j++) {
        const price = (Math.floor(Math.random() * 500) + 1) * 100000;
        const quantity = Math.floor(Math.random() * 3) + 1;
        items.push({
          productId: `prod${Math.floor(Math.random() * 1000)}`,
          name: productNames[Math.floor(Math.random() * productNames.length)],
          price: price,
          quantity: quantity
        });
        subtotal += price * quantity;
      }
      
      const discountAmount = Math.random() > 0.7 ? subtotal * 0.1 : 0;
      const shippingMethod = shippingMethods[Math.floor(Math.random() * shippingMethods.length)];
      const shippingFee = shippingMethod === 'Standard' ? 30000 : shippingMethod === 'Express' ? 50000 : 80000;
      const taxRate = 10;
      const taxAmount = (subtotal - discountAmount) * (taxRate / 100);
      const total = subtotal - discountAmount + shippingFee + taxAmount;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      const paymentStatus = (status === 'COMPLETED' || status === 'SHIPPING') ? 'PAID' : paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)];
      
      const timeline = [{ status: 'PENDING', timestamp: new Date(timestamp) }];
      if (status !== 'PENDING') timeline.push({ status: 'CONFIRMED', timestamp: new Date(timestamp + Math.random() * 3600000) });
      if (status === 'SHIPPING' || status === 'COMPLETED') timeline.push({ status: 'SHIPPING', timestamp: new Date(timestamp + Math.random() * 86400000) });
      if (status === 'COMPLETED') timeline.push({ status: 'COMPLETED', timestamp: new Date(timestamp + Math.random() * 172800000) });
      if (status === 'CANCELLED') timeline.push({ status: 'CANCELLED', timestamp: new Date(timestamp + Math.random() * 86400000), note: 'Customer cancelled' });
      
      const shippingTracking = (status === 'SHIPPING' || status === 'COMPLETED') ? `VN${Math.floor(Math.random() * 1000000)}${timestamp.toString().slice(10)}` : '';
      
      await collection.insertOne({
        id: orderId,
        customerName: customerName,
        customerPhone: customerPhone,
        customerAddress: customerAddress,
        customerEmail: customerEmail,
        items: items,
        subtotal: subtotal,
        discountAmount: discountAmount,
        voucherCode: Math.random() > 0.8 ? `SAVE${Math.floor(Math.random() * 50)}` : '',
        voucherDiscount: Math.random() > 0.8 ? subtotal * 0.05 : 0,
        pointsUsed: Math.random() > 0.85 ? Math.floor(Math.random() * 1000) : 0,
        pointsDiscount: Math.random() > 0.85 ? Math.floor(Math.random() * 1000) * 100 : 0,
        shippingFee: shippingFee,
        shippingMethod: shippingMethod,
        taxRate: taxRate,
        taxAmount: taxAmount,
        total: total,
        status: status,
        paymentMethod: paymentMethod,
        paymentStatus: paymentStatus,
        paymentTransactionId: '',
        timeline: timeline,
        shippingTracking: shippingTracking,
        createdAt: new Date(timestamp),
        updatedAt: new Date(timestamp + Math.random() * 3600000)
      });
      
      console.log(`Inserted order ${i + 1}: ${orderId}`);
    }

    console.log('Successfully inserted 50 fake orders');
  } finally {
    await client.close();
  }
}

seedOrders().catch(console.error);

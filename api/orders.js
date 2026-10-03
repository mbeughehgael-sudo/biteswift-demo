const { createOrder } = require('../lib/db');

function generateOrderId() {
  return 'BS-' + Math.floor(1000 + Math.random() * 9000) + '-' + Date.now().toString(36).toUpperCase();
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const body = req.body || {};
  if (!Array.isArray(body.items) || body.items.length === 0) {
    return res.status(400).json({ error: 'Order must include at least one item' });
  }

  const order = {
    id: generateOrderId(),
    items: body.items.map((i) => ({
      id: i.id,
      name: String(i.name || '').slice(0, 200),
      price: Number(i.price) || 0,
      qty: Math.max(1, Number(i.qty) || 1)
    })),
    subtotal: Number(body.subtotal) || 0,
    delivery: Number(body.delivery) || 0,
    discount: Number(body.discount) || 0,
    total: Number(body.total) || 0,
    address: String(body.address || '').slice(0, 300),
    status: 'confirmed',
    placedAt: Date.now()
  };

  try {
    await createOrder(order);
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to place order' });
  }
};

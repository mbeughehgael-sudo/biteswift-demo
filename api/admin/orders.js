const { requireAdmin } = require('../../lib/requireAdmin');
const { listOrders } = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const orders = await listOrders();
  res.status(200).json(orders);
};

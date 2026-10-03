const { requireAdmin } = require('../../../lib/requireAdmin');
const { updateOrder } = require('../../../lib/db');

const VALID_STATUSES = ['confirmed', 'preparing', 'on_the_way', 'delivered', 'cancelled'];

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { id } = req.query;
  const { status } = req.body || {};
  if (!VALID_STATUSES.includes(status)) {
    return res.status(400).json({ error: `status must be one of: ${VALID_STATUSES.join(', ')}` });
  }

  const updated = await updateOrder(id, { status });
  if (!updated) return res.status(404).json({ error: 'Order not found' });
  res.status(200).json(updated);
};

const { getOrder } = require('../../lib/db');

// Public by design: the order id is long/random enough to act as a capability token,
// so a customer can poll their own order's live status without needing an account.
module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { id } = req.query;
  try {
    const order = await getOrder(id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).json(order);
  } catch (err) {
    res.status(500).json({ error: 'Failed to load order' });
  }
};

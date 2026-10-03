const { requireAdmin } = require('../../lib/requireAdmin');
const { listOrders } = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const orders = await listOrders();
  const totalOrders = orders.length;
  const totalRevenue = orders
    .filter((o) => o.status !== 'cancelled')
    .reduce((sum, o) => sum + (o.total || 0), 0);

  const itemCounts = {};
  orders.forEach((o) => {
    (o.items || []).forEach((i) => {
      itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty;
    });
  });
  const topItems = Object.entries(itemCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, qty]) => ({ name, qty }));

  const byStatus = {};
  orders.forEach((o) => {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
  });

  res.status(200).json({ totalOrders, totalRevenue, topItems, byStatus });
};

const { requireAdmin } = require('../../../lib/requireAdmin');
const { getRestaurant, upsertRestaurant, deleteRestaurant } = require('../../../lib/db');

// PUT replaces the whole restaurant record (including its nested menu array) —
// the admin UI always sends the full object back, which keeps this endpoint simple.
module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = Number(req.query.id);

  if (req.method === 'PUT') {
    const existing = await getRestaurant(id);
    if (!existing) return res.status(404).json({ error: 'Restaurant not found' });
    const body = req.body || {};
    const updated = {
      ...existing,
      ...body,
      id,
      menu: Array.isArray(body.menu) ? body.menu : existing.menu
    };
    await upsertRestaurant(updated);
    return res.status(200).json(updated);
  }

  if (req.method === 'DELETE') {
    await deleteRestaurant(id);
    return res.status(204).end();
  }

  res.setHeader('Allow', 'PUT, DELETE');
  res.status(405).json({ error: 'Method not allowed' });
};

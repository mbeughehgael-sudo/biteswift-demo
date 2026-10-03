const { requireAdmin } = require('../../../lib/requireAdmin');
const { deletePromo } = require('../../../lib/db');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', 'DELETE');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  await deletePromo(req.query.code);
  res.status(204).end();
};

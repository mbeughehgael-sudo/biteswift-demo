const { requireAdmin } = require('../../lib/requireAdmin');
const { listPromos, upsertPromo } = require('../../lib/db');

module.exports = async (req, res) => {
  if (!requireAdmin(req, res)) return;

  if (req.method === 'GET') {
    return res.status(200).json(await listPromos());
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    if (!body.code || !['percent', 'flat'].includes(body.type) || !(Number(body.value) > 0)) {
      return res.status(400).json({ error: 'code, type (percent|flat) and a positive value are required' });
    }
    const saved = await upsertPromo({
      code: body.code,
      type: body.type,
      value: Number(body.value),
      active: body.active !== false
    });
    return res.status(201).json(saved);
  }

  res.setHeader('Allow', 'GET, POST');
  res.status(405).json({ error: 'Method not allowed' });
};

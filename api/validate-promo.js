const { getPromo } = require('../lib/db');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { code } = req.body || {};
  if (!code || typeof code !== 'string') {
    return res.status(400).json({ valid: false, error: 'Missing code' });
  }
  try {
    const promo = await getPromo(code);
    if (!promo || !promo.active) {
      return res.status(200).json({ valid: false });
    }
    res.status(200).json({ valid: true, code: promo.code, type: promo.type, value: promo.value });
  } catch (err) {
    res.status(500).json({ valid: false, error: 'Failed to validate promo' });
  }
};

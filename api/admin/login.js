const { signSession } = require('../../lib/auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!process.env.ADMIN_PASSWORD) {
    return res.status(500).json({ error: 'Server not configured: ADMIN_PASSWORD is not set' });
  }

  const { password } = req.body || {};
  if (password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: 'Invalid password' });
  }

  const token = signSession();
  const maxAge = 60 * 60 * 12; // 12 hours
  res.setHeader(
    'Set-Cookie',
    `admin_session=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge}`
  );
  res.status(200).json({ ok: true });
};

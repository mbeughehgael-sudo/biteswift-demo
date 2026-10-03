const { verifySession } = require('../../lib/auth');
const { parse } = require('../../lib/cookie');

module.exports = async (req, res) => {
  const cookies = parse(req.headers.cookie || '');
  res.status(200).json({ authenticated: verifySession(cookies.admin_session) });
};

const crypto = require('crypto');

const SESSION_VALUE = 'admin-session';

function getSecret() {
  // Falls back to a fixed string only so the module never throws if ADMIN_PASSWORD
  // is briefly unset; login itself still requires the real ADMIN_PASSWORD to match.
  return process.env.ADMIN_PASSWORD || 'biteswift-unset-secret';
}

function signSession() {
  const sig = crypto.createHmac('sha256', getSecret()).update(SESSION_VALUE).digest('hex');
  return `${SESSION_VALUE}.${sig}`;
}

function verifySession(token) {
  if (!token || typeof token !== 'string') return false;
  const idx = token.lastIndexOf('.');
  if (idx === -1) return false;
  const value = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  if (value !== SESSION_VALUE) return false;
  const expected = crypto.createHmac('sha256', getSecret()).update(value).digest('hex');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

module.exports = { signSession, verifySession };

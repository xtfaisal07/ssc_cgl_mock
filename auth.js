// api/_auth.js
// Verifies the Supabase access token sent by the frontend in the
// Authorization header, and returns the authenticated user (or null).
const { getSupabaseAdmin } = require('./supabaseAdmin');

async function getUserFromRequest(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.slice('Bearer '.length).trim();
  if (!token) return null;

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data || !data.user) return null;
  return data.user;
}

module.exports = { getUserFromRequest };

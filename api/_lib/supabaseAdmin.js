// api/_supabaseAdmin.js
// Shared Supabase client for serverless functions, using the SERVICE ROLE key.
// This file is never sent to the browser — it only runs on Vercel's server.
const { createClient } = require('@supabase/supabase-js');

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variables. ' +
      'Set them in Vercel Project Settings → Environment Variables.'
    );
  }

  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false }
  });
}

module.exports = { getSupabaseAdmin };

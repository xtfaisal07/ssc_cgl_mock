// api/history.js
// GET — returns all past results for the authenticated user, newest first.
// Header: Authorization: Bearer <supabase access token>
const { getSupabaseAdmin } = require('./_supabaseAdmin');
const { getUserFromRequest } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'GET') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated. Please log in again.' });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('results')
      .select('id, paper_id, paper_title, total_score, correct_count, incorrect_count, skipped_count, time_taken_seconds, section_breakdown, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase select error:', error);
      res.status(500).json({ error: 'Failed to fetch history.' });
      return;
    }

    res.status(200).json({ success: true, results: data });
  } catch (err) {
    console.error('history error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

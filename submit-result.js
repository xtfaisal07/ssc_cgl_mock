// api/submit-result.js
// POST { paperId, paperTitle, totalScore, correctCount, incorrectCount,
//        skippedCount, timeTakenSeconds, sectionBreakdown, answers }
// Header: Authorization: Bearer <supabase access token>
const { getSupabaseAdmin } = require('./_supabaseAdmin');
const { getUserFromRequest } = require('./_auth');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      res.status(401).json({ error: 'Not authenticated. Please log in again.' });
      return;
    }

    const body = req.body || {};
    const {
      paperId, paperTitle, totalScore, correctCount,
      incorrectCount, skippedCount, timeTakenSeconds,
      sectionBreakdown, answers
    } = body;

    if (
      !paperId || !paperTitle ||
      totalScore === undefined || correctCount === undefined ||
      incorrectCount === undefined || skippedCount === undefined ||
      timeTakenSeconds === undefined
    ) {
      res.status(400).json({ error: 'Missing required fields in request body.' });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from('results')
      .insert({
        user_id: user.id,
        paper_id: paperId,
        paper_title: paperTitle,
        total_score: totalScore,
        correct_count: correctCount,
        incorrect_count: incorrectCount,
        skipped_count: skippedCount,
        time_taken_seconds: timeTakenSeconds,
        section_breakdown: sectionBreakdown || {},
        answers: answers || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Supabase insert error:', error);
      res.status(500).json({ error: 'Failed to save result.' });
      return;
    }

    res.status(200).json({ success: true, result: data });
  } catch (err) {
    console.error('submit-result error:', err);
    res.status(500).json({ error: err.message || 'Internal server error.' });
  }
};

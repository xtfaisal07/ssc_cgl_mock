# SSC CGL Mock Test — Setup Guide (Database + Login)

Your mock test now supports **saved results that persist across days, devices, and browsers** —
backed by a free Supabase database, with simple email/password login so multiple people can use
the same deployed link without seeing each other's scores.

Follow these steps **in order**. It takes about 10–15 minutes, one time only.

---

## Part 1 — Create your Supabase project (free)

1. Go to **https://supabase.com** → Sign up / log in (you can use your GitHub account).
2. Click **New Project**.
   - Name: `ssc-cgl-mock` (or anything).
   - Database password: set any strong password, save it somewhere — you won't need it again for this setup.
   - Region: pick the one closest to India (e.g. Mumbai/Singapore) for speed.
3. Wait ~2 minutes for the project to finish provisioning.

### Run the database schema
1. In your Supabase project, open the left sidebar → **SQL Editor** → **New query**.
2. Open the file `supabase_schema.sql` (included in this project), copy **all** of it.
3. Paste into the SQL editor and click **Run**.
4. You should see "Success. No rows returned." This created the `results` table with proper security rules (each user can only see their own results).

### Get your API keys
1. In Supabase, go to **Project Settings** (gear icon) → **API**.
2. You'll see:
   - **Project URL** — looks like `https://abcdefgh.supabase.co`
   - **anon public** key — a long string starting with `eyJ...`
   - **service_role** key — another long string starting with `eyJ...` (⚠️ keep this one secret — never put it in frontend code)

Keep this tab open, you'll need all three values in the next steps.

### Enable email login (it's on by default, just double check)
1. In Supabase, go to **Authentication** → **Providers**.
2. Make sure **Email** is enabled (it is by default).
3. Optional but recommended for testing: go to **Authentication** → **Settings** → turn OFF "Confirm email" if you want to skip email verification while testing (you can turn it back on later for real users).

---

## Part 2 — Add your Supabase keys to the project

### A) Frontend key (safe to be public) — edit `index.html`

Open `index.html`, find this block near the top of the `<script>` section (search for `SUPABASE_URL`):

```js
const SUPABASE_URL = "YOUR_SUPABASE_URL_HERE";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY_HERE";
```

Replace with your actual **Project URL** and **anon public** key from Part 1:

```js
const SUPABASE_URL = "https://abcdefgh.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIs...your full anon key...";
```

> The anon key is safe to expose in frontend code — Supabase's Row Level Security (which the
> schema script set up) ensures users can only ever read/write their own rows, no matter what.

### B) Backend key (must stay secret) — set in Vercel, NOT in code

The **service_role** key must never go into `index.html` or any file you push to GitHub —
it has full database access. It only goes into Vercel's environment variables (encrypted, server-side only):

1. Go to your project on **vercel.com** → your project → **Settings** → **Environment Variables**.
2. Add two variables:

   | Name | Value |
   |---|---|
   | `SUPABASE_URL` | same Project URL as above |
   | `SUPABASE_SERVICE_ROLE_KEY` | your **service_role** key (the secret one) |

3. Apply to all environments (Production, Preview, Development).
4. Click **Save**.

---

## Part 3 — Push to GitHub and deploy

From VS Code, in your project folder:

```bash
git add .
git commit -m "Add database-backed result history with login"
git push
```

Vercel will auto-deploy on push (since it's already connected to your GitHub repo).

**Important:** after adding the environment variables in Part 2B, you need to **redeploy** once for
them to take effect if you added them after the first deploy. In Vercel: **Deployments** → click the
three dots on the latest deployment → **Redeploy**.

---

## Part 4 — Test it

1. Open your deployed Vercel URL.
2. Click **Sign up** (top right) → enter an email + password → create account.
   - If you left "Confirm email" ON in Supabase, check your inbox and click the confirmation link first.
3. Take a mock test, submit it. You should see "✓ Saved to your history" under your score.
4. Click **My History** (top right) — you'll see that attempt listed.
5. Close the browser, come back tomorrow (or from your phone), log in with the same email — your
   history will still be there, because it's stored in the actual database, not the browser.

---

## How it works (architecture overview)

```
Browser (index.html)
   │
   │  1. Login/Signup  → Supabase Auth (handles passwords, sessions)
   │  2. After submitting a test →  POST /api/submit-result  (with auth token)
   │  3. Viewing history          →  GET  /api/history        (with auth token)
   ▼
Vercel Serverless Functions (api/*.js)
   │  - Verify the user's auth token
   │  - Use the secret service_role key to read/write the database
   ▼
Supabase Postgres Database
   - `results` table, one row per test attempt
   - Row Level Security: a user can only ever see their own rows
```

- **Multiple people** can use the same deployed link — each creates their own account, and Row
  Level Security guarantees Person A can never see Person B's scores, even if A finds the right
  database row ID.
- **Guest mode** still works — if someone clicks "Continue without an account," they can take
  tests normally, but results won't be saved anywhere (a note on the results screen tells them this,
  with a prompt to sign up).

---

## Troubleshooting

- **"Login is not configured yet"** error → you forgot to replace `SUPABASE_URL` / `SUPABASE_ANON_KEY`
  placeholders in `index.html`.
- **History page says "Could not load history"** → check that `SUPABASE_URL` and
  `SUPABASE_SERVICE_ROLE_KEY` are set correctly in Vercel's environment variables, and that you
  redeployed after adding them.
- **Signup works but login says invalid credentials** → if "Confirm email" is ON in Supabase, you
  must click the confirmation link in your email before you can log in.
- **Results not saving for a logged-in user** → open browser dev tools (F12) → Console tab, take a
  test and submit, look for any red error text — it usually tells you exactly what's wrong (e.g. a
  typo in the Supabase URL).

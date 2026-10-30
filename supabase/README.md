# Supabase database setup

The migration creates the database tables and security rules for AI Smart Diary. It does not import, alter, or delete existing browser `localStorage` data.

## Run the migration in the Supabase SQL Editor

1. Create or open your Supabase project.
2. In the Supabase dashboard, open **SQL Editor** and choose **New query**.
3. Open `migrations/20261028000000_initial_diary_schema.sql` in this project and copy its complete contents into the SQL Editor.
4. Review the SQL, then select **Run**.
5. In **Table Editor**, confirm that `profiles`, `diary_entries`, `goals`, and `emotion_analyses` were created.
6. In each table's RLS settings, confirm that Row Level Security is enabled. The migration creates per-user policies for select, insert, update, and delete.

Run the migration in a Supabase project that provides the standard `auth.users` table and `auth.uid()` function. The SQL uses `create table if not exists`, `create or replace function`, and replaceable policies/triggers so it can be pasted again without dropping these tables or their rows. If a later migration changes this schema, apply that as a separate migration rather than dropping and recreating user-data tables.

## Configure the existing Vite app

The app is React + Vite, not Next.js, so it uses the Supabase browser client rather than `@supabase/ssr` server helpers or Next middleware. Its client is in `src/lib/supabaseClient.js`; the Supabase SDK persists browser sessions and refreshes access tokens automatically.

1. Copy `.env.example` to `.env.local` in the `ai-smart-diary` folder.
2. Set `VITE_SUPABASE_URL` to your Supabase project URL and `VITE_SUPABASE_PUBLISHABLE_KEY` to its publishable key.
3. Restart Vite after changing environment variables.
4. In Supabase **Authentication → URL Configuration**, set the local site URL to `http://localhost:5173` and add your production site URL when deploying.

Vite exposes variables prefixed with `VITE_` to browser code. A publishable key is intended for that use and must be protected by RLS. Never place a service-role key in `.env.local`, any `VITE_` variable, or frontend code.

The current frontend uses Supabase for authentication only. Diary entries, goals, and settings remain in browser `localStorage` until the API/database integration and a deliberate data import are implemented.

## Tables and application fields

- `profiles` stores the authenticated user's display name. Its UUID `id` is the matching `auth.users.id`.
- `diary_entries` stores each entry's title, content, date, time, category, mood, draft/published status, and timestamps.
- `goals` stores the title, description, numeric target and progress, unit, optional target date, status, and timestamps. Its check constraints keep progress within the target and keep status consistent with progress.
- `emotion_analyses` stores the model's label, confidence from 0 to 1, per-label score object, model version, timestamp, and the diary entry analyzed. A composite foreign key ensures the referenced entry belongs to the same user as the analysis.

Mood history is derived from diary-entry mood fields in the current app, so there is no separate mood-history table.

The current UI formats entry dates and times as display strings. When connecting it to this schema, convert the entry date to an ISO `YYYY-MM-DD` value for `entry_date`; keep the displayed time in `entry_time` (or later replace it with a deliberately selected timezone-aware representation).

## Security notes

All four tables have RLS enabled. Policies compare the row's `id` or `user_id` to `auth.uid()` for every operation. The emotion-analysis foreign key also checks ownership against the referenced entry. Supabase Auth creates a profile row automatically using the signup `full_name` or `name` user metadata when available.

The policies protect row ownership, but they do not prove that an emotion result was produced by the model. In a connected application, model inference and analysis writes should be performed by the authenticated backend after validating the user's token. Never put a Supabase service-role key in Vite environment variables or frontend code; service-role credentials bypass RLS and belong only in a trusted server environment when strictly needed.

## Existing local data

The current React app stores entries and goals in browser `localStorage`; this schema migration leaves that data untouched and does not upload it. Importing local data is a separate step that should be explicit, backed up first, and performed only after the user signs into the intended account.

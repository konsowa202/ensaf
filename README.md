# INSAF - Litigation Funding Platform

A comprehensive litigation funding platform serving the Saudi Arabia and GCC markets.

## Tech Stack
- Next.js 14+ (App Router)
- Supabase (PostgreSQL, Auth, Storage)
- Tailwind CSS v4 & shadcn/ui
- next-intl (Bilingual: Arabic RTL / English LTR)

## Setup Guide

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Environment Variables:**
   Copy `.env.example` to `.env.local` and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
   ```

3. **Database Setup (Supabase SQL Editor):**
   Run the SQL migrations in `supabase/migrations/` in the following exact order:
   - `0001_init.sql` (Creates all tables and RLS)
   - `0002_seed.sql` (Inserts system roles, permissions, settings)
   - `0003_rls_fixes.sql` (Adds missing RLS policies and storage buckets)
   - `0004_money_functions.sql` (Creates secure RPC functions for wallet mutations)
   - `0005_seed_completion.sql` (Inserts demo users, cases, and remaining seed data)

4. **Disable Email Confirmation for Testing:**
   In the Supabase Dashboard, go to **Authentication > Providers > Email** and turn OFF "Confirm email".

5. **Run the Development Server:**
   ```bash
   npm run dev
   ```

## Admin Promotion (First User)
After registering a new account via the `/register` page, run the following SQL command in the Supabase SQL Editor to promote your account to a Super Admin:

```sql
UPDATE profiles
SET role_id = (SELECT id FROM roles WHERE slug = 'super_admin'), user_type = 'staff'
WHERE email = 'YOUR_REGISTERED_EMAIL@example.com';
```

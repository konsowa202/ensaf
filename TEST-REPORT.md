# TEST REPORT — INSAF Litigation-Funding Platform

Date: 2026-09-10 · Tester: automated QA agent · Project root: `D:\ensaf`

---

## ملخص تنفيذي (عربي)

**الحكم: FIX-FIRST — المشروع غير جاهز إطلاقًا.**

المشروع في حالته الحالية ليس سوى هيكل أولي (create-next-app) مع بعض الأساسات الجيدة:
الحزم المطلوبة كلها مثبتة، ملفات Supabase المساعدة موجودة ومطابقة للمواصفة، إعدادات
الهوية البصرية (الألوان، الخط، الشعار) صحيحة، وملفا الهجرات SQL يحتويان كل الجداول
الـ17 مع تفعيل RLS. **لكن لا يوجد أي تطبيق فعلي:** صفحة الهبوط غير موجودة (0 من 12
قسمًا)، ولا توجد صفحات تسجيل/دخول، ولا لوحات تحكم، ولا تفعيل للغتين (next-intl غير
مربوط)، ولا ملف middleware لحماية المسارات، وكل المسارات المطلوبة ترجع 404. إضافةً
إلى ذلك، **الهجرات لم تُنفَّذ على قاعدة البيانات الحية** (كل الجداول غير موجودة في
Supabase)، وتأكيد البريد الإلكتروني مفعّل مما يمنع تسجيل الدخول في الاختبارات.

ما يعمل: `npm run build` ينجح بصفر أخطاء TypeScript، وواجهة Supabase Auth تستجيب
(تم إنشاء مستخدم اختباري بنجاح عبر API). ما يجب فعله أولًا: تنفيذ ملفات SQL في لوحة
Supabase (قسم "User action required" أدناه)، تعطيل تأكيد البريد للاختبار، ثم إعادة
بناء التطبيق فعليًا — الغالبية العظمى من المواصفة لم تُنفَّذ بعد.

---

## Verdict: **FIX-FIRST** (do not ship)

The workspace contains a create-next-app scaffold plus solid foundations (all required
dependencies, spec-matching Supabase client helpers, correct brand tokens/font/logo,
and migration SQL covering all 17 tables with RLS enabled). However, **no part of the
actual product exists**: the landing page is 0/12 sections, there are no auth pages,
no dashboards, no i18n routing (`/ar` and `/en` both 404), no root `middleware.ts`,
and the live Supabase project has **none of the tables** (migrations were never run).
The build passes with zero TS errors and Supabase Auth responds (a test signup
succeeded via the Auth API), but every functional flow is blocked. This is a
foundation, not a platform.

## Score summary

| Phase | Checks passed | Notes |
|---|---|---|
| 1 — Static audit | 9 / 24 | Foundations good; i18n, middleware, several RLS areas fail |
| 2 — Build & run | 3 / 3 | Build ✅, lint ✅, dev server ✅ |
| 3 — Landing page | 0 / 23 | Only the default scaffold `/` renders; everything else 404 |
| 4 — Functional flows | 0 / 9 | 1 partial: Auth API signup works; all else BLOCKED |
| 5 — Non-functional | 2 / 8 | No secret leakage ✅, .env ignored ✅; RTL/i18n hardcoded |
| **Total** | **14 / 67** | |

---

## Phase 1 — Static audit

| # | Check | Result | Evidence |
|---|---|---|---|
| 1.1 | Project root located | PASS | `D:\ensaf\package.json` |
| 1.2 | `@supabase/supabase-js`, `@supabase/ssr`, `next-intl`, `recharts`, `framer-motion`, `lottie-react`, `lucide-react`, `react-hook-form`, `zod` present | PASS | `package.json:11-29` — all present. Note: `shadcn` CLI listed as a runtime dependency (should be dev/CLI-only) and nonstandard `cn` package used instead of `clsx` + `tailwind-merge` (`src/lib/utils.ts:1`) — WARNING |
| 1.3a | `utils/supabase/server.ts` | PASS | `src/utils/supabase/server.ts` — matches spec (async cookie variant) |
| 1.3b | `utils/supabase/client.ts` | PASS | `src/utils/supabase/client.ts` — matches spec |
| 1.3c | `utils/supabase/middleware.ts` | PASS | `src/utils/supabase/middleware.ts` (exports `updateSession`) |
| 1.3d | Root `middleware.ts` protecting `/dashboard/*`, `/admin/*` | **FAIL** | File does not exist; no route protection anywhere |
| 1.3e | `.env.local` with both vars | PASS | Both vars present (values masked); `.env.example` has empty placeholders; `.gitignore` covers `.env*` |
| 1.3f | `config/brand.ts` | PASS | `src/config/brand.ts` — name, latin name, tagline, regulatory line in one file |
| 1.4a | All 17 spec tables in migration | PASS | `supabase/migrations/0001_init.sql` — 18 tables incl. roles/permissions/role_permissions; `public_cases` view present |
| 1.4b | RLS enabled on every table | PASS | `0001_init.sql:263-280` — 18 × `ENABLE ROW LEVEL SECURITY` |
| 1.4c | ≥1 policy per table | **FAIL** | `case_reviews`, `notifications`, `contact_messages` have **zero** policies; no INSERT policies for `profiles` (backstop), `cases`, `case_documents`, `investments`, `transactions`, `audit_logs` → all app writes would be rejected. Fixed by QA in `0003_rls_fixes.sql` |
| 1.4d | `has_permission()` SECURITY DEFINER + used by policies | PASS | `0001_init.sql:49-56`, used throughout policies |
| 1.4e | Seed: permissions, 7 roles, demo cases/partners/clients/FAQs/testimonials/settings | **FAIL** | `0002_seed.sql`: 14 permissions ✅, 7 roles ✅, settings ✅ — but only 3/6 partners, 3/8 FAQs, **no clients, no testimonials, no demo cases, no demo notifications**; `operations`, `finance`, `compliance`, `investor_relations`, `case_analyst` roles get **zero permissions** assigned |
| 1.4f | SQL syntax / FKs / lockout review | WARNING | `cases.applicant_id` is `NOT NULL` FK → `profiles` → `auth.users`: demo seed cases are impossible without a real auth user. Storage buckets + storage RLS (spec §5.4) missing entirely — added by QA in `0003_rls_fixes.sql` |
| 1.5a | `messages/ar.json` + `en.json` exist | WARNING | Both exist but are 2-key stubs; next-intl is not wired (no `i18n` config, no `[locale]` segment) |
| 1.5b | Hardcoded strings in components | N/A | Only 2 components exist (`logo.tsx` hardcodes the brand name — acceptable; `ui/button.tsx` is a primitive). Nothing else to check |
| 1.6a | Primary `#0E5B34` in theme | PASS | `src/app/globals.css:76` (Tailwind v4 CSS-first config, no `tailwind.config.ts` — correct for TW4) |
| 1.6b | IBM Plex Sans Arabic loaded | PASS | `src/app/layout.tsx:2-9` via `next/font/google`, weights 300–700 |
| 1.6c | Logo component | PASS | `src/components/brand/logo.tsx` — gold-ring seal + scales icon, light/dark variants |
| 1.6d | Footer «قيد الترخيص» line | **FAIL** | String exists in `brand.ts:7` but **no footer component exists** to render it |
| 1.6e | No fake "licensed/authorized" claims | PASS | Grep for `licensed\|authorized\|مرخص\|معتمد` across `src/` — no matches |

## Phase 2 — Build & run

| # | Check | Result | Evidence |
|---|---|---|---|
| 2.1 | Dependencies installed | PASS | `node_modules` present, install clean |
| 2.2 | `npm run build` zero TS errors | PASS | `✓ Compiled successfully`, `Finished TypeScript` — no errors (Next.js 16.3.4, Turbopack) |
| 2.3 | `npm run lint` | PASS | eslint exits clean (very little code to lint) |
| 2.4 | `npm run dev` serves app | PASS | Dev server responded on `http://localhost:3000` |

## Phase 3 — Landing page (12 sections + public pages)

**All FAIL.** `/` renders the untouched create-next-app template (screenshot
`qa/screenshots/landing-root-desktop.png`). `/ar` and `/en` return 404
(`qa/screenshots/route-ar-404.png`).

| Route | HTTP | Result |
|---|---|---|
| `/` | 200 | Default Next.js scaffold page — none of the 12 sections |
| `/ar`, `/en` | 404 | FAIL — no `[locale]` routing exists |
| `/opportunities`, `/opportunities/[id]`, `/how-it-works`, `/about`, `/contact`, `/terms`, `/privacy`, `/risk-disclosure` | 404 | FAIL ×8 |
| `/login`, `/register` | 404 | FAIL ×2 |
| `/dashboard`, `/admin`, `/committee` | 404 | FAIL ×3 |

Sections: Header/nav ❌ · Hero ❌ · Stats bar ❌ · How it works ❌ · For case owners ❌ ·
For investors + risk strip ❌ · Featured opportunities ❌ · Why us/security ❌ ·
Partners marquee ❌ · Clients/testimonials ❌ · FAQ accordion ❌ · Final CTA + footer ❌ —
**0/12.** Language switcher: does not exist. Animations (Lottie/GIF/SVG): none
(libraries installed but unused).

## Phase 4 — Functional flows

Method: browser automation was pointless (no UI), so the live Supabase project was
tested directly via its REST/Auth APIs using the publishable key.

| # | Flow | Result | Evidence |
|---|---|---|---|
| 4.0 | Supabase project reachable | PASS | `GET /auth/v1/health` → 200 |
| 4.0b | Schema deployed on live DB | **BLOCKED** | `rest/v1/faqs`, `profiles`, `public_cases` → `PGRST205 "Could not find the table"` — **migrations 0001–0003 have never been run** |
| 4.1a | Register investor (Auth API) | PARTIAL | Signup succeeded: user `00c21463-…` created with `user_type: investor` metadata. Profile-row creation unverifiable (no tables). `/register` UI does not exist |
| 4.1b | Login after register | **BLOCKED** | `email_not_confirmed` — email confirmation is ON in Supabase Auth; the QA mailbox is unreachable. Disable "Confirm email" for testing (see §User action) |
| 4.2 | RBAC role-builder (create role → assign → scope enforced) | **BLOCKED** | No admin UI, no auth, no tables |
| 4.3 | Applicant case-submission wizard + doc upload | **BLOCKED** | No UI; storage buckets missing (added in `0003_rls_fixes.sql`, not yet applied) |
| 4.4 | Committee review → approve → marketplace | **BLOCKED** | No UI; `case_reviews` had zero RLS policies (fixed in `0003_rls_fixes.sql`) |
| 4.5 | Investor invests → wallet locked → progress | **BLOCKED** | No UI, no tables |
| 4.6 | Flow repeated in English locale | **BLOCKED** | No i18n |
| 4.7 | Notification in bell dropdown | **BLOCKED** | No UI; `notifications` had zero RLS policies (fixed in `0003_rls_fixes.sql`) |
| 4.8 | CMS: edit FAQ / approve testimonial → landing | **BLOCKED** | No admin UI, no landing |
| 4.9 | Contact form → `contact_messages` | **BLOCKED** | No `/contact` page; table had zero policies (fixed in `0003_rls_fixes.sql`) |

## Phase 5 — Non-functional checks

| # | Check | Result | Evidence |
|---|---|---|---|
| 5.1 | Responsive 390px, no h-scroll | WARNING | Scaffold page at 390px shows content clipped (`qa/screenshots/landing-root-mobile-390.png`) because `dir="rtl"` is hardcoded onto LTR English template content. Real pages don't exist to test |
| 5.2 | RTL sidebar right / LTR left | **FAIL** | `layout.tsx:22` hardcodes `lang="ar" dir="rtl"` for ALL locales; no per-locale switching exists |
| 5.3 | `/admin/*`, `/dashboard/*` redirect when logged out | **FAIL** | No root `middleware.ts`; routes don't exist at all (404, not 302→login) |
| 5.4 | No `service_role` key client-side | PASS | Grep across `src/` — clean; only publishable key used |
| 5.5 | RLS enabled per Phase 1.4 | PASS (with gaps) | Enabled on all 18 tables; policy gaps fixed in `0003_rls_fixes.sql` |
| 5.6 | a11y smoke (lang/dir, alt, focus) | WARNING | `lang`/`dir` attributes present but hardcoded; scaffold images have alts; no menus exist to keyboard-test |
| 5.7 | No console errors on landing | PASS (trivial) | Static scaffold page renders without errors |
| 5.8 | Images optimized | PASS (trivial) | Scaffold uses `next/image`; no real images exist |

---

## Bugs found

| Sev | Description | Location | Fixed by |
|---|---|---|---|
| BLOCKER | Entire application missing: no landing (0/12 sections), no auth pages, no dashboards, no i18n routing, no public sub-pages. Only the create-next-app template at `/` | `src/app/` (only `layout.tsx`, `page.tsx`) | build-AI |
| BLOCKER | Migrations never applied to live Supabase — all tables missing (`PGRST205`) | live DB | **user** (paste SQL, see below) |
| BLOCKER | Root `middleware.ts` missing — no session refresh, no route protection | project root | build-AI |
| BLOCKER | next-intl not wired: stub message files, no `[locale]` segment, no request config | `messages/`, `src/app/` | build-AI |
| MAJOR | `case_reviews`, `notifications`, `contact_messages` had zero RLS policies (fully locked out) | `supabase/migrations/0001_init.sql` | **QA — fixed in `0003_rls_fixes.sql`** |
| MAJOR | No INSERT policies for `profiles`/`cases`/`case_documents`/`investments`/`transactions`/`audit_logs` — all legitimate app writes would be rejected | `0001_init.sql` | **QA — fixed in `0003_rls_fixes.sql`** |
| MAJOR | Storage buckets (`case-documents`, `avatars`, `content-media`) + storage RLS missing (spec §5.4) | `0001_init.sql` | **QA — fixed in `0003_rls_fixes.sql`** |
| MAJOR | Seed incomplete vs spec: no demo cases, no clients, no testimonials, 3/6 partners, 3/8 FAQs, no demo notifications; 5 of 7 roles have zero permissions | `0002_seed.sql` | build-AI |
| MAJOR | `cases.applicant_id NOT NULL` FK to `auth.users` makes seeding demo cases impossible without a real auth user | `0001_init.sql:63` | build-AI (seed demo cases after creating a demo applicant user, or make nullable) |
| MAJOR | Email confirmation enabled in Supabase Auth blocks all login-based testing | Supabase dashboard | **user** (toggle off for testing) |
| MINOR | `layout.tsx` hardcodes `lang="ar" dir="rtl"` globally — English pages would render RTL | `src/app/layout.tsx:22` | build-AI |
| MINOR | `shadcn` CLI is a runtime dependency; nonstandard `cn` package instead of `clsx`+`tailwind-merge` | `package.json:17,27`, `src/lib/utils.ts:1` | build-AI |
| MINOR | README is the default create-next-app file (spec §11 requires setup steps) | `README.md` | build-AI |
| INFO | Wallet mutations should go through a `SECURITY DEFINER` function (e.g. `invest_in_case`) rather than direct client `UPDATE wallets` — deliberate; not added to avoid giving users direct balance-write access | — | build-AI |

## Fixes applied by QA (complete list)

1. **Created `supabase/migrations/0003_rls_fixes.sql`** — idempotent migration adding:
   - INSERT policy on `profiles` (trigger backstop); INSERT/UPDATE for applicant-owned
     `cases`; staff case-update policy
   - INSERT on `case_documents` for case owners
   - Full RLS for `case_reviews` (committee read/insert), `notifications` (owner
     read/update, staff broadcast), `contact_messages` (public insert, staff read/update)
   - INSERT on `investments` (own), `transactions` (own), `audit_logs` (own actor)
   - Storage buckets `case-documents` (private), `avatars` (public), `content-media`
     (public) + `storage.objects` policies
   No other files were modified. No app code was written — the missing application is
   the build-AI's scope, not a QA fix.

## User action required

1. **Apply migrations** — Supabase Dashboard → SQL Editor → paste and run, in order:
   1. `supabase/migrations/0001_init.sql`
   2. `supabase/migrations/0002_seed.sql`
   3. `supabase/migrations/0003_rls_fixes.sql`
2. **Disable email confirmation for testing** — Supabase Dashboard → Authentication →
   Sign In / Providers → Email → turn OFF "Confirm email". (Re-enable before launch.)
3. **Delete QA test user** — Authentication → Users → delete
   `qa.investor.1789056086@gmail.com` (id `00c21463-0898-4494-89ad-42c259d6b513`),
   created by this test run.
4. **Create the first admin** — after registering through the app (once it exists), run:
   ```sql
   UPDATE profiles
   SET role_id = (SELECT id FROM roles WHERE slug = 'super_admin'), user_type = 'staff'
   WHERE email = 'YOUR-EMAIL';
   ```
5. No missing API keys — the publishable key is present and working.

## Screenshots index (`qa/screenshots/`)

| File | Shows |
|---|---|
| `landing-root-desktop.png` | `/` at 1440px — default create-next-app page (not the product) |
| `landing-root-mobile-390.png` | `/` at 390px — scaffold content clipped by hardcoded RTL |
| `route-ar-404.png` | `/ar` — 404, no locale routing exists |

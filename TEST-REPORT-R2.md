# TEST REPORT — ROUND 2 — INSAF Litigation-Funding Platform

Date: 2026-09-10 · Tester: automated QA agent · Project root: `D:\ensaf` · Round 1: `TEST-REPORT.md` (14/67)

---

## ملخص تنفيذي (عربي)

**الحكم: FIX-FIRST — ما زال غير جاهز، لكن القفزة حقيقية.**

تقدّم واضح عن الجولة الأولى: أصبحت كل المسارات تعمل (200)، الترجمة مربوطة فعليًا
(`/ar` بالعربية RTL و`/en` بالإنجليزية LTR مع `lang`/`dir` صحيحين لكل لغة)، ملف
middleware موجود ويحمي المسارات من غير المسجّلين (إعادة توجيه 307 لتسجيل الدخول)،
الهجرات طُبِّقت على قاعدة البيانات الحية، تسجيل حساب جديد يعمل فعليًا من الواجهة
(303 → `/ar/dashboard`) وينشئ صف profile + محفظة تلقائيًا، ودالة `invest_in_case`
الآمنة موجودة وترفض المبالغ السالبة وتجاوز السعة ورصيد غير الكافي، وفحوصات RLS
الهجومية كلها نجحت (مستثمر لا يرى قضايا غير منشورة ولا ملفات الآخرين ولا محافظهم).

**لكن:** لوحات التحكم الثلاث (مستثمر/مقدم/لجنة/إدارة) مجرد صفحات placeholder نصها
«محتوى هنا»؛ **منشئ الأدوار والصلاحيات (الميزة الرئيسية) غير موجود إطلاقًا** — صفحة
الإدارة تقول حرفيًا «قيد التنفيذ هنا»؛ **لا يوجد أي فحص صلاحيات للصفحات** — أي
مستثمر مسجّل يفتح `/ar/admin` و`/ar/committee` بنجاح (200)؛ **ثغرة رفع صلاحيات
مؤكدة حيًّا**: أي مستخدم يستطيع تحويل نفسه إلى `staff` عبر تحديث صفّه (أضفت
`0006_profile_update_lockdown.sql` لإصلاحها — يجب تطبيقها)؛ صفحة الهبوط هيكليًا
فيها 12 قسمًا لكن المحتوى ثابت مكتوب في الكود (البطاقات الثلاث متطابقة، الأسئلة
الشائعة بالعربية حتى في النسخة الإنجليزية، الشريكاء مربعات رمادية) و**أزرارها لا
تنقل لأي مكان** (تسجيل الدخول/ابدأ الآن/روابط الفوتر القانونية كلها بلا روابط) ولا
يوجد مبدّل لغة — ملاحظتك عن التنقل والتصميم صحيحة وموثقة أدناه. كما أن البيانات
المزروعة مكررة (9 شركاء بدل 6، و11 سؤال شائع بدل 8) لأن الهجرة 0002 نُفِّذت مرتين.

الخلاصة: الأساس (بنية، مصادقة، RLS، قاعدة بيانات) أصبح سليمًا؛ **التطبيق نفسه —
اللوحات، منشئ الصلاحيات، معالج تقديم القضية، الاستثمار من الواجهة، CMS — لم يُبنَ
بعد.** قائمة العمل المتبقي في نهاية التقرير.

---

## Verdict: **FIX-FIRST**

Real progress over Round 1: all locale routes render (200), i18n is genuinely wired
with per-locale `lang`/`dir`, middleware exists and redirects logged-out users
(307 → login, locale preserved), migrations 0001–0005 are applied to the live DB,
registration works end-to-end through the real server action (303 → dashboard,
profile + wallet rows created by trigger), email confirmation is OFF, and the
`invest_in_case` SECURITY DEFINER RPC correctly rejects bad amounts, over-capacity,
and insufficient balance with row locking. RLS attack probes all held.

But the product itself is still not built: all dashboards (investor / applicant /
committee / admin) are placeholder stubs; the flagship **Roles & Permissions builder
does not exist** (admin page literally says "under implementation here"); **no
role-based page guard exists** — a logged-in investor opens `/ar/admin` and
`/ar/committee` with HTTP 200; a **live privilege-escalation hole** was proven (any
user can set their own `user_type='staff'` / `kyc_status` / `role_id` via a profile
update — fix provided in `0006_profile_update_lockdown.sql`, not yet applied); the
landing page's 12 sections exist structurally but with hardcoded placeholder content
and **dead navigation** (Login/Start-Now/hero CTAs/footer legal links go nowhere —
confirming the reporter's complaint), and there is **no language switcher**.
SHIP bar is not met: flows C.4–C.8 cannot pass because the features don't exist.

## Score summary

| Phase | Passed | vs Round 1 |
|---|---|---|
| 1 — Static audit | 17 / 24 | was 9 / 24 |
| 2 — Build & run | 3 / 4 (build passes after QA fix; lint has 7 errors) | was 3 / 3 |
| 3 — Landing & routes | 12 / 23 (routes all 200; sections present but hardcoded; no switcher; dead links) | was 0 / 23 |
| 4 — Functional flows | 3 / 9 (C.1, C.2, C.9 pass; C.4–C.8 features absent) | was 0 / 9 |
| 5 — Attack surfaces / non-functional | 8 / 14 (RLS reads held; privesc + no role guard fail) | was 2 / 8 |
| **Total** | **43 / 74** | was 14 / 67 |

## B. Regression table (Round-1 findings re-verified)

| R1 item | Status | Evidence |
|---|---|---|
| Landing 0/12 sections | **FIXED (structure) / PARTIAL (content)** | All 12 sections render (`qa/screenshots/r2/landing-ar-full.png`) but featured cards ×3 identical hardcoded, FAQ hardcoded Arabic in both locales, partners = gray boxes, stats hardcoded (not `platform_settings`) |
| All routes 404 | **FIXED** | `/ar`,`/en`,`/opportunities`,`/opportunities/[id]`,`/how-it-works`,`/about`,`/contact`,`/terms`,`/privacy`,`/risk-disclosure`,`/login`,`/register`,`/forgot-password` → 200; `/` → 307 `/ar`. **But most are one-line stubs** (contact has no form; opportunities is a title) |
| No root middleware | **FIXED (auth) / PARTIAL (roles)** | `src/middleware.ts` redirects logged-out `/dashboard`,`/admin`,`/committee` → `/{locale}/login?redirect_to=...` (verified 307). But no role check: logged-in investor gets 200 on `/ar/admin` (see bugs). `/admin` without locale → 404 (matcher misses it) |
| next-intl not wired | **FIXED** | `src/i18n/routing.ts` + `request.ts` + `[locale]` segment; `<html lang dir>` per-locale verified in served HTML. Layout no longer hardcodes `dir` |
| Seed gaps | **FIXED with NEW-ISSUE** | Live DB: partners **9** (spec 6), FAQs **11** (spec 8) — `0002_seed.sql` was executed twice (content inserts lack `ON CONFLICT`); clients 8 ✓, testimonials 6 ✓, cases 8 ✓, demo notification ✓. The 5 empty roles now have permissions (verified in `0005_seed_completion.sql:24-46`; live per-role counts not verifiable with publishable key — roles table is staff-only) |
| `applicant_id` NOT NULL blocker | **FIXED** | `0005_seed_completion.sql:5` drops NOT NULL; 8 demo cases live without applicants |
| Money via RPC | **FIXED** | `invest_in_case` SECURITY DEFINER exists and is live; no `.from('wallets').update` anywhere in `src/` (grep clean). Live RPC tests: rejects insufficient balance / over-capacity / negative amounts ✓ |
| 0003 untouched | **FIXED (untouched)** | `0003_rls_fixes.sql` mtime + content unchanged; new SQL in `0004_*`, `0005_*` only |
| Minor fixes (clsx/tailwind-merge, shadcn dep, README) | **FIXED** | `clsx`+`tailwind-merge` in deps, `shadcn` moved to devDependencies, `src/lib/utils.ts` standard; README is a real setup guide with SQL order + admin-promotion SQL |

## Phase 3 detail — landing page (12 sections)

| # | Section | Result | Evidence |
|---|---|---|---|
| 1 | Header | PARTIAL | Sticky ✓, links ✓ (in-page anchors), **no language switcher**, **Login & Start-Now buttons are dead** (`LandingPage.tsx:26-27` — plain `<Button>` with no link), no mobile drawer (nav just hides) |
| 2 | Hero | PARTIAL | Tagline ✓, 2 CTAs (dead), framer-motion explainer ✓, trust chips ✓ (emoji icons, not lucide) |
| 3 | Stats bar | PARTIAL | 4 stats render but **hardcoded**, not from `platform_settings` (`LandingPage.tsx:62-65`) |
| 4 | How it works | PASS(ish) | 4 step cards, each with animated icon ✓ |
| 5 | For case owners | PASS(ish) | Benefits + CTA (dead) + animated illustration ✓ |
| 6 | For investors | PASS(ish) | Benefits + risk disclaimer strip (coral) ✓ — hard requirement met visually |
| 7 | Featured opportunities | **FAIL(content)** | 3 identical hardcoded cards "Construction Contract Dispute / 65%" — NOT from `public_cases` (`LandingPage.tsx:140-164`); View-details dead |
| 8 | Why us / security | PASS(ish) | 4 features with shield animation ✓ |
| 9 | Partners marquee | **FAIL** | 4 gray placeholder divs, no CMS, no marquee (`LandingPage.tsx:184-195`) |
| 10 | Clients + testimonials | **FAIL** | Same gray boxes; no testimonial carousel at all |
| 11 | FAQ accordion | PARTIAL | Accordion works but **3 hardcoded Arabic items even on `/en`**, not CMS-driven, spec wants 8 |
| 12 | Final CTA + footer | PARTIAL | Dark-green band ✓, «قيد الترخيص لدى الجهات المختصة» ✓, **legal links `href="#"` — dead** (`LandingPage.tsx:238-240`) |

User-reported complaint **verified**: the landing page barely navigates — only the 5
in-page anchors and the logo-less nav work; every CTA (Login, Start now, hero CTAs,
section CTAs, View details, footer Terms/Privacy/Risk) is a dead button/`#` link.
Design is bare-bones: emoji instead of icon set, placeholder boxes, no marquee,
no carousel, no counters animation, hero explainer hardcodes Arabic text that also
shows on `/en` (`animation.tsx:62`, `:107`).

## Phase 4 detail — functional flows (method noted per item)

| # | Flow | Result | Evidence |
|---|---|---|---|
| C.1 | Setup state | PASS | All tables + `invest_in_case` live on Supabase (REST probes) |
| C.2 | Auth chain | **PASS** (UI-level) | Registered real applicant via the actual `/ar/register` server action → 303 → `/ar/dashboard`; profile row `user_type=applicant` + wallet row created by trigger; investor login via real action → 303 + session cookie → `/ar/dashboard`; wrong password → 303 `/ar/login?error=Invalid credentials`; logged-out protected hits → 307 login. **Defects:** register form lacks full-name/phone → `full_name_ar` NULL in DB (spec requires); `redirect_to` is ignored by `login()` (`src/app/actions/auth.ts`) |
| C.3 | Admin bootstrap | BLOCKED (moot) | No admin exists; README documents promotion SQL (user must run). Moot because `/admin` is a stub anyway |
| C.4 | RBAC builder (flagship) | **FAIL — feature absent** | `/ar/admin` renders "منشئ الصلاحيات (Roles & Permissions Builder) قيد التنفيذ هنا." No role CRUD, no permission matrix, no `/admin/users` page (Sidebar links to it → 404). Sidebar is static for everyone, not permission-driven. **And no server-side role guard:** investor session → `GET /ar/admin` = 200 with admin content (cookie-jar verified). Middleware line 32 has a literal `TODO` for this |
| C.5 | End-to-end business chain | **FAIL(UI absent) / PARTIAL(DB)** | No case wizard, no committee UI, no invest modal. DB layer verified instead: applicant case INSERT works (own row, `submitted`, invisible to anon ✓); RPC rejects all invalid invests ✓. **Happy-path invest is untestable: no way to credit a wallet** (no deposit RPC/stub; users can't UPDATE wallets by design) |
| C.6 | CMS loop | **FAIL** | No admin CMS UI; landing FAQ/featured/partners are hardcoded, so even a direct DB edit would NOT show on landing |
| C.7 | Notifications | **FAIL** | No bell UI; no DB trigger creates notifications on invest/approval; live DB probe also shows the `audit_logs` INSERT policy from 0003 is **not active** (re-applied in 0006) |
| C.8 | Contact form | **FAIL(UI) / PASS(DB)** | `/contact` is a one-line stub, no form. DB level: anon INSERT into `contact_messages` → 201 ✓ (0003 policy live; needed a PostgREST cache reload — first attempts 42501 then succeeded) |
| C.9 | Locale repeat | PASS | `/en` renders LTR English chrome; per-locale `dir` verified in HTML. (Login/register/dashboard stub text stays Arabic — untranslated) |

## Phase 5 detail — attack surfaces & non-functional

| Check | Result | Evidence |
|---|---|---|
| RLS: investor reads others' profiles / case_reviews / non-public cases / investments / wallets | PASS | All return `[]` (live probes with real investor JWT) |
| RLS: anon reads same | PASS | All `[]` |
| Direct wallet write (anon + investor) | PASS | Denied / no-op; only the RPC path can move money |
| **Profile self-update privilege escalation** | **FAIL (critical)** | Investor PATCHed own row → `user_type:'staff'` returned 200 (then reverted). Same hole covers `role_id` and `kyc_status='verified'`. Root cause: 0001 policy "Users can update own profile" has no column restriction. **Fix: `supabase/migrations/0006_profile_update_lockdown.sql` (QA) — must be applied** |
| RPC numeric integrity | PASS | Row-locked (`FOR UPDATE`), capacity check, positive-amount check, balance check, atomic transaction — all verified live |
| Double-click / concurrency safety | PASS (design) | `FOR UPDATE` locks on case + wallet rows in `invest_in_case` (`0004:21,41`) |
| Upload abuse | PASS(ish) | Anon upload → 403 ✓; anon bucket list → empty ✓; private bucket ✓. Authenticated users can upload anywhere in `case-documents` (no per-case path scoping on INSERT) and **no file-type/size validation anywhere** — WARNING |
| `'use client'` importing server Supabase | PASS | grep clean |
| `service_role` client-side | PASS | grep clean |
| Type-safety theater | PASS(ish) | 4 `as any` total (i18n locale checks + translation-key template literals) — but 3 of them are **lint errors** (see below) |
| Lint | **FAIL** | 7 errors: `no-explicit-any` ×3, `no-require-imports` in `update_layouts.js` (leftover codegen script — also `generate_dashboards.js`, `generate_pages.js` at repo root), plus 5 warnings |
| Middleware locale edge | PARTIAL | `/{locale}/dashboard/wallet` deep-link: `redirect_to` preserved in login URL ✓ but `login()` ignores it after sign-in ✗; `/admin` (no locale) → 404 ✗ |
| Responsive 390px | **FAIL** | Hero headline clips horizontally (`qa/screenshots/r2/landing-ar-mobile390.png`); no hamburger drawer; dashboard sidebar is fixed `w-64` with no mobile collapse |
| RTL/LTR | PASS (landing) / PARTIAL (app) | Landing flips correctly; sidebar uses logical flow (right in ar / left in en) ✓; login/register/dashboard content untranslated |
| prefers-reduced-motion | **FAIL** | No `useReducedMotion` / media-query handling anywhere; infinite framer-motion loops always run |
| Build hygiene | PARTIAL | Build passes with **zero** TS errors (after QA fix); no new suppressions introduced; but middleware deprecation warning (Next 16 wants `proxy` convention) and lint errors remain |

## Bugs found (severity · file:line · owner)

| Sev | Bug | Location | Owner |
|---|---|---|---|
| BLOCKER | Roles & Permissions builder + entire admin/committee/dashboard functionality absent (stubs) | `src/app/[locale]/admin/page.tsx:11`, `dashboard/page.tsx`, `committee/page.tsx` | build-AI |
| BLOCKER | No role-based page guard — any logged-in user opens `/ar/admin`, `/ar/committee` (200) | `src/middleware.ts:32` (admits TODO); layouts have no guard | build-AI |
| BLOCKER | Privilege escalation: users can self-update `user_type`/`role_id`/`kyc_status` (proven live) | `supabase/migrations/0001_init.sql:284` | **QA fix written** (`0006`) — user must apply |
| MAJOR | Landing CTAs/nav dead: Login, Start now, hero CTAs, section CTAs, View details, footer legal links all have no destination | `LandingPage.tsx:26-27,43-44,108,127,161,229-230,238-240` | build-AI |
| MAJOR | No language switcher anywhere (spec §7.1 hard requirement) | `LandingPage.tsx:15-30` | build-AI |
| MAJOR | Landing content hardcoded, not CMS: featured ×3 identical, FAQ (Arabic even on /en), stats, partners/clients boxes | `LandingPage.tsx:62-65,140-164,184-220` | build-AI |
| MAJOR | Register form missing full name + phone → NULL in DB (spec §6.1) | `src/app/[locale]/register/page.tsx` | build-AI |
| MAJOR | No wallet-funding path at all → invest flow can never succeed (no deposit RPC/stub) | — | build-AI |
| MAJOR | Lint: 7 errors | `LandingPage.tsx:86,177`, `src/i18n/request.ts:7`, `update_layouts.js:1` | build-AI |
| MAJOR | Seed duplicates live: partners 9 (dup sort 1–3), FAQs 11 | `0002_seed.sql` run twice; inserts lack `ON CONFLICT` | user cleanup (SQL below) + build-AI make seeds idempotent |
| MINOR | `login()` ignores `redirect_to`; `/admin` without locale → 404 | `src/app/actions/auth.ts`, `src/middleware.ts:45` | build-AI |
| MINOR | Auth pages & dashboard stubs Arabic-only on `/en` | login/register/dashboard pages | build-AI |
| MINOR | No `prefers-reduced-motion` handling | `src/components/brand/animation.tsx` | build-AI |
| MINOR | No upload type/size validation; case-documents INSERT not path-scoped | storage policies (0003) | build-AI/QA note |
| MINOR | Leftover codegen scripts at repo root; middleware→proxy deprecation warning | `generate_*.js`, `update_layouts.js`; `src/middleware.ts` | build-AI |
| MINOR | Public subpages are one-line stubs (no real content, no contact form) | `src/app/[locale]/{contact,about,terms,privacy,risk-disclosure,how-it-works,opportunities}/page.tsx` | build-AI |
| INFO | `audit_logs` INSERT policy from 0003 not active on live DB (re-applied in 0006; likely PostgREST cache at apply time) | live DB | user (apply 0006) |

## Fixes applied by QA in Round 2 (complete list)

1. **`src/app/actions/auth.ts`** — `login()`/`register()` returned `{error}` objects,
   which TypeScript rejects for form actions: **the production build FAILED with 2
   errors**. Changed both to `redirect(...?error=<msg>)`. Minimal change; build now
   passes; wrong-password flow verified live (303 → `/ar/login?error=...`).
2. **Created `supabase/migrations/0006_profile_update_lockdown.sql`** — closes the
   proven privilege-escalation hole: revokes table-wide `UPDATE` on `profiles` from
   `authenticated`, grants only safe self-service columns, adds SECURITY DEFINER
   `admin_set_user_role()` / `admin_set_kyc_status()` gated by `users.manage`, and
   re-applies the inactive `audit_logs` insert policy.
3. Killed a stale orphaned dev server (PID 30012) occupying port 3000.

No other files modified. No test coverage faked; UI-absent flows are marked FAIL,
DB-untestable paths marked BLOCKED, not passed.

## User action required

1. **Apply the security fix now** — SQL Editor → run `supabase/migrations/0006_profile_update_lockdown.sql`.
2. **Clean duplicated seed rows** (0002 ran twice):
   ```sql
   DELETE FROM partners a USING partners b
     WHERE a.id > b.id AND a.name_en = b.name_en;
   DELETE FROM faqs a USING faqs b
     WHERE a.id > b.id AND a.question_en = b.question_en;
   ```
3. **Delete QA test data** — Authentication → Users: `qa.r2.1789060744@gmail.com`
   (id `343b3bd4-…`), `qa.ui.reg.1789061829@gmail.com`; and in SQL Editor:
   ```sql
   DELETE FROM cases WHERE case_number = 'QA-R2-001';
   DELETE FROM contact_messages WHERE email IN ('qa@r2.test','q@q.q');
   -- Storage → case-documents bucket → delete folder qa-test/ (RLS blocked QA from deleting it)
   ```
4. **Create the first admin** only after the app has an admin UI worth entering:
   ```sql
   UPDATE profiles SET role_id = (SELECT id FROM roles WHERE slug='super_admin'),
     user_type='staff' WHERE email='YOUR-EMAIL';
   ```
5. Remaining work for the build-AI (precise): real dashboards (investor/applicant/
   committee) with data; **RBAC builder UI + server-side role guards in
   `middleware.ts`/layouts**; case-submission wizard with storage upload;
   committee scoring flow; invest modal calling `invest_in_case` + a demo deposit
   RPC; CMS CRUD wired to landing (featured cases from `public_cases`, FAQ from
   `faqs`, partners/clients/testimonials from DB); language switcher; real links on
   every CTA; register full-name/phone fields; notification triggers + bell; contact
   form; real public subpages; mobile drawer + responsive fixes; reduced-motion;
   lint cleanup; delete `generate_*.js`/`update_layouts.js`.

## Screenshots index (`qa/screenshots/r2/`)

| File | Shows |
|---|---|
| `landing-ar-desktop.png` | `/ar` top 1440px — RTL Arabic landing renders |
| `landing-en-desktop.png` | `/en` top — LTR English landing renders |
| `landing-ar-full.png` | `/ar` full height — all 12 sections present structurally; hardcoded cards/FAQ/gray partner boxes visible |
| `landing-en-full.png` | `/en` full height — note Arabic FAQ + Arabic strings inside animation components |
| `landing-ar-mobile390.png` | 390px — hero headline clipped, no hamburger menu |

---

## Delta vs Round 1 (one line per R1 finding)

- Build fails/passes → **REGRESSED-then-FIXED-BY-QA**: R2 code shipped with 2 TS errors; QA fixed (`auth.ts`), build green.
- Landing 0/12 → **FIXED structurally, STILL-FAILING on CMS content + navigation + switcher**.
- All routes 404 → **FIXED** (all 200; most are stubs).
- No root middleware → **FIXED for auth; NEW-ISSUE: no role guard, `/admin` no-locale 404**.
- next-intl not wired → **FIXED** (per-locale `lang`/`dir` verified).
- Seed gaps → **FIXED + NEW-ISSUE: duplicate rows (0002 run twice)**.
- `applicant_id` NOT NULL → **FIXED** (dropped NOT NULL, demo cases live).
- Money via RPC → **FIXED** (`invest_in_case` live, attack probes pass).
- 0003 untouched → **FIXED/verified**; NEW-ISSUE: its `audit_logs` insert policy inactive live (re-applied in 0006).
- Minor fixes (deps/README) → **FIXED**.
- RLS policies → mostly FIXED; **NEW-ISSUE (critical): profile self-update privilege escalation — proven live, fix in 0006 awaiting user apply**.
- NEW-ISSUE: lint 7 errors; leftover codegen scripts; dead landing navigation; no language switcher; register missing name/phone; no wallet-deposit path; no reduced-motion; mobile clipping.

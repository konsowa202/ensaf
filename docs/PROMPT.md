# MASTER PROMPT — Build a Litigation-Funding Platform (Saudi Arabia / GCC)

> Copy this entire document into the AI coding tool and execute it section by section.
> Do not skip the Database & RLS part. Do not hardcode secrets.

---

## 1. ROLE

You are a senior full-stack engineer + product designer. You will build a complete,
production-grade web application: a **litigation funding platform for the Saudi and GCC
market** (the business model of AxiaFunder in the UK and LexShares in the US, localized
for Saudi Arabia): investors fund strong legal cases and earn a share of the recovery;
case owners get their litigation costs financed.

Working brand name: **"إنصاف / INSAF"** — put the brand name, latin name, and tagline in
ONE config file (`config/brand.ts`) so it can be switched to "يقين / YAQEEN" by editing
one constant. Tagline: **«القضية أصبحت قضيتك»** / "The case became your case".

---

## 2. TECH STACK (non-negotiable)

- **Next.js 14+ (App Router) + TypeScript** (strict mode)
- **Tailwind CSS + shadcn/ui** components
- **Supabase** (Auth + Postgres + Storage + RLS) via `@supabase/supabase-js` and `@supabase/ssr`
- **next-intl** for full bilingual **Arabic (RTL, default) + English (LTR)** with a language
  switcher that flips layout direction correctly (`dir="rtl"` / `dir="ltr"`)
- **Recharts** for dashboard charts
- **Framer Motion + Lottie (`lottie-react`)** for animations
- **lucide-react** icons
- Forms: **react-hook-form + zod** validation

---

## 3. DESIGN SYSTEM (brand identity — follow exactly)

### Colors (design tokens in `tailwind.config.ts` and CSS variables)

| Token | Hex | Usage |
|---|---|---|
| `primary` (Saudi Sovereign Green) | `#0E5B34` | Primary buttons, links, active nav, headings accents |
| `primary-deep` | `#0A4427` | Dark sections, footer, gradients |
| `gold` | `#C09A4A` | Badges, seals, premium accents (use sparingly ≤10%) |
| `gold-light` | `#E3CD94` | Gold highlights, hover states |
| `background` | `#FFFFFF` | **ALL page backgrounds are white** |
| `surface` | `#FAF6EE` | Ivory: alternating section backgrounds, cards tint |
| `ink` | `#15241C` | Body text |
| `coral` | `#F2665C` | Risk warnings, destructive accents only |
| `indigo` | `#4736E8` | Data/charts secondary accent only |

### Typography

- **IBM Plex Sans Arabic** everywhere (Arabic + Latin). Weights: 300, 400, 500, 600, 700.
  Load via Google Fonts / `@fontsource/ibm-plex-sans-arabic`.
- Headings: Bold 700, tight tracking. Body: 400/500. Numbers in KPIs: 700 tabular.

### Logo

- Wordmark + circular **gold-ring seal** icon (green center, ivory ring, gold outer ring)
  containing a scales-of-justice line icon. Provide an SVG logo component in
  `components/brand/logo.tsx` (light + dark variants).
- IMPORTANT: never display any "licensed / authorized" badge. Use a neutral placeholder
  "قيد الترخيص لدى الجهات المختصة" where a regulatory seal would go.

### Look & feel reference (dashboard)

Match this layout language: **RTL dashboard with a fixed RIGHT sidebar** (white, thin
border, icon + label nav items, active item = soft green pill `#0E5B34` text on
`#0E5B34/10` background), top bar with page title + notifications bell + user chip,
content area with **KPI cards** (rounded-2xl, white, subtle border, big bold number,
small delta badge green ↑ / red ↓), then chart cards and list cards. Generous spacing,
`rounded-2xl`, `border` `#E7DFC9`-like neutral, soft shadows only.

---

## 4. SUPABASE INTEGRATION (exact)

### 4.1 Install

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 4.2 Environment — create `.env.local` exactly like this:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://vaybpwsbnhrxxapnyske.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_hFb5GqYB0eO_NRgypZCreA_Wmczofu7
```

Never commit `.env.local`. Also create `.env.example` with the same keys and empty values.
If a service-role key is ever needed, it must live ONLY in server-only env
(`SUPABASE_SERVICE_ROLE_KEY`) and never be exposed to the client.

### 4.3 Client helpers (create these files exactly)

`utils/supabase/server.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (cookieStore: Awaited<ReturnType<typeof cookies>>) => {
  return createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch { /* called from a Server Component — safe to ignore when middleware refreshes sessions */ }
      },
    },
  });
};
```

`utils/supabase/client.ts`:

```ts
import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = () => createBrowserClient(supabaseUrl!, supabaseKey!);
```

`utils/supabase/middleware.ts`:

```ts
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const createClient = (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({ request: { headers: request.headers } });
  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() { return request.cookies.getAll() },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({ request })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options))
      },
    },
  });
  return supabaseResponse
};
```

Plus `middleware.ts` at project root that refreshes the session and protects
`/dashboard/*` and `/admin/*` routes (redirect unauthenticated users to `/login`).

---

## 5. DATABASE — write the SQL, ready to paste into the Supabase SQL Editor

Create `supabase/migrations/0001_init.sql` (+ `0002_seed.sql`) with the FULL schema below.
Every table gets **Row Level Security enabled + policies**. Add `updated_at` triggers,
useful indexes, and comments in English.

### 5.1 Core tables

1. **profiles** — `id uuid pk references auth.users`, `full_name_ar`, `full_name_en`,
   `email`, `phone`, `national_id`, `user_type text` (`investor` | `applicant` | `staff`),
   `role_id uuid -> roles`, `kyc_status text` (`pending|verified|rejected`),
   `avatar_url`, `preferred_locale text default 'ar'`, `created_at`, `updated_at`.
2. **roles** — `id`, `name_ar`, `name_en`, `slug` unique, `is_system bool` (system roles
   can't be deleted), `created_at`.
3. **permissions** — `id`, `key text unique` (e.g. `cases.view`, `cases.approve`,
   `users.manage`, `roles.manage`, `transactions.view`, `content.manage`,
   `settings.manage`, `audit.view`, `finance.payout`), `group text`, `label_ar`, `label_en`.
4. **role_permissions** — `role_id -> roles`, `permission_id -> permissions`, pk (both).
5. **cases** (litigation cases seeking funding) — `id`, `case_number`, `applicant_id ->
   profiles`, `title_ar`, `title_en`, `description_ar`, `description_en`,
   `case_type text` (`commercial|civil|labor|real_estate|arbitration|execution|other`),
   `court text`, `claim_amount numeric`, `requested_funding numeric`,
   `funded_amount numeric default 0`, `expected_return_min numeric`,
   `expected_return_max numeric`, `duration_months int`, `risk_level text` (`low|medium|high`),
   `status text` (`draft|submitted|under_review|committee_review|approved|rejected|
   funding_open|funded|in_litigation|settled|won|lost|closed`),
   `committee_decision text`, `committee_notes text`, `reviewed_by -> profiles`,
   `reviewed_at`, `created_at`, `updated_at`.
6. **case_documents** — `id`, `case_id -> cases`, `uploaded_by -> profiles`,
   `doc_type text` (`power_of_attorney|court_filing|evidence|contract|id_doc|other`),
   `file_path` (Supabase Storage), `file_name`, `created_at`.
7. **case_reviews** (judicial committee) — `id`, `case_id`, `reviewer_id -> profiles`,
   `legal_strength int 1-10`, `enforceability int 1-10`, `counterparty_solvency int 1-10`,
   `overall_score numeric`, `recommendation text` (`approve|reject|request_info`),
   `notes`, `created_at`.
8. **investments** — `id`, `investor_id -> profiles`, `case_id -> cases`,
   `amount numeric`, `status text` (`pending|confirmed|returned|lost|cancelled`),
   `expected_share numeric`, `actual_return numeric`, `created_at`.
9. **transactions** — `id`, `user_id -> profiles`, `case_id`, `type text`
   (`deposit|investment|payout|refund|fee`), `amount numeric`, `status text`,
   `reference text unique`, `created_at`.
10. **wallets** — `user_id pk -> profiles`, `balance numeric default 0`,
    `locked_balance numeric default 0`, `updated_at`.
11. **notifications** — `id`, `user_id`, `title_ar`, `title_en`, `body_ar`, `body_en`,
    `is_read bool default false`, `link`, `created_at`.
12. **comments / testimonials** — `id`, `author_name`, `author_role_ar/en`,
    `content_ar`, `content_en`, `rating int 1-5`, `is_approved bool default false`,
    `is_testimonial bool`, `created_at`.
13. **partners** — `id`, `name_ar`, `name_en`, `logo_url`, `website`, `sort_order`,
    `is_active bool`.  **clients** — same shape (separate table).
14. **faqs** — `id`, `question_ar/en`, `answer_ar/en`, `sort_order`, `is_active`.
15. **contact_messages** — `id`, `name`, `email`, `phone`, `subject`, `message`,
    `is_read`, `created_at`.
16. **audit_logs** — `id`, `actor_id -> profiles`, `action text`, `entity text`,
    `entity_id`, `metadata jsonb`, `ip text`, `created_at`.
17. **platform_settings** — `key text pk`, `value jsonb` (hero stats, fees %, min
    investment, maintenance mode, etc.).

### 5.2 RLS policies (mandatory)

- `profiles`: user reads/updates own row; staff with `users.manage` reads all.
- `cases`: applicant sees own cases; investors see only `status in
  ('funding_open','funded','in_litigation','settled','won')` (limited public columns via
  a view `public_cases`); committee role sees `submitted|under_review|committee_review`;
  admin sees all. Writes restricted by role.
- `investments`, `transactions`, `wallets`: owner-only read; writes via server actions.
- `case_reviews`: committee members only; admin read.
- `partners`, `clients`, `faqs`, approved testimonials: public read; `content.manage`
  write.
- `roles`/`permissions`/`role_permissions`: read for staff; write only with
  `roles.manage`.
- `audit_logs`: insert by server; read only with `audit.view`.
- Helper SQL function `has_permission(uid uuid, perm_key text) returns boolean`
  (SECURITY DEFINER) used by policies.

### 5.3 Seed data (`0002_seed.sql`)

- Permissions (full list), system roles: `super_admin` (all), `judicial_committee`
  (cases.view/committee review/approve), `operations`, `finance`, `compliance`,
  `investor_relations`, plus demo custom role `case_analyst`.
- 8 demo cases (mixed types/statuses, realistic Saudi courts & amounts in SAR),
  6 partners, 8 clients, 8 FAQs, 6 testimonials, demo comments, platform settings,
  1 admin user note (created via dashboard), demo notifications.

### 5.4 Storage

Create buckets: `case-documents` (private), `avatars` (public), `content-media`
(public). Add storage RLS policies (case docs: owner + committee + admin only).

---

## 6. AUTH & RBAC (role-based access control)

### 6.1 Auth flows (Supabase Auth, email+password; phone OTP ready but stubbed)

- `/login` and `/register` (bilingual, brand-styled, split screen with brand panel).
- Registration asks: account type (**Investor / Case owner (applicant)**), full name,
  email, phone, password. Creates `profiles` row via DB trigger `handle_new_user()`.
- Email confirmation flow + forgot/reset password pages.
- After login, route by role: investor → `/dashboard`, applicant → `/dashboard`,
  staff/admin → `/admin`.

### 6.2 Permission model (this is critical — build it generic)

- A user has ONE role; a role has MANY permissions. All authorization checks go through
  `hasPermission('cases.approve')` (client hook + server helper + SQL function).
- **The Super Admin can create NEW ROLES from the UI** and attach ANY subset of
  permissions via a checkbox matrix grouped by module — no code change needed.
- Sidebar menus are generated FROM the user's permissions (menu item ↔ permission key
  mapping in one config file), so a custom role automatically sees only its allowed pages.
- Every server action double-checks the permission server-side. Never trust the client.

### 6.3 Built-in roles

| Role | Scope |
|---|---|
| `super_admin` | Everything: users, roles & permissions, cases, money, content, settings, audit |
| `judicial_committee` | Review submitted cases, score them, vote approve/reject/request-info |
| `operations` | Day-to-day case pipeline management, documents, applicant support |
| `finance` | Wallets, transactions, payouts, fee reports |
| `compliance` | KYC review, AML flags, document verification |
| `investor_relations` | Investors list, support tickets, communications |

---

## 7. LANDING PAGE — EXACTLY 12 SECTIONS (public, bilingual, animated)

Route: `/[locale]/page.tsx`. White background; alternate with ivory `#FAF6EE`.
Every section contains at least one **animated explainer** (see §10). All content comes
from the DB where marked (CMS) so admin can edit it.

1. **Header / Navbar** — sticky, glass-white blur, logo right, links (How it works,
   Opportunities, For case owners, For investors, FAQ, Contact), language switcher
   (عربي/EN), `Login` ghost button + `Start now` primary green button. Mobile: drawer.
2. **Hero** — huge headline «القضية أصبحت قضيتك», sub-headline explaining the model in
   one sentence, two CTAs ("موّل قضيتك" / "ابدأ الاستثمار"), looping animated explainer
   (GIF/Lottie) showing money flow: Investor → Platform → Case → Recovery → Returns.
   Trust chips row (Sharia-reviewed structure, Segregated accounts, Data protection).
3. **Stats bar** — 4 animated counters (funded volume SAR, cases funded, investor
   community size, avg. review time). Values editable via `platform_settings`.
4. **How it works** — 4 steps (Submit case → Committee review → Funding opens → Returns
   distributed), each step a card with its own looping animation, connected by an
   animated progress line.
5. **For case owners (مقدم الطلب)** — benefits grid (no upfront legal costs, keep control
   of your case, fast decision), CTA "قدّم قضيتك", animated illustration of a case file
   being funded.
6. **For investors (استثمر)** — benefits (vetted opportunities, case-level SPV
   transparency, risk disclosure), CTA "افتح حساب مستثمر", animated chart illustration.
   Include a visible risk disclaimer strip (coral icon, honest wording, no guaranteed
   returns — this is a hard requirement).
7. **Featured opportunities** — 3 live case cards from `public_cases` view: case type
   badge, funding progress bar (gold), claim amount, expected duration, risk badge,
   "View details" → public teaser page (details blurred until login).
8. **Why us / Trust & security** — 4 features: Segregated investor accounts, Independent
   judicial committee, Full data encryption (PDPL-ready), Transparent waterfall
   distribution. Gold seal motif + animated lock/shield explainer.
9. **Partners (شركاء)** — logo marquee (CMS `partners`), grayscale → color on hover.
10. **Clients & Testimonials (عملاء + آراء)** — clients logo row (CMS `clients`) +
    testimonial carousel (CMS, approved only) with star ratings.
11. **FAQ** — accordion (CMS `faqs`), 8 items, including: "Is my investment guaranteed?"
    (answer: NO, clear risk wording), "Who approves cases?", "How are returns
    distributed?".
12. **Final CTA + Footer** — dark green `#0A4427` band: "جاهز تبدأ؟" + two CTAs.
    Footer: logo, nav columns, contact, social icons, legal links (Terms, Privacy/PDPL,
    Risk Disclosure), regulatory-status line "قيد الترخيص لدى الجهات المختصة", © line.

Also build public sub-pages: `/opportunities` (list + filters), `/opportunities/[id]`
(teaser), `/how-it-works`, `/about`, `/contact` (form → `contact_messages`), `/terms`,
`/privacy`, `/risk-disclosure`.

---

## 8. DASHBOARDS (authenticated) — one layout, permission-driven sidebar

### 8.1 Shared dashboard shell

Match the reference style: fixed RIGHT sidebar (RTL) / left in English, white content
background, top bar (page title, search, notifications dropdown from `notifications`,
language switcher, user menu). KPI cards with delta badges. Recharts area/bar/donut
charts. Data tables with search, filters, pagination, CSV export. Empty states with a
friendly illustration. Skeleton loaders everywhere.

### 8.2 Investor dashboard (`/dashboard`)

- **Overview**: KPI cards (Wallet balance, Invested amount, Expected returns, Realized
  returns), portfolio donut by case type, returns-over-time area chart.
- **Opportunities marketplace**: all open cases, filter by type/risk/amount, case detail
  page (description, committee score summary, documents the investor is allowed to see,
  funding progress, "Invest" modal with amount + wallet check + risk acknowledgment
  checkbox — mandatory).
- **My investments**: table + status timeline per investment.
- **Wallet**: balance, deposit/withdraw stubs (marked as gateway-integration pending),
  transactions ledger.
- **Profile & KYC**: personal data, national ID / IBAN fields, document upload, KYC
  status badge, notification preferences, language.
- **Notifications** page.

### 8.3 Applicant (case owner) dashboard (`/dashboard`)

- **Overview**: my cases KPIs (submitted, under review, approved, funded), recent updates.
- **Submit a case** — multi-step wizard (Case info → Parties & court → Amounts &
  requested funding → Documents upload → Review & submit). Draft autosave.
- **My cases**: status timeline per case (Submitted → Committee review → Approved →
  Funding open → Funded → In litigation → Settled/Won), committee feedback, messages.
- **Documents** manager per case. **Profile & verification**. **Notifications**.

### 8.4 Judicial Committee dashboard (`/committee`)

- **Review queue**: cases in `submitted/under_review`, filters, SLA badge (days waiting).
- **Case review page**: full case file, documents viewer, scoring form (legal strength /
  enforceability / counterparty solvency 1–10 sliders → auto overall score),
  recommendation (Approve / Reject / Request info) + notes, submit → `case_reviews`.
- **Voting & decisions**: show other members' reviews, final decision panel (changes
  `cases.status`), decision log. Committee members CANNOT see investor identities.
- **Committee stats**: approved/rejected ratios, avg review time.

### 8.5 Admin dashboard (`/admin`) — ALL permissions

1. **Overview**: platform KPIs (GMV funded, active investors, pending approvals,
   conversion), charts, pending committee approvals card, recent activity feed.
2. **Users management**: all users table, filter by type/KYC, view user 360° profile,
   activate/suspend, assign role, verify KYC.
3. **Roles & Permissions builder** (FLAGSHIP FEATURE):
   - List roles → create/edit/duplicate/delete (non-system) role.
   - Permission matrix: modules × actions checkboxes (`cases.*`, `users.*`,
     `transactions.*`, `content.*`, `settings.*`, `audit.*`, `finance.*` …).
   - Save → updates `role_permissions`; sidebar of affected users updates immediately.
   - Show "users with this role" count; prevent deleting a role in use.
4. **Cases pipeline**: kanban by status + table view, open any case, override status,
   assign committee reviewer, export.
5. **Investments & transactions**: full ledger, filters, CSV export, payout batch stub.
6. **Content management (CMS)**: CRUD for partners, clients, testimonials (approve/
   reject comments), FAQs, hero stats, featured opportunities.
7. **Committee oversight**: all reviews, scores, decision history.
8. **Notifications center**: broadcast a notification to a segment (all investors /
   all applicants / specific user).
9. **Audit log**: filterable, who did what/when (from `audit_logs`).
10. **Settings**: platform fees %, min investment, KYC requirements toggles,
    maintenance mode, landing content toggles — all in `platform_settings`.

### 8.6 Other staff roles

`operations`, `finance`, `compliance`, `investor_relations` dashboards reuse the same
shell and components, each showing only the modules its permissions allow (e.g. finance
sees wallets/transactions/payouts; compliance sees KYC queue + flags).

---

## 9. ANIMATIONS & EXPLAINERS ("lots of GIFs that explain everything")

- Every landing section and every major dashboard empty-state must have a looping
  animated explainer. Implementation order of preference:
  1. **Lottie JSON** (free from lottiefiles.com, recolored to brand green/gold) rendered
     with `lottie-react`, lazy-loaded.
  2. If Lottie unavailable: **animated SVG/CSS** micro-animations.
  3. As a last resort: optimized **GIF/WebP** placeholders in `public/animations/` with a
     `<BrandAnimation name="..." />` wrapper component so files can be swapped later
     without touching code.
- Required explainers: hero money-flow loop, 4 "how it works" step loops, case-funding
  loop (case owners), returns chart loop (investors), security shield loop, empty states.
- All animations respect `prefers-reduced-motion`.

---

## 10. i18n (Arabic default + English)

- `next-intl`, routes `/ar/...` (default, RTL) and `/en/...` (LTR).
- Every user-facing string in `messages/ar.json` + `messages/en.json` — zero hardcoded
  strings. Numbers: Western digits, currency "ر.س / SAR".
- DB content tables carry `_ar` and `_en` columns; pick by locale.

---

## 11. NON-FUNCTIONAL REQUIREMENTS

- Fully responsive (mobile-first); dashboard usable on tablets.
- Security: RLS everywhere, server-side permission checks, zod validation on all inputs,
  rate-limit contact/invest actions, never log sensitive data.
- Risk & compliance copy: no guaranteed-return promises anywhere; risk disclosure on
  every investment flow; "قيد الترخيص" line in footer.
- Performance: next/image, lazy animations, server components by default.
- Code quality: typed Supabase (`supabase gen types` style manual types file is fine),
  feature-folder structure, README with setup steps.

---

## 12. EXECUTION ORDER (follow strictly)

1. Scaffold Next.js + TS + Tailwind + shadcn/ui; install all deps incl. §4.1.
2. Add `.env.local` (§4.2) and the three Supabase helper files + middleware (§4.3).
3. Output `supabase/migrations/0001_init.sql` and `0002_seed.sql` COMPLETE (§5) and tell
   me exactly where to paste them (Supabase → SQL Editor → Run). Then generate
   `types/database.ts` matching the schema.
4. Brand system: Tailwind tokens, fonts, Logo component, `config/brand.ts`.
5. Auth pages + profile trigger + route protection.
6. Dashboard shell + RBAC engine (permission hook, server guard, menu-from-permissions).
7. Landing page — all 12 sections with animations (§7).
8. Investor + Applicant dashboards (§8.2, §8.3).
9. Committee dashboard (§8.4).
10. Admin dashboard incl. Roles & Permissions builder (§8.5).
11. i18n pass, QA, README.

## 13. ACCEPTANCE CRITERIA (verify before declaring done)

- `npm run build` passes with zero TS errors.
- A new registration → profile row exists → correct dashboard by account type.
- Admin creates a NEW role with 3 permissions in the UI → a user with that role sees
  exactly those 3 modules and nothing else (server-enforced, not just hidden).
- Committee member approves a seeded case → status changes → case appears in investor
  marketplace.
- Investor invests → wallet locked balance updates → case progress bar updates.
- Language switch flips ALL content + direction.
- Every landing section (12/12) present with its animation; every chart renders.

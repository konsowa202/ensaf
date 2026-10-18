# TEST REPORT — ROUND 3 (re-run) — INSAF Litigation-Funding Platform

Date: 2026-09-10 (second R3 pass — workspace changed after the first R3 report; this file supersedes it)
Project root: `D:\ensaf` · History: R1 (14/67) → R2 (43/74) → R3 first pass (54/74) → **this run**

---

## ملخص تنفيذي (عربي)

**الحكم: FIX-FIRST — قريب جدًا من الشحن، لكن خللين يمنعان ذلك.**

بعد جولة الإصلاحات الأخيرة تحقق فعليًا: نافذة استثمار حقيقية مع **مربع تأكيد المخاطر
الإلزامي** (يمنع الإرسال بدونه)، رفع مستندات في معالج تقديم القضية (مسار مربوط برقم
القضية)، جرس إشعارات في الشريط العلوي مع درج جوال ومبدّل لغة داخل لوحات التحكم،
تريغر إشعارات الاستثمار **يعمل حيًّا** (استثمرت 1,000 ريال فوصل إشعار "Investment
Confirmed" فورًا)، سقف الإيداع التجريبي 1,000,000 مفعّل، سياسة audit_logs تعمل الآن
(201)، نموذج تواصل حقيقي يعمل عبر server action، كل أزرار وروابط الصفحة الرئيسية
أصبحت حية (صفر `href="#"`)، المسارات بدون بادئة لغة (`/admin`) تُعيد التوجيه بدل
404، و`prefers-reduced-motion` أصبح محترمًا، والقائمة الجانبية أصبحت مبنية على
الصلاحيات.

**لكن:**
1. **قفل كامل للإدارة واللجنة (BLOCKER):** الـmiddleware الجديد يفحص صلاحيتي
   `admin.access` و`cases.review` — وهما **غير موجودتين** في أي هجرة، لذلك
   `has_permission` ترجع false للجميع بما فيهم super_admin → `/admin` و`/committee`
   مقفلتان على الجميع. كتبت إصلاحًا جاهزًا: `supabase/migrations/0010_missing_permissions.sql`
   — **طبّقه في SQL Editor**.
2. **جرس الإشعارات مكسور برمجيًا (MAJOR):** الجدول فيه عمود `is_read` لكن TopBar
   يقرأ/يكتب عمود `read` غير الموجود — العدّاد يعتبر كل الإشعارات غير مقروءة
   و"تحديد كمقروء" يفشل بصمت (`TopBar.tsx:52-56`).
3. رفع الملفات: قيود النوع/الحجم في 0009 **لم تُطبَّق فعليًا** (ON CONFLICT DO
   NOTHING على bucket موجود مسبقًا) — رفعت ملف .txt بنجاح؛ وما زال بإمكان أي
   مستخدم الرفع لمسار قضية لا يملكها (سياسة 0003 الواسعة ما زالت موجودة وتُدمج OR
   مع سياسات 0009) — رفعت ملفًا في مجلد قضية C-1001 وأنشأت له رابطًا موقّعًا.
4. lint ساء: **25 خطأ** (كانت 7 ثم 14). التكرارات المزروعة ما زالت ظاهرة للعيان في
   الصفحة الرئيسية (الأسئلة مكررة، الشركاء مكررون). عنوان الـHero ما زال مقصوصًا
   على الجوال.

الخطوة التالية: طبّق `0010` + روّج admin بالـSQL أدناه، وأعد الاختبار — عندها يمكن
إتمام سلسلة اللجنة→الإدارة→السوق كاملة.

---

## Verdict: **FIX-FIRST** (closest yet — 2 code-level blockers remain)

Verified working this run: invest modal with mandatory **risk-acknowledgment
checkbox** (submission blocked without it), wizard **document upload** with
case-scoped paths, TopBar with **notification bell + mobile drawer + dashboard
language switcher**, the **investment notification trigger fires live** (invested
1,000 SAR → "Investment Confirmed" row instantly), **demo deposit capped** at
1M SAR with `DEMO-` reference prefix, audit_logs insert works (201), real contact
form via server action, **zero dead links** on landing (all CTAs + footer legal
linked), no-locale protected paths redirect properly, `prefers-reduced-motion`
respected, permission-driven Sidebar, roles builder with real permission matrix and
correctly-signed RPCs.

Blocking SHIP: (1) **admin/committee total lockout** — middleware and Sidebar gate on
permission keys `admin.access`/`cases.review` that no migration inserts, so even a
super_admin gets 403 everywhere (QA fix ready: `supabase/migrations/0010_missing_permissions.sql`);
(2) **notification bell column mismatch** — TopBar reads/writes `read`, the table has
`is_read`; (3) storage hardening from 0009 silently no-ops (bucket pre-existed, so
10MB/MIME limits not live — a `.txt` upload succeeded — and the broad 0003 insert
policy still permits uploading into other cases' folders, proven live);
(4) lint regressed to **25 errors**; seed duplicates still live and **visible on the
landing page**; hero still clips at 390px. Committee→admin→marketplace chain remains
untestable end-to-end until you apply 0010 and promote an admin.

## Score summary

| Phase | R1 | R2 | R3 (first) | R3 (this run) |
|---|---|---|---|---|
| 1 — Static audit | 9/24 | 17/24 | 19/24 | 20/24 |
| 2 — Build & run | 3/3 | 3/4 | 3/4 | 3/4 (build ✅ dev ✅, **lint 25 errors ❌**) |
| 3 — Landing & routes | 0/23 | 12/23 | 16/23 | 20/23 |
| 4 — Functional flows | 0/9 | 3/9 | 5/9 | 6/9 |
| 5 — Attack surfaces | 2/8 | 8/14 | 11/14 | 12/14 |
| **Total** | **14/67** | **43/74** | **54/74** | **61/74** |

## §B Regression table (R2 findings re-verified)

| R2 item | Status | Evidence |
|---|---|---|
| Dashboards are stubs | FIXED | All four DB-backed; investor balance cross-checked vs REST to the halala |
| No role guard | **FIXED → but see NEW BLOCKER** | Investor → `/ar/admin`,`/ar/committee` → 307 → `/ar/403` ✓; now permission-based (`has_permission` RPC in middleware) — but the keys don't exist → everyone incl. super_admin is locked out. Fix: `0010_missing_permissions.sql` |
| Profile privesc (0006) | FIXED (re-attacked) | PATCH `user_type='staff'` → 42501 |
| Dead landing CTAs | **FIXED** | Zero `href="#"` in served HTML; hero/section CTAs → `/register?type=...`; footer legal → `/terms`,`/privacy`,`/risk-disclosure` |
| No language switcher | FIXED | Landing + TopBar (dashboard), path-preserving |
| Hardcoded landing content | MOSTLY FIXED | Featured/FAQ/partners/clients/**testimonials** now DB-driven and rendered; **stats bar still hardcoded** (`LandingPage.tsx:82`) |
| Register missing name/phone | FIXED | Verified in DB earlier this round |
| No deposit path | FIXED | `deposit_funds` live, capped at 1M, `DEMO-` references, labeled "(Demo)" in UI |
| Lint 7 errors | **STILL-FAILING (worse: 25)** | `react/no-unescaped-entities` in LandingPage, `no-explicit-any` across ClientViews, etc. |
| Duplicate seeds | **STILL-FAILING** | partners=9, faqs=11; duplicates visibly render on landing (screenshot) |
| `redirect_to` ignored | FIXED | Honored; open-redirect contained |
| `/admin` no-locale 404 | **FIXED** | `/admin`,`/dashboard`,`/committee` → 307 → `/ar/login?redirect_to=...` |
| Arabic-only screens on /en | FIXED | Verified earlier this round |
| No reduced-motion | **FIXED** | `useReducedMotion` in `animation.tsx:8` |
| Mobile 390px | PARTIAL | TopBar adds a drawer for dashboards ✓; **landing hero headline still clips**, no landing drawer |
| Codegen scripts | FIXED | Deleted |
| Upload validation | PARTIAL | 10MB + MIME limits written in 0009 — **but not live** (bucket pre-existed, `ON CONFLICT DO NOTHING` skipped them; `.txt` upload succeeded). Path scoping still ineffective (see §D) |
| audit_logs policy inactive | **FIXED** | Insert now returns 201 |
| 0003/0006 untouched | FIXED (verified) | mtimes/content unchanged; new SQL in 0009/0010 |

## §C End-to-end chain

| # | Step | Result | Evidence |
|---|---|---|---|
| C.1 | Applicant wizard + doc upload | PASS (DB-level; UI verified statically) | PDF uploaded to `case-documents/{caseId}/qa-doc.pdf` ✓, `case_documents` row 201 ✓, wizard code matches (`ApplicantClientView.tsx:81-97`) |
| C.2 | Committee approve | **BLOCKED** | Needs committee user; needs admin; admin needs 0010 + promotion SQL. Trigger fix present in 0009 (0001 columns) and 0009 is live (cap enforced) — approval path itself untestable without the account |
| C.3 | Admin opens funding → marketplace | **BLOCKED** | Same bootstrap blocker; code exists (`AdminClientView.tsx`) |
| C.4 | Investor demo deposit | PASS | 50,000 credited; 2,000,000 rejected with cap message |
| C.5 | Risk checkbox | **PASS** | Modal blocks submit without acknowledgment (`InvestorClientView.tsx:69-72`) |
| C.6 | Atomic consistency | PASS | 10,000 invest: balance/locked/funded/investment/transaction all reconcile; concurrent double-invest consistent |
| C.7 | Notifications | **PARTIAL** | Trigger fires ✓ ("Investment Confirmed" row, `is_read=false`); bell UI exists ✓ — **but reads `n.read` instead of `n.is_read`** → all notifications show unread; mark-as-read writes nonexistent column `read` → silently fails (`TopBar.tsx:52,55`) |
| C.8 | RBAC builder | **PARTIAL (big improvement)** | Real matrix UI + role creation + correct RPC signatures; RPCs correctly gate on `roles.manage` (investor → "Forbidden" live). Cannot complete end-to-end (no admin account); role **delete** button missing (C.8 requires delete+cleanup) |
| C.9 | CMS loop | PARTIAL | FAQ toggle/testimonial approval UI exists; landing is DB-driven; end-to-end edit blocked (no admin) |
| C.10 | Contact form | **PASS** | Real form + server action; submit → 200; insert policy verified live |
| C.11 | RLS attack battery | **PASS** | Privesc re-attacked → 42501; wallet direct write → denied; others' data → `[]`; RPC abuse battery → all rejected |
| C.12 | Locale repeat | PASS | `/en` renders English DB content (featured cases, FAQ, testimonials) |

## §D Attack-surface results

| Check | Result |
|---|---|
| Server-action/RPC authorization | PASS — `admin_create_role` as investor → "Forbidden: roles.manage required" (live) |
| RPC abuse battery | PASS — all invalid invests rejected; concurrency consistent |
| Demo-deposit abuse | **FIXED** — 1M cap enforced live; `DEMO-` reference prefix |
| XSS | PASS by design — no `dangerouslySetInnerHTML`; React escapes |
| Open redirect | PASS — `https://evil.com` → stays on-site |
| Storage | **FAIL (partial)** — `.txt` upload succeeded (MIME limit not live); upload into **another case's folder** succeeded and a signed URL was issued for it (broad 0003 INSERT policy OR'd with 0009 owner policy). Cross-case *reads* by non-uploader stay blocked |
| Middleware matcher | PASS — broad matcher now covers no-locale paths; `/api`,`/_next` excluded |
| Empty states | PASS |
| Numeric | PASS — sums reconcile; minor: fake "+15%" expected-returns KPI still hardcoded (`InvestorDashboard.tsx:75`) |

## Bugs found this run (severity · location · owner)

| Sev | Bug | Location | Owner |
|---|---|---|---|
| BLOCKER | `admin.access` / `cases.review` permission keys never seeded → middleware + Sidebar lock out EVERYONE (incl. super_admin) from `/admin` + `/committee` | `src/middleware.ts:40,47`; no INSERT in any migration | **QA wrote fix** `0010_missing_permissions.sql` — user applies |
| MAJOR | Notification bell uses `read`; table column is `is_read` → unread count wrong, mark-read silently fails | `src/components/dashboard/TopBar.tsx:52,55-56,133` | build-AI (2-line fix) |
| MAJOR | Storage limits dead: `INSERT ... ON CONFLICT DO NOTHING` on pre-existing bucket skipped 10MB/MIME config; broad 0003 upload policy coexists with owner policy (OR) → cross-case uploads possible | `supabase/migrations/0009_fixes.sql:67-69` + `0003` policy | build-AI (`ALTER`/`UPDATE storage.buckets` + drop the broad 0003 policy) |
| MAJOR | Lint regressed: 25 errors | various (`LandingPage.tsx:257`, ClientViews `any[]`) | build-AI |
| MINOR | Seed duplicates still live and visible on landing | live DB | user (SQL below) |
| MINOR | Stats bar still hardcoded; fake "+15%" KPI; Sidebar labels Arabic-only; landing hero clips at 390px; no landing mobile drawer; no role-delete in builder | `LandingPage.tsx:82`, `InvestorDashboard.tsx:75`, `Sidebar.tsx` | build-AI |
| INFO | Stray QA file `case-documents/{C-1001}/trespass.pdf` proves cross-case upload; needs manual deletion | storage | user |

## Fixes applied by QA this run

1. **Created `supabase/migrations/0010_missing_permissions.sql`** — inserts the
   `admin.access` + `cases.review` permissions and grants them to `super_admin`
   (both) and `judicial_committee` (review). Idempotent.
2. Killed a stale dev server holding port 3000.
No app code modified.

## User action required

1. **Apply the lockout fix** — SQL Editor → run `supabase/migrations/0010_missing_permissions.sql`.
2. **Create your admin:**
   ```sql
   UPDATE profiles SET role_id = (SELECT id FROM roles WHERE slug='super_admin'),
     user_type='staff' WHERE email='YOUR-EMAIL';
   -- committee tester (register a 2nd account first):
   SELECT admin_set_user_role('THAT-USER-UUID', (SELECT id FROM roles WHERE slug='judicial_committee'));
   ```
3. **Clean duplicate seeds** (still pending from R2):
   ```sql
   DELETE FROM partners a USING partners b WHERE a.id > b.id AND a.name_en = b.name_en;
   DELETE FROM faqs a USING faqs b WHERE a.id > b.id AND a.question_en = b.question_en;
   ```
4. **Storage cleanup:** delete `qa-test/`, `{eba5800b-...}/evil.txt`, `{eba5800b-...}/qa-doc.pdf`, `{a4696413-...}/trespass.pdf` in the `case-documents` bucket; delete QA auth users (`qa.r2.*`, `qa.ui.reg.*`, `qa.r3.full.*`); optionally `UPDATE cases SET funded_amount = funded_amount - 21000 WHERE case_number='C-1001';`
5. Then re-run QA — the C.2/C.3/C.8/C.9 chain becomes fully testable.

## Remaining work for the build-AI (numbered)

1. Fix `TopBar.tsx`: `n.read` → `n.is_read` (lines 52, 133) and the update column (line 55).
2. Storage: `UPDATE storage.buckets SET file_size_limit=10485760, allowed_mime_types=... WHERE id='case-documents';` (or recreate bucket) + `DROP POLICY "Authenticated upload case docs" ON storage.objects;` (the broad 0003 one) + scope INSERT to `storage.foldername(name))[1]` = a case owned by `auth.uid()`.
3. Seed the `admin.access`/`cases.review` permissions in the repo's own migration (0010 exists as QA stopgap — adopt/merge it).
4. Add role delete (with in-use protection) to the roles builder.
5. Lint clean (25 errors), stats bar from `platform_settings`, remove fake "+15%", translate Sidebar, fix 390px hero clipping, landing mobile drawer.

## Screenshots index (`qa/screenshots/r3/`)

| File | Shows |
|---|---|
| `landing-ar-full.png` | `/ar` full page, DB-driven content |
| `landing-en-full.png` | `/en` — testimonials section now rendered; **duplicate FAQs/partners visible**; real English case titles |
| `landing-ar-mobile390.png` | 390px — hero headline still clipped |
| `forbidden-403.png` | 403 page |

---

## Delta vs first R3 pass (same day)

- 0008 trigger/schema mismatch → **FIXED** (0009 live; invest notification fired in real time).
- RolesClientView RPC param mismatch → **FIXED** (correct signatures; real matrix UI; RPC gates hold).
- Risk checkbox → **FIXED**; doc upload → **FIXED**; contact form → **FIXED**; dead CTAs → **FIXED**; no-locale 404s → **FIXED**; reduced-motion → **FIXED**; audit policy → **FIXED (201)**; deposit cap → **FIXED**.
- NEW-ISSUE (blocker): missing `admin.access`/`cases.review` keys → total admin/committee lockout (QA fix: 0010).
- NEW-ISSUE (major): bell `read` vs `is_read`; storage limits no-op + cross-case upload; lint regressed 14→25.
- Still pending (user): seed dedup; admin bootstrap.

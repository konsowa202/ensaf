-- 0012: Fix public_cases view — add created_at/updated_at so pages can sort by recency.
-- The opportunities page ordered by created_at, which the old view did not expose,
-- so the query failed and the page rendered empty.

CREATE OR REPLACE VIEW public.public_cases AS
SELECT
  id,
  case_number,
  title_ar,
  title_en,
  description_ar,
  description_en,
  case_type,
  court,
  claim_amount,
  requested_funding,
  funded_amount,
  expected_return_min,
  expected_return_max,
  duration_months,
  risk_level,
  status,
  created_at,
  updated_at
FROM cases
WHERE status = ANY (ARRAY[
  'funding_open'::text,
  'funded'::text,
  'in_litigation'::text,
  'settled'::text,
  'won'::text,
  'lost'::text,
  'closed'::text
]);

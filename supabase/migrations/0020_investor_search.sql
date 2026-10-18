-- 0020: searchable investor directory for Investor Relations
-- Same server-side trigram search pattern as admin_search_users, but scoped to
-- investors and enriched with investment aggregates.

CREATE OR REPLACE FUNCTION public.admin_search_investors(
  p_query text DEFAULT '',
  p_limit int DEFAULT 25,
  p_offset int DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions
AS $function$
DECLARE
  v_q text := trim(COALESCE(p_query, ''));
  v_rows json;
  v_total bigint;
BEGIN
  IF current_user <> 'postgres'
     AND NOT has_permission(auth.uid(), 'users.view')
     AND NOT has_permission(auth.uid(), 'admin.access') THEN
    RAISE EXCEPTION 'Not authorized';
  END IF;

  SELECT COUNT(*) INTO v_total
  FROM profiles p
  WHERE p.user_type = 'investor'
    AND (v_q = ''
         OR p.email ILIKE '%' || v_q || '%'
         OR p.full_name_ar ILIKE '%' || v_q || '%'
         OR p.full_name_en ILIKE '%' || v_q || '%'
         OR p.phone ILIKE '%' || v_q || '%'
         OR p.national_id ILIKE '%' || v_q || '%');

  SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json) INTO v_rows
  FROM (
    SELECT p.id,
           COALESCE(p.full_name_ar, p.full_name_en, p.email) AS name_ar,
           COALESCE(p.full_name_en, p.full_name_ar, p.email) AS name_en,
           p.email, p.phone, p.kyc_status, p.avatar_url,
           COALESCE(s.total_invested, 0) AS total_invested,
           COALESCE(s.tokens_total, 0) AS tokens_total,
           COALESCE(s.investments_count, 0) AS investments_count,
           COALESCE(w.balance, 0) AS balance
    FROM profiles p
    LEFT JOIN wallets w ON w.user_id = p.id
    LEFT JOIN LATERAL (
      SELECT SUM(i.amount) AS total_invested,
             SUM(i.tokens) AS tokens_total,
             COUNT(*) AS investments_count
      FROM investments i
      WHERE i.investor_id = p.id AND i.status IN ('confirmed', 'returned')
    ) s ON true
    WHERE p.user_type = 'investor'
      AND (v_q = ''
           OR p.email ILIKE '%' || v_q || '%'
           OR p.full_name_ar ILIKE '%' || v_q || '%'
           OR p.full_name_en ILIKE '%' || v_q || '%'
           OR p.phone ILIKE '%' || v_q || '%'
           OR p.national_id ILIKE '%' || v_q || '%')
    ORDER BY COALESCE(s.total_invested, 0) DESC, p.created_at DESC
    LIMIT LEAST(p_limit, 100) OFFSET p_offset
  ) t;

  RETURN json_build_object('success', true, 'total', v_total, 'investors', v_rows);
END;
$function$;

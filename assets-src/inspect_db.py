# -*- coding: utf-8 -*-
"""Inspect INSAF Supabase DB state for the dashboard build."""
import psycopg2

conn = psycopg2.connect(
    host="aws-1-eu-west-1.pooler.supabase.com",
    port=5432,
    dbname="postgres",
    user="postgres.vaybpwsbnhrxxapnyske",
    password=os.environ["SUPABASE_DB_PASSWORD"],
    sslmode="require",
)
cur = conn.cursor()

print("=== TABLES (public) ===")
cur.execute("""SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY 1""")
for r in cur.fetchall():
    print(" -", r[0])

print("\n=== ROW COUNTS ===")
for t in ["profiles","roles","permissions","role_permissions","cases","public_cases","investments","wallets","transactions","notifications","comments","partners","clients","faqs","case_documents","case_reviews","platform_settings"]:
    try:
        cur.execute(f'SELECT count(*) FROM "{t}"')
        print(f"{t}: {cur.fetchone()[0]}")
    except Exception as e:
        conn.rollback()
        print(f"{t}: ERR {e}")

print("\n=== MAHMOUD PROFILE ===")
cur.execute("""SELECT p.id, p.email, p.user_type, p.full_name_ar, r.slug, r.name_ar
               FROM profiles p LEFT JOIN roles r ON r.id = p.role_id
               WHERE p.email = 'mahmoudkonsowa3030@gmail.com'""")
for r in cur.fetchall():
    print(r)

print("\n=== ROLES & PERMISSION COUNTS ===")
cur.execute("""SELECT r.slug, count(rp.permission_id) FROM roles r
               LEFT JOIN role_permissions rp ON rp.role_id = r.id
               GROUP BY r.slug ORDER BY 1""")
for r in cur.fetchall():
    print(r)

print("\n=== CASES STATUS ===")
cur.execute("SELECT status, count(*) FROM cases GROUP BY status ORDER BY 1")
for r in cur.fetchall():
    print(r)

print("\n=== INVESTMENTS ===")
cur.execute("SELECT status, count(*), coalesce(sum(amount),0) FROM investments GROUP BY status")
for r in cur.fetchall():
    print(r)

print("\n=== FAQ DUPES ===")
cur.execute("SELECT question_ar, count(*) FROM faqs GROUP BY question_ar HAVING count(*)>1")
for r in cur.fetchall():
    print(r)

print("\n=== COMMENTS SAMPLE ===")
cur.execute("SELECT author_name, rating, is_approved, is_testimonial, left(content_ar,40) FROM comments LIMIT 8")
for r in cur.fetchall():
    print(r)

cur.close()
conn.close()

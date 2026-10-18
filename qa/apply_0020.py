import os
import sys
import psycopg2

conn = psycopg2.connect(
    host="aws-1-eu-west-1.pooler.supabase.com",
    port=5432,
    dbname="postgres",
    user="postgres.vaybpwsbnhrxxapnyske",
    password=os.environ["SUPABASE_DB_PASSWORD"],
    sslmode="require",
)
conn.autocommit = True
cur = conn.cursor()
sql = open(r"D:\ensaf\supabase\migrations\0020_investor_search.sql", encoding="utf-8").read()
try:
    cur.execute(sql)
    print("MIGRATION OK")
except Exception as e:
    print("MIGRATION FAILED:", e)
    sys.exit(1)
cur.execute("SELECT 1 FROM pg_proc WHERE proname = 'admin_search_investors'")
print("admin_search_investors", "OK" if cur.fetchone() else "MISSING")
conn.close()

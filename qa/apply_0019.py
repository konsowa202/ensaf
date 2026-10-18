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
sql = open(r"D:\ensaf\supabase\migrations\0019_finance_workspace.sql", encoding="utf-8").read()
try:
    cur.execute(sql)
    print("MIGRATION OK")
except Exception as e:
    print("MIGRATION FAILED:", e)
    sys.exit(1)

# Smoke-check the new RPCs exist
for fn in ["preview_case_settlement", "process_case_settlement", "admin_search_users", "admin_user_financials", "admin_adjust_wallet", "admin_search_transactions"]:
    cur.execute("SELECT 1 FROM pg_proc WHERE proname = %s", (fn,))
    print(fn, "OK" if cur.fetchone() else "MISSING")
conn.close()

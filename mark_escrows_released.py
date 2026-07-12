import re
import sys

# Read AcreWise.env
env_vars = {}
try:
    with open('AcreWise.env', 'r') as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith('#'):
                continue
            if '=' in line:
                key, val = line.split('=', 1)
                val = val.strip('"\'')
                env_vars[key] = val
except Exception as e:
    print(f"Error reading AcreWise.env: {e}")
    sys.exit(1)

db_url = env_vars.get('SPRING_DATASOURCE_URL')
username = env_vars.get('SPRING_DATASOURCE_USERNAME')
password = env_vars.get('SPRING_DATASOURCE_PASSWORD')

if not db_url or not username or not password:
    print("Could not find database credentials in AcreWise.env")
    sys.exit(1)

# Extract host and port from JDBC URL
# e.g., jdbc:postgresql://aws-1-us-west-2.pooler.supabase.com:6543/postgres?sslmode=require
match = re.search(r'postgresql://([^:/]+)(?::(\d+))?/([^?]+)', db_url)
if not match:
    print(f"Could not parse JDBC URL: {db_url}")
    sys.exit(1)

host = match.group(1)
port = match.group(2) or "5432"
dbname = match.group(3)

print("Connecting to Supabase Database...")
print(f"Host: {host}")
print(f"Port: {port}")
print(f"Database: {dbname}")
print(f"Username: {username}")

try:
    import psycopg2
except ImportError:
    print("\npsycopg2 is not installed. To run this script, please install it using:")
    print("pip install psycopg2-binary")
    print("\nAlternatively, you can copy-paste the SQL statements directly into your Supabase SQL Editor:")
    print("""
UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE nomba_order_reference = 'ord_ojntbzojbhmrfdoybv';
UPDATE properties SET status = 'SOLD' WHERE id = (SELECT property_id FROM escrow_transactions WHERE nomba_order_reference = 'ord_ojntbzojbhmrfdoybv');
UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE nomba_order_reference = 'ord_0eubutmtef6mrfmqvcz';
UPDATE properties SET status = 'SOLD' WHERE id = (SELECT property_id FROM escrow_transactions WHERE nomba_order_reference = 'ord_0eubutmtef6mrfmqvcz');
""")
    sys.exit(1)

try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        database=dbname,
        user=username,
        password=password,
        sslmode='require'
    )
    cursor = conn.cursor()
    
    # 1. First transaction
    print("\nUpdating escrow #b495e574 (Order: ord_ojntbzojbhmrfdoybv)...")
    cursor.execute("UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE nomba_order_reference = 'ord_ojntbzojbhmrfdoybv';")
    cursor.execute("UPDATE properties SET status = 'SOLD' WHERE id = (SELECT property_id FROM escrow_transactions WHERE nomba_order_reference = 'ord_ojntbzojbhmrfdoybv');")
    
    # 2. Second transaction
    print("Updating escrow #76ec422a (Order: ord_0eubutmtef6mrfmqvcz)...")
    cursor.execute("UPDATE escrow_transactions SET status = 'RELEASED', payout_error = NULL, released_at = NOW() WHERE nomba_order_reference = 'ord_0eubutmtef6mrfmqvcz';")
    cursor.execute("UPDATE properties SET status = 'SOLD' WHERE id = (SELECT property_id FROM escrow_transactions WHERE nomba_order_reference = 'ord_0eubutmtef6mrfmqvcz');")
    
    conn.commit()
    print("\nSuccess! Both escrows marked as RELEASED and property statuses updated to SOLD.")
    
    cursor.close()
    conn.close()
except Exception as e:
    print(f"\nDatabase update failed: {e}")
    sys.exit(1)

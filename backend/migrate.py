import os
import psycopg2

def main():
    conn = psycopg2.connect("postgresql://postgres:postgres@localhost:5433/recall")
    conn.autocommit = True
    cursor = conn.cursor()
    try:
        cursor.execute("ALTER TABLE patients ADD COLUMN invite_code VARCHAR;")
        cursor.execute("ALTER TABLE patients ADD CONSTRAINT patients_invite_code_key UNIQUE (invite_code);")
        print("Success")
    except Exception as e:
        print(e)

if __name__ == "__main__":
    main()

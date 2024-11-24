import os
import psycopg2
from psycopg2.extensions import ISOLATION_LEVEL_AUTOCOMMIT
from dotenv import load_dotenv

load_dotenv()

def insert_report(user_id, username, offence, action, reported_by=None, advice=None, note=None, proof=None, rm=None):
    try:
        conn = psycopg2.connect(os.getenv('DATABASE_URL'))
        conn.set_isolation_level(ISOLATION_LEVEL_AUTOCOMMIT)
        cur = conn.cursor()
        
        insert_query = """
        INSERT INTO reports (user_id, username, offence, action, reported_by, advice, note, proof, rm)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
        RETURNING id;
        """
        
        cur.execute(insert_query, (
            user_id,
            username,
            offence,
            action,
            reported_by,
            advice,
            note,
            proof,
            rm
        ))
        
        report_id = cur.fetchone()[0]
        return report_id
        
    except Exception as e:
        raise e
    
    finally:
        if cur:
            cur.close()
        if conn:
            conn.close() 
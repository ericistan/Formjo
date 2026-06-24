from dotenv import load_dotenv
import os
import psycopg2.pool
import psycopg2.extras

# Load variables from the .env file into os.getenv() — keeps secrets out of the code
load_dotenv()

# A connection pool keeps a small set of open database connections ready to reuse
# Opening a fresh DB connection on every request is expensive — pooling avoids that cost
# SimpleConnectionPool(min=2, max=3) — always keep 2 connections open, allow up to 3
pool = psycopg2.pool.SimpleConnectionPool(
    2, 3,
    host=os.getenv('DB_HOST'),
    database=os.getenv('DB'),
    user=os.getenv('DB_USER'),
    password=os.getenv('DB_PASSWORD'),
    port=os.getenv('DB_PORT')
)


def get_cursor():
    # Borrow a connection from the pool for this request
    connection = pool.getconn()
    # RealDictCursor makes rows come back as dictionaries: {"id": 1, "name": "ET"}
    # instead of plain tuples: (1, "ET") — much easier to serialize to JSON
    cursor = connection.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    return connection, cursor


def release_connection(connection):
    # Return the connection to the pool so the next request can reuse it
    # Always call this after your queries — forgetting causes pool exhaustion and hanging requests
    pool.putconn(connection)

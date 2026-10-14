
import sqlite3

DATABASE_NAME = "logs.db"


def get_connection():
    connection = sqlite3.connect(DATABASE_NAME)
    connection.row_factory = sqlite3.Row
    return connection


def initialize_database():
    connection = get_connection()

    connection.execute("""
        CREATE TABLE IF NOT EXISTS logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            source TEXT NOT NULL,
            level TEXT NOT NULL,
            message TEXT NOT NULL,
            previous_hash TEXT,
            current_hash TEXT
        )
    """)

    connection.commit()
    connection.close()


if __name__ == "__main__":
    initialize_database()
    print("Database initialized successfully!")
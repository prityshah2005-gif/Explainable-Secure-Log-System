
import sqlite3
import shutil
import os
import hashlib
import json

project_folder = os.path.dirname(os.path.dirname(__file__))

original_db = os.path.join(project_folder, "logs.db")
test_db = os.path.join(project_folder, "test_logs.db")

if not os.path.exists(original_db):
    print("Original database not found. Run the backend first.")
    raise SystemExit(1)

shutil.copy2(original_db, test_db)

connection = sqlite3.connect(test_db)
connection.row_factory = sqlite3.Row

log = connection.execute(
    "SELECT * FROM logs ORDER BY id ASC LIMIT 1"
).fetchone()

if log is None:
    print("No logs found. Add a log before testing.")
    connection.close()
    os.remove(test_db)
    raise SystemExit(1)

# Change only the copied database.
connection.execute(
    "UPDATE logs SET message = ? WHERE id = ?",
    ("TAMPERED MESSAGE", log["id"])
)
connection.commit()

changed_log = connection.execute(
    "SELECT * FROM logs WHERE id = ?", (log["id"],)
).fetchone()

hash_data = json.dumps(
    {
        "timestamp": changed_log["timestamp"],
        "source": changed_log["source"],
        "level": changed_log["level"],
        "message": changed_log["message"],
        "previous_hash": changed_log["previous_hash"]
    },
    sort_keys=True,
    separators=(",", ":")
)

calculated_hash = hashlib.sha256(
    hash_data.encode("utf-8")
).hexdigest()

if calculated_hash != changed_log["current_hash"]:
    print("SUCCESS: Tampering detected in the copied database!")
else:
    print("WARNING: Tampering was not detected.")

connection.close()
os.remove(test_db)
print("Temporary test database removed.")
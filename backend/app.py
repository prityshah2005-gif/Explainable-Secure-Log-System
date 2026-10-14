
from flask import Flask, jsonify, request
from flask_cors import CORS
from database import get_connection, initialize_database
from datetime import datetime, timezone
import hashlib
import json

from ai_detector import detect_anomalies

app = Flask(__name__)
CORS(app)

initialize_database()


@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "success",
        "message": "Backend is running!"
    })


@app.route("/api/logs", methods=["GET"])
def get_logs():
    connection = get_connection()
    rows = connection.execute(
        "SELECT * FROM logs ORDER BY id DESC"
    ).fetchall()
    connection.close()

    return jsonify({
        "status": "success",
        "logs": [dict(row) for row in rows]
    })


@app.route("/api/logs", methods=["POST"])
def add_log():
    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({
            "status": "error",
            "message": "A JSON object is required."
        }), 400

    source = data.get("source")
    level = data.get("level")
    message = data.get("message")

    if not all(
        isinstance(value, str) and value.strip()
        for value in (source, level, message)
    ):
        return jsonify({
            "status": "error",
            "message": "source, level, and message are required."
        }), 400

    source = source.strip()
    level = level.strip().upper()
    message = message.strip()

    if len(source) > 100 or len(level) > 20 or len(message) > 5000:
        return jsonify({
            "status": "error",
            "message": "One or more fields exceed the allowed length."
        }), 400

    timestamp = datetime.now(timezone.utc).isoformat()

    connection = get_connection()

    try:
        previous = connection.execute(
            "SELECT current_hash FROM logs ORDER BY id DESC LIMIT 1"
        ).fetchone()

        previous_hash = previous["current_hash"] if previous else "GENESIS"

        hash_data = json.dumps(
            {
                "timestamp": timestamp,
                "source": source,
                "level": level,
                "message": message,
                "previous_hash": previous_hash
            },
            sort_keys=True,
            separators=(",", ":")
        )

        current_hash = hashlib.sha256(
            hash_data.encode("utf-8")
        ).hexdigest()

        cursor = connection.execute(
            """
            INSERT INTO logs
            (timestamp, source, level, message, previous_hash, current_hash)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                timestamp,
                source,
                level,
                message,
                previous_hash,
                current_hash
            )
        )

        connection.commit()
        log_id = cursor.lastrowid

        return jsonify({
            "status": "success",
            "message": "Log added successfully.",
            "id": log_id,
            "current_hash": current_hash
        }), 201

    except Exception:
        connection.rollback()
        app.logger.exception("Failed to add security log")
        return jsonify({
            "status": "error",
            "message": "Could not save the log."
        }), 500

    finally:
        connection.close()

@app.route("/api/integrity/verify", methods=["POST"])
def verify_integrity():
    connection = get_connection()

    try:
        rows = connection.execute(
            "SELECT * FROM logs ORDER BY id ASC"
        ).fetchall()

        expected_previous_hash = "GENESIS"
        verified_count = 0
        errors = []

        for row in rows:
            log = dict(row)

            if log["previous_hash"] != expected_previous_hash:
                errors.append({
                    "id": log["id"],
                    "reason": "Previous hash link does not match."
                })

            hash_data = json.dumps(
                {
                    "timestamp": log["timestamp"],
                    "source": log["source"],
                    "level": log["level"],
                    "message": log["message"],
                    "previous_hash": log["previous_hash"]
                },
                sort_keys=True,
                separators=(",", ":")
            )

            calculated_hash = hashlib.sha256(
                hash_data.encode("utf-8")
            ).hexdigest()

            if calculated_hash != log["current_hash"]:
                errors.append({
                    "id": log["id"],
                    "reason": "Log content or hash has been changed."
                })

            expected_previous_hash = log["current_hash"]
            verified_count += 1

        return jsonify({
            "status": "success",
            "integrity": "intact" if not errors else "compromised",
            "total_logs": len(rows),
            "verified_logs": verified_count,
            "errors": errors
        })

    finally:
        connection.close()

@app.route("/api/analyze", methods=["POST"])
def analyze_logs():
    connection = None

    try:
        connection = get_connection()

        logs = connection.execute(
            "SELECT * FROM logs ORDER BY id ASC"
        ).fetchall()

        log_data = [dict(log) for log in logs]
        results = detect_anomalies(log_data)

        anomaly_count = sum(
            1 for result in results if result["is_anomaly"]
        )

        return jsonify({
            "status": "success",
            "total_logs": len(results),
            "anomaly_count": anomaly_count,
            "results": results
        })

    except Exception:
        app.logger.exception("AI log analysis failed")
        return jsonify({
            "status": "error",
            "message": "Could not analyze logs."
        }), 500

    finally:
        if connection is not None:
            connection.close()
if __name__ == "__main__":
    app.run(debug=True, port=5000)

import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest


def detect_anomalies(logs):
    """
    Detect unusual log activity using Isolation Forest.
    Each log should contain source, level, and message.
    """

    if not logs:
        return []

    features = []

    for log in logs:
        source = str(log.get("source", ""))
        level = str(log.get("level", "INFO")).upper()
        message = str(log.get("message", ""))

        features.append([
            len(source),
            len(message),
            message.count(" "),
            int(level in ["WARNING", "ERROR", "CRITICAL"]),
            int(level in ["ERROR", "CRITICAL"]),
            int(any(
                word in message.lower()
                for word in [
                    "failed", "unauthorized", "attack",
                    "suspicious", "malicious", "denied"
                ]
            ))
        ])

    data = pd.DataFrame(
        features,
        columns=[
            "source_length",
            "message_length",
            "word_spacing",
            "warning_or_higher",
            "error_or_critical",
            "suspicious_keyword"
        ]
    )

    # Isolation Forest needs at least two records to compare.
    if len(data) < 2:
        return [
            {
                "log": logs[0],
                "is_anomaly": False,
                "score": 0.0,
                "explanation": (
                    "Not enough log records for anomaly detection."
                )
            }
        ]

    model = IsolationForest(
        n_estimators=100,
        contamination="auto",
        random_state=42
    )

    predictions = model.fit_predict(data)
    scores = model.decision_function(data)

    results = []

    for index, log in enumerate(logs):
        is_anomaly = predictions[index] == -1

        reasons = []
        level = str(log.get("level", "INFO")).upper()
        message = str(log.get("message", "")).lower()

        if level in ["ERROR", "CRITICAL"]:
            reasons.append("High-severity log level")

        if any(
            word in message
            for word in [
                "failed", "unauthorized", "attack",
                "suspicious", "malicious", "denied"
            ]
        ):
            reasons.append("Suspicious keyword found")

        if is_anomaly and not reasons:
            reasons.append("Unusual log pattern compared with other records")

        results.append({
            "log": log,
            "is_anomaly": bool(is_anomaly),
            "score": round(float(scores[index]), 4),
           "explanation": (
    "; ".join(reasons)
    if is_anomaly and reasons
    else (
        "Unusual log pattern compared with other records."
        if is_anomaly
        else "No anomaly detected by the current model."
    )
)
        })

    return results
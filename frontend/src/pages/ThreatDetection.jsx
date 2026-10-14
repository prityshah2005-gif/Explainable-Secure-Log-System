
import { useState, useEffect } from "react";
import {
  Activity,
  AlertTriangle,
  Search,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { runAnalysis } from "../services/api";

function ThreatDetection() {
  const [search, setSearch] = useState("");
  const [selectedThreat, setSelectedThreat] = useState(null);
  const [threats, setThreats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasAnalyzed, setHasAnalyzed] = useState(false);
  const [totalLogs, setTotalLogs] = useState(0);

  async function loadThreats() {
    setLoading(true);
    setError("");

    try {
      const response = await runAnalysis();
      const data = response.data;

      setThreats(
        (data.results || []).filter(
          (result) => result.is_anomaly
        )
      );

      setTotalLogs(data.total_logs ?? 0);
      setHasAnalyzed(true);
      setSelectedThreat(null);
    } catch (err) {
      console.error("Threat analysis failed:", err);
      setError(
        "Could not load AI results. Check that the Flask backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadThreats();
  }, []);

  function getSeverity(result) {
    const level = String(
      result.log?.level || "INFO"
    ).toUpperCase();

    if (level === "CRITICAL" || level === "ERROR") {
      return "High";
    }

    if (level === "WARNING") {
      return "Medium";
    }

    return "Low";
  }

  const filteredThreats = threats.filter((result) => {
    const log = result.log || {};
    const severity = getSeverity(result);

    return [
      log.source,
      log.message,
      log.level,
      result.explanation,
      severity,
    ]
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase());
  });

  const highSeverity = threats.filter(
    (result) => getSeverity(result) === "High"
  ).length;

  return (
    <div className="threat-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Total flagged</span>
            <AlertTriangle size={20} />
          </div>
          <h2>{loading ? "..." : threats.length}</h2>
          <p>AI-flagged anomalies</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>High severity</span>
            <Activity size={20} />
          </div>
          <h2>{loading ? "..." : highSeverity}</h2>
          <p>Requires review</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Detection status</span>
            <ShieldCheck size={20} />
          </div>
          <h2>
            {loading
              ? "Running"
              : hasAnalyzed
                ? "Complete"
                : "Pending"}
          </h2>
          <p>
            {hasAnalyzed
              ? `${totalLogs} logs analyzed`
              : "AI analysis status"}
          </p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Threat Detection &amp; Explanations</h3>
            <p>
              Review suspicious logs identified by the AI model.
            </p>
          </div>

          <button
            className="secondary-button"
            onClick={loadThreats}
            disabled={loading}
          >
            <RefreshCw size={16} />
            {loading ? "Analyzing..." : "Run Analysis"}
          </button>
        </div>

        <div className="search-box log-search">
          <Search size={17} />
          <input
            placeholder="Search threats, sources or severity..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>

        {loading && (
          <p className="demo-label">
            Analyzing logs with the AI model...
          </p>
        )}

        {error && (
          <p role="alert" className="empty-state">
            {error}
          </p>
        )}

        {!loading && !error && hasAnalyzed && (
          <p className="demo-label">
            Showing results returned by the backend AI model.
          </p>
        )}

        {!loading && !error && hasAnalyzed && (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>SOURCE</th>
                  <th>LOG MESSAGE</th>
                  <th>SEVERITY</th>
                  <th>MODEL SCORE</th>
                  <th>EXPLANATION</th>
                  <th>DETAILS</th>
                </tr>
              </thead>

              <tbody>
                {filteredThreats.map((result, index) => {
                  const log = result.log || {};
                  const threatId = String(
                    log.id ?? `${log.timestamp || "log"}-${index}`
                  );
                  const severity = getSeverity(result);

                  return (
                    <tr key={threatId}>
                      <td className="user-cell">
                        {log.source || "Unknown"}
                      </td>

                      <td>{log.message || "No message"}</td>

                      <td>
                        <span
                          className={`severity ${severity.toLowerCase()}`}
                        >
                          {severity}
                        </span>
                      </td>

                      <td>
                        {Number.isFinite(Number(result.score))
                          ? Number(result.score).toFixed(4)
                          : "—"}
                      </td>

                      <td className="reason-cell">
                        {result.explanation ||
                          "Unusual log pattern detected."}
                      </td>

                      <td>
                        <button
                          className="text-button"
                          onClick={() =>
                            setSelectedThreat(
                              selectedThreat === threatId
                                ? null
                                : threatId
                            )
                          }
                        >
                          {selectedThreat === threatId
                            ? "Hide"
                            : "View"}
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filteredThreats.length === 0 && (
                  <tr>
                    <td colSpan="6" className="empty-state">
                      {threats.length === 0
                        ? "No anomalies were flagged by the model."
                        : "No matching threats found."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {selectedThreat && (
          <div className="threat-details">
            {filteredThreats
              .filter((result, index) => {
                const log = result.log || {};
                const id = String(
                  log.id ?? `${log.timestamp || "log"}-${index}`
                );
                return id === selectedThreat;
              })
              .map((result, index) => (
                <div key={selectedThreat || index}>
                  <h3>Investigation details</h3>
                  <p>
                    <strong>Source:</strong>{" "}
                    {result.log?.source || "Unknown"}
                  </p>
                  <p>
                    <strong>Log message:</strong>{" "}
                    {result.log?.message || "No message"}
                  </p>
                  <p>
                    <strong>Why flagged:</strong>{" "}
                    {result.explanation ||
                      "Unusual log pattern detected."}
                  </p>
                  <p>
                    <strong>Model score:</strong>{" "}
                    {result.score}
                  </p>
                  <p>
                    <strong>Suggested action:</strong>{" "}
                    Review the log details and confirm whether the activity was authorized.
                  </p>
                </div>
              ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default ThreatDetection;
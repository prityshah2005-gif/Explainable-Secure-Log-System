
import { useState } from "react";
import {
  ShieldCheck,
  ShieldAlert,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { verifyIntegrity } from "../services/api";

function IntegrityVerification() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function verifyLogs() {
    setLoading(true);
    setError("");

    try {
      const response = await verifyIntegrity();
      setResult(response.data);
    } catch (err) {
      console.error("Integrity verification failed:", err);
      setError(
        "Could not verify log integrity. Check whether the backend is running."
      );
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  const intact =
    result?.status === "success" &&
    result?.integrity === "intact";

  const compromised =
    result?.status === "success" &&
    result?.integrity === "compromised";

  const statusText = !result
    ? "Pending"
    : intact
      ? "Intact"
      : compromised
        ? "Compromised"
        : "Unknown";

  return (
    <div className="integrity-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Verification status</span>
            {intact ? (
              <ShieldCheck size={20} />
            ) : (
              <ShieldAlert size={20} />
            )}
          </div>
          <h2>{loading ? "Checking..." : statusText}</h2>
          <p>
            {result
              ? "Result from backend verification"
              : "Run a verification check"}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Hash algorithm</span>
            <LockKeyhole size={20} />
          </div>
          <h2>SHA-256</h2>
          <p>Log hash verification</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Hash chain</span>
            {intact ? (
              <ShieldCheck size={20} />
            ) : (
              <ShieldAlert size={20} />
            )}
          </div>
          <h2>
            {loading
              ? "Checking..."
              : result
                ? intact
                  ? "Valid"
                  : compromised
                    ? "Broken"
                    : "Unknown"
                : "Not checked"}
          </h2>
          <p>
            {result
              ? `${result.total_logs ?? 0} logs checked`
              : "Backend verification"}
          </p>
        </div>
      </div>

      <section className="panel integrity-verification-panel">
        <div className="panel-heading">
          <div>
            <h3>Log Integrity Verification</h3>
            <p>
              Check whether stored log records and their hash chain
              have been modified.
            </p>
          </div>
          <ShieldCheck size={24} />
        </div>

        <div className="integrity-graphic">
          <div className="shield-circle">
            {intact ? (
              <ShieldCheck size={39} />
            ) : (
              <ShieldAlert size={39} />
            )}
          </div>

          <h2>
            {loading
              ? "Verifying logs..."
              : !result
                ? "Ready for verification"
                : intact
                  ? "Integrity verified"
                  : compromised
                    ? "Integrity compromised"
                    : "Verification result received"}
          </h2>

          <p>
            {loading
              ? "Checking log hashes and chain links."
              : !result
                ? "Run verification to check your actual stored logs."
                : intact
                  ? "The backend reports that the log hash chain is intact."
                  : compromised
                    ? "The backend detected integrity problems. Review the reported errors."
                    : "The backend returned a result that needs further inspection."}
          </p>
        </div>

{result && (
  <div
    style={{
      padding: "16px",
      margin: "20px 0",
      borderRadius: "10px",
      background: result.integrity === "intact" ? "#dcfce7" : "#fee2e2",
      color: result.integrity === "intact" ? "#166534" : "#991b1b",
      fontWeight: "bold",
      fontSize: "20px",
    }}
  >
    {result.integrity === "intact"
      ? "✓ Integrity Intact"
      : "⚠ Integrity Compromised"}
  </div>
)}
        {result && (
          <div className="hash-example">
            <h4>Verification summary</h4>
            <p>
              Total logs: {result.total_logs ?? 0}
            </p>
            <p>
              Errors detected: {result.errors?.length ?? 0}
            </p>

            {Array.isArray(result.errors) &&
              result.errors.length > 0 && (
                <ul>
                  {result.errors.map((item, index) => (
                    <li key={index}>
                      {typeof item === "string"
                        ? item
                        : JSON.stringify(item)}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        )}

        {error && (
          <p role="alert" className="empty-state">
            {error}
          </p>
        )}

        <button
          className="primary-button"
          onClick={verifyLogs}
          disabled={loading}
        >
          <RefreshCw size={16} />
          {loading ? "Verifying..." : "Verify Log Integrity"}
        </button>
      </section>
    </div>
  );
}

export default IntegrityVerification;
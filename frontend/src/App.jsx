
import Evaluation from "./pages/Evaluation";
import IntegrityVerification from "./pages/IntegrityVerification";
import ThreatDetection from "./pages/ThreatDetection";
import Sidebar from "./components/Sidebar";
import { useState, useEffect } from "react";
import { getLogs, runAnalysis, verifyIntegrity } from "./services/api";
import LogExplorer from "./pages/LogExplorer";
import {
  ShieldCheck,
  LayoutDashboard,
  FileSearch,
  Activity,
  LockKeyhole,
  ChartNoAxesCombined,
  Bell,
  Search,
  Menu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ArrowUpRight,
  RefreshCw,
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

import "./App.css";

import StatCard from "./components/StatCard";

const activityData = [];

const initialAlerts = [
  {
    id: "ALT-001",
    user: "user_104",
    event: "Repeated failed logins",
    reason: "Multiple authentication failures in 5 minutes",
    severity: "High",
    time: "14:32:08",
  },
  {
    id: "ALT-002",
    user: "user_219",
    event: "Unusual data access",
    reason: "Number of records accessed is unusually high",
    severity: "Medium",
    time: "14:28:41",
  },
  {
    id: "ALT-003",
    user: "user_087",
    event: "After-hours activity",
    reason: "Activity occurred outside expected hours",
    severity: "Low",
    time: "14:15:19",
  },
];

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Log Explorer", icon: FileSearch },
  { label: "Threat Detection", icon: Activity },
  { label: "Integrity Verification", icon: LockKeyhole },
  { label: "Evaluation", icon: ChartNoAxesCombined },
];

function App() {
  const [activePage, setActivePage] = useState("Dashboard");
  const [search, setSearch] = useState("");
 const [alerts, setAlerts] = useState([]);
const [alertsLoading, setAlertsLoading] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
const [verified, setVerified] = useState(false);
const [integrityResult, setIntegrityResult] = useState(null);
const [verifying, setVerifying] = useState(false);
const [logs, setLogs] = useState([]);
const [activityData, setActivityData] = useState([]);
const [loadingLogs, setLoadingLogs] = useState(true);
const [backendError, setBackendError] = useState("");
const [anomalyCount, setAnomalyCount] = useState(0);
useEffect(() => {
  

async function loadLogs() {
  try {
    const response = await getLogs();
    const data = response.data;
    const logList = Array.isArray(data) ? data : data.logs || [];

    setLogs(logList);
    setBackendError("");

    const groupedLogs = {};

    logList.forEach((log) => {
      const timestamp = log.timestamp
        ? new Date(log.timestamp)
        : null;

      const time =
        timestamp && !Number.isNaN(timestamp.getTime())
          ? timestamp.toLocaleTimeString("en-GB", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "Unknown";

      if (!groupedLogs[time]) {
        groupedLogs[time] = {
          time,
          normal: 0,
          suspicious: 0,
        };
      }

      const level = String(log.level || "INFO").toUpperCase();
      const message = String(log.message || "").toLowerCase();

      const isSuspicious =
        ["WARNING", "ERROR", "CRITICAL"].includes(level) ||
        ["failed", "unauthorized", "attack", "suspicious", "malicious", "denied"]
          .some((word) => message.includes(word));

      if (isSuspicious) {
        groupedLogs[time].suspicious += 1;
      } else {
        groupedLogs[time].normal += 1;
      }
    });

    setActivityData(
      Object.values(groupedLogs).sort((a, b) =>
        a.time.localeCompare(b.time)
      )
    );
  } catch (error) {
    console.error("Failed to load logs:", error);
    setBackendError("Could not load logs from the backend.");
  } finally {
    setLoadingLogs(false);
  }
}
  
  loadLogs();
  loadDashboardAlerts();
}, []);

  const visibleAlerts = alerts.filter((alert) =>
    `${alert.user} ${alert.event} ${alert.reason}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  async function runDemoAnalysis() {
  try {
    setAnalyzed(false);

    const response = await runAnalysis();

    setAnomalyCount(response.data.anomaly_count ?? 0);
    setAnalyzed(true);
    setActivePage("Threat Detection");
  } catch (error) {
    console.error("AI analysis failed:", error);
    alert("Could not run AI analysis. Please check whether the backend is running.");
  }
}


async function loadDashboardAlerts() {
  try {
    setAlertsLoading(true);

    const response = await runAnalysis();
    const data = response.data;

    const flaggedLogs = (data.results || [])
      .filter((result) => result.is_anomaly)
      .map((result, index) => {
        const log = result.log || {};
        const level = String(log.level || "INFO").toUpperCase();

        const severity =
          level === "CRITICAL" || level === "ERROR"
            ? "High"
            : level === "WARNING"
              ? "Medium"
              : "Low";

        return {
          id: log.id ?? `ALT-${index + 1}`,
          user: log.source || "Unknown source",
          event: log.message || "Suspicious log activity",
          reason:
            result.explanation ||
            "The AI model detected an unusual log pattern.",
          severity,
          time: log.timestamp || "Time unavailable",
        };
      });

    setAlerts(flaggedLogs);
  } catch (error) {
    console.error("Failed to load dashboard alerts:", error);
  } finally {
    setAlertsLoading(false);
  }
}

 
async function runDemoVerification() {
  try {
    setVerifying(true);

    const response = await verifyIntegrity();
    const result = response.data;

    setIntegrityResult(result);
    setVerified(
      result.status === "success" &&
      result.integrity === "intact"
    );

    setActivePage("Integrity Verification");
  } catch (error) {
    console.error("Integrity verification failed:", error);
    alert("Could not verify integrity. Please check whether the backend is running.");
  } finally {
    setVerifying(false);
  }
}

  return (
    <div className="app-shell">
    <Sidebar
  activePage={activePage}
  setActivePage={setActivePage}
/>

      <main className="main-content">
        <header className="topbar">
          <div className="mobile-brand">
            <ShieldCheck size={23} />
            LogSecure
          </div>
          <div className="breadcrumb">
            Workspace <span>/</span> {activePage}
          </div>
          <div className="topbar-right">
            <span className="environment">
              <span className="status-dot" />
              Demo environment
            </span>
            <button
              className="icon-button"
              title="Notifications"
              onClick={() => setActivePage("Threat Detection")}
            >
              <Bell size={19} />
            </button>
            <div className="avatar">LS</div>
          </div>
        </header>

        <section className="page-content">
          <div className="page-heading">
            <div>
              <div className="eyebrow">SECURITY MONITORING</div>
              <h1>{activePage}</h1>
              <p>
                Monitor log integrity and investigate unusual activity.
              </p>
            </div>
            <button
              className="primary-button"
              onClick={runDemoAnalysis}
            >
              <RefreshCw size={16} />
              Run Analysis
            </button>
          </div>

          <div className="notice">
            <Activity size={18} />
            <div>
              <strong>Prototype preview</strong>
              <p>
                Dashboard values are sample data. Live backend integration
                will be added in a later step.
              </p>
            </div>
          </div>

          <div className="stats-grid">
           <StatCard
  title="Total Logs"
  value={loadingLogs ? "..." : logs.length.toLocaleString()}
  note={backendError || "Records from backend"}
  icon={FileSearch}
  color="blue"
/>
            <StatCard
              title="Flagged Anomalies"
              value={analyzed ? anomalyCount.toString() : "—"}
              note={analyzed ? "Results from AI analysis" : "Run analysis to check logs"}
              icon={AlertTriangle}
              color="orange"
            />
            
<StatCard
  title="Integrity Status"
  value={
    integrityResult
      ? integrityResult.integrity === "intact"
        ? "Intact"
        : integrityResult.integrity === "compromised"
          ? "Compromised"
          : "Error"
      : "Pending"
  }
  note={
    integrityResult
      ? `${integrityResult.verified_logs ?? 0} logs verified`
      : "Run integrity verification"
  }
  icon={
    verified
      ? CheckCircle2
      : integrityResult?.integrity === "compromised"
        ? XCircle
        : LockKeyhole
  }
  color={verified ? "green" : "orange"}
/>
            <StatCard
              title="Open Alerts"
              value={alerts.length.toString()}
              note="Require investigation"
              icon={Bell}
              color="purple"
            />
          </div>

          {activePage === "Dashboard" && (
            <>
              <div className="charts-grid">
                <section className="panel activity-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Activity Overview</h3>
                      <p>Sample normal and suspicious events</p>
                    </div>
                    <span className="period-tag">TODAY</span>
                  </div>

                  <div className="chart-legend">
                    <span><i className="legend-blue" /> Normal activity</span>
                    <span><i className="legend-orange" /> Suspicious activity</span>
                  </div>

                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={activityData}>
                        <CartesianGrid
                          stroke="#263449"
                          strokeDasharray="3 3"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="time"
                          stroke="#8493a8"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          stroke="#8493a8"
                          tickLine={false}
                          axisLine={false}
                          width={30}
                        />
                        <Tooltip
                          contentStyle={{
                            background: "#111d2e",
                            border: "1px solid #334155",
                            borderRadius: 10,
                          }}
                        />
                        <Area
                          type="monotone"
                          dataKey="normal"
                          name="Normal"
                          stroke="#5b9dff"
                          fill="#5b9dff"
                          fillOpacity={0.13}
                        />
                        <Area
                          type="monotone"
                          dataKey="suspicious"
                          name="Suspicious"
                          stroke="#fb923c"
                          fill="#fb923c"
                          fillOpacity={0.1}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </section>

                <section className="panel integrity-panel">
                  <div className="panel-heading">
                    <div>
                      <h3>Log Integrity</h3>
                      <p>SHA-256 hash-chain verification</p>
                    </div>
                    <LockKeyhole size={20} />
                  </div>

                  <div className="integrity-graphic">
                    <div className="shield-circle">
                      {verified ? (
                        <CheckCircle2 size={39} />
                      ) : (
                        <ShieldCheck size={39} />
                      )}
                    </div>
                    <h2>
  {integrityResult
    ? integrityResult.integrity === "intact"
      ? "Integrity Intact"
      : integrityResult.integrity === "compromised"
        ? "Integrity Compromised"
        : "Verification Error"
    : "Awaiting verification"}
</h2>

<p>
  {integrityResult
    ? `${integrityResult.verified_logs ?? 0} of ${
        integrityResult.total_logs ?? 0
      } logs verified. ${
        integrityResult.errors?.length ?? 0
      } integrity errors detected.`
    : "Run verification to check the real log hash chain."}
</p>
                  </div>

                  <button
  className="secondary-button full-button"
  onClick={runDemoVerification}
  disabled={verifying}
>
  {verifying ? "Verifying..." : "Verify Log Integrity"}
  <ArrowUpRight size={16} />
</button>
                </section>
              </div>

              <section className="panel alerts-panel">
                <div className="panel-heading alerts-heading">
                  <div>
                    <h3>Recent Security Alerts</h3>
                    <p>
  {alertsLoading
    ? "Loading AI-detected alerts..."
    : `${alerts.length} AI-flagged alerts requiring review`}
</p>
                  </div>
                  <button
                    className="text-button"
                    onClick={() => setActivePage("Threat Detection")}
                  >
                    View all <ArrowUpRight size={16} />
                  </button>
                </div>

                <div className="search-box">
                  <Search size={17} />
                  <input
                    placeholder="Search users or events..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>USER</th>
                        <th>EVENT</th>
                        <th>EXPLANATION</th>
                        <th>SEVERITY</th>
                        <th>TIME</th>
                      </tr>
                    </thead>
                    <tbody>
                      {visibleAlerts.map((alert) => (
                        <tr key={alert.id}>
                          <td className="user-cell">{alert.user}</td>
                          <td>{alert.event}</td>
                          <td className="reason-cell">{alert.reason}</td>
                          <td>
                            <span
                              className={`severity ${alert.severity.toLowerCase()}`}
                            >
                              {alert.severity}
                            </span>
                          </td>
                          <td className="time-cell">{alert.time}</td>
                        </tr>
                      ))}
                      {visibleAlerts.length === 0 && (
                        <tr>
                          <td colSpan="5" className="empty-state">
                            No matching alerts found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}

        {activePage === "Log Explorer" && <LogExplorer />} 

        {activePage === "Threat Detection" && <ThreatDetection />} 

        {activePage === "Integrity Verification" && (
  <IntegrityVerification />
)}

{activePage === "Evaluation" && <Evaluation />}          

          <footer className="footer">
            <span>LogSecure · Explainable Log Integrity System</span>
            <span>Prototype · Sample data only</span>
          </footer>
        </section>
      </main>
    </div>
  );
}


export default App;
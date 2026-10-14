
import {
  ShieldCheck,
  LayoutDashboard,
  FileSearch,
  Activity,
  LockKeyhole,
  ChartNoAxesCombined,
} from "lucide-react";

const navigation = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "Log Explorer", icon: FileSearch },
  { label: "Threat Detection", icon: Activity },
  { label: "Integrity Verification", icon: LockKeyhole },
  { label: "Evaluation", icon: ChartNoAxesCombined },
];

function Sidebar({ activePage, setActivePage }) {
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-icon">
          <ShieldCheck size={25} />
        </div>

        <div>
          <h2>LogSecure</h2>
          <p>INTELLIGENCE CENTER</p>
        </div>
      </div>

      <div className="nav-heading">WORKSPACE</div>

      <nav className="navigation">
        {navigation.map(({ label, icon: Icon }) => (
          <button
            key={label}
            className={`nav-item ${
              activePage === label ? "active" : ""
            }`}
            onClick={() => setActivePage(label)}
          >
            <Icon size={19} />
            <span>{label}</span>

            {label === "Threat Detection" && (
              <span className="nav-count">3</span>
            )}
          </button>
        ))}
      </nav>

      <div className="sidebar-bottom">
        <div className="system-status">
          <span className="status-dot" />
          <div>
            <strong>System overview</strong>
            <p>Demo interface running</p>
          </div>
        </div>

        <p className="version">LOGSECURE · VERSION 1.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
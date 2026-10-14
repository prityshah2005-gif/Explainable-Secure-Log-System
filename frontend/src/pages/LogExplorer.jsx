
import { useState } from "react";
import { Search, FileSearch } from "lucide-react";

const demoLogs = [
  {
    id: 1,
    timestamp: "2026-10-12 14:32:08",
    user: "user_104",
    event: "Failed login",
    source: "192.168.1.10",
    status: "Suspicious",
  },
  {
    id: 2,
    timestamp: "2026-10-12 14:28:41",
    user: "user_219",
    event: "File access",
    source: "192.168.1.15",
    status: "Normal",
  },
  {
    id: 3,
    timestamp: "2026-10-12 14:15:19",
    user: "user_087",
    event: "After-hours access",
    source: "192.168.1.20",
    status: "Suspicious",
  },
  {
    id: 4,
    timestamp: "2026-10-12 13:55:02",
    user: "user_104",
    event: "Login successful",
    source: "192.168.1.10",
    status: "Normal",
  },
];

function LogExplorer() {
  const [search, setSearch] = useState("");

  const filteredLogs = demoLogs.filter((log) =>
    Object.values(log)
      .join(" ")
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <section className="panel log-explorer-panel">
      <div className="panel-heading">
        <div>
          <h3>Log Explorer</h3>
          <p>Search and review security log records</p>
        </div>
        <FileSearch size={22} />
      </div>

      <div className="search-box log-search">
        <Search size={17} />
        <input
          type="text"
          placeholder="Search user, event, IP address or status..."
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <p className="demo-label">
        Demo records only — backend integration is not connected yet.
      </p>

      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>TIMESTAMP</th>
              <th>USER</th>
              <th>EVENT</th>
              <th>SOURCE IP</th>
              <th>STATUS</th>
            </tr>
          </thead>

          <tbody>
            {filteredLogs.map((log) => (
              <tr key={log.id}>
                <td>{log.timestamp}</td>
                <td className="user-cell">{log.user}</td>
                <td>{log.event}</td>
                <td>{log.source}</td>
                <td>
                  <span
                    className={`severity ${
                      log.status === "Suspicious"
                        ? "high"
                        : "low"
                    }`}
                  >
                    {log.status}
                  </span>
                </td>
              </tr>
            ))}

            {filteredLogs.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-state">
                  No matching logs found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default LogExplorer;
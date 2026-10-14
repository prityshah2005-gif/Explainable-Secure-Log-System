
import {
  BarChart3,
  Target,
  ShieldCheck,
  Activity,
} from "lucide-react";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

const demoMetrics = [
  { name: "Precision", value: 88 },
  { name: "Recall", value: 82 },
  { name: "F1 Score", value: 85 },
  { name: "Accuracy", value: 91 },
];

function Evaluation() {
  return (
    <div className="evaluation-page">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-top">
            <span>Accuracy</span>
            <Target size={20} />
          </div>
          <h2>91%</h2>
          <p>Illustrative demo value</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Precision</span>
            <ShieldCheck size={20} />
          </div>
          <h2>88%</h2>
          <p>Illustrative demo value</p>
        </div>

        <div className="stat-card">
          <div className="stat-top">
            <span>Recall</span>
            <Activity size={20} />
          </div>
          <h2>82%</h2>
          <p>Illustrative demo value</p>
        </div>
      </div>

      <section className="panel">
        <div className="panel-heading">
          <div>
            <h3>Model Evaluation Metrics</h3>
            <p>
              Example comparison of threat-detection performance metrics.
            </p>
          </div>
          <BarChart3 size={22} />
        </div>

        <p className="demo-label">
          Demo values only — these are not measured results from your AI model.
        </p>

        <div className="chart-container evaluation-chart">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={demoMetrics}>
              <CartesianGrid
                stroke="#263449"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis dataKey="name" stroke="#8493a8" />
              <YAxis
                stroke="#8493a8"
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value) => [`${value}%`, "Demo score"]}
                contentStyle={{
                  background: "#111d2e",
                  border: "1px solid #334155",
                  borderRadius: 10,
                }}
              />
              <Bar
                dataKey="value"
                name="Demo score"
                fill="#5b9dff"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
}

export default Evaluation;
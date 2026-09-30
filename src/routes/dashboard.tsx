import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell, Section, KpiCard } from "@/components/PageShell";
import { modelMetrics } from "@/data/bdaData";
import { CLUSTER_COLORS, DEPT_COLORS, byDepartment, byMonth, clusterCounts, kpis } from "@/lib/bda";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard Preview — Hospital Resource Utilization Analytics" },
      {
        name: "description",
        content: "Power BI-style preview of the exported hospital analytics results: KPI cards, occupancy by department, cluster mix and bed-demand trend.",
      },
      { property: "og:title", content: "Dashboard Preview — Hospital Resource Analytics" },
      { property: "og:description", content: "KPI cards and charts built from the Power BI-ready export." },
    ],
  }),
  component: Dashboard,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 12 };
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: 12,
};

function Dashboard() {
  const k = kpis();
  const depts = byDepartment();
  const monthly = byMonth();
  const counts = clusterCounts();
  const predictedTotal = Math.round(monthly[monthly.length - 1]?.predicted ?? 0);

  return (
    <PageShell
      eyebrow="Stage 5 · Reporting"
      title="Dashboard Preview"
      description="This is an in-app Dashboard Preview of the analytics output — not an embedded Power BI report. The same figures come from the Power BI-ready export, so the Power BI Desktop dashboard reproduces these visuals exactly."
    >
      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent bg-accent/40 p-4 text-sm">
        <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
          Dashboard Preview
        </span>
        <span className="text-accent-foreground">
          Built from <code className="font-mono text-xs">powerbi_export.csv</code> — the Power BI-ready export produced by the Python pipeline.
        </span>
        <a
          href="/data/powerbi_export.csv"
          download
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Download className="size-4" /> Download Power BI-ready CSV
        </a>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard label="Records" value={String(k.records)} hint="Department-months" />
        <KpiCard label="Avg occupancy" value={`${k.avgOccupancy}%`} hint="All departments" />
        <KpiCard label="High-utilization" value={String(k.highCount)} hint="K-Means cluster" />
        <KpiCard label="Predicted beds (latest)" value={String(predictedTotal)} hint="Hospital-wide" />
        <KpiCard label="Model accuracy" value={`R² ${modelMetrics.regression.r2}`} hint={`MAE ${modelMetrics.regression.mae} beds`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Section title="Occupancy by department" className="lg:col-span-2">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={depts}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="department" tick={axis} />
                <YAxis tick={axis} unit="%" />
                <Tooltip contentStyle={tooltipStyle} />
                <Bar dataKey="occupancy" name="Avg occupancy %" radius={[6, 6, 0, 0]}>
                  {depts.map((d, i) => (
                    <Cell key={d.department} fill={DEPT_COLORS[i % DEPT_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Cluster distribution">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={counts} dataKey="count" nameKey="cluster" innerRadius={55} outerRadius={90} paddingAngle={3}>
                  {counts.map((c) => (
                    <Cell key={c.cluster} fill={CLUSTER_COLORS[c.cluster]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="Monthly trend — occupied beds">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthly}>
                <defs>
                  <linearGradient id="occFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0.05} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={axis} interval={4} />
                <YAxis tick={axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Area type="monotone" dataKey="occupied" name="Occupied beds" stroke="var(--chart-1)" fill="url(#occFill)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Section>

        <Section title="Actual vs predicted beds">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={axis} interval={4} />
                <YAxis tick={axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="occupied" name="Actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--chart-4)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Section>
      </div>

      <Section title="Department summary table" subtitle="Averages across all 36 monthly periods.">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr>
              <th className="py-2">Department</th>
              <th className="text-right">Avg occupancy %</th>
              <th className="text-right">Avg occupied beds</th>
              <th className="text-right">Total admissions</th>
            </tr>
          </thead>
          <tbody>
            {depts.map((d) => (
              <tr key={d.department} className="border-t border-border">
                <td className="py-2">{d.department}</td>
                <td className="text-right tabular-nums">{d.occupancy}</td>
                <td className="text-right tabular-nums">{d.occupiedBeds}</td>
                <td className="text-right tabular-nums">{d.admissions.toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Section>
    </PageShell>
  );
}

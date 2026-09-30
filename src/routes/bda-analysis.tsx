import { createFileRoute } from "@tanstack/react-router";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { PageShell, Section, KpiCard } from "@/components/PageShell";
import { clusterSummary, forecasts, modelMetrics, results } from "@/data/bdaData";
import { CLUSTER_COLORS, byMonth, clusterCounts } from "@/lib/bda";

export const Route = createFileRoute("/bda-analysis")({
  head: () => ({
    meta: [
      { title: "BDA Analysis — K-Means & Linear Regression" },
      {
        name: "description",
        content:
          "K-Means utilization clusters and Linear Regression bed-demand predictions on hospital resource data, with MAE and R² metrics.",
      },
      { property: "og:title", content: "BDA Analysis — K-Means & Linear Regression" },
      { property: "og:description", content: "Cluster results, scatter plot and actual-vs-predicted occupied beds." },
    ],
  }),
  component: Analysis,
});

const axis = { stroke: "var(--muted-foreground)", fontSize: 12 };
const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: "0.75rem",
  fontSize: 12,
};

function Analysis() {
  const counts = clusterCounts();
  const monthly = byMonth();
  const scatter = results.map((r) => ({
    x: r.occupancy_rate,
    y: r.staff_utilization,
    cluster: r.utilization_cluster,
    department: r.department,
    month: r.month,
  }));

  return (
    <PageShell
      eyebrow="Stages 3 & 4 · Algorithms"
      title="BDA Analysis"
      description="Two algorithms are applied to the preprocessed dataset: K-Means clustering for utilization segmentation and Linear Regression for next-period bed demand. All numbers below come from the Python pipeline export."
    >
      {/* ------------------------------ K-MEANS ------------------------------ */}
      <Section
        title="1. K-Means Clustering (k = 3)"
        subtitle="Features used (standardised): occupancy_rate, admissions, avg_length_of_stay, staff_utilization. Clusters are named by their mean occupancy rate."
      >
        <div className="grid gap-4 md:grid-cols-3">
          {clusterSummary.map((c) => (
            <div key={c.utilization_cluster} className="rounded-xl border border-border p-4">
              <div className="flex items-center gap-2">
                <span
                  className="size-3 rounded-full"
                  style={{ background: CLUSTER_COLORS[c.utilization_cluster] }}
                />
                <h3 className="font-semibold">{c.utilization_cluster}</h3>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums">{c.records}</p>
              <p className="text-xs text-muted-foreground">department-month records</p>
              <dl className="mt-3 space-y-1 text-sm">
                <Row label="Avg occupancy" value={`${c.avg_occupancy_rate}%`} />
                <Row label="Avg admissions" value={String(Math.round(c.avg_admissions))} />
                <Row label="Avg length of stay" value={`${c.avg_length_of_stay} d`} />
                <Row label="Avg staff utilization" value={`${c.avg_staff_utilization}`} />
              </dl>
            </div>
          ))}
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Cluster distribution</h4>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="cluster" tick={axis} tickFormatter={(v: string) => v.split(" ")[0]} />
                  <YAxis tick={axis} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {counts.map((c) => (
                      <Cell key={c.cluster} fill={CLUSTER_COLORS[c.cluster]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Occupancy vs staff utilization, coloured by cluster</h4>
            <div className="mt-3 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 8, right: 8, bottom: 16, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis type="number" dataKey="x" name="Occupancy %" tick={axis} domain={[30, 100]} />
                  <YAxis type="number" dataKey="y" name="Staff utilization" tick={axis} />
                  <Tooltip contentStyle={tooltipStyle} cursor={{ strokeDasharray: "3 3" }} />
                  {Object.keys(CLUSTER_COLORS).map((c) => (
                    <Scatter
                      key={c}
                      name={c}
                      data={scatter.filter((s) => s.cluster === c)}
                      fill={CLUSTER_COLORS[c]}
                    />
                  ))}
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          <p className="font-medium text-foreground">How to read this</p>
          <p className="mt-1">
            K-Means places each department-month at a point in 4-dimensional feature space and repeatedly (i) assigns
            every point to the nearest cluster centre and (ii) moves each centre to the mean of its members, until the
            assignments stop changing. Features are standardised first so that admissions (in hundreds) do not dominate
            length of stay (in days). Final inertia (within-cluster sum of squares) for this run is{" "}
            <strong>{modelMetrics.kmeans_inertia}</strong>. The <em>High Utilization</em> cluster is dominated by ICU
            months — high occupancy and long stays with fewer admissions — while <em>Moderate Utilization</em> captures
            high-throughput Emergency months with short stays.
          </p>
        </div>

        <pre className="mt-4 overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-xs text-background">
{`X = StandardScaler().fit_transform(df[["occupancy_rate", "admissions",
                                       "avg_length_of_stay", "staff_utilization"]])
km = KMeans(n_clusters=3, n_init=10, random_state=42).fit(X)
df["cluster_id"] = km.labels_   # then renamed Low / Moderate / High by mean occupancy`}
        </pre>
      </Section>

      {/* -------------------------- LINEAR REGRESSION ------------------------- */}
      <Section
        title="2. Linear Regression — next-period occupied beds"
        subtitle="Target: occupied_beds. Trained on the earlier months, tested on the most recent months of every department."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="R² (test)" value={String(modelMetrics.regression.r2)} hint="Variance explained" />
          <KpiCard label="MAE (test)" value={`${modelMetrics.regression.mae} beds`} hint="Mean absolute error" />
          <KpiCard label="Training rows" value={String(modelMetrics.regression.train_rows)} />
          <KpiCard label="Test rows" value={String(modelMetrics.regression.test_rows)} />
        </div>

        <div className="mt-6 rounded-xl border border-border p-4">
          <h4 className="text-sm font-semibold">Actual vs predicted occupied beds (hospital total per month)</h4>
          <div className="mt-3 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" tick={axis} interval={3} />
                <YAxis tick={axis} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="occupied" name="Actual" stroke="var(--chart-1)" strokeWidth={2} dot={false} />
                <Line
                  type="monotone"
                  dataKey="predicted"
                  name="Predicted"
                  stroke="var(--chart-4)"
                  strokeWidth={2}
                  strokeDasharray="5 4"
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Next-period prediction by department</h4>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-xs uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Department</th>
                  <th>Last month</th>
                  <th className="text-right">Actual</th>
                  <th className="text-right">Predicted next</th>
                </tr>
              </thead>
              <tbody>
                {forecasts.map((f) => (
                  <tr key={f.department} className="border-t border-border">
                    <td className="py-2">{f.department}</td>
                    <td className="font-mono text-xs">{f.last_month}</td>
                    <td className="text-right tabular-nums">{f.last_occupied_beds}</td>
                    <td className="text-right font-semibold tabular-nums">{f.predicted_next_occupied_beds}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="mt-3 text-xs text-muted-foreground">
              Predictions assume next month's admissions, length of stay and staffing stay close to the latest observed
              month, and carry the latest occupied beds as the lag input.
            </p>
          </div>

          <div className="rounded-xl border border-border p-4">
            <h4 className="text-sm font-semibold">Model formula and features</h4>
            <p className="mt-2 font-mono text-xs leading-relaxed text-muted-foreground">
              occupied_beds = {modelMetrics.regression.intercept}
              {Object.entries(modelMetrics.regression.coefficients).map(([f, c]) => (
                <span key={f}>
                  {" "}
                  {Number(c) >= 0 ? "+" : "−"} {Math.abs(Number(c))}·{f}
                </span>
              ))}
            </p>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><strong className="text-foreground">admissions</strong> — patient inflow for the month.</li>
              <li><strong className="text-foreground">avg_length_of_stay</strong> — how long each admission holds a bed.</li>
              <li><strong className="text-foreground">staff_on_duty</strong> — staffing level, a proxy for operating capacity.</li>
              <li><strong className="text-foreground">prev_occupied_beds</strong> — previous month's occupancy, capturing trend and persistence.</li>
            </ul>
            <pre className="mt-3 overflow-x-auto rounded-lg bg-foreground p-3 font-mono text-xs text-background">
{`model = LinearRegression().fit(train[FEATURES], train["occupied_beds"])
pred  = model.predict(test[FEATURES])
mae   = mean_absolute_error(test["occupied_beds"], pred)
r2    = r2_score(test["occupied_beds"], pred)`}
            </pre>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-2">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-medium tabular-nums">{value}</dd>
    </div>
  );
}

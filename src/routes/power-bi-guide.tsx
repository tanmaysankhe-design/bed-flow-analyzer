import { createFileRoute } from "@tanstack/react-router";
import { Download } from "lucide-react";
import { PageShell, Section } from "@/components/PageShell";

export const Route = createFileRoute("/power-bi-guide")({
  head: () => ({
    meta: [
      { title: "Power BI Guide — Hospital Resource Utilization Analytics" },
      {
        name: "description",
        content: "Step-by-step instructions to import the exported CSV into Power BI Desktop and build KPI cards, occupancy, cluster and forecast visuals.",
      },
      { property: "og:title", content: "Power BI Guide — Hospital Resource Analytics" },
      { property: "og:description", content: "Exact import steps, fields and recommended visuals for the Power BI Desktop dashboard." },
    ],
  }),
  component: Guide,
});

const steps = [
  {
    t: "Produce the export",
    d: "Run the Python pipeline: `python generate_dataset.py` then `python bda_analysis.py`. This writes `data/powerbi_export.csv` (one row per department-month, already cleaned and with cluster labels and predictions).",
  },
  {
    t: "Import into Power BI Desktop",
    d: "Open Power BI Desktop → Home → Get data → Text/CSV → select `powerbi_export.csv` → Load. Keep the default comma delimiter and UTF-8 encoding.",
  },
  {
    t: "Check column types",
    d: "In Power Query / the Data view set `date` to Date, `month_name` and `department` and `utilization_cluster` to Text, and all numeric columns to Decimal or Whole Number. Close & Apply.",
  },
  {
    t: "Add a date hierarchy",
    d: "Mark `date` as a date column and use Power BI's built-in Year / Quarter / Month hierarchy on the axis of trend visuals. Sort `month_name` by the month number if you use it directly.",
  },
  {
    t: "Create measures (optional but recommended)",
    d: "New measure → `Avg Occupancy % = AVERAGE('powerbi_export'[occupancy_rate])`, `High Util Records = SUM('powerbi_export'[is_high_utilization])`, `MAE Beds = AVERAGEX('powerbi_export', ABS('powerbi_export'[prediction_error]))`.",
  },
  {
    t: "Add slicers",
    d: "Insert slicers for `department`, `year` and `utilization_cluster` so the whole report page filters together.",
  },
  {
    t: "Build the visuals",
    d: "Use the recommended visuals listed below, then arrange KPI cards across the top and charts in a 2×2 grid underneath.",
  },
];

const visuals = [
  { v: "KPI cards (4-5)", fields: "Avg Occupancy %, Count of rows, High Util Records, Average of predicted_occupied_beds, MAE Beds", why: "Top-line capacity health at a glance." },
  { v: "Clustered column chart — Occupancy by department", fields: "Axis: department · Values: Average of occupancy_rate", why: "Shows which departments run hottest." },
  { v: "Donut / pie chart — Cluster distribution", fields: "Legend: utilization_cluster · Values: Count of month", why: "Share of Low / Moderate / High utilization periods." },
  { v: "Line chart — Actual vs predicted beds", fields: "Axis: date · Values: Sum of occupied_beds and Sum of predicted_occupied_beds", why: "Visual check of Linear Regression accuracy." },
  { v: "Area or line chart — Monthly trend", fields: "Axis: date · Values: Sum of occupied_beds · Legend: department", why: "Seasonality and growth of bed demand." },
  { v: "Matrix — Department × cluster", fields: "Rows: department · Columns: utilization_cluster · Values: Count of month", why: "Which departments dominate each utilization group." },
  { v: "Scatter chart — Occupancy vs staff utilization", fields: "X: occupancy_rate · Y: staff_utilization · Legend: utilization_cluster · Details: department", why: "Reproduces the K-Means cluster plot." },
];

const columns = [
  ["date", "Date", "Month start date, for the time axis"],
  ["month / year / month_name", "Text / Whole number", "Convenience fields for slicers and labels"],
  ["department", "Text", "Slicer and axis field"],
  ["total_beds / occupied_beds / free_beds", "Whole number", "Capacity measures"],
  ["admissions / avg_length_of_stay / staff_on_duty", "Number", "Demand and staffing drivers"],
  ["equipment_utilization_pct / occupancy_rate / staff_utilization", "Decimal", "Utilization KPIs"],
  ["utilization_cluster", "Text", "K-Means label: Low / Moderate / High Utilization"],
  ["is_high_utilization", "Whole number", "1 when the record is in the High cluster — easy to SUM"],
  ["predicted_occupied_beds / prediction_error", "Decimal", "Linear Regression output and residual"],
];

function Guide() {
  return (
    <PageShell
      eyebrow="Stage 6 · Power BI"
      title="Power BI Guide"
      description="This web app deliberately does not embed Power BI — embedding needs a paid workspace and API. Instead the Python pipeline writes a clean, Power BI-ready CSV, and these steps rebuild the full dashboard in the free Power BI Desktop."
    >
      <div className="flex flex-wrap gap-3">
        <a href="/data/powerbi_export.csv" download className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
          <Download className="size-4" /> powerbi_export.csv
        </a>
        <a href="/data/analysis_results.csv" download className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
          <Download className="size-4" /> analysis_results.csv
        </a>
        <a href="/data/cluster_summary.csv" download className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
          <Download className="size-4" /> cluster_summary.csv
        </a>
        <a href="/data/forecast_next_period.csv" download className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary">
          <Download className="size-4" /> forecast_next_period.csv
        </a>
      </div>

      <Section title="Import steps">
        <ol className="space-y-3">
          {steps.map((s, i) => (
            <li key={s.t} className="rounded-xl border border-border p-4">
              <p className="text-sm font-semibold">
                <span className="mr-2 text-primary">{i + 1}.</span>
                {s.t}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Recommended visuals">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[46rem] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Visual</th>
                <th>Fields</th>
                <th>Purpose</th>
              </tr>
            </thead>
            <tbody>
              {visuals.map((v) => (
                <tr key={v.v} className="border-t border-border align-top">
                  <td className="py-3 pr-4 font-medium">{v.v}</td>
                  <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">{v.fields}</td>
                  <td className="py-3 text-muted-foreground">{v.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Column reference for powerbi_export.csv">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[42rem] text-sm">
            <thead className="text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="py-2">Column</th>
                <th>Power BI type</th>
                <th>Use</th>
              </tr>
            </thead>
            <tbody>
              {columns.map(([c, t, u]) => (
                <tr key={c} className="border-t border-border">
                  <td className="py-2 pr-4 font-mono text-xs text-primary">{c}</td>
                  <td className="py-2 pr-4">{t}</td>
                  <td className="py-2 text-muted-foreground">{u}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Refreshing the dashboard">
        <p className="text-sm text-muted-foreground">
          Re-run the Python pipeline whenever the dataset changes, keep the same file path, then press <strong>Refresh</strong>
          {" "}in Power BI Desktop. Because the export schema is fixed, every visual and measure keeps working without rebuilding.
        </p>
      </Section>
    </PageShell>
  );
}

import { createFileRoute, Link } from "@tanstack/react-router";
import { Database, GitBranch, LineChart, Boxes, Coffee, BarChart3 } from "lucide-react";
import { Section, KpiCard } from "@/components/PageShell";
import { kpis } from "@/lib/bda";
import { modelMetrics, results } from "@/data/bdaData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Hospital Resource Utilization Analytics — BDA Mini-Project" },
      {
        name: "description",
        content:
          "Academic Big Data Analytics mini-project analysing hospital bed, staff and equipment utilization using K-Means clustering and Linear Regression.",
      },
      { property: "og:title", content: "Hospital Resource Utilization Analytics" },
      {
        property: "og:description",
        content: "K-Means clustering and Linear Regression on synthetic hospital resource data, with a Power BI-ready export.",
      },
    ],
  }),
  component: Overview,
});

const stack = [
  { icon: Database, name: "Python", note: "pandas, numpy, scikit-learn — data cleaning, K-Means, Linear Regression, CSV exports" },
  { icon: Coffee, name: "Java", note: "Dependency-light CLI that reads analysis_results.csv and prints a summary report" },
  { icon: BarChart3, name: "Power BI Desktop", note: "Dashboard built from the exported powerbi_export.csv (no paid API used)" },
  { icon: Boxes, name: "React web app", note: "Documentation, data explorer and dashboard preview of the exported results" },
];

const workflow = [
  "Raw synthetic CSV (180 department-month records)",
  "Preprocessing: de-duplicate, handle missing, derive occupancy rate, staff utilization, lag feature",
  "K-Means clustering (k = 3) → Low / Moderate / High utilization groups",
  "Linear Regression → next-period occupied beds + MAE and R²",
  "Export analysis_results.csv and powerbi_export.csv",
  "Java report + Power BI Desktop dashboard",
];

function Overview() {
  const k = kpis();
  return (
    <div>
      <section className="hero-gradient text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] opacity-80">
            BE Computer Engineering · Big Data Analytics Mini-Project
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold md:text-5xl">
            Hospital Resource Utilization Analytics
          </h1>
          <p className="mt-4 max-w-2xl opacity-90">
            Understand how beds, ICU capacity, staff and equipment are used across five hospital departments,
            group periods into utilization levels, and predict near-term bed demand for capacity planning.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/bda-analysis"
              className="rounded-lg bg-background px-4 py-2 text-sm font-medium text-foreground transition-opacity hover:opacity-90"
            >
              View BDA Analysis
            </Link>
            <Link
              to="/dashboard"
              className="rounded-lg border border-primary-foreground/40 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary-foreground/10"
            >
              Dashboard Preview
            </Link>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-8 px-4 py-10">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard label="Records analysed" value={String(k.records)} hint="5 departments × 36 months" />
          <KpiCard label="Average occupancy" value={`${k.avgOccupancy}%`} hint="Occupied beds ÷ total beds" />
          <KpiCard label="High-utilization records" value={String(k.highCount)} hint="K-Means cluster assignment" />
          <KpiCard label="Regression R²" value={String(modelMetrics.regression.r2)} hint={`MAE ${modelMetrics.regression.mae} beds`} />
        </div>

        <Section title="Problem statement">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Hospital administrators plan capacity with limited visibility into how each department actually consumes
            resources. Beds may sit empty in one department while the ICU runs near saturation, staff rosters may not
            match patient load, and demand spikes are noticed only after they happen. This project analyses historical
            department-month resource records to (a) classify each department-month into a utilization group and
            (b) forecast the number of occupied beds for the next period, so capacity and staffing can be planned ahead.
          </p>
          <p className="mt-3 rounded-lg bg-secondary p-3 text-xs text-secondary-foreground">
            The dataset is <strong>synthetic</strong>, generated with a Python script for academic demonstration. It contains
            no real patient or hospital data.
          </p>
        </Section>

        <Section title="Objectives">
          <ul className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            {[
              "Build a clean, analysable dataset of hospital resource usage per department and month.",
              "Segment department-months into Low / Moderate / High utilization groups using K-Means.",
              "Predict next-period occupied beds using Linear Regression and report error metrics.",
              "Export results as a Power BI-ready CSV and document the dashboard build steps.",
              "Provide a Java companion component that reports on the exported results.",
              "Keep the full pipeline traceable: raw data → preprocessing → models → export → dashboard.",
            ].map((o) => (
              <li key={o} className="flex gap-2 rounded-lg bg-muted p-3">
                <span className="mt-1 size-1.5 shrink-0 rounded-full bg-primary" />
                {o}
              </li>
            ))}
          </ul>
        </Section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="BDA algorithms (exactly two)">
            <div className="space-y-4">
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <GitBranch className="size-4 text-primary" />
                  <h3 className="font-semibold">1. K-Means Clustering</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Unsupervised grouping of each department-month record into k = 3 clusters using standardised features:
                  occupancy rate, admissions, average length of stay and staff utilization. Clusters are then named by
                  mean occupancy as Low, Moderate or High Utilization.
                </p>
              </div>
              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center gap-2">
                  <LineChart className="size-4 text-primary" />
                  <h3 className="font-semibold">2. Linear Regression</h3>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Supervised prediction of occupied beds from admissions, average length of stay, staff on duty and the
                  previous month's occupied beds. Evaluated on the most recent months with MAE and R².
                </p>
              </div>
            </div>
          </Section>

          <Section title="Technology stack">
            <ul className="space-y-3">
              {stack.map((s) => (
                <li key={s.name} className="flex gap-3 rounded-lg border border-border p-3">
                  <s.icon className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span className="text-sm">
                    <span className="font-medium">{s.name}</span>
                    <span className="block text-muted-foreground">{s.note}</span>
                  </span>
                </li>
              ))}
            </ul>
          </Section>
        </div>

        <Section title="Architecture / workflow" subtitle="Every stage produces an artefact you can inspect.">
          <ol className="grid gap-3 md:grid-cols-3">
            {workflow.map((step, i) => (
              <li key={step} className="rounded-xl border border-border bg-muted/50 p-4 text-sm">
                <span className="text-xs font-semibold text-primary">STEP {i + 1}</span>
                <p className="mt-1">{step}</p>
              </li>
            ))}
          </ol>
          <pre className="mt-5 overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-xs leading-relaxed text-background">
{`hospital_resource_data.csv
        │  pandas: clean, derive occupancy_rate / staff_utilization / lag
        ▼
   preprocessed dataframe  ──►  KMeans(k=3)  ──►  utilization_cluster
        │                                              │
        └────────►  LinearRegression  ──►  predicted_occupied_beds
                                   │
                                   ▼
        analysis_results.csv  +  powerbi_export.csv
                     │                    │
             Java ReportSummary    Power BI Desktop dashboard`}
          </pre>
          <p className="mt-3 text-xs text-muted-foreground">
            Current run: {results.length} records, K-Means inertia {modelMetrics.kmeans_inertia}, regression trained on{" "}
            {modelMetrics.regression.train_rows} rows and tested on {modelMetrics.regression.test_rows} rows.
          </p>
        </Section>
      </div>
    </div>
  );
}

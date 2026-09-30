import { createFileRoute } from "@tanstack/react-router";
import { PageShell, Section } from "@/components/PageShell";

export const Route = createFileRoute("/run-project")({
  head: () => ({
    meta: [
      { title: "Run Project — Hospital Resource Utilization Analytics" },
      {
        name: "description",
        content: "Commands and folder structure for running the Python analytics pipeline and the Java summary reporter of this BDA mini-project.",
      },
      { property: "og:title", content: "Run Project — Hospital Resource Analytics" },
      { property: "og:description", content: "Python and Java run instructions with the full project folder structure." },
    ],
  }),
  component: RunProject,
});

const tree = `hospital-resource-analytics/
├── python/
│   ├── generate_dataset.py      # creates the synthetic dataset (180 rows)
│   └── bda_analysis.py          # preprocessing + K-Means + Linear Regression + exports
├── java/
│   └── ReportSummary.java       # CLI report over analysis_results.csv (JDK only)
├── data/
│   ├── hospital_resource_data.csv   # raw dataset
│   ├── analysis_results.csv         # per-record clusters + predictions
│   ├── powerbi_export.csv           # Power BI-ready export
│   ├── cluster_summary.csv          # K-Means cluster profile
│   ├── forecast_next_period.csv     # next-period bed prediction per department
│   └── model_metrics.json           # inertia, MAE, R2, coefficients
├── public/data/                 # same CSVs served by the web app for download
└── src/                         # React documentation & dashboard-preview app`;

function Block({ title, children }: { title: string; children: string }) {
  return (
    <div>
      <p className="text-sm font-medium">{title}</p>
      <pre className="mt-2 overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-xs leading-relaxed text-background">
        {children}
      </pre>
    </div>
  );
}

function RunProject() {
  return (
    <PageShell
      eyebrow="Reproduce"
      title="Run Project"
      description="The analytics run entirely offline with open-source tools. No paid API, database or cloud service is required."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <Section title="1. Python — analytics pipeline" subtitle="Requires Python 3.9+ with pandas, numpy and scikit-learn.">
          <div className="space-y-4">
            <Block title="Install dependencies">{`pip install pandas numpy scikit-learn`}</Block>
            <Block title="Generate the dataset and run the analysis">{`cd python
python generate_dataset.py
python bda_analysis.py`}</Block>
            <Block title="Expected output">{`[1] Loaded 180 rows, 5 departments
[2] Preprocessing done: derived occupancy_rate, staff_utilization, lag feature
[3] K-Means (k=3), inertia = 231.04
[4] Linear Regression  MAE=3.64 beds  R2=0.952
[5] Exported analysis_results.csv, powerbi_export.csv, ...`}</Block>
          </div>
        </Section>

        <Section title="2. Java — summary reporter" subtitle="Requires only a JDK (8 or newer). No external libraries.">
          <div className="space-y-4">
            <Block title="Compile and run">{`cd java
javac ReportSummary.java
java ReportSummary ../data/analysis_results.csv`}</Block>
            <Block title="Sample report">{`========================================================
 HOSPITAL RESOURCE UTILIZATION ANALYTICS - SUMMARY REPORT
========================================================
 Total records analysed     : 180
 Departments                : 5
 Average occupancy rate     : 76.26 %
 High-utilization records   : 36 (20.0 %)
 Avg predicted occupied beds: 55.62
 Mean absolute error (beds) : 2.93
--------------------------------------------------------
 DEPARTMENT            AVG OCC %  AVG PRED BEDS
 Emergency                 82.50          66.85
 General Medicine          75.51          89.08
 ICU                       92.08          37.28
 Pediatrics                61.81          35.82
 Surgery                   69.40          49.07`}</Block>
          </div>
        </Section>
      </div>

      <Section title="3. Power BI" subtitle="Open Power BI Desktop and follow the Power BI Guide page.">
        <p className="text-sm text-muted-foreground">
          Get data → Text/CSV → <code className="font-mono text-xs">data/powerbi_export.csv</code> → Load, then build the
          KPI cards and charts listed in the guide. Nothing is embedded in this web app, so no Power BI licence or API is needed.
        </p>
      </Section>

      <Section title="4. Web app (documentation & dashboard preview)">
        <Block title="Start the site locally">{`npm install
npm run dev`}</Block>
      </Section>

      <Section title="Project folder structure">
        <pre className="overflow-x-auto rounded-xl bg-foreground p-4 font-mono text-xs leading-relaxed text-background">
          {tree}
        </pre>
      </Section>
    </PageShell>
  );
}

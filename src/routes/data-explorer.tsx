import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Download } from "lucide-react";
import { PageShell, Section, KpiCard } from "@/components/PageShell";
import { results, departments, months } from "@/data/bdaData";
import { downloadCsv, kpis, toCsv } from "@/lib/bda";

export const Route = createFileRoute("/data-explorer")({
  head: () => ({
    meta: [
      { title: "Data Explorer — Hospital Resource Utilization Analytics" },
      {
        name: "description",
        content: "Browse and filter the synthetic hospital resource dataset by department and month, and download it as CSV.",
      },
      { property: "og:title", content: "Data Explorer — Hospital Resource Analytics" },
      { property: "og:description", content: "Filter 180 department-month records and export them as CSV." },
    ],
  }),
  component: DataExplorer,
});

function DataExplorer() {
  const [dept, setDept] = useState("All");
  const [month, setMonth] = useState("All");

  const rows = useMemo(
    () =>
      results.filter(
        (r) => (dept === "All" || r.department === dept) && (month === "All" || r.month === month),
      ),
    [dept, month],
  );
  const k = kpis(rows);

  const select = "rounded-lg border border-input bg-card px-3 py-2 text-sm";

  return (
    <PageShell
      eyebrow="Stage 1 · Raw data"
      title="Data Explorer"
      description="The synthetic dataset covers 5 departments across 36 monthly periods (180 records). Filter it below and download the raw CSV used by the Python pipeline."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Rows shown" value={String(k.records)} />
        <KpiCard label="Avg occupancy" value={`${k.avgOccupancy}%`} />
        <KpiCard label="Total admissions" value={k.totalAdmissions.toLocaleString()} />
        <KpiCard label="Avg length of stay" value={`${k.avgLos} days`} />
      </div>

      <Section>
        <div className="flex flex-wrap items-end gap-3">
          <label className="text-sm">
            <span className="block text-xs font-medium text-muted-foreground">Department</span>
            <select className={`mt-1 ${select}`} value={dept} onChange={(e) => setDept(e.target.value)}>
              <option>All</option>
              {departments.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </label>
          <label className="text-sm">
            <span className="block text-xs font-medium text-muted-foreground">Month</span>
            <select className={`mt-1 ${select}`} value={month} onChange={(e) => setMonth(e.target.value)}>
              <option>All</option>
              {months.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <button
            onClick={() => downloadCsv("hospital_filtered_data.csv", toCsv(rows))}
            className="ml-auto inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
          >
            <Download className="size-4" /> Download filtered CSV
          </button>
          <a
            href="/data/hospital_resource_data.csv"
            download
            className="inline-flex items-center gap-2 rounded-lg border border-input px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary"
          >
            <Download className="size-4" /> Raw dataset CSV
          </a>
        </div>

        <div className="mt-5 max-h-[32rem] overflow-auto rounded-xl border border-border">
          <table className="w-full min-w-[56rem] text-sm">
            <thead className="sticky top-0 bg-secondary text-left text-xs uppercase tracking-wide text-secondary-foreground">
              <tr>
                {["Month", "Department", "Total beds", "Occupied", "Admissions", "Avg LOS", "Staff", "Equip %", "Occupancy %", "Cluster"].map((h) => (
                  <th key={h} className="px-3 py-2 font-semibold">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.month}-${r.department}`} className="border-t border-border even:bg-muted/40">
                  <td className="px-3 py-2 font-mono text-xs">{r.month}</td>
                  <td className="px-3 py-2">{r.department}</td>
                  <td className="px-3 py-2 tabular-nums">{r.total_beds}</td>
                  <td className="px-3 py-2 tabular-nums">{r.occupied_beds}</td>
                  <td className="px-3 py-2 tabular-nums">{r.admissions}</td>
                  <td className="px-3 py-2 tabular-nums">{r.avg_length_of_stay}</td>
                  <td className="px-3 py-2 tabular-nums">{r.staff_on_duty}</td>
                  <td className="px-3 py-2 tabular-nums">{r.equipment_utilization_pct}</td>
                  <td className="px-3 py-2 tabular-nums">{r.occupancy_rate}</td>
                  <td className="px-3 py-2 text-xs">{r.utilization_cluster}</td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-3 py-6 text-center text-muted-foreground">
                    No records match these filters.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </Section>

      <Section title="Field dictionary">
        <div className="grid gap-2 text-sm md:grid-cols-2">
          {[
            ["month", "Reporting period (YYYY-MM)"],
            ["department", "Emergency, General Medicine, Surgery, ICU, Pediatrics"],
            ["total_beds", "Sanctioned beds in the department"],
            ["occupied_beds", "Average beds occupied during the month"],
            ["admissions", "Patients admitted during the month"],
            ["avg_length_of_stay", "Average stay per patient, in days"],
            ["staff_on_duty", "Average nursing and clinical staff on duty"],
            ["equipment_utilization_pct", "Share of critical equipment in active use"],
            ["occupancy_rate", "Derived: occupied_beds ÷ total_beds × 100"],
            ["staff_utilization", "Derived: patient-days per staff member, scaled to 0-100"],
          ].map(([f, d]) => (
            <div key={f} className="rounded-lg border border-border p-3">
              <code className="font-mono text-xs text-primary">{f}</code>
              <p className="text-muted-foreground">{d}</p>
            </div>
          ))}
        </div>
      </Section>
    </PageShell>
  );
}

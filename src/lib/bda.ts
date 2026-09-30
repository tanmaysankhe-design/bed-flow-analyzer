import { results, type ResultRow } from "@/data/bdaData";

export const CLUSTER_COLORS: Record<string, string> = {
  "Low Utilization": "var(--chart-2)",
  "Moderate Utilization": "var(--chart-3)",
  "High Utilization": "var(--chart-4)",
};

export const DEPT_COLORS = [
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
];

const round = (n: number, d = 1) => Number(n.toFixed(d));

export function kpis(rows: ResultRow[] = results) {
  const n = rows.length || 1;
  const occ = rows.reduce((s, r) => s + r.occupancy_rate, 0) / n;
  const beds = rows.reduce((s, r) => s + r.total_beds, 0) / n;
  const adm = rows.reduce((s, r) => s + r.admissions, 0);
  const los = rows.reduce((s, r) => s + r.avg_length_of_stay, 0) / n;
  const high = rows.filter((r) => r.utilization_cluster === "High Utilization").length;
  const mae = rows.reduce((s, r) => s + Math.abs(r.prediction_error), 0) / n;
  return {
    records: rows.length,
    avgOccupancy: round(occ, 2),
    avgBeds: round(beds, 0),
    totalAdmissions: adm,
    avgLos: round(los, 2),
    highCount: high,
    mae: round(mae, 2),
  };
}

export function byDepartment(rows: ResultRow[] = results) {
  const map = new Map<string, { department: string; occupancy: number; occupied: number; admissions: number; count: number }>();
  for (const r of rows) {
    const e = map.get(r.department) ?? { department: r.department, occupancy: 0, occupied: 0, admissions: 0, count: 0 };
    e.occupancy += r.occupancy_rate;
    e.occupied += r.occupied_beds;
    e.admissions += r.admissions;
    e.count += 1;
    map.set(r.department, e);
  }
  return [...map.values()].map((e) => ({
    department: e.department,
    occupancy: round(e.occupancy / e.count, 1),
    occupiedBeds: round(e.occupied / e.count, 0),
    admissions: e.admissions,
  }));
}

export function byMonth(rows: ResultRow[] = results) {
  const map = new Map<string, { month: string; occupied: number; predicted: number; admissions: number; count: number }>();
  for (const r of rows) {
    const e = map.get(r.month) ?? { month: r.month, occupied: 0, predicted: 0, admissions: 0, count: 0 };
    e.occupied += r.occupied_beds;
    e.predicted += r.predicted_occupied_beds;
    e.admissions += r.admissions;
    e.count += 1;
    map.set(r.month, e);
  }
  return [...map.values()]
    .sort((a, b) => a.month.localeCompare(b.month))
    .map((e) => ({
      month: e.month,
      occupied: round(e.occupied, 0),
      predicted: round(e.predicted, 0),
      admissions: e.admissions,
    }));
}

export function clusterCounts(rows: ResultRow[] = results) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.utilization_cluster, (map.get(r.utilization_cluster) ?? 0) + 1);
  return [...map.entries()].map(([cluster, count]) => ({ cluster, count }));
}

export function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const header = Object.keys(rows[0]);
  const lines = rows.map((r) => header.map((h) => String(r[h] ?? "")).join(","));
  return [header.join(","), ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

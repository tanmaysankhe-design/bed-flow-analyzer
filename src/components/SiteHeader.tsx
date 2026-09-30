import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

const links = [
  { to: "/", label: "Overview" },
  { to: "/data-explorer", label: "Data Explorer" },
  { to: "/bda-analysis", label: "BDA Analysis" },
  { to: "/dashboard", label: "Dashboard Preview" },
  { to: "/power-bi-guide", label: "Power BI Guide" },
  { to: "/run-project", label: "Run Project" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="hero-gradient flex size-9 items-center justify-center rounded-lg text-primary-foreground">
            <Activity className="size-5" />
          </span>
          <span className="leading-tight">
            <span className="block text-sm font-semibold">Hospital Resource Utilization Analytics</span>
            <span className="block text-xs text-muted-foreground">BE Computer Engineering · BDA Mini-Project</span>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-1 text-sm md:ml-auto">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              activeOptions={{ exact: l.to === "/" }}
              className="rounded-md px-3 py-1.5 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground font-medium" }}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-8 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Hospital Resource Utilization Analytics</p>
        <p className="mt-1">
          Dataset is synthetic and generated for academic demonstration only. No real patient data is used.
        </p>
        <p className="mt-1">Algorithms used: K-Means Clustering and Linear Regression (scikit-learn).</p>
      </div>
    </footer>
  );
}

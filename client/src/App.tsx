import { useQuery } from "@tanstack/react-query";
import type { HealthDTO } from "@shared/api";
import { Button } from "@/components/ui/button";
import { api } from "@/lib/api";

// Phase 0 placeholder: proves client → server → database are wired together.
// Replaced by the router shell in Phase 1.
export default function App() {
  const health = useQuery({
    queryKey: ["health"],
    queryFn: () => api.get<HealthDTO>("/health"),
  });

  return (
    <main className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center gap-6 px-5 py-12">
      <div>
        <p className="text-sm font-medium tracking-wide text-terracotta uppercase">Coming soon</p>
        <h1 className="mt-2 text-5xl font-semibold text-maroon">Aji's Kitchen</h1>
        <p lang="mr" className="mt-1 text-2xl text-muted-foreground">
          आजीचं स्वयंपाकघर
        </p>
      </div>

      <section className="rounded-2xl border bg-card p-5 shadow-sm" aria-live="polite">
        <h2 className="text-lg font-semibold">Kitchen status</h2>
        {health.isPending && <p className="mt-2 text-muted-foreground">Checking the kitchen…</p>}
        {health.isError && (
          <div className="mt-2 space-y-3">
            <p className="text-destructive">{health.error.message}</p>
            <Button variant="outline" onClick={() => void health.refetch()}>
              Try again
            </Button>
          </div>
        )}
        {health.isSuccess && (
          <dl className="mt-3 grid grid-cols-2 gap-y-1 text-sm">
            <dt className="text-muted-foreground">API</dt>
            <dd className="font-medium text-leaf">{health.data.status}</dd>
            <dt className="text-muted-foreground">Database</dt>
            <dd className={health.data.db === "connected" ? "font-medium text-leaf" : "font-medium text-destructive"}>
              {health.data.db}
            </dd>
            <dt className="text-muted-foreground">Server time</dt>
            <dd className="font-medium">{new Date(health.data.time).toLocaleTimeString("en-IN")}</dd>
          </dl>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <span className="h-8 w-8 rounded-full bg-terracotta" title="terracotta" />
        <span className="h-8 w-8 rounded-full bg-maroon" title="maroon" />
        <span className="h-8 w-8 rounded-full bg-saffron" title="saffron" />
        <span className="h-8 w-8 rounded-full bg-leaf" title="leaf" />
        <span className="h-8 w-8 rounded-full border bg-cream" title="cream" />
      </div>
    </main>
  );
}

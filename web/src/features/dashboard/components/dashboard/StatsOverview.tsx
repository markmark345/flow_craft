import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RunStatsDTO } from "@/types/dto";
import { Activity, CheckCircle, XCircle, Clock } from "lucide-react";

interface StatsOverviewProps {
  stats: RunStatsDTO | null;
  isLoading: boolean;
}

export function StatsOverview({ stats, isLoading }: StatsOverviewProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-10 bg-muted rounded" />
              <div className="h-3 w-16 bg-muted rounded mt-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const successRate = stats.total > 0 ? Math.round((stats.success / stats.total) * 100) : 0;

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="bg-[color-mix(in_srgb,var(--accent),transparent_95%)] border-[color-mix(in_srgb,var(--accent),transparent_80%)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-accent">Total Runs</CardTitle>
          <Activity className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">Lifetime executions</p>
        </CardContent>
      </Card>
      <Card className="bg-[color-mix(in_srgb,var(--success),transparent_90%)] border-[color-mix(in_srgb,var(--success),transparent_80%)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-success">Success Rate</CardTitle>
          <CheckCircle className="h-4 w-4 text-success" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-success">{successRate}%</div>
          <p className="text-xs text-success/80">{stats.success} successful</p>
        </CardContent>
      </Card>
      <Card className="bg-[color-mix(in_srgb,var(--error),transparent_90%)] border-[color-mix(in_srgb,var(--error),transparent_80%)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-error">Failed</CardTitle>
          <XCircle className="h-4 w-4 text-error" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-error">{stats.failed}</div>
          <p className="text-xs text-error/80">Need attention</p>
        </CardContent>
      </Card>
      <Card className="bg-[color-mix(in_srgb,var(--accent),transparent_90%)] border-[color-mix(in_srgb,var(--accent),transparent_80%)]">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-accent">Active</CardTitle>
          <Clock className="h-4 w-4 text-accent" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-accent">{stats.running + stats.queued}</div>
          <p className="text-xs text-accent/80">Running or Queued</p>
        </CardContent>
      </Card>
    </div>
  );
}

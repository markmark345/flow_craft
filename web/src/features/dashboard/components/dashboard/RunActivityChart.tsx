"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp } from "lucide-react";
import type { DailyStatDTO } from "@/features/runs/services/runsApi";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface RunActivityChartProps {
  data: DailyStatDTO[] | null;
  isLoading: boolean;
}

export function RunActivityChart({ data, isLoading }: RunActivityChartProps) {
  if (isLoading) {
    return (
      <Card className="h-[300px] animate-pulse">
        <CardHeader className="flex flex-row items-center gap-2">
          <div className="h-4 w-32 bg-muted rounded" />
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px]">
          <div className="h-full w-full bg-muted/50 rounded" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card className="h-[300px]">
        <CardHeader className="flex flex-row items-center gap-2">
          <BarChart3 className="h-5 w-5 text-accent" />
          <CardTitle className="text-lg">Run Activity</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-[220px]">
          <div className="text-center text-muted">
            <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-30" />
            <p>No run data available yet</p>
            <p className="text-xs mt-1">Run some flows to see activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Format dates for display (e.g., "Jan 15")
  const chartData = data.map((d) => {
    const date = new Date(d.date);
    return {
      ...d,
      label: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    };
  });

  return (
    <Card className="h-[300px]">
      <CardHeader className="flex flex-row items-center gap-2 pb-2">
        <BarChart3 className="h-5 w-5 text-accent" />
        <CardTitle className="text-lg">Run Activity</CardTitle>
        <span className="text-xs text-muted ml-auto">Last 7 days</span>
      </CardHeader>
      <CardContent className="h-[230px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={{ stroke: "var(--border)" }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "rgba(255, 255, 255, 0.95)",
                border: "1px solid rgba(0, 0, 0, 0.1)",
                borderRadius: "8px",
                fontSize: "12px",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              }}
              labelStyle={{ color: "#1a1a1a", fontWeight: 600, marginBottom: "4px" }}
              itemStyle={{ color: "#666", padding: "2px 0" }}
              cursor={{ fill: "rgba(0, 0, 0, 0.04)" }}
            />
            <Legend
              wrapperStyle={{ fontSize: "11px", paddingTop: "8px" }}
              iconType="circle"
              iconSize={8}
            />
            <Bar
              dataKey="success"
              name="Success"
              fill="var(--success)"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="failed"
              name="Failed"
              fill="var(--error)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

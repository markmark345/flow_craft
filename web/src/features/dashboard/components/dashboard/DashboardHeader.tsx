"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

interface DashboardHeaderProps {
  showInfo: (title: string, message: string) => void;
}

export function DashboardHeader({ showInfo }: DashboardHeaderProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="text-2xl font-bold text-text tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted mt-1">Overview of your automation landscape.</p>
      </div>
      <div className="flex gap-3">
        <Button
          variant="secondary"
          size="sm"
          className="h-9 px-4 rounded-lg"
          onClick={() => showInfo("Filters", "Dashboard filters are coming soon.")}
        >
          <Icon name="filter_list" className="text-[18px] mr-2" />
          Filter
        </Button>
        <Link href="/flows/new">
          <Button size="sm" className="h-9 px-4 rounded-lg">
            <Icon name="add" className="text-[18px] mr-2" />
            New Flow
          </Button>
        </Link>
      </div>
    </div>
  );
}

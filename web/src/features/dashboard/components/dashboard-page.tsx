"use client";

"use client";

import { useDashboardPage } from "../hooks/use-dashboard-page";
import { DashboardHeader } from "./dashboard/DashboardHeader";
import { RecentFlows } from "./dashboard/RecentFlows";
import { DashboardSidebar } from "./dashboard/DashboardSidebar";

export function DashboardPage() {
  const { recentFlows, recentRuns, showInfo, navigateToFlow } = useDashboardPage();

  return (
    <div className="min-h-screen bg-bg">
      <div className="p-6 md:p-8 max-w-7xl mx-auto w-full">
        <DashboardHeader showInfo={showInfo} />

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 items-start">
          <div className="space-y-8">
            <RecentFlows recentFlows={recentFlows} navigateToFlow={navigateToFlow} />
          </div>

          <DashboardSidebar recentRuns={recentRuns} showInfo={showInfo} />
        </div>
      </div>
    </div>
  );
}

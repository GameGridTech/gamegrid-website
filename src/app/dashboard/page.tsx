"use client";

/**
 * Dashboard Page
 * Main admin dashboard view that orchestrates all dashboard sections.
 * Content depends on the currently selected league from DashboardContext.
 * Sections: Upcoming Games, Stat Leaders, Standings.
 * The AlertsPanel is rendered in the layout (right column).
 */

import { useDashboard } from "@/lib/dashboard-context";
import { Trophy, Loader2 } from "lucide-react";
import UpcomingGames from "@/components/custom/dashboard/UpcomingGames";
import StatLeaders from "@/components/custom/dashboard/StatLeaders";
import StandingsTable from "@/components/custom/dashboard/StandingsTable";

export default function DashboardPage() {
  const { selectedLeague, leagues, leaguesLoading } = useDashboard();

  // Loading state while fetching leagues
  if (leaguesLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-[#0f5a1f]" />
      </div>
    );
  }

  // No leagues state — admin has no leagues yet
  if (leagues.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Trophy className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-xl font-bold text-gray-700 mb-2">
          No Leagues Found
        </h2>
        <p className="text-sm text-gray-500 max-w-md">
          You don&apos;t have any leagues associated with your admin account yet.
          Create a league in the GameGrid app to get started.
        </p>
      </div>
    );
  }

  // Waiting for league selection (should auto-select first league)
  if (!selectedLeague) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* ── Upcoming Games ── */}
      <UpcomingGames />

      {/* ── Stat Leaders ── */}
      <StatLeaders />

      {/* ── Standings ── */}
      <StandingsTable />
    </div>
  );
}

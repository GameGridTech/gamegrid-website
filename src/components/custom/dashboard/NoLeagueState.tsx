"use client";

/**
 * NoLeagueState
 * Empty state shown on management pages when the admin has no leagues, or
 * hasn't selected one yet. Offers a direct path to create a league.
 */

import Link from "next/link";
import { Trophy, Plus } from "lucide-react";

interface NoLeagueStateProps {
  /** Whether the admin has zero leagues (vs. just none selected) */
  hasNoLeagues?: boolean;
}

export default function NoLeagueState({ hasNoLeagues }: NoLeagueStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
      <Trophy className="mb-4 h-12 w-12 text-gray-300" />
      <h2 className="mb-2 text-xl font-bold text-gray-700">
        {hasNoLeagues ? "No leagues yet" : "Select a league"}
      </h2>
      <p className="mb-6 max-w-md text-sm text-gray-500">
        {hasNoLeagues
          ? "Create your first league to start managing teams, schedules, and standings."
          : "Choose a league from the sidebar to manage it, or create a new one."}
      </p>
      <Link
        href="/dashboard/leagues/new"
        className="inline-flex items-center gap-2 rounded-full bg-[#0f5a1f] px-6 py-2.5 text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-md"
      >
        <Plus className="h-4 w-4" />
        Create League
      </Link>
    </div>
  );
}

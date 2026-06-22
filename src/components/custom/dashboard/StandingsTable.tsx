"use client";

/**
 * StandingsTable
 * Displays the league standings in a clean table format.
 * Columns: Rank, Team (logo + name), W, L, PCT, GB
 * Fetches from league-standings endpoint and supports pagination.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import { getLeagueStandings, StandingRow } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StandingsTable() {
  const { token } = useAuth();
  const { selectedLeague } = useDashboard();

  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch standings when selected league changes
  useEffect(() => {
    if (!token || !selectedLeague) return;

    let cancelled = false;
    setLoading(true);

    const fetchStandings = async () => {
      try {
        const data = await getLeagueStandings(token, selectedLeague.id, 1, 50);
        if (!cancelled) setStandings(data.standings ?? []);
      } catch (error) {
        console.error("Failed to fetch standings:", error);
        if (!cancelled) setStandings([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    fetchStandings();
    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague]);

  return (
    <section className="p-5 overflow-hidden">
      <h2
        className="text-xl font-bold text-[#000000] uppercase tracking-wide mb-4"
        style={{ fontFamily: "var(--font-gamegrid-title)" }}
      >
        Standings
      </h2>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-10 w-full rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-12 w-full rounded" />
          ))}
        </div>
      ) : standings.length === 0 ? (
        <div className="rounded-xl bg-gray-100 p-8 text-center">
          <p className="text-sm text-gray-500">No standings available yet</p>
        </div>
      ) : (
        <div className="overflow-hidden">
          {/* Table: no rounded edges, no left/right borders, only vertical lines between columns */}
          <Table>
            <TableHeader>
              <TableRow className="bg-white hover:bg-white border-0">
                <TableHead className="w-[50px] text-center font-bold text-[#000000] text-xs uppercase border-0 border-r border-gray-200">
                  #
                </TableHead>
                <TableHead className="font-bold text-[#000000] text-xs uppercase border-0 border-r border-gray-200">
                  Team
                </TableHead>
                <TableHead className="text-center font-bold text-[#000000] text-xs uppercase w-[70px] border-0 border-r border-gray-200">
                  W
                </TableHead>
                <TableHead className="text-center font-bold text-[#000000] text-xs uppercase w-[70px] border-0 border-r border-gray-200">
                  L
                </TableHead>
                <TableHead className="text-center font-bold text-[#000000] text-xs uppercase w-[80px] border-0 border-r border-gray-200">
                  PCT
                </TableHead>
                <TableHead className="text-center font-bold text-[#000000] text-xs uppercase w-[70px] border-0">
                  GB
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {standings.map((team, index) => (
                <TableRow
                  key={team.id}
                  className={`transition-colors border-x-0 border-y-0 ${
                    index % 2 === 1 ? "bg-[#EFEFEF]" : "bg-white"
                  }`}
                >
                  {/* Rank */}
                  <TableCell className="text-center text-sm font-medium text-[#000000] border-0 border-r border-gray-200">
                    {index + 1}
                  </TableCell>

                  {/* Team name + logo */}
                  <TableCell className="border-0 border-r border-gray-200">
                    <div className="flex items-center gap-3">
                      <TeamLogo url={team.logoUrl} name={team.name} />
                      <span className="text-sm font-semibold text-[#000000]">
                        {team.name}
                      </span>
                    </div>
                  </TableCell>

                  {/* Wins */}
                  <TableCell className="text-center text-sm font-medium text-[#000000] border-0 border-r border-gray-200">
                    {team.wins}
                  </TableCell>

                  {/* Losses */}
                  <TableCell className="text-center text-sm font-medium text-[#000000] border-0 border-r border-gray-200">
                    {team.losses}
                  </TableCell>

                  {/* Win Percentage */}
                  <TableCell className="text-center text-sm font-medium text-[#000000] border-0 border-r border-gray-200">
                    {formatPct(team.winPercentage)}
                  </TableCell>

                  {/* Games Behind */}
                  <TableCell className="text-center text-sm font-medium text-[#000000] border-0">
                    {team.gamesBehind === 0 ? "-" : team.gamesBehind}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}

/** Format win percentage to 3 decimal places (e.g., .695) */
function formatPct(value: number): string {
  if (value === undefined || value === null) return ".000";
  // If the value is already between 0-1, display as-is
  const pct = value > 1 ? value / 100 : value;
  return pct.toFixed(3).replace(/^0/, "");
}

/** Small team logo with fallback initials */
function TeamLogo({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <div className="relative w-7 h-7 rounded-full overflow-hidden bg-white border border-gray-200 shrink-0">
        <Image
          src={url}
          alt={name}
          fill
          className="object-cover"
          sizes="28px"
        />
      </div>
    );
  }

  return (
    <div className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-[10px] font-bold text-white shrink-0">
      {name[0]?.toUpperCase()}
    </div>
  );
}

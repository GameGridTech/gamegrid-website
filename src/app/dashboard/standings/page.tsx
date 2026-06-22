"use client";

/**
 * Standings Page
 * Full league standings table for the selected league. Columns adapt to the
 * data the standings endpoint returns (points, W/L/D, points for/against,
 * differential, win %, and games behind). Tie-breaker configuration lives in
 * League Settings, which this page links to.
 */

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ListOrdered, Settings } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import { getLeagueStandings, StandingRow } from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function StandingsPage() {
  const { token } = useAuth();
  const { leagues, leaguesLoading, selectedLeague } = useDashboard();

  const [standings, setStandings] = useState<StandingRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !selectedLeague) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);

    getLeagueStandings(token, selectedLeague.id, 1, 100)
      .then((data) => {
        if (!cancelled) setStandings(data.standings ?? []);
      })
      .catch((error) => {
        console.error("Failed to fetch standings:", error);
        if (!cancelled) setStandings([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague]);

  if (!leaguesLoading && leagues.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Standings" />
        <NoLeagueState hasNoLeagues />
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="space-y-6">
        <PageHeader title="Standings" />
        <NoLeagueState />
      </div>
    );
  }

  // Decide which optional columns to show based on available data.
  const showDraws = standings.some((s) => s.draws !== undefined);
  const showPointsForAgainst = standings.some(
    (s) => s.pointsFor !== undefined || s.goalsFor !== undefined
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Standings"
        subtitle={selectedLeague.name}
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/settings">
              <Settings className="h-4 w-4" />
              Tie-breaker rules
            </Link>
          </Button>
        }
      />

      <div className="rounded-2xl border border-gray-200 bg-white p-2 shadow-sm sm:p-4">
        {loading ? (
          <div className="space-y-3 p-2">
            <Skeleton className="h-10 w-full rounded" />
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded" />
            ))}
          </div>
        ) : standings.length === 0 ? (
          <div className="py-16 text-center">
            <ListOrdered className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              No standings available yet. They populate once games are played.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-0 hover:bg-transparent">
                  <Th className="w-[50px] text-center">#</Th>
                  <Th>Team</Th>
                  <Th className="w-[60px] text-center">GP</Th>
                  <Th className="w-[60px] text-center">W</Th>
                  <Th className="w-[60px] text-center">L</Th>
                  {showDraws && <Th className="w-[60px] text-center">D</Th>}
                  <Th className="w-[70px] text-center">PTS</Th>
                  {showPointsForAgainst && (
                    <>
                      <Th className="w-[70px] text-center">PF</Th>
                      <Th className="w-[70px] text-center">PA</Th>
                      <Th className="w-[70px] text-center">DIFF</Th>
                    </>
                  )}
                  <Th className="w-[80px] text-center">PCT</Th>
                  <Th className="w-[60px] text-center">GB</Th>
                </TableRow>
              </TableHeader>
              <TableBody>
                {standings.map((team, index) => {
                  const draws = team.draws ?? 0;
                  const gp = team.wins + team.losses + draws;
                  const pf = team.pointsFor ?? team.goalsFor;
                  const pa = team.pointsAgainst ?? team.goalsAgainst;
                  const diff =
                    team.pointDifferential ??
                    team.goalDifferential ??
                    (pf !== undefined && pa !== undefined
                      ? pf - pa
                      : undefined);

                  return (
                    <TableRow
                      key={team.id}
                      className={`border-0 ${
                        index % 2 === 1 ? "bg-[#F7F7F7]" : "bg-white"
                      }`}
                    >
                      <Td className="text-center font-medium">{index + 1}</Td>
                      <Td>
                        <div className="flex items-center gap-3">
                          <TeamLogo url={team.logoUrl} name={team.name} />
                          <span className="font-semibold text-gray-900">
                            {team.name}
                          </span>
                        </div>
                      </Td>
                      <Td className="text-center">{gp}</Td>
                      <Td className="text-center">{team.wins}</Td>
                      <Td className="text-center">{team.losses}</Td>
                      {showDraws && <Td className="text-center">{draws}</Td>}
                      <Td className="text-center font-bold text-[#0D5A1E]">
                        {team.points}
                      </Td>
                      {showPointsForAgainst && (
                        <>
                          <Td className="text-center">{pf ?? "—"}</Td>
                          <Td className="text-center">{pa ?? "—"}</Td>
                          <Td className="text-center">
                            {diff === undefined
                              ? "—"
                              : diff > 0
                                ? `+${diff}`
                                : diff}
                          </Td>
                        </>
                      )}
                      <Td className="text-center">
                        {formatPct(team.winPercentage)}
                      </Td>
                      <Td className="text-center">
                        {team.gamesBehind === 0 ? "-" : team.gamesBehind}
                      </Td>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}

/** Styled table header cell */
function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableHead
      className={`text-xs font-bold uppercase text-gray-700 ${className}`}
    >
      {children}
    </TableHead>
  );
}

/** Styled table body cell */
function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TableCell className={`text-sm text-gray-800 ${className}`}>
      {children}
    </TableCell>
  );
}

/** Format win percentage to 3 decimals (e.g. .695) */
function formatPct(value: number): string {
  if (value === undefined || value === null) return ".000";
  const pct = value > 1 ? value / 100 : value;
  return pct.toFixed(3).replace(/^0/, "");
}

/** Small team logo with initials fallback */
function TeamLogo({ url, name }: { url?: string; name: string }) {
  if (url) {
    return (
      <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
        <Image src={url} alt={name} fill className="object-cover" sizes="28px" />
      </div>
    );
  }
  return (
    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-300 text-[10px] font-bold text-white">
      {name[0]?.toUpperCase()}
    </div>
  );
}

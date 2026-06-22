"use client";

/**
 * Game Detail Page
 * Shows the details of a single matchup/game. Since the backend exposes
 * schedules per-league (not a single-game endpoint), we resolve the matchup
 * by scanning the selected league's schedule across all time ranges and
 * matching on the matchup id or its game id.
 *
 * Stat corrections / result edits are part of the stat-oversight roadmap and
 * are surfaced here as a clearly-labeled "coming soon" panel.
 */

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Loader2,
  MapPin,
  CalendarDays,
  Clock,
  ClipboardList,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  getLeagueSchedule,
  ScheduleMatchup,
  ScheduleTeam,
  ScheduleTimeRange,
} from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import GameStatEditor from "@/components/custom/dashboard/GameStatEditor";

const TIME_RANGES: ScheduleTimeRange[] = [
  "pastWeek",
  "lastWeek",
  "thisWeek",
  "nextWeek",
];

export default function GameDetailPage() {
  const params = useParams();
  const gameId = params.id as string;
  const { token } = useAuth();
  const { selectedLeague, leaguesLoading, leagues } = useDashboard();

  const [matchup, setMatchup] = useState<ScheduleMatchup | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !selectedLeague) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    const findMatchup = async () => {
      try {
        // Scan all time ranges for a matchup matching this id (or its game id).
        for (const range of TIME_RANGES) {
          const data = await getLeagueSchedule(
            token,
            selectedLeague.id,
            range,
            1,
            50
          );
          for (const group of data.matchups ?? []) {
            const found = group.data.find(
              (m) => m.id === gameId || m.game?.id === gameId
            );
            if (found) {
              if (!cancelled) setMatchup(found);
              return;
            }
          }
        }
        if (!cancelled) setMatchup(null);
      } catch (error) {
        console.error("Failed to resolve game:", error);
        if (!cancelled) setMatchup(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    findMatchup();
    return () => {
      cancelled = true;
    };
  }, [token, selectedLeague, gameId]);

  if (!leaguesLoading && leagues.length === 0) {
    return <NoLeagueState hasNoLeagues />;
  }

  const backHref = selectedLeague
    ? `/dashboard/schedule/${selectedLeague.id}`
    : "/dashboard";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={backHref}
        className="inline-flex items-center gap-2 text-sm text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Schedule
      </Link>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f5a1f]" />
        </div>
      ) : !matchup ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-16 text-center">
          <CalendarDays className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <h2 className="mb-2 text-lg font-bold text-gray-700">
            Game not found
          </h2>
          <p className="mx-auto max-w-md text-sm text-gray-500">
            We couldn&apos;t find this game in the current league&apos;s
            schedule. It may belong to another league or season.
          </p>
        </div>
      ) : (
        <GameDetailContent matchup={matchup} />
      )}
    </div>
  );
}

function GameDetailContent({ matchup }: { matchup: ScheduleMatchup }) {
  const { teamA, teamB, game, location, matchDateTime, matchTime } = matchup;

  const isCompleted =
    game?.status === "COMPLETED" || game?.status === "completed";
  const isLive = game?.isLive;

  const dateLabel = matchDateTime
    ? new Date(matchDateTime).toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Date TBD";

  return (
    <div className="space-y-6">
      {/* ── Status header ── */}
      <div className="flex items-center justify-between">
        <h1
          className="text-2xl font-bold uppercase tracking-wide text-gray-900"
          style={{ fontFamily: "var(--font-gamegrid-title)" }}
        >
          Game Detail
        </h1>
        {isLive ? (
          <Badge variant="destructive">LIVE</Badge>
        ) : isCompleted ? (
          <Badge className="bg-gray-200 text-gray-700">Final</Badge>
        ) : (
          <Badge className="bg-[#0D5A1E]/10 text-[#0D5A1E]">Upcoming</Badge>
        )}
      </div>

      {/* ── Scoreboard ── */}
      <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <TeamSide team={teamA} align="left" />

          <div className="flex flex-col items-center">
            {game ? (
              <div className="flex items-center gap-3 text-4xl font-bold text-gray-900">
                <span
                  className={
                    game.homeScore > game.awayScore ? "text-[#0D5A1E]" : ""
                  }
                >
                  {game.homeScore}
                </span>
                <span className="text-gray-300">-</span>
                <span
                  className={
                    game.awayScore > game.homeScore ? "text-[#0D5A1E]" : ""
                  }
                >
                  {game.awayScore}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <Clock className="mx-auto mb-1 h-6 w-6 text-gray-300" />
                <p className="text-sm font-semibold text-gray-700">
                  {matchTime ?? "TBD"}
                </p>
              </div>
            )}
            {matchup.playoffLabel && (
              <Badge className="mt-2 bg-amber-100 text-amber-700">
                {matchup.playoffLabel}
              </Badge>
            )}
          </div>

          <TeamSide team={teamB} align="right" />
        </div>
      </div>

      {/* ── Meta ── */}
      <div className="grid gap-4 sm:grid-cols-2">
        <MetaCard
          icon={<CalendarDays className="h-5 w-5 text-[#0D5A1E]" />}
          label="Date"
          value={dateLabel}
        />
        <MetaCard
          icon={<MapPin className="h-5 w-5 text-[#0D5A1E]" />}
          label="Location"
          value={location || "To be determined"}
        />
      </div>

      {/* ── Stat corrections ── */}
      {game?.id ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h2
              className="text-lg font-bold uppercase tracking-wide text-gray-900"
              style={{ fontFamily: "var(--font-gamegrid-title)" }}
            >
              Stat Corrections
            </h2>
          </div>
          <p className="-mt-2 text-sm text-gray-500">
            Edit the play-by-play log to fix a wrong stat, reassign it to another
            player, or remove a mistaken entry. The box score updates instantly.
          </p>
          <GameStatEditor gameId={game.id} />
        </div>
      ) : (
        <div className="flex items-start gap-3 rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-6">
          <div className="rounded-xl bg-white p-2 shadow-sm">
            <ClipboardList className="h-5 w-5 text-[#0D5A1E]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              No stats to edit yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This game hasn&apos;t been played, so there&apos;s no stat log to
              correct. Once it&apos;s scored in the GameGrid app, the editable
              play-by-play log will appear here.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function TeamSide({
  team,
  align,
}: {
  team?: ScheduleTeam;
  align: "left" | "right";
}) {
  return (
    <div
      className={`flex flex-1 flex-col items-center gap-2 ${
        align === "left" ? "sm:items-start" : "sm:items-end"
      }`}
    >
      {team?.logoUrl ? (
        <div className="relative h-16 w-16 overflow-hidden rounded-full border border-gray-200 bg-white">
          <Image
            src={team.logoUrl}
            alt={team.name}
            fill
            className="object-cover"
            sizes="64px"
          />
        </div>
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-300 text-lg font-bold text-white">
          {team?.name?.[0]?.toUpperCase() ?? "?"}
        </div>
      )}
      <div className="text-center">
        <p className="font-bold text-gray-900">{team?.name ?? "TBD"}</p>
        <p className="text-xs text-gray-500">
          {team?.record ?? `${team?.wins ?? 0}-${team?.losses ?? 0}`}
        </p>
      </div>
    </div>
  );
}

function MetaCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="rounded-xl bg-[#0D5A1E]/5 p-2">{icon}</div>
      <div>
        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

"use client";

/**
 * GameCard
 * Displays a single upcoming or completed game matchup in a compact card.
 * Layout matches the mockup: [Logo A] [Record A] [Day/Time] [Record B] [Logo B]
 * with team names below and a green MANAGE button.
 */

import Image from "next/image";
import Link from "next/link";
import { ScheduleMatchup } from "@/lib/api";

interface GameCardProps {
  matchup: ScheduleMatchup;
}

export default function GameCard({ matchup }: GameCardProps) {
  const { teamA, teamB, game, dayOfWeek, matchTime } = matchup;

  // Format day label (e.g. "MONDAY" -> "Monday")
  const dayLabel =
    dayOfWeek.charAt(0).toUpperCase() + dayOfWeek.slice(1).toLowerCase();

  // Build record strings
  const recordA = teamA?.record ?? `${teamA?.wins ?? 0}-${teamA?.losses ?? 0}`;
  const recordB = teamB?.record ?? `${teamB?.wins ?? 0}-${teamB?.losses ?? 0}`;

  // Game state
  const isCompleted = game?.status === "COMPLETED" || game?.status === "completed";

  return (
    <div className="flex-shrink-0 w-[230px] sm:w-[260px] rounded-xl bg-[#EFEFEF] px-4 py-4">
      {/* ── Main row: Logo + Record | Day/Time | Record + Logo ── */}
      <div className="flex items-center justify-between">
        {/* Team A: logo + record */}
        <div className="flex items-center gap-1.5">
          <TeamLogo url={teamA?.logoUrl} name={teamA?.name} />
          <span className="text-sm font-bold text-[#000000]">{recordA}</span>
        </div>

        {/* Center: Day + Time */}
        <div className="text-center px-1">
          <p className="text-[11px] font-semibold text-[#717171] leading-tight">{dayLabel}</p>
          <p className="text-xs font-bold text-[#000000] leading-tight">
            {isCompleted ? "Final" : matchTime ?? "TBD"}
          </p>
        </div>

        {/* Team B: record + logo */}
        <div className="flex items-center gap-1.5">
          <span className="text-sm font-bold text-[#000000]">{recordB}</span>
          <TeamLogo url={teamB?.logoUrl} name={teamB?.name} />
        </div>
      </div>

      {/* ── Team names row with score highlighting winner in green ── */}
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] font-semibold text-[#000000] max-w-[80px] truncate">
          {teamA?.name ?? "TBD"}
        </span>
        {/* Score if game has been played - highlight winner in green */}
        {game && (
          <div className="flex items-center gap-1 text-xs font-bold">
            <span className={game.homeScore > game.awayScore ? "text-[#0D5A1E]" : "text-[#000000]"}>
              {game.homeScore}
            </span>
            <span className="text-[#717171]">-</span>
            <span className={game.awayScore > game.homeScore ? "text-[#0D5A1E]" : "text-[#000000]"}>
              {game.awayScore}
            </span>
          </div>
        )}
        <span className="text-[10px] font-semibold text-[#000000] max-w-[80px] truncate text-right">
          {teamB?.name ?? "TBD"}
        </span>
      </div>

      {/* MANAGE button - full width, dark green, per design */}
      <Link
        href={`/dashboard/game/${matchup.game?.id ?? matchup.id}`}
        className="mt-3 block w-full rounded-lg bg-[#0D5A1E] py-2 text-center text-sm font-bold uppercase tracking-wide text-white/90 hover:bg-[#0a4718] hover:text-white transition-colors"
        style={{ fontFamily: "var(--font-gamegrid-title)" }}
      >
        Manage
      </Link>
    </div>
  );
}

/** Team logo circle with fallback initials */
function TeamLogo({ url, name }: { url?: string; name?: string }) {
  if (url) {
    return (
      <div className="relative w-11 h-11 rounded-full overflow-hidden bg-white shrink-0">
        <Image
          src={url}
          alt={name ?? "Team"}
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>
    );
  }

  return (
    <div className="w-11 h-11 rounded-full bg-gray-300 flex items-center justify-center text-xs font-bold text-white shrink-0">
      {name?.[0]?.toUpperCase() ?? "?"}
    </div>
  );
}

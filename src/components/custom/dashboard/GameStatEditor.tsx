"use client";

/**
 * GameStatEditor
 * Admin stat-correction surface for a single game. Because the stat engine is
 * event-sourced, corrections work by editing the underlying play-by-play log:
 *  - change a stat's type (e.g. a 3PT logged that should be a 2PT)
 *  - reassign a stat to a different player
 *  - delete a mistakenly-recorded stat
 * After any edit the box score is refetched (the engine recomputes totals);
 * a manual "Recalculate" button is also provided.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  RefreshCw,
  Pencil,
  Trash2,
  ListChecks,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  getGameStats,
  getGameEvents,
  changeEventStat,
  changeEventPlayer,
  deleteGameEvent,
  recalculateGameStats,
  eventTypeLabel,
  SPORT_EVENT_TYPES,
  GameBoxScore,
  BoxScorePlayer,
  PlayEvent,
  ApiError,
} from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface GameStatEditorProps {
  gameId: string;
}

/** Resolved lookup info for a player referenced by an event */
interface PlayerInfo {
  name: string;
  teamId: string;
  side: "home" | "away";
}

export default function GameStatEditor({ gameId }: GameStatEditorProps) {
  const { token } = useAuth();

  const [boxScore, setBoxScore] = useState<GameBoxScore | null>(null);
  const [events, setEvents] = useState<PlayEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [recalculating, setRecalculating] = useState(false);

  const [editEvent, setEditEvent] = useState<PlayEvent | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PlayEvent | null>(null);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      // Box score may 400 if teams are still TBD; fetch both, tolerate stats failure.
      const [stats, log] = await Promise.all([
        getGameStats(token, gameId).catch((e) => {
          if (e instanceof ApiError && e.status === 400) {
            throw new Error(
              "Stat keeping isn't available for this game yet (teams not assigned)."
            );
          }
          return null;
        }),
        getGameEvents(token, gameId).catch(() => [] as PlayEvent[]),
      ]);
      setBoxScore(stats);
      setEvents(log);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load game stats.");
    } finally {
      setLoading(false);
    }
  }, [token, gameId]);

  useEffect(() => {
    load();
  }, [load]);

  // Build playerId -> info and teamId -> side maps from the box score.
  const { playerMap, sport, homePlayers, awayPlayers } = useMemo(() => {
    const map = new Map<string, PlayerInfo>();
    const homeId = boxScore?.homeTeam.teamId ?? "";
    const awayId = boxScore?.awayTeam.teamId ?? "";

    for (const p of boxScore?.homePlayerStats ?? []) {
      map.set(p.playerId, { name: p.playerName, teamId: homeId, side: "home" });
    }
    for (const p of boxScore?.awayPlayerStats ?? []) {
      map.set(p.playerId, { name: p.playerName, teamId: awayId, side: "away" });
    }

    return {
      playerMap: map,
      sport: (boxScore?.gameInfo.sport ?? "").toLowerCase(),
      homePlayers: boxScore?.homePlayerStats ?? [],
      awayPlayers: boxScore?.awayPlayerStats ?? [],
    };
  }, [boxScore]);

  const handleRecalculate = async () => {
    if (!token) return;
    setRecalculating(true);
    try {
      await recalculateGameStats(token, gameId);
      toast.success("Stats recalculated from the game log.");
      await load();
    } catch (e) {
      toast.error(extractError(e, "Failed to recalculate stats."));
    } finally {
      setRecalculating(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-bold text-amber-800">
            Stat editing unavailable
          </p>
          <p className="text-sm text-amber-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* ── Box score ── */}
      {boxScore && (
        <div className="grid gap-4 lg:grid-cols-2">
          <BoxScoreCard
            teamName={boxScore.homeTeam.teamName}
            teamPts={boxScore.homeTeam.pts}
            players={homePlayers}
          />
          <BoxScoreCard
            teamName={boxScore.awayTeam.teamName}
            teamPts={boxScore.awayTeam.pts}
            players={awayPlayers}
          />
        </div>
      )}

      {/* ── Game log ── */}
      <div className="rounded-2xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between gap-3 border-b border-gray-100 p-5">
          <div className="flex items-center gap-2">
            <ListChecks className="h-5 w-5 text-[#0D5A1E]" />
            <h2 className="text-lg font-bold text-gray-900">Game Log</h2>
            <Badge className="bg-gray-100 text-gray-600">
              {events.length} events
            </Badge>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRecalculate}
            disabled={recalculating}
          >
            {recalculating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Recalculate
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="py-14 text-center">
            <ListChecks className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              No events recorded for this game yet.
            </p>
          </div>
        ) : (
          <div className="max-h-[560px] divide-y divide-gray-100 overflow-y-auto">
            {[...events].reverse().map((event) => (
              <EventRow
                key={event.id}
                event={event}
                playerInfo={
                  event.playerId ? playerMap.get(event.playerId) : undefined
                }
                onEdit={() => setEditEvent(event)}
                onDelete={() => setDeleteTarget(event)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Edit dialog ── */}
      <EditEventDialog
        gameId={gameId}
        event={editEvent}
        sport={sport}
        homeTeamName={boxScore?.homeTeam.teamName ?? "Home"}
        awayTeamName={boxScore?.awayTeam.teamName ?? "Away"}
        homePlayers={homePlayers}
        awayPlayers={awayPlayers}
        onClose={() => setEditEvent(null)}
        onSaved={async () => {
          setEditEvent(null);
          await load();
        }}
      />

      {/* ── Delete confirm ── */}
      <Dialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this event?</DialogTitle>
            <DialogDescription>
              {deleteTarget && (
                <>
                  Removing{" "}
                  <span className="font-semibold">
                    {eventTypeLabel(deleteTarget.eventType)}
                  </span>{" "}
                  {deleteTarget.playerId &&
                    `by ${playerMap.get(deleteTarget.playerId)?.name ?? "a player"} `}
                  will update the box score. This can&apos;t be undone.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Cancel
            </Button>
            <DeleteButton
              gameId={gameId}
              event={deleteTarget}
              onDeleted={async () => {
                setDeleteTarget(null);
                await load();
              }}
            />
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** Per-team box score card listing players and points */
function BoxScoreCard({
  teamName,
  teamPts,
  players,
}: {
  teamName: string;
  teamPts: number;
  players: BoxScorePlayer[];
}) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-bold text-gray-900">{teamName}</h3>
        <span className="text-xl font-bold text-[#0D5A1E]">{teamPts}</span>
      </div>
      {players.length === 0 ? (
        <p className="py-4 text-center text-sm text-gray-400">
          No player stats yet.
        </p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {[...players]
            .sort((a, b) => b.pts - a.pts)
            .map((p) => (
              <li
                key={p.playerId}
                className="flex items-center justify-between py-2 text-sm"
              >
                <span className="flex items-center gap-2 text-gray-800">
                  {p.jerseyNumber && (
                    <span className="inline-flex h-5 w-6 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-500">
                      {p.jerseyNumber}
                    </span>
                  )}
                  {p.playerName}
                  {p.dnp && (
                    <span className="text-[10px] font-semibold uppercase text-gray-400">
                      DNP
                    </span>
                  )}
                </span>
                <span className="font-semibold text-gray-900">{p.pts} pts</span>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}

/** A single play-by-play row with edit/delete actions */
function EventRow({
  event,
  playerInfo,
  onEdit,
  onDelete,
}: {
  event: PlayEvent;
  playerInfo?: PlayerInfo;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center gap-3 px-5 py-3 transition-colors hover:bg-gray-50">
      <Badge className="shrink-0 bg-gray-100 font-mono text-xs text-gray-600">
        P{event.period}
      </Badge>

      <div className="w-16 shrink-0 text-center text-xs font-semibold text-gray-500">
        {event.homeScoreAtTime}-{event.awayScoreAtTime}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-900">
          {eventTypeLabel(event.eventType)}
        </p>
        <p className="truncate text-xs text-gray-500">
          {playerInfo?.name ?? (event.playerId ? "Unknown player" : "Team event")}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onEdit}
          aria-label="Edit event"
        >
          <Pencil className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={onDelete}
          className="text-gray-400 hover:bg-red-50 hover:text-red-600"
          aria-label="Delete event"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

/** Dialog to change an event's stat type and/or assigned player */
function EditEventDialog({
  gameId,
  event,
  sport,
  homeTeamName,
  awayTeamName,
  homePlayers,
  awayPlayers,
  onClose,
  onSaved,
}: {
  gameId: string;
  event: PlayEvent | null;
  sport: string;
  homeTeamName: string;
  awayTeamName: string;
  homePlayers: BoxScorePlayer[];
  awayPlayers: BoxScorePlayer[];
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [newType, setNewType] = useState("");
  const [newPlayerId, setNewPlayerId] = useState("");
  const [reason, setReason] = useState("");
  const [saving, setSaving] = useState(false);

  // Seed the form whenever a new event is opened.
  useEffect(() => {
    if (event) {
      setNewType(event.eventType);
      setNewPlayerId(event.playerId ?? "");
      setReason("");
    }
  }, [event]);

  // Sport-appropriate options, ensuring the current type is always selectable
  // even if it isn't in the standard list (e.g. lifecycle events).
  const allTypeOptions = useMemo(() => {
    const typeOptions = SPORT_EVENT_TYPES[sport] ?? [];
    if (event && !typeOptions.includes(event.eventType)) {
      return [event.eventType, ...typeOptions];
    }
    return typeOptions;
  }, [event, sport]);

  const handleSave = async () => {
    if (!token || !event) return;
    const typeChanged = newType && newType !== event.eventType;
    const playerChanged = newPlayerId && newPlayerId !== (event.playerId ?? "");

    if (!typeChanged && !playerChanged) {
      toast.info("Nothing changed.");
      return;
    }

    setSaving(true);
    try {
      // Apply player reassignment first, then stat-type change, so both stick.
      if (playerChanged) {
        await changeEventPlayer(token, gameId, event.id, {
          newPlayerId,
          reason: reason.trim() || undefined,
        });
      }
      if (typeChanged) {
        await changeEventStat(token, gameId, event.id, {
          newEventType: newType,
          reason: reason.trim() || undefined,
        });
      }
      toast.success("Event updated and box score recalculated.");
      await onSaved();
    } catch (e) {
      toast.error(extractError(e, "Failed to update event."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={!!event} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit event</DialogTitle>
          <DialogDescription>
            Correct the stat type or reassign it to a different player. The box
            score updates automatically.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Stat type</Label>
            <Select value={newType} onValueChange={setNewType}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {allTypeOptions.map((t) => (
                  <SelectItem key={t} value={t}>
                    {eventTypeLabel(t)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Player</Label>
            <Select value={newPlayerId} onValueChange={setNewPlayerId}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a player" />
              </SelectTrigger>
              <SelectContent>
                {homePlayers.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{homeTeamName}</SelectLabel>
                    {homePlayers.map((p) => (
                      <SelectItem key={p.playerId} value={p.playerId}>
                        {p.playerName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
                {awayPlayers.length > 0 && (
                  <SelectGroup>
                    <SelectLabel>{awayTeamName}</SelectLabel>
                    {awayPlayers.map((p) => (
                      <SelectItem key={p.playerId} value={p.playerId}>
                        {p.playerName}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Logged as a 3 but was a 2"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Confirmed delete action button */
function DeleteButton({
  gameId,
  event,
  onDeleted,
}: {
  gameId: string;
  event: PlayEvent | null;
  onDeleted: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!token || !event) return;
    setDeleting(true);
    try {
      await deleteGameEvent(token, gameId, event.id);
      toast.success("Event deleted and box score updated.");
      await onDeleted();
    } catch (e) {
      toast.error(extractError(e, "Failed to delete event."));
      setDeleting(false);
    }
  };

  return (
    <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
      {deleting ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" /> Deleting...
        </>
      ) : (
        <>
          <Trash2 className="h-4 w-4" /> Delete event
        </>
      )}
    </Button>
  );
}

/** Extract a friendly message from an ApiError (or fall back) */
function extractError(error: unknown, fallback: string): string {
  if (error instanceof ApiError) {
    const message = (error.data as { message?: string | string[] })?.message;
    if (Array.isArray(message)) return message.join(", ");
    if (message) return message;
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

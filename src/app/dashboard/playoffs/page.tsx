"use client";

/**
 * Playoffs Page
 * - If no bracket exists: shows a "create bracket" form (team count, format,
 *   name, live-outlook toggle).
 * - If a bracket exists: renders it round-by-round and, when the bracket is
 *   still NOT_STARTED, offers a "confirm & lock" action to start the playoffs.
 *
 * Operates on the selected league from DashboardContext.
 */

import { useCallback, useEffect, useState } from "react";
import {
  Loader2,
  Trophy,
  Lock,
  Plus,
  Check,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  getActivePlayoffBracket,
  getPlayoffBracketDetail,
  createPlayoffBracket,
  confirmPlayoffBracket,
  PlayoffBracket,
  PlayoffNode,
  PlayOffFormat,
  PLAYOFF_FORMAT_OPTIONS,
  ApiError,
} from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

export default function PlayoffsPage() {
  const { token } = useAuth();
  const { leagues, leaguesLoading, selectedLeague } = useDashboard();

  const [bracket, setBracket] = useState<PlayoffBracket | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!token || !selectedLeague) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      // The `/active` endpoint returns only the bracket summary (no nodes), so
      // when a bracket exists we fetch the detail endpoint to get the full node
      // tree with seeds, winners, and matchup scores needed to render results.
      const summary = await getActivePlayoffBracket(token, selectedLeague.id);
      if (summary?.id) {
        const detail = await getPlayoffBracketDetail(token, summary.id);
        setBracket(detail);
      } else {
        setBracket(summary);
      }
    } catch (error) {
      console.error("Failed to load playoff bracket:", error);
      setBracket(null);
    } finally {
      setLoading(false);
    }
  }, [token, selectedLeague]);

  useEffect(() => {
    load();
  }, [load]);

  if (!leaguesLoading && leagues.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Playoffs" />
        <NoLeagueState hasNoLeagues />
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="space-y-6">
        <PageHeader title="Playoffs" />
        <NoLeagueState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Playoffs" subtitle={selectedLeague.name} />

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-[#0f5a1f]" />
        </div>
      ) : bracket ? (
        <BracketView
          bracket={bracket}
          onConfirmed={load}
        />
      ) : (
        <CreateBracketForm leagueId={selectedLeague.id} onCreated={load} />
      )}
    </div>
  );
}

// ============================================
// Create bracket
// ============================================

function CreateBracketForm({
  leagueId,
  onCreated,
}: {
  leagueId: string;
  onCreated: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [numberOfTeams, setNumberOfTeams] = useState(4);
  const [format, setFormat] = useState<PlayOffFormat>("single-elimination");
  const [name, setName] = useState("");
  const [autoUpdate, setAutoUpdate] = useState(true);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!token) return;
    if (numberOfTeams < 2) {
      toast.error("A bracket needs at least 2 teams.");
      return;
    }
    setCreating(true);
    try {
      await createPlayoffBracket(token, leagueId, {
        numberOfTeams,
        format,
        name: name.trim() || undefined,
        autoUpdate,
      });
      toast.success("Playoff bracket created.");
      await onCreated();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (error.data as { message?: string | string[] })?.message
          : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to create bracket."
      );
      setCreating(false);
    }
  };

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-start gap-3">
        <div className="rounded-xl bg-[#0D5A1E]/5 p-2.5">
          <Trophy className="h-6 w-6 text-[#0D5A1E]" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Create a playoff bracket
          </h2>
          <p className="text-sm text-gray-500">
            Seed your postseason from the current standings. You can lock it in
            once the regular season is complete.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bracket-name">Bracket name (optional)</Label>
            <Input
              id="bracket-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 2026 Playoffs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="num-teams">Number of teams</Label>
            <Input
              id="num-teams"
              type="number"
              min={2}
              max={32}
              value={Number.isNaN(numberOfTeams) ? "" : numberOfTeams}
              onChange={(e) => setNumberOfTeams(Number(e.target.value))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Format</Label>
          <Select
            value={format}
            onValueChange={(v) => setFormat(v as PlayOffFormat)}
          >
            <SelectTrigger className="w-full sm:w-72">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PLAYOFF_FORMAT_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 p-4">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Live playoff outlook
            </p>
            <p className="text-xs text-gray-500">
              Auto-update projected seeding as regular-season results come in.
            </p>
          </div>
          <Switch checked={autoUpdate} onCheckedChange={setAutoUpdate} />
        </div>

        <div className="flex justify-end">
          <Button
            onClick={handleCreate}
            disabled={creating}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {creating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" /> Create bracket
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ============================================
// Bracket view
// ============================================

function BracketView({
  bracket,
  onConfirmed,
}: {
  bracket: PlayoffBracket;
  onConfirmed: () => Promise<void>;
}) {
  const { token } = useAuth();
  const [confirming, setConfirming] = useState(false);

  const status = (bracket.status ?? "").toUpperCase();
  const canConfirm = status === "NOT_STARTED" || status === "";

  const handleConfirm = async () => {
    if (!token) return;
    setConfirming(true);
    try {
      await confirmPlayoffBracket(token, bracket.id, true);
      toast.success("Playoffs locked in. The bracket is now official.");
      await onConfirmed();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (error.data as { message?: string | string[] })?.message
          : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to confirm bracket."
      );
      setConfirming(false);
    }
  };

  // Group nodes into ordered round columns for display.
  const rounds = buildRounds(bracket);

  return (
    <div className="space-y-6">
      {canConfirm && (
        <div className="flex justify-end">
          <Button
            onClick={handleConfirm}
            disabled={confirming}
            className="bg-[#0D5A1E] hover:bg-[#0a4718]"
          >
            {confirming ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Locking...
              </>
            ) : (
              <>
                <Lock className="h-4 w-4" /> Confirm & lock bracket
              </>
            )}
          </Button>
        </div>
      )}

      {/* ── Rounds ── */}
      {rounds.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50 py-14 text-center">
          <Trophy className="mx-auto mb-3 h-10 w-10 text-gray-300" />
          <p className="text-sm text-gray-500">
            The bracket structure will appear here once it&apos;s generated.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto pb-4">
          {/* Round columns sit side-by-side; equal column heights + flex-1 slots
              make each parent matchup land at the midpoint of its two feeders. */}
          <div className="flex items-stretch">
            {rounds.map((round, roundIndex) => {
              const isFinalRound = roundIndex === rounds.length - 1;
              return (
                <div key={round.key} className="flex shrink-0 flex-col">
                  {/* Title spans only the card column (CARD_W), not the connector
                      gutter, so it sits centered over the matchup boxes below. */}
                  <div
                    className="mb-3"
                    style={{
                      width: isFinalRound ? CARD_W : CARD_W + CONN_W,
                    }}
                  >
                    <h3
                      className="text-center text-sm font-bold uppercase tracking-wide text-gray-700"
                      style={{
                        fontFamily: "var(--font-gamegrid-title)",
                        width: CARD_W,
                      }}
                    >
                      {round.name}
                    </h3>
                  </div>
                  <div className="flex flex-1 flex-col">
                    {round.nodes.map((node, i) => (
                      <MatchSlot
                        key={node.id}
                        node={node}
                        hasOutgoing={!isFinalRound}
                        isTopChild={i % 2 === 0}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One matchup positioned within its round column. `flex-1` gives every slot an
 * equal share of the (equal-height) column, and `justify-center` centers the
 * card — so a parent slot, which spans two child slots, centers exactly at the
 * boundary between those children. When the round feeds another round, the
 * connector lines are drawn in the right-hand gutter.
 */
function MatchSlot({
  node,
  hasOutgoing,
  isTopChild,
}: {
  node: PlayoffNode;
  hasOutgoing: boolean;
  isTopChild: boolean;
}) {
  return (
    <div
      className="relative flex flex-1 flex-col justify-center py-3"
      style={{ width: hasOutgoing ? CARD_W + CONN_W : CARD_W, minHeight: 84 }}
    >
      <BracketNode node={node} />
      {hasOutgoing && <RoundConnector isTopChild={isTopChild} />}
    </div>
  );
}

/**
 * Connector lines for one child matchup, drawn with absolutely-positioned bars
 * in the slot's right gutter:
 *  - a horizontal stub out of the card to the gutter's vertical line,
 *  - a vertical line from the card's center to the pair midpoint (the slot's
 *    bottom edge for the top child / top edge for the bottom child — which equal
 *    the midpoint because flex distributes the slots evenly), and
 *  - for the top child only, one horizontal stub from the midpoint into the
 *    parent column, where the parent card is centered.
 */
function RoundConnector({ isTopChild }: { isTopChild: boolean }) {
  const midX = CARD_W + CONN_W / 2; // x of the vertical connector line
  const bar = "absolute bg-gray-300";
  return (
    <>
      {/* card → vertical line */}
      <div
        className={bar}
        style={{ left: CARD_W, top: "50%", width: CONN_W / 2, height: 2 }}
      />
      {/* vertical line: card center → pair midpoint (slot edge) */}
      <div
        className={bar}
        style={{
          left: midX,
          width: 2,
          ...(isTopChild ? { top: "50%", bottom: 0 } : { top: 0, bottom: "50%" }),
        }}
      />
      {/* midpoint → parent card (drawn once, by the top child) */}
      {isTopChild && (
        <div
          className={bar}
          style={{ left: midX, bottom: 0, width: CONN_W / 2, height: 2 }}
        />
      )}
    </>
  );
}

/** A single matchup node in the bracket, showing both teams + final scores. */
function BracketNode({ node }: { node: PlayoffNode }) {
  // Prefer the explicit winner; fall back to comparing scores when finished.
  const result = resolveNodeResult(node);

  return (
    <div
      className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm"
      style={{ width: CARD_W }}
    >
      <NodeTeamRow
        name={node.teamA?.name}
        seed={node.seed1}
        score={node.matchup?.teamAScore}
        showScore={result.hasScores}
        isWinner={result.winnerId === node.teamA?.id && !!node.teamA?.id}
        isLoser={result.decided && result.winnerId !== node.teamA?.id}
      />
      <div className="h-px bg-gray-100" />
      <NodeTeamRow
        name={node.teamB?.name}
        seed={node.seed2}
        score={node.matchup?.teamBScore}
        showScore={result.hasScores}
        isWinner={result.winnerId === node.teamB?.id && !!node.teamB?.id}
        isLoser={result.decided && result.winnerId !== node.teamB?.id}
      />
    </div>
  );
}

function NodeTeamRow({
  name,
  seed,
  score,
  showScore,
  isWinner,
  isLoser,
}: {
  name?: string;
  seed?: number;
  score?: number;
  showScore: boolean;
  isWinner: boolean;
  isLoser: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between gap-2 px-3 py-2.5 text-sm ${
        isWinner
          ? "bg-[#0D5A1E]/5 font-bold text-[#0D5A1E]"
          : isLoser
            ? "text-gray-400"
            : "text-gray-800"
      }`}
    >
      <span className="flex min-w-0 items-center gap-2">
        {seed !== undefined && (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-100 text-[10px] font-bold text-gray-500">
            {seed}
          </span>
        )}
        <span className="truncate">{name ?? "TBD"}</span>
        {isWinner && (
          <Check className="h-3.5 w-3.5 shrink-0 text-[#0D5A1E]" aria-label="Winner" />
        )}
      </span>
      {showScore && (
        <span className="shrink-0 tabular-nums font-semibold">
          {score ?? "—"}
        </span>
      )}
    </div>
  );
}

// ============================================
// Helpers
// ============================================

/** Matchup card width (px). Kept in JS so connector math can reference it. */
const CARD_W = 224;
/** Width (px) of the connector gutter between two rounds. */
const CONN_W = 40;

interface DisplayRound {
  key: string;
  name: string;
  nodes: PlayoffNode[];
}

/** The decided result of a node: who won and whether scores are shown. */
interface NodeResult {
  winnerId?: string;
  decided: boolean; // a winner is known
  hasScores: boolean; // final scores are available to display
}

/**
 * Resolve a node's outcome. Prefer the explicit `winner`; otherwise derive the
 * winner from final scores so completed games still highlight correctly.
 */
function resolveNodeResult(node: PlayoffNode): NodeResult {
  const a = node.matchup?.teamAScore;
  const b = node.matchup?.teamBScore;
  const hasScores =
    node.matchup?.status === "FINISHED" &&
    typeof a === "number" &&
    typeof b === "number";

  let winnerId = node.winner?.id;
  if (!winnerId && hasScores && a !== b) {
    winnerId = (a as number) > (b as number) ? node.teamA?.id : node.teamB?.id;
  }

  return { winnerId, decided: !!winnerId, hasScores };
}

/**
 * Normalize a bracket into ordered round columns. Within each round, nodes are
 * sorted top-to-bottom by a tree-derived key so the two children feeding a
 * parent sit directly above/below it — a hard requirement for the connectors.
 */
function buildRounds(bracket: PlayoffBracket): DisplayRound[] {
  const nodes = bracket.nodes ?? [];
  if (nodes.length === 0) return [];

  const order = computeVerticalOrder(nodes);

  // Group by round number, then sort ascending (earliest round first).
  const byRound = new Map<number, PlayoffNode[]>();
  for (const node of nodes) {
    const round = node.round ?? 0;
    if (!byRound.has(round)) byRound.set(round, []);
    byRound.get(round)!.push(node);
  }

  const vKey = (n: PlayoffNode) => order.get(n.id) ?? n.position ?? 0;

  return Array.from(byRound.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([round, roundNodes]) => ({
      key: String(round),
      name: roundName(round, roundNodes.length),
      nodes: roundNodes.slice().sort((a, b) => vKey(a) - vKey(b)),
    }));
}

/**
 * Assigns each node a vertical-order key by walking the bracket tree from the
 * final (root) down. Children are linked via `parentNodeId` (childNode ids are
 * not always populated) and ordered by `advancesToSlot` so the slot-A feeder
 * sits on top. Leaves get sequential keys; an internal node's key is the mean
 * of its children's keys, which centers it between them when rounds are sorted.
 */
function computeVerticalOrder(nodes: PlayoffNode[]): Map<string, number> {
  const childrenByParent = new Map<string, PlayoffNode[]>();
  for (const node of nodes) {
    if (node.parentNodeId) {
      const list = childrenByParent.get(node.parentNodeId) ?? [];
      list.push(node);
      childrenByParent.set(node.parentNodeId, list);
    }
  }

  const order = new Map<string, number>();
  let leaf = 0;
  const slotRank = (slot?: string | null) => (slot === "B" ? 1 : 0);

  const visit = (node: PlayoffNode): number => {
    const children = (childrenByParent.get(node.id) ?? [])
      .slice()
      .sort((a, b) => slotRank(a.advancesToSlot) - slotRank(b.advancesToSlot));
    const key =
      children.length === 0
        ? leaf++
        : children.map(visit).reduce((s, k) => s + k, 0) / children.length;
    order.set(node.id, key);
    return key;
  };

  // Roots are nodes with no parent (normally just the final).
  nodes.filter((n) => !n.parentNodeId).forEach(visit);
  return order;
}

/**
 * Human-friendly round label derived from how many matchups it contains
 * (1 → Championship, 2 → Semifinals, 4 → Quarterfinals, ...).
 */
function roundName(round: number, nodeCount: number): string {
  switch (nodeCount) {
    case 1:
      return "Championship";
    case 2:
      return "Semifinals";
    case 4:
      return "Quarterfinals";
    case 8:
      return "Round of 16";
    case 16:
      return "Round of 32";
    default:
      return `Round ${round}`;
  }
}

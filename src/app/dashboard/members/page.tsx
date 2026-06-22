"use client";

/**
 * Members Page
 * Paginated league roster for the selected league: name, email, role, team,
 * and join date. Admins can search and remove members (with confirmation).
 *
 * Operates on the selected league from DashboardContext.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  Search,
  Trash2,
  UserMinus,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  getLeagueRosters,
  removeLeagueMember,
  LeagueRosterMember,
  ApiError,
} from "@/lib/api";
import PageHeader from "@/components/custom/dashboard/PageHeader";
import NoLeagueState from "@/components/custom/dashboard/NoLeagueState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";

const PAGE_SIZE = 15;

export default function MembersPage() {
  const { token } = useAuth();
  const { leagues, leaguesLoading, selectedLeague } = useDashboard();

  const [members, setMembers] = useState<LeagueRosterMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [removeTarget, setRemoveTarget] = useState<LeagueRosterMember | null>(
    null
  );

  // Debounce the search box so we don't hammer the API on every keystroke.
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => {
      if (searchTimer.current) clearTimeout(searchTimer.current);
    };
  }, [search]);

  const load = useCallback(async () => {
    if (!token || !selectedLeague) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await getLeagueRosters(
        token,
        selectedLeague.id,
        page,
        PAGE_SIZE,
        debouncedSearch || undefined
      );
      setMembers(res.roster ?? []);
      setTotalPages(res.totalPages || 1);
      setTotal(res.total ?? 0);
    } catch (error) {
      console.error("Failed to load members:", error);
      setMembers([]);
    } finally {
      setLoading(false);
    }
  }, [token, selectedLeague, page, debouncedSearch]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRemove = async () => {
    if (!token || !selectedLeague || !removeTarget) return;
    try {
      await removeLeagueMember(token, selectedLeague.id, removeTarget.userId);
      toast.success(
        `${removeTarget.firstName} ${removeTarget.lastName} removed from the league.`
      );
      setRemoveTarget(null);
      await load();
    } catch (error) {
      const message =
        error instanceof ApiError
          ? (error.data as { message?: string | string[] })?.message
          : undefined;
      toast.error(
        Array.isArray(message)
          ? message.join(", ")
          : message || "Failed to remove member."
      );
    }
  };

  if (!leaguesLoading && leagues.length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Members" />
        <NoLeagueState hasNoLeagues />
      </div>
    );
  }

  if (!selectedLeague) {
    return (
      <div className="space-y-6">
        <PageHeader title="Members" />
        <NoLeagueState />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Members"
        subtitle={`${selectedLeague.name} · ${total} member${total === 1 ? "" : "s"}`}
      />

      {/* ── Search ── */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email"
          className="pl-9"
        />
      </div>

      {/* ── Members table ── */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
        {loading ? (
          <div className="space-y-2 p-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-12 w-full rounded-lg" />
            ))}
          </div>
        ) : members.length === 0 ? (
          <div className="py-16 text-center">
            <UserMinus className="mx-auto mb-3 h-10 w-10 text-gray-300" />
            <p className="text-sm text-gray-500">
              {debouncedSearch
                ? "No members match your search."
                : "No members in this league yet."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {members.map((m) => (
              <MemberRow
                key={m.userId}
                member={m}
                onRemove={() => setRemoveTarget(m)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Pagination ── */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* ── Remove confirmation ── */}
      <Dialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              {removeTarget &&
                `${removeTarget.firstName} ${removeTarget.lastName} will be removed from ${selectedLeague.name} and any team they're on. This can't be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRemoveTarget(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRemove}>
              <Trash2 className="h-4 w-4" />
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/** A single member row */
function MemberRow({
  member,
  onRemove,
}: {
  member: LeagueRosterMember;
  onRemove: () => void;
}) {
  const joinedLabel = member.joinedAt
    ? new Date(member.joinedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : "—";

  const isManager = member.role?.toLowerCase().includes("manager");

  return (
    <div className="flex items-center gap-4 px-4 py-3 transition-colors hover:bg-gray-50">
      {/* Avatar */}
      {member.profilePicture ? (
        <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-gray-200">
          <Image
            src={member.profilePicture}
            alt={`${member.firstName} ${member.lastName}`}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-200 text-sm font-bold text-gray-600">
          {(member.firstName?.[0] ?? member.email[0]).toUpperCase()}
        </div>
      )}

      {/* Name + email */}
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-semibold text-gray-900">
            {member.firstName} {member.lastName}
          </p>
          {isManager && (
            <Badge className="bg-[#0D5A1E]/10 text-[#0D5A1E]">Admin</Badge>
          )}
        </div>
        <p className="truncate text-xs text-gray-500">{member.email}</p>
      </div>

      {/* Team */}
      <div className="hidden w-32 shrink-0 sm:block">
        <p className="truncate text-sm text-gray-700">
          {member.team?.name ?? "Free agent"}
        </p>
      </div>

      {/* Joined */}
      <div className="hidden w-28 shrink-0 text-sm text-gray-500 md:block">
        {joinedLabel}
      </div>

      {/* Remove (managers can't be removed via this action) */}
      <div className="shrink-0">
        {!isManager && (
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={onRemove}
            className="text-gray-400 hover:bg-red-50 hover:text-red-600"
            aria-label="Remove member"
          >
            <UserMinus className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}

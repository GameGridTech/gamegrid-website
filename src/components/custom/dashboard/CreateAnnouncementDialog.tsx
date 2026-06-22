"use client";

/**
 * CreateAnnouncementDialog
 * Modal dialog for creating a new announcement.
 * Fields:
 * - Announcement type (select dropdown)
 * - Description (textarea)
 * - Team selector (checkboxes with "Select All" toggle)
 *
 * On submit, calls POST /announcements once per selected team.
 */

import { useState, useCallback } from "react";
import { Loader2, Megaphone } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { useDashboard } from "@/lib/dashboard-context";
import {
  AnnouncementType,
  createAnnouncement,
} from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

/** Available announcement type options */
const ANNOUNCEMENT_TYPES: { value: AnnouncementType; label: string }[] = [
  { value: "General Update", label: "General Update" },
  { value: "Match Day Reminder", label: "Match Day Reminder" },
  { value: "Training Update", label: "Training Update" },
  { value: "Team Note", label: "Team Note" },
  { value: "Event Alert", label: "Event Alert" },
];

interface CreateAnnouncementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Callback when announcement is successfully created */
  onCreated: () => void;
}

export default function CreateAnnouncementDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateAnnouncementDialogProps) {
  const { token } = useAuth();
  const { leagueTeams } = useDashboard();

  // Form state
  const [type, setType] = useState<AnnouncementType>("General Update");
  const [description, setDescription] = useState("");
  const [selectedTeamIds, setSelectedTeamIds] = useState<Set<string>>(new Set());
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /** Whether all teams are selected */
  const allSelected =
    leagueTeams.length > 0 && selectedTeamIds.size === leagueTeams.length;

  /** Toggle "Select All" */
  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedTeamIds(new Set());
    } else {
      setSelectedTeamIds(new Set(leagueTeams.map((t) => t.id)));
    }
  }, [allSelected, leagueTeams]);

  /** Toggle individual team */
  const handleToggleTeam = useCallback((teamId: string) => {
    setSelectedTeamIds((prev) => {
      const next = new Set(prev);
      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }
      return next;
    });
  }, []);

  /** Reset form fields */
  const resetForm = useCallback(() => {
    setType("General Update");
    setDescription("");
    setSelectedTeamIds(new Set());
    setError(null);
  }, []);

  /** Submit announcement to each selected team */
  const handleSubmit = useCallback(async () => {
    if (!token) return;

    // Validation
    if (!description.trim()) {
      setError("Please enter a description.");
      return;
    }
    if (selectedTeamIds.size === 0) {
      setError("Please select at least one team.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Create announcement for each selected team in parallel
      const teamIds = Array.from(selectedTeamIds);
      const results = await Promise.allSettled(
        teamIds.map((teamId) =>
          createAnnouncement(token, {
            announcement_type: type,
            description: description.trim(),
            teamId,
          })
        )
      );

      // Check if any failed
      const failures = results.filter((r) => r.status === "rejected");
      if (failures.length > 0) {
        console.error("Some announcements failed:", failures);
        if (failures.length === results.length) {
          setError("Failed to create announcement. Please try again.");
          return;
        }
        // Partial success
      }

      resetForm();
      onCreated();
    } catch (err) {
      console.error("Error creating announcements:", err);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [token, type, description, selectedTeamIds, resetForm, onCreated]);

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Megaphone className="w-5 h-5 text-[#0f5a1f]" />
            Create Announcement
          </DialogTitle>
          <DialogDescription>
            Send an announcement to selected teams in your league.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* ── Announcement Type ── */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Type
            </label>
            <Select
              value={type}
              onValueChange={(val) => setType(val as AnnouncementType)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {ANNOUNCEMENT_TYPES.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ── Description ── */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1.5 block">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Write your announcement..."
              rows={3}
              className="resize-none"
            />
          </div>

          <Separator />

          {/* ── Team Selector ── */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              Send to Teams
            </label>

            {/* Select All toggle */}
            <div className="flex items-center gap-2 mb-3">
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={handleSelectAll}
              />
              <label
                htmlFor="select-all"
                className="text-sm font-semibold text-gray-800 cursor-pointer select-none"
              >
                Select All ({leagueTeams.length} teams)
              </label>
            </div>

            {/* Individual team checkboxes */}
            <div className="space-y-2 max-h-[200px] overflow-y-auto pr-1">
              {leagueTeams.length === 0 ? (
                <p className="text-sm text-gray-400 italic">
                  No teams in this league
                </p>
              ) : (
                leagueTeams.map((team) => (
                  <div key={team.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`team-${team.id}`}
                      checked={selectedTeamIds.has(team.id)}
                      onCheckedChange={() => handleToggleTeam(team.id)}
                    />
                    <label
                      htmlFor={`team-${team.id}`}
                      className="text-sm text-gray-700 cursor-pointer select-none"
                    >
                      {team.name}
                    </label>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Error Message ── */}
          {error && (
            <p className="text-sm text-red-600 font-medium">{error}</p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#0f5a1f] hover:bg-[#0d4e1b] text-white"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              "Send Announcement"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

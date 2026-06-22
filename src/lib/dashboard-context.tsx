"use client";

/**
 * Dashboard Context
 * Manages the currently selected league and provides league data
 * to all dashboard child components without prop drilling.
 *
 * Leagues are fetched from the dedicated /users/admin/leagues endpoint
 * on mount (not relying on cached auth user data which may be stale).
 */

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  ReactNode,
} from "react";
import { useAuth } from "./auth-context";
import {
  League,
  LeagueTeam,
  getLeagueTeams,
  getAdminLeagues,
  getUserDetails,
} from "./api";

// ============================================
// Types
// ============================================

interface DashboardContextType {
  /** All leagues the admin manages */
  leagues: League[];
  /** Whether leagues are still loading */
  leaguesLoading: boolean;
  /** Currently selected league (controls all dashboard data) */
  selectedLeague: League | null;
  /** Switch the active league */
  selectLeague: (league: League) => void;
  /** Select a league by its id (used after creating a new league) */
  selectLeagueById: (leagueId: string) => void;
  /** Re-fetch the admin's leagues; resolves with the fresh list */
  refreshLeagues: () => Promise<League[]>;
  /** Teams in the currently selected league */
  leagueTeams: LeagueTeam[];
  /** Whether teams are still loading */
  teamsLoading: boolean;
  /** Refresh teams list for current league */
  refreshTeams: () => Promise<void>;
}

// ============================================
// Context
// ============================================

const DashboardContext = createContext<DashboardContextType | undefined>(
  undefined
);

// ============================================
// Provider
// ============================================

interface DashboardProviderProps {
  children: ReactNode;
}

export function DashboardProvider({ children }: DashboardProviderProps) {
  const { user, token } = useAuth();

  const [leagues, setLeagues] = useState<League[]>([]);
  const [leaguesLoading, setLeaguesLoading] = useState(true);
  const [selectedLeague, setSelectedLeague] = useState<League | null>(null);
  const [leagueTeams, setLeagueTeams] = useState<LeagueTeam[]>([]);
  const [teamsLoading, setTeamsLoading] = useState(false);

  /**
   * Load the admin's leagues using a layered fallback strategy:
   *   1. Dedicated admin-leagues endpoint
   *   2. Fresh user details (adminProfile.leagues)
   *   3. Cached user data
   * Returns the resolved list so callers (e.g. the create-league flow) can
   * immediately act on the newest data.
   */
  const loadLeagues = useCallback(async (): Promise<League[]> => {
    if (!token) {
      setLeaguesLoading(false);
      return [];
    }

    setLeaguesLoading(true);
    let resolved: League[] = [];

    // Strategy 1: dedicated admin leagues endpoint
    try {
      const adminLeagues = await getAdminLeagues(token);
      if (adminLeagues.length > 0) resolved = adminLeagues;
    } catch (error) {
      console.warn("Admin leagues endpoint failed, trying user details:", error);
    }

    // Strategy 2: fresh user details
    if (resolved.length === 0) {
      try {
        const response = await getUserDetails(token);
        resolved = response.data?.adminProfile?.leagues ?? [];
      } catch (error) {
        console.warn("User details fetch failed, using cached data:", error);
      }
    }

    // Strategy 3: cached user data
    if (resolved.length === 0) {
      resolved = user?.adminProfile?.leagues ?? [];
    }

    setLeagues(resolved);
    setLeaguesLoading(false);
    return resolved;
  }, [token, user]);

  // Fetch admin leagues on mount / when the token changes.
  useEffect(() => {
    if (!token) {
      setLeaguesLoading(false);
      return;
    }
    loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Also react to user changes (e.g., after refresh) to pick up leagues from profile
  useEffect(() => {
    const profileLeagues = user?.adminProfile?.leagues;
    if (profileLeagues && profileLeagues.length > 0 && leagues.length === 0) {
      setLeagues(profileLeagues);
    }
  }, [user, leagues.length]);

  // Set default selected league when leagues load
  useEffect(() => {
    if (leagues.length > 0 && !selectedLeague) {
      setSelectedLeague(leagues[0]);
    }
  }, [leagues, selectedLeague]);

  /** Fetch teams for the currently selected league */
  const refreshTeams = useCallback(async () => {
    if (!token || !selectedLeague) return;

    setTeamsLoading(true);
    try {
      const response = await getLeagueTeams(token, selectedLeague.id);
      setLeagueTeams(response.teams);
    } catch (error) {
      console.error("Failed to load league teams:", error);
      setLeagueTeams([]);
    } finally {
      setTeamsLoading(false);
    }
  }, [token, selectedLeague]);

  // Refetch teams when the selected league changes
  useEffect(() => {
    if (selectedLeague && token) {
      refreshTeams();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedLeague, token]);

  /** Switch the active league and reset teams */
  const selectLeague = useCallback((league: League) => {
    setSelectedLeague(league);
    setLeagueTeams([]);
  }, []);

  /** Select a league by id from the current list (no-op if not found) */
  const selectLeagueById = useCallback(
    (leagueId: string) => {
      const match = leagues.find((l) => l.id === leagueId);
      if (match) {
        setSelectedLeague(match);
        setLeagueTeams([]);
      }
    },
    [leagues]
  );

  /** Re-fetch leagues (e.g. after create/delete) and return the fresh list */
  const refreshLeagues = useCallback(() => loadLeagues(), [loadLeagues]);

  // Memoize context value to prevent unnecessary re-renders of all consumers
  // when the DashboardProvider re-renders but none of these values changed.
  const value: DashboardContextType = useMemo(() => ({
    leagues,
    leaguesLoading,
    selectedLeague,
    selectLeague,
    selectLeagueById,
    refreshLeagues,
    leagueTeams,
    teamsLoading,
    refreshTeams,
  }), [leagues, leaguesLoading, selectedLeague, selectLeague, selectLeagueById, refreshLeagues, leagueTeams, teamsLoading, refreshTeams]);

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Access dashboard context (selected league, teams, etc.)
 * Must be used within DashboardProvider.
 */
export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

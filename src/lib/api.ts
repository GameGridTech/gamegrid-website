/**
 * GameGrid API Client
 * Handles all communication with the GameGrid backend API
 */

// Base API URL from environment variable - remove trailing slash if present
const API_BASE_URL = (process.env.NEXT_PUBLIC_BASE_URL || 'https://api.gamegridtech.com').replace(/\/$/, '');

/**
 * Custom error class for API errors
 */
export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    public data?: unknown
  ) {
    super(`API Error: ${status} ${statusText}`);
    this.name = 'ApiError';
  }
}

/**
 * Base API client for making requests to the GameGrid API
 * @param endpoint - API endpoint path (e.g., '/auth/google/login')
 * @param options - Fetch options (method, body, headers)
 * @returns Promise with the JSON response
 */
export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;

  // When sending FormData (file uploads), the browser must set the
  // multipart Content-Type + boundary itself, so we omit the JSON header.
  const isFormData =
    typeof FormData !== 'undefined' && options.body instanceof FormData;

  const response = await fetch(url, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    },
  });

  // Parse response body
  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(response.status, response.statusText, data);
  }

  return data as T;
}

/**
 * Make authenticated API requests with Bearer token
 * @param endpoint - API endpoint path
 * @param token - JWT access token
 * @param options - Additional fetch options
 */
export async function authenticatedApiClient<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
): Promise<T> {
  return apiClient<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    },
  });
}

// ============================================
// Auth API Functions
// ============================================

/** Response from Google login endpoint */
export interface GoogleLoginResponse {
  msg: string;
  data: UserData;
  accessToken: string;
}

/** User data structure from API */
export interface UserData {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  accountType?: string;
  subscriptionPlan?: string;
  paymentStatus?: string;
  fcmToken?: string;
  createdAt?: string;
  updatedAt?: string;
  playerProfile?: PlayerProfile;
  adminProfile?: AdminProfile | null;
  numberOfLeagues?: number;
  leagueIds?: string[];
}

/** Player profile data */
export interface PlayerProfile {
  id: string;
  gender?: string;
  dob?: string;
  height?: string;
  heightUnit?: string;
  weight?: number;
  weightUnit?: string;
  username?: string;
  profilePicture?: string;
  matchReminders?: boolean;
  leagueAnnouncements?: boolean;
  teamChatMessages?: boolean;
  weeklyPerformanceSummary?: boolean;
  sport?: Sport;
  teams?: Team[];
}

/** Admin profile data */
export interface AdminProfile {
  id: string;
  jerseyOption?: string;
  leagues?: League[];
}

/** Sport data */
export interface Sport {
  id: string;
  name: string;
  icon?: string;
}

/** Team data */
export interface Team {
  id: string;
  name: string;
  logo?: string;
  leagueId?: string;
}

/** League data */
export interface League {
  id: string;
  name: string;
  sportId?: string;
  status?: string;
}

/** Response from user details endpoint */
export interface UserDetailsResponse {
  msg: string;
  data: UserData;
  accessToken: string;
}

/**
 * Login with Google OAuth
 * Sends the Google ID token to the backend for verification
 * @param idToken - Google OAuth ID token from client
 * @param fcmToken - Optional FCM token for push notifications
 */
export async function googleLogin(
  idToken: string,
  fcmToken?: string
): Promise<GoogleLoginResponse> {
  return apiClient<GoogleLoginResponse>('/auth/google/login', {
    method: 'POST',
    body: JSON.stringify({ idToken, fcmToken }),
  });
}

/**
 * Get full user details including profiles and subscriptions
 * Requires authentication
 * @param token - JWT access token
 */
export async function getUserDetails(token: string): Promise<UserDetailsResponse> {
  return authenticatedApiClient<UserDetailsResponse>('/users/details', token, {
    method: 'GET',
  });
}

// ============================================
// OTP & Auth Helper Functions
// ============================================

/**
 * Send OTP to email for login/registration
 * @param email - User's email address
 */
export async function sendOtp(email: string): Promise<{ msg: string }> {
  return apiClient<{ msg: string }>('/auth/send-otp', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

/**
 * Verify OTP and complete login/registration
 * @param email - User's email address
 * @param otp - OTP code received via email
 */
export async function verifyOtp(
  email: string,
  otp: string
): Promise<GoogleLoginResponse> {
  return apiClient<GoogleLoginResponse>('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify({ email, otp }),
  });
}

/**
 * Get user's league matches and participations
 * @param token - JWT access token
 * @param page - Page number (default: 1)
 * @param limit - Items per page (default: 20)
 */
export async function getUserLeagueMatches(
  token: string,
  page = 1,
  limit = 20
): Promise<unknown> {
  return authenticatedApiClient<unknown>(
    `/users/league-matches?page=${page}&limit=${limit}`,
    token,
    { method: 'GET' }
  );
}

// ============================================
// Dashboard Types
// ============================================

/** Team info returned in schedule matchups and standings */
export interface ScheduleTeam {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string;
  wins?: number;
  losses?: number;
  draws?: number;
  record?: string;
  rating?: number;
  jerseyColor?: string;
}

/** Game state attached to a matchup (live or completed) */
export interface MatchupGame {
  id: string;
  status: string;
  homeScore: number;
  awayScore: number;
  currentPeriod?: number;
  clock?: string;
  isLive?: boolean;
  statusDisplay?: string;
  timeDisplay?: string;
}

/** Single matchup within a schedule day group */
export interface ScheduleMatchup {
  id: string;
  matchDateTime: string;
  location?: string;
  division?: string;
  matchTime?: string;
  teamA?: ScheduleTeam;
  teamB?: ScheduleTeam;
  game?: MatchupGame;
  dayOfWeek: string;
  playoffLabel?: string;
  playoffNodeId?: string;
  seedA?: number;
  seedB?: number;
  playoffBracketStatus?: string;
}

/** Schedule day group containing matchups for that day */
export interface ScheduleDayGroup {
  dayOfWeek: string;
  data: ScheduleMatchup[];
}

/** Time range options for schedule endpoint */
export type ScheduleTimeRange = 'pastWeek' | 'lastWeek' | 'thisWeek' | 'nextWeek';

/** Response from league schedule endpoint */
export interface LeagueScheduleResponse {
  matchups: ScheduleDayGroup[];
  total: number;
  page: number;
  limit: number;
  timeRange: ScheduleTimeRange;
}

/** Single team standing row */
export interface StandingRow {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string;
  points: number;
  wins: number;
  losses: number;
  draws?: number;
  goalsFor?: number;
  goalsAgainst?: number;
  goalDifferential?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  pointDifferential?: number;
  winPercentage: number;
  gamesBehind: number;
}

/** Response from league standings endpoint */
export interface LeagueStandingsResponse {
  standings: StandingRow[];
  total: number;
  page: number;
  limit: number;
}

/** Top player entry with PPR and team info */
export interface TopPlayer {
  id: string;
  name: string;
  jerseyNumber?: string;
  playerPicture?: string;
  team: {
    id: string;
    name: string;
    abbreviation: string;
    logoUrl: string;
  };
  scaledPPR: number;
  istrending: boolean;
  pprChange?: string;
  /** Per-category season totals used to derive true stat-category leaders */
  points?: number;
  assists?: number;
  rebounds?: number;
  steals?: number;
  blocks?: number;
  threePointersMade?: number;
}

/** Response from top players endpoint */
export interface TopPlayersResponse {
  players: TopPlayer[];
  total: number;
  page: number;
  limit: number;
}

/** League team info returned from admin teams endpoint */
export interface LeagueTeam {
  id: string;
  name: string;
  abbreviation: string;
  logoUrl: string;
  jerseyColor?: string | null;
  type: string;
  playerCount?: number;
  league?: { id?: string; name?: string; status?: string };
  hasLeague: boolean;
  captain?: {
    id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  } | null;
  matchRecord: { wins: number; losses: number };
  userRole?: 'captain' | 'player' | 'not_member';
  jerseyNumber?: string;
}

/** Paginated teams response */
export interface LeagueTeamsResponse {
  teams: LeagueTeam[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary: {
    totalTeams: number;
    teamsWithLeagues: number;
    teamsWithoutLeagues: number;
  };
}

/** Announcement type options */
export type AnnouncementType =
  | 'Match Day Reminder'
  | 'Training Update'
  | 'Team Note'
  | 'Event Alert'
  | 'General Update';

/** Announcement response shape */
export interface Announcement {
  id: string;
  announcement_type: AnnouncementType;
  description: string;
  team: {
    id: string;
    name: string;
    logoUrl: string | null;
  };
  seen: boolean;
  seenAt?: string;
  createdAt: string;
  updatedAt: string;
}

/** Paginated announcements response */
export interface AnnouncementsResponse {
  data: Announcement[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

/** Payload for creating a new announcement */
export interface CreateAnnouncementPayload {
  announcement_type: AnnouncementType;
  description: string;
  teamId: string;
}

// ============================================
// Dashboard API Functions
// ============================================

/**
 * Get all leagues managed by the current admin user
 * @param token - JWT access token
 */
export async function getAdminLeagues(
  token: string
): Promise<League[]> {
  // The endpoint returns { message, data: League[], count }
  // Backend League entity uses "leagueName" not "name", and "sport" not "sportId"
  // so we normalize the shape to match our frontend League interface.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const result = await authenticatedApiClient<any>(
    '/users/admin/leagues',
    token,
    { method: 'GET' }
  );

  // Extract the leagues array from whichever response shape we get
  let raw: Record<string, unknown>[] = [];
  if (Array.isArray(result)) raw = result;
  else if (result?.data && Array.isArray(result.data)) raw = result.data;

  // Normalize backend entity → frontend League interface
  return raw.map((l) => ({
    id: String(l.id ?? ''),
    name: String(l.leagueName ?? l.name ?? 'Unnamed League'),
    sportId: String(l.sport ?? l.sportId ?? ''),
    status: l.status ? String(l.status) : undefined,
  }));
}

/**
 * Get league schedule with upcoming/past matchups grouped by day
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param timeRange - Time range filter (default: thisWeek)
 * @param page - Page number
 * @param limit - Items per page
 */
export async function getLeagueSchedule(
  token: string,
  leagueId: string,
  timeRange: ScheduleTimeRange = 'thisWeek',
  page = 1,
  limit = 10
): Promise<LeagueScheduleResponse> {
  return authenticatedApiClient<LeagueScheduleResponse>(
    `/home/league-schedule/${leagueId}?timeRange=${timeRange}&page=${page}&limit=${limit}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Get league standings with W/L record, PCT, and games behind
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param page - Page number
 * @param limit - Items per page
 */
export async function getLeagueStandings(
  token: string,
  leagueId: string,
  page = 1,
  limit = 50
): Promise<LeagueStandingsResponse> {
  return authenticatedApiClient<LeagueStandingsResponse>(
    `/home/league-standings/${leagueId}?page=${page}&limit=${limit}`,
    token,
    { method: 'GET' }
  );
}

/** Time window for the top-players / stat-leaders query */
export type TopPlayersTimeRange = 'alltime' | 'today' | 'week';

/**
 * Get top players in a league ranked by PPR (Player Performance Rating)
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param timeRange - Stat window: 'alltime' (default), 'today', or 'week'
 */
export async function getTopPlayers(
  token: string,
  leagueId: string,
  timeRange: TopPlayersTimeRange = 'alltime'
): Promise<TopPlayersResponse> {
  // Omit the query param for the default so the request stays backward-compatible
  const query =
    timeRange && timeRange !== 'alltime'
      ? `?timeRange=${encodeURIComponent(timeRange)}`
      : '';
  return authenticatedApiClient<TopPlayersResponse>(
    `/home/top-players/${leagueId}${query}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Get all teams in a league (for admin)
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param page - Page number
 * @param limit - Items per page
 */
export async function getLeagueTeams(
  token: string,
  leagueId: string,
  page = 1,
  limit = 100
): Promise<LeagueTeamsResponse> {
  return authenticatedApiClient<LeagueTeamsResponse>(
    `/league/${leagueId}/teams?page=${page}&limit=${limit}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Get paginated announcements for a specific team
 * @param token - JWT access token
 * @param teamId - Team UUID
 * @param page - Page number
 * @param limit - Items per page
 */
export async function getAnnouncements(
  token: string,
  teamId: string,
  page = 1,
  limit = 10
): Promise<AnnouncementsResponse> {
  return authenticatedApiClient<AnnouncementsResponse>(
    `/announcements?teamId=${teamId}&page=${page}&limit=${limit}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Create a new announcement for a team
 * @param token - JWT access token
 * @param payload - Announcement type, description, and target teamId
 */
export async function createAnnouncement(
  token: string,
  payload: CreateAnnouncementPayload
): Promise<Announcement> {
  return authenticatedApiClient<Announcement>('/announcements', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Mark an announcement as seen by the current user
 * @param token - JWT access token
 * @param announcementId - Announcement UUID
 */
export async function markAnnouncementSeen(
  token: string,
  announcementId: string
): Promise<void> {
  return authenticatedApiClient<void>(
    `/announcements/${announcementId}/seen`,
    token,
    { method: 'POST' }
  );
}

// ============================================
// League Configuration Enums & Options
// ============================================
// These mirror the backend league DTO enums so the admin console only ever
// sends values the API accepts. Kept as string-literal unions + option arrays
// so they can both type-check payloads AND drive select/radio inputs.

/** Sports the backend currently supports for league creation */
export type SportType = 'basketball' | 'soccer' | 'football' | 'pickleball';

/** Roster generation style (maps to competitionFormat.customFormat) */
export type LeagueCustomFormat = 'manual rosters' | 'auto-generated rosters';

/** Top-level roster type flag */
export type RosterType = 'manual' | 'auto';

/** Built-in or custom scoring systems */
export type ScoringSystem = 'w3-d1-l0' | 'w2-d1-l0' | 'custom';

/** How often matches are played / scheduled */
export type MatchFrequency = 'admin-scheduled' | 'weekly' | 'bi-weekly';

/** Playoff bracket formats */
export type PlayOffFormat = 'single-elimination' | 'double-elimination' | 'custom';

/** Tie-breaker criteria keys */
export type TieBreakerKey =
  | 'headToHeadRecord'
  | 'goalDifference'
  | 'goalsScored'
  | 'fewestGoalsConceded'
  | 'fairPlayPoints'
  | 'playoffMatchOrPenalty';

/** Custom W/D/L point values */
export interface CustomScoringSystem {
  pointsForWin: number;
  pointsForDraw: number;
  pointsForLoss: number;
}

/** A single tie-breaker priority entry */
export interface TieBreakerPriority {
  key: TieBreakerKey;
  priority: number;
}

/** Selectable sport options for forms */
export const SPORT_OPTIONS: { value: SportType; label: string }[] = [
  { value: 'basketball', label: 'Basketball' },
  { value: 'soccer', label: 'Soccer' },
  { value: 'football', label: 'Football' },
  { value: 'pickleball', label: 'Pickleball' },
];

/** Selectable scoring system options for forms */
export const SCORING_OPTIONS: { value: ScoringSystem; label: string; hint: string }[] = [
  { value: 'w3-d1-l0', label: 'Win 3 / Draw 1 / Loss 0', hint: 'Standard (soccer-style)' },
  { value: 'w2-d1-l0', label: 'Win 2 / Draw 1 / Loss 0', hint: 'Two points per win' },
  { value: 'custom', label: 'Custom', hint: 'Set your own point values' },
];

/** Selectable match-frequency options for forms */
export const FREQUENCY_OPTIONS: { value: MatchFrequency; label: string }[] = [
  { value: 'admin-scheduled', label: 'Admin scheduled' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'bi-weekly', label: 'Bi-weekly' },
];

/** Selectable playoff format options for forms */
export const PLAYOFF_FORMAT_OPTIONS: { value: PlayOffFormat; label: string }[] = [
  { value: 'single-elimination', label: 'Single elimination' },
  { value: 'double-elimination', label: 'Double elimination' },
  { value: 'custom', label: 'Custom' },
];

/** Selectable tie-breaker options for forms */
export const TIEBREAKER_OPTIONS: { value: TieBreakerKey; label: string }[] = [
  { value: 'headToHeadRecord', label: 'Head-to-head record' },
  { value: 'goalDifference', label: 'Point/goal differential' },
  { value: 'goalsScored', label: 'Points/goals scored' },
  { value: 'fewestGoalsConceded', label: 'Fewest points/goals conceded' },
  { value: 'fairPlayPoints', label: 'Fair-play points' },
  { value: 'playoffMatchOrPenalty', label: 'Playoff match / penalties' },
];

// ============================================
// League Management Types
// ============================================

/** Payload sent to POST /league to create a new league */
export interface CreateLeaguePayload {
  leagueName: string;
  sport: SportType;
  competitionFormat?: { format: 'standard'; customFormat?: LeagueCustomFormat };
  numberOfTeamsAndPlayers?: {
    maxTeams: number;
    minPlayersPerTeam?: number;
    enableSubstitutes?: boolean;
    maxSubstitutesPerTeam?: number;
  };
  matchRules?: {
    matchFrequency?: MatchFrequency;
    matchDuration?: number;
    scoringSystem?: ScoringSystem;
    customScoringSystem?: CustomScoringSystem;
    enableTieBreakers?: boolean;
    tieBreakerPriority?: TieBreakerPriority[];
    enablePlayOffs?: boolean;
    numberOfTeamsInPlayoffs?: number;
    playOffFormat?: PlayOffFormat;
  };
  rosterType?: RosterType;
}

/** Response from POST /league */
export interface LeagueCreationResponse {
  msg: string;
  savedLeague: {
    id: string;
    leagueName: string;
    sport: string;
    joinCode?: string;
    createdAt?: string;
    updatedAt?: string;
    createdBy?: { id: string; name?: string };
  };
}

/** Full league entity returned by GET /league/:id */
export interface LeagueDetail {
  id: string;
  leagueName: string;
  sport?: SportType;
  format?: string;
  customFormat?: string | null;
  leagueLogo?: string | null;
  maxTeams?: number;
  minPlayersPerTeam?: number;
  enableSubstitutes?: boolean;
  maxSubstitutesPerTeam?: number;
  matchFrequency?: MatchFrequency;
  matchDuration?: number;
  scoringSystem?: ScoringSystem;
  customScoringSystem?: CustomScoringSystem | null;
  enableTieBreakers?: boolean;
  enablePlayOffs?: boolean;
  numberOfTeamsInPlayoffs?: number;
  playOffFormat?: PlayOffFormat;
  rosterType?: RosterType;
  joinCode?: string;
  isLive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: {
    id: string;
    name?: string;
    firstName?: string;
    lastName?: string;
    email?: string;
  };
}

/** Payload for PATCH /users/admin/league/:leagueId (JSON, no file) */
export interface UpdateLeagueByAdminPayload {
  leagueName?: string;
  format?: string;
  maxTeams?: number;
  minPlayersPerTeam?: number;
  enableSubstitutes?: boolean;
  matchDuration?: number;
  matchFrequency?: MatchFrequency;
  enableTieBreakers?: boolean;
  scoringSystem?: ScoringSystem;
  customScoringSystem?: CustomScoringSystem;
  rosterType?: RosterType;
}

/** Sport-specific game settings (scoring/stats/period config) */
export interface GameSettings {
  id?: string;
  sport?: string;
  scoringFormat?: Record<string, boolean>;
  statsTracking?: Record<string, boolean>;
  advancedOptions?: Record<string, boolean>;
  periodFormat?: {
    structure?: string;
    enableRunningClock?: boolean;
    enableTimeoutRules?: boolean;
    enableHalftimeDuration?: boolean;
    periodLength?: number;
  };
  standingsSettings?: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
}

/** Defaults + option metadata returned by GET /league/:id/game-settings/defaults */
export interface GameSettingsDefaults {
  sport: string;
  defaults: GameSettings;
  settingsInfo?: {
    displayName?: string;
    scoringOptions?: { key: string; label: string; description?: string }[];
    statsOptions?: { key: string; label: string; default?: boolean }[];
  };
}

/** Payload for creating a team within a league */
export interface CreateTeamPayload {
  teamName: string;
  abbreviation: string;
  jerseyColor: string;
}

/** Payload for updating a team's info and/or roster */
export interface UpdateTeamPayload {
  teamName?: string;
  abbreviation?: string;
  jerseyColor?: string;
  playerUpdates?: {
    playerId: string;
    jerseyNumber?: number;
    role?: 'normal' | 'captain';
  }[];
  removePlayerIds?: string[];
}

/** A member row within a league roster */
export interface LeagueRosterMember {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string | null;
  role: string;
  joinedAt: string;
  team?: {
    id: string;
    name: string;
    logoUrl?: string;
    jerseyColor?: string;
    jerseyNumber?: string | null;
  } | null;
}

/** Paginated league roster response */
export interface LeagueRosterResponse {
  leagueId: string;
  roster: LeagueRosterMember[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/** A team slot within a playoff node */
export interface PlayoffTeam {
  id: string;
  name: string;
  abbreviation?: string;
  logoUrl?: string;
  seed?: number;
}

/**
 * Game/matchup result attached to a playoff node.
 * Scores map to slots: teamAScore = home (teamA), teamBScore = away (teamB).
 * `status` mirrors the underlying game (SCHEDULED | LIVE | FINISHED | CANCELLED).
 */
export interface PlayoffMatchupInfo {
  id: string;
  matchDateTime?: string;
  location?: string;
  division?: string;
  teamAScore?: number;
  teamBScore?: number;
  status?: string;
}

/**
 * A single matchup node within a playoff bracket.
 * Mirrors the backend PlayoffNodeResponseDto: seeds live on the node
 * (`seed1`/`seed2`) and the result lives on `matchup` + `winner`.
 */
export interface PlayoffNode {
  id: string;
  round?: number;
  position?: number;
  status?: string; // PROJECTED | CONFIRMED | COMPLETED
  label?: string;
  seed1?: number;
  seed2?: number;
  teamA?: PlayoffTeam | null;
  teamB?: PlayoffTeam | null;
  winner?: PlayoffTeam | null;
  matchup?: PlayoffMatchupInfo | null;
  parentNodeId?: string | null;
  childNode1Id?: string | null;
  childNode2Id?: string | null;
  advancesToSlot?: string | null;
}

/** A playoff bracket. `nodes` is only populated by the detail endpoint. */
export interface PlayoffBracket {
  id: string;
  leagueId: string;
  name?: string;
  status?: string;
  numberOfTeams?: number;
  format?: string;
  autoUpdate?: boolean;
  nodes?: PlayoffNode[];
}

/** Payload for creating a playoff bracket */
export interface CreatePlayoffBracketPayload {
  numberOfTeams: number;
  format?: PlayOffFormat;
  name?: string;
  startDate?: string;
  autoUpdate?: boolean;
}

/** One entry in a user's league participation history */
export interface LeagueHistoryEntry {
  leagueId: string;
  leagueName: string;
  sport: string;
  placement?: string;
  startDate?: string;
  endDate?: string;
  joinedAt?: string;
  teamStats?: {
    teamName: string;
    wins: number;
    draws: number;
    losses: number;
    jerseyColor?: string;
    teamLogo?: string;
  };
  isCompleted?: boolean;
  format?: string;
}

/** Paginated league history response */
export interface LeagueHistoryResponse {
  leagueHistory: LeagueHistoryEntry[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
  summary?: {
    totalLeagues: number;
    completedLeagues: number;
    activeLeagues: number;
    totalWins: number;
    totalLosses: number;
    totalDraws: number;
    winPercentage: number;
  };
}

// ============================================
// League Management API Functions
// ============================================

/**
 * Create a new league. The authenticated user becomes the league manager.
 * @param token - JWT access token
 * @param payload - League configuration
 */
export async function createLeague(
  token: string,
  payload: CreateLeaguePayload
): Promise<LeagueCreationResponse> {
  return authenticatedApiClient<LeagueCreationResponse>('/league', token, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

/**
 * Get full detail for a single league.
 * @param token - JWT access token
 * @param leagueId - League UUID
 */
export async function getLeagueDetail(
  token: string,
  leagueId: string
): Promise<LeagueDetail> {
  return authenticatedApiClient<LeagueDetail>(`/league/${leagueId}`, token, {
    method: 'GET',
  });
}

/**
 * Update core league settings via the JSON admin endpoint (no file upload).
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param payload - Partial settings to update
 */
export async function updateLeagueByAdmin(
  token: string,
  leagueId: string,
  payload: UpdateLeagueByAdminPayload
): Promise<unknown> {
  return authenticatedApiClient<unknown>(
    `/users/admin/league/${leagueId}`,
    token,
    { method: 'PATCH', body: JSON.stringify(payload) }
  );
}

/**
 * Upload / replace a league logo via the multipart league endpoint.
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param logoFile - Image file
 */
export async function updateLeagueLogo(
  token: string,
  leagueId: string,
  logoFile: File
): Promise<LeagueDetail> {
  const formData = new FormData();
  formData.append('leagueLogoFile', logoFile);
  return authenticatedApiClient<LeagueDetail>(`/league/${leagueId}`, token, {
    method: 'PATCH',
    body: formData,
  });
}

/**
 * Permanently delete a league and all its data.
 * @param token - JWT access token
 * @param leagueId - League UUID
 */
export async function deleteLeague(
  token: string,
  leagueId: string
): Promise<{ message: string; deletedId?: string }> {
  return authenticatedApiClient<{ message: string; deletedId?: string }>(
    `/league/${leagueId}`,
    token,
    { method: 'DELETE' }
  );
}

/**
 * Get the sport-specific game settings for a league.
 * @param token - JWT access token
 * @param leagueId - League UUID
 */
export async function getGameSettings(
  token: string,
  leagueId: string
): Promise<GameSettings> {
  return authenticatedApiClient<GameSettings>(
    `/league/${leagueId}/game-settings`,
    token,
    { method: 'GET' }
  );
}

/**
 * Update sport-specific game settings for a league (partial update supported).
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param payload - Partial game settings
 */
export async function updateGameSettings(
  token: string,
  leagueId: string,
  payload: Partial<GameSettings>
): Promise<GameSettings> {
  return authenticatedApiClient<GameSettings>(
    `/league/${leagueId}/game-settings`,
    token,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
}

/**
 * Get default game settings + option metadata for a league's sport.
 * @param token - JWT access token
 * @param leagueId - League UUID
 */
export async function getGameSettingsDefaults(
  token: string,
  leagueId: string
): Promise<GameSettingsDefaults> {
  return authenticatedApiClient<GameSettingsDefaults>(
    `/league/${leagueId}/game-settings/defaults`,
    token,
    { method: 'GET' }
  );
}

/**
 * Create a team within a league. Supports an optional logo upload.
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param payload - Team name, abbreviation, jersey color
 * @param logoFile - Optional team logo image
 */
export async function createTeam(
  token: string,
  leagueId: string,
  payload: CreateTeamPayload,
  logoFile?: File
): Promise<LeagueTeam> {
  const formData = new FormData();
  formData.append('teamName', payload.teamName);
  formData.append('abbreviation', payload.abbreviation);
  formData.append('jerseyColor', payload.jerseyColor);
  if (logoFile) formData.append('teamLogoFile', logoFile);

  return authenticatedApiClient<LeagueTeam>(
    `/league/${leagueId}/teams`,
    token,
    { method: 'POST', body: formData }
  );
}

/**
 * Update a team's basic info and/or roster.
 * - When a logo is provided, sends multipart (scalar fields + logo).
 * - Otherwise sends JSON so nested arrays (player updates / removals) parse correctly.
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param teamId - Team UUID
 * @param payload - Fields to update
 * @param logoFile - Optional new logo
 */
export async function updateTeam(
  token: string,
  leagueId: string,
  teamId: string,
  payload: UpdateTeamPayload,
  logoFile?: File
): Promise<LeagueTeam> {
  const path = `/league/${leagueId}/teams/${teamId}`;

  if (logoFile) {
    const formData = new FormData();
    if (payload.teamName) formData.append('teamName', payload.teamName);
    if (payload.abbreviation) formData.append('abbreviation', payload.abbreviation);
    if (payload.jerseyColor) formData.append('jerseyColor', payload.jerseyColor);
    formData.append('teamLogoFile', logoFile);
    return authenticatedApiClient<LeagueTeam>(path, token, {
      method: 'PATCH',
      body: formData,
    });
  }

  return authenticatedApiClient<LeagueTeam>(path, token, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

/**
 * Assign multiple players to a team.
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param teamId - Team UUID
 * @param playerIds - User IDs to assign
 */
export async function assignPlayersToTeam(
  token: string,
  leagueId: string,
  teamId: string,
  playerIds: string[]
): Promise<string> {
  return authenticatedApiClient<string>(
    `/league/${leagueId}/teams/${teamId}/players`,
    token,
    { method: 'POST', body: JSON.stringify({ playerIds }) }
  );
}

/**
 * Get the paginated league roster (members + their team assignment).
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param page - Page number
 * @param limit - Items per page
 * @param search - Optional name/email search
 */
export async function getLeagueRosters(
  token: string,
  leagueId: string,
  page = 1,
  limit = 20,
  search?: string
): Promise<LeagueRosterResponse> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return authenticatedApiClient<LeagueRosterResponse>(
    `/league/${leagueId}/league-rosters?page=${page}&limit=${limit}${searchParam}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Remove a member from a league (and all teams within it).
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param userId - User UUID to remove
 */
export async function removeLeagueMember(
  token: string,
  leagueId: string,
  userId: string
): Promise<{ message: string }> {
  return authenticatedApiClient<{ message: string }>(
    `/league/${leagueId}/members/${userId}`,
    token,
    { method: 'DELETE' }
  );
}

/**
 * Get the active (or completed) playoff bracket for a league, or null.
 * @param token - JWT access token
 * @param leagueId - League UUID
 */
export async function getActivePlayoffBracket(
  token: string,
  leagueId: string
): Promise<PlayoffBracket | null> {
  return authenticatedApiClient<PlayoffBracket | null>(
    `/league/${leagueId}/playoffs/active`,
    token,
    { method: 'GET' }
  );
}

/**
 * Get the full playoff bracket (with all nodes, teams, seeds, winners, and
 * matchup scores) by bracket id. The `/active` summary endpoint omits nodes,
 * so this is required to render the bracket structure and results.
 * @param token - JWT access token
 * @param bracketId - Playoff bracket UUID
 */
export async function getPlayoffBracketDetail(
  token: string,
  bracketId: string
): Promise<PlayoffBracket> {
  return authenticatedApiClient<PlayoffBracket>(
    `/league/playoffs/brackets/${bracketId}`,
    token,
    { method: 'GET' }
  );
}

/**
 * Create a playoff bracket for a league.
 * @param token - JWT access token
 * @param leagueId - League UUID
 * @param payload - Bracket configuration
 */
export async function createPlayoffBracket(
  token: string,
  leagueId: string,
  payload: CreatePlayoffBracketPayload
): Promise<PlayoffBracket> {
  return authenticatedApiClient<PlayoffBracket>(
    `/league/${leagueId}/playoffs/brackets`,
    token,
    { method: 'POST', body: JSON.stringify(payload) }
  );
}

/**
 * Confirm / lock a playoff bracket to officially start the playoffs.
 * @param token - JWT access token
 * @param bracketId - Playoff bracket UUID
 * @param createRound1Matchups - Whether to auto-create round 1 matchups
 */
export async function confirmPlayoffBracket(
  token: string,
  bracketId: string,
  createRound1Matchups = false
): Promise<PlayoffBracket> {
  return authenticatedApiClient<PlayoffBracket>(
    `/league/playoffs/brackets/${bracketId}/confirm`,
    token,
    { method: 'POST', body: JSON.stringify({ createRound1Matchups }) }
  );
}

/**
 * Get the authenticated user's league participation history.
 * @param token - JWT access token
 * @param page - Page number
 * @param limit - Items per page
 * @param search - Optional search term
 */
export async function getLeagueHistory(
  token: string,
  page = 1,
  limit = 10,
  search?: string
): Promise<LeagueHistoryResponse> {
  const searchParam = search ? `&search=${encodeURIComponent(search)}` : '';
  return authenticatedApiClient<LeagueHistoryResponse>(
    `/league/history?page=${page}&limit=${limit}${searchParam}`,
    token,
    { method: 'GET' }
  );
}

// ============================================
// Stat Engine: Box Scores & Play-by-Play Corrections
// ============================================
// The stat engine is event-sourced: a game's box score is derived from an
// ordered log of play events. Admin "stat corrections" therefore work by
// editing/reassigning/deleting individual events and letting the engine
// recompute the box score.

/** A player's line in a box score (sport-agnostic core fields) */
export interface BoxScorePlayer {
  playerId: string;
  playerName: string;
  jerseyNumber?: string;
  pts: number;
  playerPicture?: string | null;
  jerseyColor?: string;
  dnp?: boolean;
}

/** A team's totals in a box score */
export interface BoxScoreTeam {
  teamId: string;
  teamName: string;
  logoUrl?: string;
  pts: number;
}

/** Core game info within a box score */
export interface BoxScoreGameInfo {
  gameId: string;
  matchupId: string;
  sport: string;
  status: string;
  currentPeriod: string;
  homeScore: number;
  awayScore: number;
}

/** Sport-agnostic view of the box score response (only the fields we use) */
export interface GameBoxScore {
  gameInfo: BoxScoreGameInfo;
  homeTeam: BoxScoreTeam;
  awayTeam: BoxScoreTeam;
  homePlayerStats: BoxScorePlayer[];
  awayPlayerStats: BoxScorePlayer[];
}

/** A single recorded play event (one row of the game log) */
export interface PlayEvent {
  id: string;
  gameId: string;
  teamId: string;
  playerId: string | null;
  eventType: string;
  period: number;
  clock: number | null;
  value: number | null;
  meta?: Record<string, unknown> | null;
  homeScoreAtTime: number;
  awayScoreAtTime: number;
  createdAt: string;
}

/** Human-readable labels for every stat-engine event type */
export const EVENT_TYPE_LABELS: Record<string, string> = {
  // Basketball
  SHOT_2_MADE: '2PT Made',
  SHOT_2_MISS: '2PT Miss',
  SHOT_3_MADE: '3PT Made',
  SHOT_3_MISS: '3PT Miss',
  FT_MADE: 'Free Throw Made',
  FT_MISS: 'Free Throw Miss',
  REBOUND_OFF: 'Offensive Rebound',
  REBOUND_DEF: 'Defensive Rebound',
  ASSIST: 'Assist',
  STEAL: 'Steal',
  BLOCK: 'Block',
  TURNOVER: 'Turnover',
  FOUL: 'Foul',
  TECHNICAL_FOUL: 'Technical Foul',
  TIMEOUT: 'Timeout',
  SUBSTITUTION: 'Substitution',
  DNP: 'Did Not Play',
  PUT_BACK: 'Put-Back',
  // Football
  PASS_COMPLETE: 'Pass Complete',
  PASS_INCOMPLETE: 'Pass Incomplete',
  PASS_TD: 'Passing TD',
  RECEPTION: 'Reception',
  REC_MISS: 'Incomplete Target',
  RUSH_TD: 'Rushing TD',
  REC_TD: 'Receiving TD',
  DEF_TD: 'Defensive TD',
  PAT_MADE: 'PAT Made',
  PAT_MISS: 'PAT Miss',
  SACK: 'Sack',
  SAFETY: 'Safety',
  TACKLE: 'Tackle',
  DEFLECTION: 'Deflection',
  INTERCEPTION: 'Interception',
  FIRST_DOWN: 'First Down',
  CARRY: 'Carry',
  // Soccer
  SHOT_MADE: 'Shot On Target',
  SHOT_MISS: 'Shot Off Target',
  GOAL: 'Goal',
  SOCCER_ASSIST: 'Assist',
  FREE_KICK: 'Free Kick',
  CORNER_KICK: 'Corner Kick',
  SOCCER_TACKLE: 'Tackle',
  SAVE: 'Save',
  OFFSIDE: 'Offside',
  YELLOW_CARD: 'Yellow Card',
  RED_CARD: 'Red Card',
  SOCCER_FOUL: 'Foul',
  POSSESSION: 'Possession',
  // Pickleball
  POINT_SCORED: 'Point Scored',
  WINNER: 'Winner',
  FAULT: 'Fault',
  SERVE_IN: 'Serve In',
  SERVE_FAULT: 'Serve Fault',
  FORCED_ERROR: 'Forced Error',
  UNFORCED_ERROR: 'Unforced Error',
  KITCHEN_ERROR: 'Kitchen Error',
  NET_ERROR: 'Net Error',
};

/**
 * Event types that an admin can reassign an event to, grouped by sport. We
 * deliberately omit lifecycle events (timeout/substitution/DNP) since those
 * aren't manual stat corrections.
 */
export const SPORT_EVENT_TYPES: Record<string, string[]> = {
  basketball: [
    'SHOT_2_MADE',
    'SHOT_2_MISS',
    'SHOT_3_MADE',
    'SHOT_3_MISS',
    'FT_MADE',
    'FT_MISS',
    'REBOUND_OFF',
    'REBOUND_DEF',
    'ASSIST',
    'STEAL',
    'BLOCK',
    'TURNOVER',
    'FOUL',
    'TECHNICAL_FOUL',
    'PUT_BACK',
  ],
  football: [
    'PASS_COMPLETE',
    'PASS_INCOMPLETE',
    'PASS_TD',
    'RECEPTION',
    'REC_MISS',
    'RUSH_TD',
    'REC_TD',
    'DEF_TD',
    'PAT_MADE',
    'PAT_MISS',
    'SACK',
    'SAFETY',
    'TACKLE',
    'DEFLECTION',
    'INTERCEPTION',
    'FIRST_DOWN',
    'CARRY',
  ],
  soccer: [
    'GOAL',
    'SHOT_MADE',
    'SHOT_MISS',
    'SOCCER_ASSIST',
    'FREE_KICK',
    'CORNER_KICK',
    'SOCCER_TACKLE',
    'SAVE',
    'OFFSIDE',
    'YELLOW_CARD',
    'RED_CARD',
    'SOCCER_FOUL',
  ],
  pickleball: [
    'POINT_SCORED',
    'WINNER',
    'FAULT',
    'SERVE_IN',
    'SERVE_FAULT',
    'FORCED_ERROR',
    'UNFORCED_ERROR',
    'KITCHEN_ERROR',
    'NET_ERROR',
  ],
};

/** Friendly label for an event type, falling back to the raw key */
export function eventTypeLabel(eventType: string): string {
  return EVENT_TYPE_LABELS[eventType] ?? eventType;
}

/**
 * Get the full box score / stats for a game (player points, team totals).
 * @param token - JWT access token
 * @param gameId - Game UUID
 */
export async function getGameStats(
  token: string,
  gameId: string
): Promise<GameBoxScore> {
  return authenticatedApiClient<GameBoxScore>(
    `/games/${gameId}/stats`,
    token,
    { method: 'GET' }
  );
}

/**
 * Get the full ordered play-by-play event log for a game.
 * @param token - JWT access token
 * @param gameId - Game UUID
 */
export async function getGameEvents(
  token: string,
  gameId: string
): Promise<PlayEvent[]> {
  return authenticatedApiClient<PlayEvent[]>(
    `/stat-engine/games/${gameId}/events`,
    token,
    { method: 'GET' }
  );
}

/**
 * Change the stat type (and optionally numeric value) of a recorded event.
 * The engine recomputes the box score automatically.
 * @param token - JWT access token
 * @param gameId - Game UUID
 * @param eventId - Event UUID
 * @param payload - New event type, optional value, and optional reason
 */
export async function changeEventStat(
  token: string,
  gameId: string,
  eventId: string,
  payload: { newEventType: string; value?: number; reason?: string }
): Promise<PlayEvent> {
  return authenticatedApiClient<PlayEvent>(
    `/stat-engine/games/${gameId}/events/${eventId}/stat`,
    token,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
}

/**
 * Reassign a recorded event to a different player.
 * @param token - JWT access token
 * @param gameId - Game UUID
 * @param eventId - Event UUID
 * @param payload - New player id and optional reason
 */
export async function changeEventPlayer(
  token: string,
  gameId: string,
  eventId: string,
  payload: { newPlayerId: string; reason?: string }
): Promise<PlayEvent> {
  return authenticatedApiClient<PlayEvent>(
    `/stat-engine/games/${gameId}/events/${eventId}/player`,
    token,
    { method: 'PUT', body: JSON.stringify(payload) }
  );
}

/**
 * Delete a recorded event (used to remove a mistakenly-logged stat).
 * @param token - JWT access token
 * @param gameId - Game UUID
 * @param eventId - Event UUID
 */
export async function deleteGameEvent(
  token: string,
  gameId: string,
  eventId: string
): Promise<{ message: string }> {
  return authenticatedApiClient<{ message: string }>(
    `/stat-engine/games/${gameId}/events/${eventId}`,
    token,
    { method: 'DELETE' }
  );
}

/**
 * Recalculate a game's aggregated stats from its event log. Useful after
 * manual corrections or to fix drifted aggregates.
 * @param token - JWT access token
 * @param gameId - Game UUID
 */
export async function recalculateGameStats(
  token: string,
  gameId: string
): Promise<{ message: string; eventsProcessed?: number }> {
  return authenticatedApiClient<{ message: string; eventsProcessed?: number }>(
    `/stat-engine/games/${gameId}/events/recalculate`,
    token,
    { method: 'POST' }
  );
}


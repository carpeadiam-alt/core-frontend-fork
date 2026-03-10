'use client';

import { useState, useEffect, useCallback } from 'react';
import { Rubik } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const yuseiMagic = {
  fontFamily: 'Yusei Magic',
};

// ─── Season helpers ────────────────────────────────────────────────────────────

const VALID_SEASONS = ['Winter', 'Spring', 'Summer', 'Monsoon', 'Autumn'] as const;
type SeasonName = typeof VALID_SEASONS[number];

function getSeasonName(month: number): SeasonName {
  if ([10, 11, 0].includes(month)) return 'Winter';
  if ([1, 2].includes(month)) return 'Spring';
  if ([3, 4].includes(month)) return 'Summer';
  if ([5, 6, 7].includes(month)) return 'Monsoon';
  return 'Autumn';
}

/** Returns true only for keys shaped like "2024_Summer" with a valid season. */
function isValidSeasonKey(key: string): boolean {
  const parts = key.split('_');
  if (parts.length !== 2) return false;
  const [yearStr, season] = parts;
  const year = Number(yearStr);
  if (!Number.isInteger(year) || year < 2020 || year > 2100) return false;
  return (VALID_SEASONS as readonly string[]).includes(season);
}

function parseSeasonKey(key: string): { year: string; seasonName: SeasonName } | null {
  if (!isValidSeasonKey(key)) return null;
  const [year, seasonName] = key.split('_');
  return { year, seasonName: seasonName as SeasonName };
}

function getCurrentSeasonKey(): string {
  const now = new Date();
  return `${now.getFullYear()}_${getSeasonName(now.getMonth())}`;
}

// ─── Image / icon maps ─────────────────────────────────────────────────────────

const SEASON_IMAGE_MAP: Record<SeasonName, string> = {
  Summer: '/seasons/summer.png',
  Monsoon: '/seasons/monsoon.png',
  Autumn: '/icons/day.svg',
  Winter: '/seasons/winter.png',
  Spring: '/seasons/spring.png',
};

const GAME_ICON_MAP: Record<string, string> = {
  wordual: '/icons/wd.svg',
  wikisprint: '/icons/wiki2.svg',
  hopscotch: '/icons/hopscotch.svg',
  charades: '/icons/charades1.svg',
  cipher: '/icons/cipher.svg',
  miniesque: '/icons/miniesque.svg',
  connections: '/icons/connections.svg',
  archives: '/icons/archives.svg',
  sudokuction: '/icons/sudokuction.svg',
  punchline: '/icons/punchline.svg',
  trivia: '/icons/trivia2.svg',
  tenet: '/icons/tnt.svg',
  shuffle: '/icons/shf.svg',
  'six-degrees': '/icons/sd.svg',
  'big-lecrossski': '/icons/tfc.svg',
  whispers: '/icons/whispers.svg',
};

function getGameIcon(game: string): string {
  // Try exact match first, then lowercase
  return GAME_ICON_MAP[game] ?? GAME_ICON_MAP[game.toLowerCase()] ?? '/icons/default.svg';
}

// ─── Types ─────────────────────────────────────────────────────────────────────

type PlayerRanking = {
  username: string;
  score: number;
  photo_index: number;
};

type GameLeaderboard = Record<string, PlayerRanking[]>;
type LeaderboardData = Record<string, GameLeaderboard>;

// ─── Derived selectors ─────────────────────────────────────────────────────────

/**
 * Returns only season keys that are validly shaped AND have at least one game
 * with at least one player.
 */
function getValidSeasons(data: LeaderboardData): string[] {
  return Object.keys(data).filter((key) => {
    if (!isValidSeasonKey(key)) return false;
    const season = data[key];
    // Season must have at least one game with at least one ranking entry
    return Object.values(season).some((rankings) => Array.isArray(rankings) && rankings.length > 0);
  });
}

/**
 * Returns games that actually have data (non-empty rankings array) for a given season.
 */
function getGamesForSeason(data: LeaderboardData, seasonKey: string): string[] {
  if (!isValidSeasonKey(seasonKey) || !data[seasonKey]) return [];
  return Object.entries(data[seasonKey])
    .filter(([, rankings]) => Array.isArray(rankings) && rankings.length > 0)
    .map(([game]) => game);
}

/**
 * Safely returns rankings, never undefined.
 */
function getRankings(data: LeaderboardData, seasonKey: string, game: string): PlayerRanking[] {
  if (!isValidSeasonKey(seasonKey) || !game) return [];
  return data[seasonKey]?.[game] ?? [];
}

function formatGameName(name: string): string {
  return name.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({});
  const [seasons, setSeasons] = useState<string[]>([]);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number>(0);

  const router = useRouter();

  // ── Derived state ─────────────────────────────────────────────────────────

  // Clamp season index to valid range
  const safeSeasonIndex = seasons.length > 0 ? Math.min(currentSeasonIndex, seasons.length - 1) : 0;
  const currentSeasonKey = seasons[safeSeasonIndex] ?? '';
  const parsedSeason = currentSeasonKey ? parseSeasonKey(currentSeasonKey) : null;

  // Games available for this specific season
  const gamesForSeason = currentSeasonKey ? getGamesForSeason(leaderboardData, currentSeasonKey) : [];

  // Clamp game index to valid range for this season
  const safeGameIndex = gamesForSeason.length > 0 ? Math.min(currentGameIndex, gamesForSeason.length - 1) : 0;
  const currentGame = gamesForSeason[safeGameIndex] ?? '';

  const rankings = currentSeasonKey && currentGame
    ? getRankings(leaderboardData, currentSeasonKey, currentGame)
    : [];

  const seasonImageUrl = parsedSeason
    ? (SEASON_IMAGE_MAP[parsedSeason.seasonName] ?? '/seasons/default.png')
    : '/seasons/default.png';

  const gameIcon = getGameIcon(currentGame);
  const isCurrentSeason = currentSeasonKey === getCurrentSeasonKey();

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchLeaderboard = useCallback(async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(
        `https://thecodeworks.in/core_backend/leaderboard?token=${encodeURIComponent(token)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const raw = await response.json();

      // Guard: must be a plain object
      if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) {
        throw new Error('Unexpected leaderboard response shape');
      }

      const data: LeaderboardData = raw;
      setLeaderboardData(data);

      const validSeasons = getValidSeasons(data);
      setSeasons(validSeasons);

      // Default to current season if present, otherwise first
      const currentKey = getCurrentSeasonKey();
      const currentIdx = validSeasons.indexOf(currentKey);
      setCurrentSeasonIndex(currentIdx >= 0 ? currentIdx : 0);
      setCurrentGameIndex(0);
    } catch (err) {
      console.error('Error fetching leaderboard:', err);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('bento_token');
    const storedUsername = localStorage.getItem('bento_username');

    if (!token || !storedUsername) {
      router.push('/');
      return;
    }

    setUserToken(token);
    setUsername(storedUsername);

    fetch(`https://thecodeworks.in/core_backend/profile?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setPhotoIndex(data.photo_index ?? 0);
      })
      .catch(console.error);

    fetchLeaderboard(token);
  }, [router, fetchLeaderboard]);

  // Reset game index to 0 whenever the season changes
  useEffect(() => {
    setCurrentGameIndex(0);
  }, [currentSeasonIndex]);

  // ── Navigation ─────────────────────────────────────────────────────────────

  const nextSeason = () => {
    if (seasons.length <= 1) return;
    setCurrentSeasonIndex((prev) => (prev + 1) % seasons.length);
  };
  const prevSeason = () => {
    if (seasons.length <= 1) return;
    setCurrentSeasonIndex((prev) => (prev - 1 + seasons.length) % seasons.length);
  };

  const nextGame = () => {
    if (gamesForSeason.length <= 1) return;
    setCurrentGameIndex((prev) => (prev + 1) % gamesForSeason.length);
  };
  const prevGame = () => {
    if (gamesForSeason.length <= 1) return;
    setCurrentGameIndex((prev) => (prev - 1 + gamesForSeason.length) % gamesForSeason.length);
  };

  // ── Auth ───────────────────────────────────────────────────────────────────

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bento_token');
      localStorage.removeItem('bento_username');
      localStorage.removeItem('bento_photo_index');
    }
    router.push('/');
  };

  // ── Render guards ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans flex items-center justify-center p-4`}>
        <div className="bg-white rounded-lg p-8 max-w-md text-center border border-gray-300">
          <h2 className="text-xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => fetchLeaderboard(userToken)}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors mr-4"
          >
            Retry
          </button>
          <button
            onClick={() => router.push('/add-friend')}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add Friends
          </button>
        </div>
      </div>
    );
  }

  if (seasons.length === 0) {
    return (
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans flex items-center justify-center p-4`}>
        <div className="bg-white rounded-lg p-8 max-w-md text-center border border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4">No Leaderboard Data Yet</h2>
          <p className="text-gray-600 mb-6">Play some games and add friends to see leaderboard data.</p>
          <button
            onClick={() => router.push('/add-friend')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add Friends
          </button>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
      >
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
              <img
                src={`/profiles/${photoIndex}.svg`}
                alt="Profile"
                className="w-full h-full object-contain"
                onError={(e) => { (e.target as HTMLImageElement).src = '/profiles/0.svg'; }}
              />
            </div>
            <span className="font-medium text-gray-900 truncate max-w-[120px]">
              {username || 'User'}
            </span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-3">
          {[
            { href: '/home', label: 'Home' },
            { href: '/leaderboard', label: 'Leaderboard' },
            { href: '/friends', label: 'Friends' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
              onClick={() => setSidebarOpen(false)}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => { handleLogout(); setSidebarOpen(false); }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-md"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
        <div className="relative">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="max-w-md mx-auto px-4 pb-8">
            {/* Season Header */}
            <div className="mb-6 text-center">
              <div className="mb-3">
                <img
                  src={seasonImageUrl}
                  alt={parsedSeason?.seasonName ?? 'Season'}
                  className="w-32 h-32 object-cover mx-auto rounded-lg"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/seasons/default.png'; }}
                />
              </div>

              <div className="flex items-center justify-center space-x-3">
                {seasons.length > 1 && (
                  <button
                    onClick={prevSeason}
                    className="p-1.5 hover:bg-gray-200 rounded-full"
                    aria-label="Previous season"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                )}

                <h2 className="text-lg font-semibold text-gray-800 whitespace-nowrap" style={yuseiMagic}>
                  {parsedSeason
                    ? `${parsedSeason.seasonName} ${parsedSeason.year}${isCurrentSeason ? ' (Current)' : ''}`
                    : '—'}
                </h2>

                {seasons.length > 1 && (
                  <button
                    onClick={nextSeason}
                    className="p-1.5 hover:bg-gray-200 rounded-full"
                    aria-label="Next season"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Game Selector — only shown if games exist for this season */}
            {gamesForSeason.length > 0 ? (
              <div className="mb-6 flex items-center justify-between bg-white rounded-lg p-3 border border-gray-300">
                <button
                  onClick={prevGame}
                  className="p-2 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors disabled:opacity-30"
                  disabled={gamesForSeason.length <= 1}
                  aria-label="Previous game"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                <div className="flex items-center space-x-2">
                  <img
                    src={gameIcon}
                    alt={currentGame}
                    className="w-6 h-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).src = '/icons/default.svg'; }}
                  />
                  <span className="text-md font-medium text-black-800" style={yuseiMagic}>
                    {formatGameName(currentGame)}
                  </span>
                </div>

                <button
                  onClick={nextGame}
                  className="p-2 hover:bg-gray-100 rounded-full border border-gray-300 transition-colors disabled:opacity-30"
                  disabled={gamesForSeason.length <= 1}
                  aria-label="Next game"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            ) : (
              <div className="mb-6 text-center py-4 text-gray-500 bg-gray-50 rounded-lg border border-gray-200 text-sm">
                No games played this season yet
              </div>
            )}

            {/* Rankings */}
            <div className="space-y-3">
              {rankings.length > 0 ? (
                rankings.map((player, index) => (
                  <div
                    key={`${player.username}-${currentSeasonKey}-${currentGame}-${index}`}
                    className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-300"
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 mr-3 flex-shrink-0">
                        <img
                          src={`/profiles/${player.photo_index}.svg`}
                          alt={player.username}
                          className="w-full h-full object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).src = '/profiles/0.svg'; }}
                        />
                      </div>
                      <span className="font-medium text-gray-800 truncate max-w-[120px]">
                        {player.username}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold text-gray-800 mr-2">{player.score}</span>
                      <span className="text-sm text-gray-500">rolls</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-300">
                  {currentGame
                    ? `No scores yet for ${formatGameName(currentGame)} in ${parsedSeason?.seasonName} ${parsedSeason?.year}`
                    : 'No data available for this season'}
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => router.push('/friends')}
                className="flex items-center gap-1.5 bg-black text-white py-2 px-4 rounded-full hover:bg-gray-800 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add Friends
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
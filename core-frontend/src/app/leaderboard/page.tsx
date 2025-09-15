// pages/LeaderboardPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Define types for our leaderboard data
type PlayerRanking = {
  username: string;
  score: number;
};

type GameLeaderboard = Record<string, PlayerRanking[]>;
type LeaderboardData = Record<string, GameLeaderboard>;

export default function LeaderboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData>({});
  const [seasons, setSeasons] = useState<string[]>([]);
  const [games, setGames] = useState<string[]>([]);
  const [currentSeasonIndex, setCurrentSeasonIndex] = useState(0);
  const [currentGameIndex, setCurrentGameIndex] = useState(0);
  const [userToken, setUserToken] = useState('');
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('bento_token');
    const username = localStorage.getItem('bento_username');
    
    if (!token || !username) {
      router.push('/login');
      return;
    }
    
    setUserToken(token);
    fetchLeaderboard(token);
  }, [router]);

  const fetchLeaderboard = async (token: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`https://thecodeworks.in/core_backend/leaderboard?token=${token}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch leaderboard');
      }
      
      const data: LeaderboardData = await response.json();
      setLeaderboardData(data);
      
      // Extract seasons and games
      const seasonList = Object.keys(data);
      setSeasons(seasonList);
      
      if (seasonList.length > 0) {
        // Get all unique games across all seasons
        const allGames = new Set<string>();
        Object.values(data).forEach(season => {
          Object.keys(season).forEach(game => allGames.add(game));
        });
        setGames(Array.from(allGames));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('Failed to load leaderboard. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  const nextSeason = () => {
    setCurrentSeasonIndex((prev) => (prev + 1) % seasons.length);
  };

  const prevSeason = () => {
    setCurrentSeasonIndex((prev) => (prev - 1 + seasons.length) % seasons.length);
  };

  const nextGame = () => {
    setCurrentGameIndex((prev) => (prev + 1) % games.length);
  };

  const prevGame = () => {
    setCurrentGameIndex((prev) => (prev - 1 + games.length) % games.length);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
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
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
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

  const currentSeason = seasons[currentSeasonIndex];
  const currentGame = games.length > 0 ? games[currentGameIndex] : '';
  const rankings = currentGame ? (leaderboardData[currentSeason]?.[currentGame] || []) : [];

  // Format season display name
  const formatSeason = (seasonKey: string) => {
    const [year, season] = seasonKey.split('_');
    const isCurrent = seasonKey === `${new Date().getFullYear()}_${getSeasonName(new Date().getMonth())}`;
    return `${season} ${year}${isCurrent ? ' (Current)' : ''}`;
  };

  function getSeasonName(month: number) {
    if ([10, 11, 0].includes(month)) return "Winter";
    if ([1, 2].includes(month)) return "Spring";
    if ([3, 4].includes(month)) return "Summer";
    if ([5, 6, 7].includes(month)) return "Monsoon";
    return "Autumn";
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Leaderboard</h1>
          
          {/* Season Navigation */}
          <div className="mb-6">
            <div className="flex items-center justify-between bg-gray-100 rounded-lg p-3">
              <button
                onClick={prevSeason}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                disabled={seasons.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              
              <h2 className="text-lg font-semibold text-gray-800">
                {formatSeason(currentSeason)}
              </h2>
              
              <button
                onClick={nextSeason}
                className="p-2 hover:bg-gray-200 rounded-full transition-colors"
                disabled={seasons.length <= 1}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
          
          {/* Game Navigation */}
          {games.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center justify-between bg-blue-50 rounded-lg p-3">
                <button
                  onClick={prevGame}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                  disabled={games.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
                
                <h3 className="text-md font-medium text-blue-800">
                  {currentGame || 'No Game Selected'}
                </h3>
                
                <button
                  onClick={nextGame}
                  className="p-2 hover:bg-blue-100 rounded-full transition-colors"
                  disabled={games.length <= 1}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          )}
          
          {/* Rankings */}
          <div className="space-y-3">
            {rankings.length > 0 ? (
              rankings.map((player, index) => (
                <div
                  key={player.username}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 
                      ? 'bg-yellow-100 border-l-4 border-yellow-500' 
                      : index === 1 
                        ? 'bg-gray-100 border-l-4 border-gray-400'
                        : index === 2
                          ? 'bg-amber-100 border-l-4 border-amber-500'
                          : 'bg-white border-l-4 border-gray-200'
                  } shadow-sm`}
                >
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm mr-3 ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-500' : 
                      index === 2 ? 'bg-amber-500' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="font-medium text-gray-800">
                      {player.username}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-lg font-bold text-gray-800 mr-2">
                      {player.score}
                    </span>
                    <span className="text-sm text-gray-500">pts</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No scores yet for {currentGame} in {formatSeason(currentSeason)}
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/add-friend')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Add Friends
          </button>
        </div>
      </div>
    </div>
  );
}
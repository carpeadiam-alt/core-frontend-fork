'use client';

import React, { useState, useEffect } from 'react';
import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const SixDegreesGame = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(5);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showAnswer, setShowAnswer] = useState(false);
  const [expandedConnections, setExpandedConnections] = useState<{[key: number]: boolean}>({});
  const [loading, setLoading] = useState(true);
  const [correctUpTo, setCorrectUpTo] = useState<number>(-1);
  const [firstWrongIndex, setFirstWrongIndex] = useState<number>(-1);
  const [showFeedback, setShowFeedback] = useState(false);
  const [touchStart, setTouchStart] = useState<{x: number, y: number} | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  // Load random game from 6d.json
  useEffect(() => {
    const loadRandomGame = async () => {
      try {
        const response = await fetch('6d.json');
        if (!response.ok) throw new Error('Failed to load game data');
        
        const games = await response.json();
        if (!games || games.length === 0) throw new Error('No games found');
        
        // Select random game
        const randomIndex = Math.floor(Math.random() * games.length);
        const selectedGame = games[randomIndex];
        
        setGameData(selectedGame);
        
        // Initialize shuffled order
        const shuffleArray = (array: string[]): string[] => {
          const newArray = [...array];
          for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
          }
          return newArray;
        };

        const itemsToShuffle = selectedGame.original_path.slice(1);
        const shuffled = shuffleArray(itemsToShuffle);
        setCurrentOrder([selectedGame.original_path[0], ...shuffled]);
        setCorrectUpTo(-1);
        setFirstWrongIndex(-1);
        setShowFeedback(false);
        setLoading(false);
      } catch (error) {
        console.error('Error loading game data:', error);
        setLoading(false);
      }
    };

    loadRandomGame();
  }, []);

  const checkAnswer = () => {
    if (!gameData) return;
    
    // Find how many consecutive items from the start are correct
    let correctCount = 0;
    let firstWrong = -1;
    
    for (let i = 0; i < currentOrder.length; i++) {
      if (currentOrder[i] === gameData.original_path[i]) {
        correctCount++;
      } else {
        firstWrong = i;
        break;
      }
    }
    
    setCorrectUpTo(correctCount - 1);
    setFirstWrongIndex(firstWrong);
    setShowFeedback(true);
    
    const isCorrect = correctCount === currentOrder.length;
    
    if (isCorrect) {
      setGameState('won');
      setTimeout(() => setShowAnswer(true), 1500);
    } else {
      setAttemptsLeft(attemptsLeft - 1);
      if (attemptsLeft <= 1) {
        setGameState('lost');
        setTimeout(() => setShowAnswer(true), 2000);
      }
    }
  };

  const resetGame = async () => {
    setLoading(true);
    setAttemptsLeft(5);
    setGameState('playing');
    setShowAnswer(false);
    setExpandedConnections({});
    setCorrectUpTo(-1);
    setFirstWrongIndex(-1);
    setShowFeedback(false);
    
    try {
      const response = await fetch('/6d.json');
      if (!response.ok) throw new Error('Failed to load game data');
      
      const games = await response.json();
      if (!games || games.length === 0) throw new Error('No games found');
      
      // Select random game
      const randomIndex = Math.floor(Math.random() * games.length);
      const selectedGame = games[randomIndex];
      
      setGameData(selectedGame);
      
      // Initialize shuffled order
      const shuffleArray = (array: string[]): string[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
      };

      const itemsToShuffle = selectedGame.original_path.slice(1);
      const shuffled = shuffleArray(itemsToShuffle);
      setCurrentOrder([selectedGame.original_path[0], ...shuffled]);
      setCorrectUpTo(-1);
      setFirstWrongIndex(-1);
      setShowFeedback(false);
      setLoading(false);
    } catch (error) {
      console.error('Error loading game data:', error);
      setLoading(false);
    }
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (fromIndex === 0 || toIndex === 0) return; // Can't move the first item
    
    const newOrder = [...currentOrder];
    const [movedItem] = newOrder.splice(fromIndex, 1);
    newOrder.splice(toIndex, 0, movedItem);
    setCurrentOrder(newOrder);
  };

  const handleTouchStart = (e: React.TouchEvent, index: number) => {
    if (index === 0 || gameState !== 'playing') return;
    
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setDraggedIndex(index);
  };

  const handleTouchEnd = (e: React.TouchEvent, dropIndex: number) => {
    if (!touchStart || draggedIndex === null || draggedIndex === 0 || dropIndex === 0) {
      setTouchStart(null);
      setDraggedIndex(null);
      return;
    }

    const touch = e.changedTouches[0];
    const deltaY = touch.clientY - touchStart.y;
    
    // Only move if there was significant vertical movement
    if (Math.abs(deltaY) > 30) {
      moveItem(draggedIndex, dropIndex);
    }
    
    setTouchStart(null);
    setDraggedIndex(null);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (index === 0 || gameState !== 'playing') return;
    e.dataTransfer.effectAllowed = 'move';
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === 0 || dropIndex === 0) return;
    
    moveItem(draggedIndex, dropIndex);
    setDraggedIndex(null);
  };

  const toggleConnection = (index: number) => {
    setExpandedConnections(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const truncateText = (text: string, maxLength: number = 80): string => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getConnectionText = (fromItem: string, toItem: string): string => {
    if (!gameData) return '';
    const connection = gameData.connections.find(
      (conn: any) => conn.from === fromItem && conn.to === toItem
    );
    return connection ? connection.connecting_text : '';
  };

  const getItemStatus = (index: number) => {
    if (!showFeedback) return 'default';
    if (index <= correctUpTo) return 'correct';
    if (index === firstWrongIndex) return 'wrong';
    return 'default';
  };

  if (loading) {
    return (
      <div className={`${rubik.variable} font-sans min-h-screen bg-white flex items-center justify-center`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-700 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className={`${rubik.variable} font-sans min-h-screen bg-white flex items-center justify-center`}>
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">Unable to load game</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-black text-white rounded-full text-sm hover:bg-gray-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`${rubik.variable} font-sans min-h-screen bg-white`}>
      {/* Header with Info Button - Removed title and border */}
      <div className="w-full bg-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-end">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="w-8 h-8 bg-white text-black rounded-full border border-black font-bold hover:bg-gray-50 transition-all flex items-center justify-center"
          >
            i
          </button>
        </div>
      </div>

      {/* How To Play Popup */}
      {showHowToPlay && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-6 rounded-lg max-w-sm mx-4 relative">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-50"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="space-y-3 text-sm">
              <p>Arrange items to trace the path from start to finish.</p>
              <p>Drag and drop items to reorder them.</p>
              <p>The first item is fixed and cannot be moved.</p>
              <p>You have 5 attempts to solve the puzzle.</p>
              <p>After each submission, you'll see which items are in the correct position.</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Complete Popup */}
      {(gameState === 'won' || gameState === 'lost') && showAnswer && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border border-black p-8 rounded-lg max-w-md mx-4 shadow-xl text-center relative">
            <button
              onClick={() => setShowAnswer(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white border border-black rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-50"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {gameState === 'won' ? 'Perfect Solution!' : 'Game Over'}
            </h2>
            <p className="mb-6">
              {gameState === 'won' 
                ? 'You solved the puzzle!' 
                : 'Better luck next time!'}
            </p>
            <button
              onClick={resetGame}
              className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all font-bold"
            >
              Play Again
            </button>
          </div>
        </div>
      )}

      {/* Main Game Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Game Stats */}
        <div className="flex justify-between items-center mb-8">
          <div className="text-center">
            <div className="text-lg font-bold text-black">{attemptsLeft}</div>
            <div className="text-xs text-gray-600">ATTEMPTS LEFT</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-black">
              {correctUpTo >= 0 ? correctUpTo + 1 : 0}/{currentOrder.length}
            </div>
            <div className="text-xs text-gray-600">CORRECT POSITIONS</div>
          </div>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-white text-black rounded-full border border-black hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            New Game
          </button>
        </div>

        {/* Game Board - Removed surrounding border */}
        <div className="bg-white p-6 mb-8">
          {!showAnswer ? (
            /* Playing State */
            <div className="space-y-3">
              {currentOrder.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className={`p-4 rounded-lg border transition-all duration-200 select-none ${
                    index === 0 
                      ? 'bg-[#00BDA1] border-black' 
                      : gameState === 'playing'
                        ? `bg-white border-black hover:shadow-md cursor-move ${
                            getItemStatus(index) === 'correct' ? 'bg-green-300 border-green-400' : 
                            getItemStatus(index) === 'wrong' ? 'bg-red-300 border-red-400' : ''
                          }`
                        : 'bg-gray-100 border-gray-300'
                  } ${draggedIndex === index ? 'opacity-70 scale-95' : ''}`}
                  draggable={index !== 0 && gameState === 'playing'}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchEnd={(e) => handleTouchEnd(e, index)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-black text-white' : 
                      getItemStatus(index) === 'correct' ? 'bg-green-600 text-white' :
                      getItemStatus(index) === 'wrong' ? 'bg-red-600 text-white' :
                      'bg-gray-400 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-lg font-bold text-black flex-1">{item}</span>
                    
                    {index === 0 && (
                      <span className="text-xs bg-black text-white px-3 py-1 rounded font-bold">
                        START
                      </span>
                    )}
                    
                    {index === currentOrder.length - 1 && index !== 0 && (
                      <span className="text-xs bg-green-600 text-white px-3 py-1 rounded font-bold">
                        END
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Answer Reveal State */
            <div className="space-y-6">
              {gameData.original_path.map((item: string, index: number) => (
                <div key={item} className="text-center">
                  {/* Item */}
                  <div className="inline-flex items-center gap-3 bg-white border rounded-lg px-5 py-3 mb-3">
                    <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-sm font-bold">
                      {index + 1}
                    </div>
                    <span className="text-lg font-bold text-black">{item}</span>
                  </div>
                  
                  {/* Connection */}
                  {index < gameData.original_path.length - 1 && (
                    <div className="mt-4 mb-6">
                      <div className="w-1 h-4 bg-black mx-auto"></div>
                      <div className="max-w-lg mx-auto">
                        <div className="text-sm text-gray-800 leading-relaxed px-5 py-3 bg-gray-100 rounded-lg border">
                          {expandedConnections[index] ? (
                            <div>
                              <p className="text-center">{getConnectionText(item, gameData.original_path[index + 1])}</p>
                              <button
                                onClick={() => toggleConnection(index)}
                                className="text-black hover:text-gray-700 mt-2 underline font-bold"
                              >
                                Show less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p className="text-center">{truncateText(getConnectionText(item, gameData.original_path[index + 1]), 80)}</p>
                              {getConnectionText(item, gameData.original_path[index + 1]).length > 80 && (
                                <button
                                  onClick={() => toggleConnection(index)}
                                  className="text-black hover:text-gray-700 mt-2 underline font-bold"
                                >
                                  Show more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-1 h-4 bg-black mx-auto"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls - Made buttons smaller and oval like NYT Games */}
<div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
  {!showAnswer && gameState === 'playing' && (
    <button
      onClick={checkAnswer}
      className="px-6 py-2 bg-black text-white rounded-full text-sm font-bold hover:bg-gray-800 transition-colors border border-black min-w-[120px] max-w-[150px]"
    >
      Submit
    </button>
  )}
  

</div>

        {/* Feedback */}
        {showFeedback && !showAnswer && firstWrongIndex !== -1 && (
          <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center">
            <p className="text-sm font-bold text-yellow-800">
              Position {firstWrongIndex + 1} is incorrect. Items 1-{correctUpTo + 1} are in the right place.
            </p>
          </div>
        )}

        {/* Instructions */}
        {!showAnswer && !showFeedback && (
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600 leading-relaxed">
              Drag items to reorder them. The first item cannot be moved.
            </p>
          </div>
        )}
      </main>
    </div>
  );
};

export default SixDegreesGame;
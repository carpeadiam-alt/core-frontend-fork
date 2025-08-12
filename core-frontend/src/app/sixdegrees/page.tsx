'use client';

import React, { useState, useEffect } from 'react';

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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-700 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4 text-sm">Unable to load game</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 px-4">
      <div className="max-w-lg mx-auto">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Six Degrees</h1>
          <p className="text-gray-600 text-sm mb-4">
            Arrange items to trace the path from start to finish
          </p>
          
          {/* Game Status */}
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="text-center">
              <div className="text-xs text-gray-500 uppercase tracking-wide">Attempts</div>
              <div className={`text-lg font-bold ${attemptsLeft <= 1 ? 'text-red-600' : 'text-gray-900'}`}>
                {attemptsLeft}
              </div>
            </div>
            
            {gameState === 'won' && (
              <div className="text-center">
                <div className="text-xs text-green-600 uppercase tracking-wide">Status</div>
                <div className="text-lg font-bold text-green-600">Solved</div>
              </div>
            )}
            
            {gameState === 'lost' && (
              <div className="text-center">
                <div className="text-xs text-red-600 uppercase tracking-wide">Status</div>
                <div className="text-lg font-bold text-red-600">Game Over</div>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded border border-gray-200 p-4 mb-4">
          {!showAnswer ? (
            /* Playing State */
            <div className="space-y-2">
              {currentOrder.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className={`p-3 rounded border transition-all duration-200 select-none ${
                    index === 0 
                      ? 'bg-blue-50 border-blue-200' 
                      : gameState === 'playing'
                        ? `bg-white border-gray-200 hover:border-gray-300 cursor-move touch-manipulation ${
                            getItemStatus(index) === 'correct' ? 'bg-green-50 border-green-300' : 
                            getItemStatus(index) === 'wrong' ? 'bg-red-50 border-red-300' : ''
                          }`
                        : 'bg-gray-50 border-gray-200'
                  } ${draggedIndex === index ? 'opacity-50 scale-95' : ''}`}
                  draggable={index !== 0 && gameState === 'playing'}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                  onTouchStart={(e) => handleTouchStart(e, index)}
                  onTouchEnd={(e) => handleTouchEnd(e, index)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      index === 0 ? 'bg-blue-600 text-white' : 
                      getItemStatus(index) === 'correct' ? 'bg-green-600 text-white' :
                      getItemStatus(index) === 'wrong' ? 'bg-red-600 text-white' :
                      'bg-gray-300 text-gray-700'
                    }`}>
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900 flex-1">{item}</span>
                    
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        Start
                      </span>
                    )}
                    
                    {index === currentOrder.length - 1 && index !== 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        End
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Answer Reveal State */
            <div className="space-y-4">
              {gameData.original_path.map((item: string, index: number) => (
                <div key={item} className="text-center">
                  {/* Item */}
                  <div className="inline-flex items-center gap-2 bg-white border border-gray-300 rounded-full px-4 py-2 mb-2">
                    <div className="w-5 h-5 rounded-full bg-gray-800 text-white flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-900">{item}</span>
                  </div>
                  
                  {/* Connection */}
                  {index < gameData.original_path.length - 1 && (
                    <div className="mt-2 mb-4">
                      <div className="w-px h-3 bg-gray-300 mx-auto"></div>
                      <div className="max-w-sm mx-auto">
                        <div className="text-xs text-gray-600 leading-relaxed px-4 py-2 bg-gray-50 rounded">
                          {expandedConnections[index] ? (
                            <div>
                              <p>{getConnectionText(item, gameData.original_path[index + 1])}</p>
                              <button
                                onClick={() => toggleConnection(index)}
                                className="text-blue-600 hover:text-blue-800 mt-1 underline"
                              >
                                less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p>{truncateText(getConnectionText(item, gameData.original_path[index + 1]), 60)}</p>
                              {getConnectionText(item, gameData.original_path[index + 1]).length > 60 && (
                                <button
                                  onClick={() => toggleConnection(index)}
                                  className="text-blue-600 hover:text-blue-800 mt-1 underline"
                                >
                                  more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-px h-3 bg-gray-300 mx-auto"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="space-y-3">
          {!showAnswer && gameState === 'playing' && (
            <button
              onClick={checkAnswer}
              className="w-full py-3 bg-gray-900 text-white rounded text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Submit
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="w-full py-3 bg-gray-200 text-gray-700 rounded text-sm font-medium hover:bg-gray-300 transition-colors"
          >
            New Game
          </button>
        </div>

        {/* Feedback */}
        {showFeedback && !showAnswer && firstWrongIndex !== -1 && (
          <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-center">
            <p className="text-sm text-orange-800">
              Position {firstWrongIndex + 1} is incorrect. Items 1-{correctUpTo + 1} are in the right place.
            </p>
          </div>
        )}

        {/* Instructions */}
        {!showAnswer && !showFeedback && (
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500 leading-relaxed">
              Drag items to reorder them. The first item cannot be moved.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SixDegreesGame;
'use client';

import React, { useState, useEffect } from 'react';

const SixDegreesGame = () => {
  const [gameData, setGameData] = useState<any>(null);
  const [currentOrder, setCurrentOrder] = useState<string[]>([]);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [gameState, setGameState] = useState<'playing' | 'won' | 'lost'>('playing');
  const [showAnswer, setShowAnswer] = useState(false);
  const [expandedConnections, setExpandedConnections] = useState<{[key: number]: boolean}>({});
  const [draggedItem, setDraggedItem] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

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
    
    const isCorrect = JSON.stringify(currentOrder) === JSON.stringify(gameData.original_path);
    
    if (isCorrect) {
      setGameState('won');
      setShowAnswer(true);
    } else {
      setAttemptsLeft(attemptsLeft - 1);
      if (attemptsLeft <= 1) {
        setGameState('lost');
        setShowAnswer(true);
      }
    }
  };

  const resetGame = async () => {
    setLoading(true);
    setAttemptsLeft(3);
    setGameState('playing');
    setShowAnswer(false);
    setExpandedConnections({});
    
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
      setLoading(false);
    } catch (error) {
      console.error('Error loading game data:', error);
      setLoading(false);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    if (index === 0) return; // Can't drag the first item
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, dropIndex: number) => {
    e.preventDefault();
    if (draggedItem === null || draggedItem === 0 || dropIndex === 0) return;

    const newOrder = [...currentOrder];
    const draggedContent = newOrder[draggedItem];
    
    // Remove dragged item
    newOrder.splice(draggedItem, 1);
    
    // Insert at new position (adjust index if necessary)
    const insertIndex = draggedItem < dropIndex ? dropIndex - 1 : dropIndex;
    newOrder.splice(insertIndex, 0, draggedContent);
    
    setCurrentOrder(newOrder);
    setDraggedItem(null);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load game data</p>
          <button
            onClick={resetGame}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Six Degrees</h1>
          <p className="text-gray-600 mb-4">
            Arrange the items in the correct order to trace the path from start to finish
          </p>
          
          {/* Game Status */}
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Attempts left:</span>
              <span className={`text-lg font-bold ${attemptsLeft <= 1 ? 'text-red-500' : 'text-blue-500'}`}>
                {attemptsLeft}
              </span>
            </div>
            
            {gameState === 'won' && (
              <div className="flex items-center gap-1 text-green-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Solved!</span>
              </div>
            )}
            
            {gameState === 'lost' && (
              <div className="flex items-center gap-1 text-red-600">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Game Over</span>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          {!showAnswer ? (
            /* Playing State */
            <div className="space-y-3">
              {currentOrder.map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className={`p-4 rounded-lg border-2 transition-all duration-200 ${
                    index === 0 
                      ? 'bg-blue-50 border-blue-200 cursor-default' 
                      : gameState === 'playing'
                        ? 'bg-gray-50 border-gray-200 cursor-move hover:border-blue-300 hover:shadow-md'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                  draggable={index !== 0 && gameState === 'playing'}
                  onDragStart={(e) => handleDragStart(e, index)}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-blue-500 text-white' : 'bg-gray-300 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                      <span className="font-medium text-gray-900">{item}</span>
                    </div>
                    
                    {index === 0 && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        Start
                      </span>
                    )}
                    
                    {index === currentOrder.length - 1 && index !== 0 && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                        End
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* Answer Reveal State */
            <div className="space-y-8">
              {gameData.original_path.map((item: string, index: number) => (
                <div key={item}>
                  {/* Item */}
                  <div className="flex items-center justify-center">
                    <div className="bg-green-50 border-2 border-green-200 rounded-lg p-4 w-full max-w-md">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold">
                          {index + 1}
                        </div>
                        <span className="font-medium text-gray-900">{item}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Connection */}
                  {index < gameData.original_path.length - 1 && (
                    <div className="flex flex-col items-center mt-4">
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 max-w-lg mx-4">
                        <div className="text-sm text-gray-700">
                          {expandedConnections[index] ? (
                            <div>
                              <p>{getConnectionText(item, gameData.original_path[index + 1])}</p>
                              <button
                                onClick={() => toggleConnection(index)}
                                className="text-blue-500 hover:text-blue-700 text-xs mt-2 flex items-center gap-1"
                              >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                Show less
                              </button>
                            </div>
                          ) : (
                            <div>
                              <p>{truncateText(getConnectionText(item, gameData.original_path[index + 1]))}</p>
                              {getConnectionText(item, gameData.original_path[index + 1]).length > 80 && (
                                <button
                                  onClick={() => toggleConnection(index)}
                                  className="text-blue-500 hover:text-blue-700 text-xs mt-2 flex items-center gap-1"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  Read more
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="w-0.5 h-6 bg-gray-300"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex gap-3 justify-center">
          {!showAnswer && gameState === 'playing' && (
            <button
              onClick={checkAnswer}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
            >
              Check Answer
            </button>
          )}
          
          <button
            onClick={resetGame}
            className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            New Game
          </button>
        </div>

        {/* Instructions */}
        {!showAnswer && (
          <div className="mt-8 text-center text-sm text-gray-600">
            <p>The first item is fixed. Drag and drop the other items to arrange them in the correct order.</p>
            <p className="mt-1">You have 3 attempts to find the correct path!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SixDegreesGame;
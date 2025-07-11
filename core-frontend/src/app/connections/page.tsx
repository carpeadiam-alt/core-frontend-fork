'use client';

import React, { useState, useEffect } from 'react';

interface GameData {
  all_words: string[];
  categories: {
    [difficulty: string]: {
      [categoryName: string]: string[];
    };
  };
}

interface FoundCategory {
  name: string;
  words: string[];
  difficulty: string;
}

const DIFFICULTY_COLORS = {
  'Easiest': 'bg-yellow-300',
  'Easy': 'bg-green-300', 
  'Medium': 'bg-blue-300',
  'Hard': 'bg-purple-300'
};

const DIFFICULTY_ORDER = ['Easiest', 'Easy', 'Medium', 'Hard'];

export default function ConnectionsGame() {
  const [gameData, setGameData] = useState<GameData | null>(null);
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [foundCategories, setFoundCategories] = useState<FoundCategory[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showOneAway, setShowOneAway] = useState(false);

  const MAX_MISTAKES = 4;

  useEffect(() => {
    fetchGameData();
  }, []);

  const fetchGameData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('https://thecodeworks.in/core/connections');
      const data: GameData = await response.json();
      setGameData(data);
      setRemainingWords([...data.all_words].sort(() => Math.random() - 0.5));
    } catch (error) {
      console.error('Failed to fetch game data:', error);
      setMessage('Failed to load game data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleWordClick = (word: string) => {
    if (gameStatus !== 'playing') return;

    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 4) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const clearSelection = () => {
    setSelectedWords([]);
  };

  const deselectOne = () => {
    if (selectedWords.length > 0) {
      setSelectedWords(selectedWords.slice(0, -1));
    }
  };

  const shuffleWords = () => {
    setRemainingWords([...remainingWords].sort(() => Math.random() - 0.5));
  };

  const checkGuess = () => {
    if (selectedWords.length !== 4 || !gameData) return;

    // Find the correct category for these words
    let correctCategory: { name: string; difficulty: string } | null = null;
    
    for (const difficulty of Object.keys(gameData.categories)) {
      for (const [categoryName, words] of Object.entries(gameData.categories[difficulty])) {
        const sortedCategoryWords = [...words].sort();
        const sortedSelectedWords = [...selectedWords].sort();
        
        if (JSON.stringify(sortedCategoryWords) === JSON.stringify(sortedSelectedWords)) {
          correctCategory = { name: categoryName, difficulty };
          break;
        }
      }
      if (correctCategory) break;
    }

    if (correctCategory) {
      // Correct guess
      const newFoundCategory: FoundCategory = {
        name: correctCategory.name,
        words: selectedWords,
        difficulty: correctCategory.difficulty
      };
      
      const newFoundCategories = [...foundCategories, newFoundCategory];
      setFoundCategories(newFoundCategories);
      
      const newRemainingWords = remainingWords.filter(word => !selectedWords.includes(word));
      setRemainingWords(newRemainingWords);
      setSelectedWords([]);
      setMessage('Correct!');
      setShowOneAway(false);

      // Check if game is won
      if (newFoundCategories.length === 4) {
        setGameStatus('won');
        setMessage('Congratulations! You solved all categories!');
      }
    } else {
      // Wrong guess - check if one away
      let isOneAway = false;
      
      for (const difficulty of Object.keys(gameData.categories)) {
        for (const [categoryName, words] of Object.entries(gameData.categories[difficulty])) {
          const matchCount = selectedWords.filter(word => words.includes(word)).length;
          if (matchCount === 3) {
            isOneAway = true;
            break;
          }
        }
        if (isOneAway) break;
      }

      const newMistakes = mistakes + 1;
      setMistakes(newMistakes);
      
      if (isOneAway) {
        setMessage('One away...');
        setShowOneAway(true);
      } else {
        setMessage('Not quite right. Try again!');
        setShowOneAway(false);
      }

      // Check if game is lost
      if (newMistakes >= MAX_MISTAKES) {
        setGameStatus('lost');
        setMessage('Game over! Better luck next time.');
        // Reveal remaining categories
        revealRemainingCategories();
      }
    }

    // Clear message after delay
    setTimeout(() => {
      if (gameStatus === 'playing') {
        setMessage('');
        setShowOneAway(false);
      }
    }, 2000);
  };

  const revealRemainingCategories = () => {
    if (!gameData) return;

    const remainingCategories: FoundCategory[] = [];
    
    for (const difficulty of Object.keys(gameData.categories)) {
      for (const [categoryName, words] of Object.entries(gameData.categories[difficulty])) {
        const alreadyFound = foundCategories.some(cat => cat.name === categoryName);
        if (!alreadyFound) {
          remainingCategories.push({
            name: categoryName,
            words,
            difficulty
          });
        }
      }
    }

    setFoundCategories([...foundCategories, ...remainingCategories]);
    setRemainingWords([]);
  };

  const resetGame = () => {
    if (gameData) {
      setFoundCategories([]);  
      setRemainingWords([...gameData.all_words].sort(() => Math.random() - 0.5));
      setSelectedWords([]);
      setMistakes(0);
      setGameStatus('playing');
      setMessage('');
      setShowOneAway(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-red-600">Failed to load game data</div>
      </div>
    );
  }

  // Sort found categories by difficulty
  const sortedFoundCategories = [...foundCategories].sort((a, b) => {
    return DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
  });

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Connections</h1>
          <p className="text-gray-600">Create four groups of four!</p>
        </div>

        {/* Found Categories */}
        <div className="space-y-2 mb-6">
          {sortedFoundCategories.map((category, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg ${DIFFICULTY_COLORS[category.difficulty as keyof typeof DIFFICULTY_COLORS]} text-center`}
            >
              <div className="font-bold text-gray-800 text-lg mb-2">
                {category.name.toUpperCase()}
              </div>
              <div className="text-gray-700">
                {category.words.join(', ')}
              </div>
            </div>
          ))}
        </div>

        {/* Game Board */}
        {remainingWords.length > 0 && (
          <div className="grid grid-cols-4 gap-2 mb-6">
            {remainingWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`
                  p-4 rounded-lg font-semibold text-sm uppercase transition-all duration-200
                  ${selectedWords.includes(word)
                    ? 'bg-gray-800 text-white transform scale-95'
                    : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                  }
                  ${gameStatus !== 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                `}
                disabled={gameStatus !== 'playing'}
              >
                {word}
              </button>
            ))}
          </div>
        )}

        {/* Game Controls */}
        {gameStatus === 'playing' && remainingWords.length > 0 && (
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="flex space-x-4">
              <button
                onClick={shuffleWords}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                Shuffle
              </button>
              <button
                onClick={deselectOne}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={selectedWords.length === 0}
              >
                Deselect One
              </button>
              <button
                onClick={clearSelection}
                className="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                disabled={selectedWords.length === 0}
              >
                Clear All
              </button>
            </div>
            
            <button
              onClick={checkGuess}
              className={`px-8 py-3 rounded-lg font-semibold transition-colors ${
                selectedWords.length === 4
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              disabled={selectedWords.length !== 4}
            >
              Submit
            </button>
          </div>
        )}

        {/* Mistakes Counter */}
        <div className="text-center mb-6">
          <div className="text-gray-600 mb-2">Mistakes remaining</div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: MAX_MISTAKES }, (_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  i < mistakes ? 'bg-red-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`text-center py-3 rounded-lg mb-6 ${
            message.includes('Correct') || message.includes('Congratulations')
              ? 'bg-green-100 text-green-800'
              : showOneAway
              ? 'bg-yellow-100 text-yellow-800'
              : message.includes('Game over')
              ? 'bg-red-100 text-red-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {message}
          </div>
        )}

        {/* Reset Button */}
        {(gameStatus === 'won' || gameStatus === 'lost') && (
          <div className="text-center">
            <button
              onClick={resetGame}
              className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-semibold"
            >
              Play Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
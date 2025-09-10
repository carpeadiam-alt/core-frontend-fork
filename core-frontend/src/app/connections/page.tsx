'use client';
import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

import React, { useState, useEffect } from 'react';

type DifficultyLevel = 'Easiest' | 'Easy' | 'Medium' | 'Hard';

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
  difficulty: DifficultyLevel;
}

const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  'Easiest': 'bg-yellow-300',
  'Easy': 'bg-green-300', 
  'Medium': 'bg-blue-300',
  'Hard': 'bg-purple-300'
};

const DIFFICULTY_ORDER: DifficultyLevel[] = ['Easiest', 'Easy', 'Medium', 'Hard'];

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
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);

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

  const getFontSize = (word: string) => {
    const length = word.length;
    if (length <= 4) return 'text-lg';
    if (length <= 6) return 'text-base';
    if (length <= 8) return 'text-sm';
    return 'text-xs';
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
    let correctCategory: { name: string; difficulty: DifficultyLevel } | null = null;
    
    for (const difficulty of Object.keys(gameData.categories)) {
      for (const [categoryName, words] of Object.entries(gameData.categories[difficulty])) {
        const sortedCategoryWords = [...words].sort();
        const sortedSelectedWords = [...selectedWords].sort();
        
        if (JSON.stringify(sortedCategoryWords) === JSON.stringify(sortedSelectedWords)) {
          correctCategory = { name: categoryName, difficulty: difficulty as DifficultyLevel };
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
        setShowGameComplete(true);
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
        setShowGameComplete(true);
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
            difficulty: difficulty as DifficultyLevel
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
      setShowGameComplete(false);
    }
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${rubik.variable} font-sans`}>
        <div className="text-xl">Loading game...</div>
      </div>
    );
  }

  if (!gameData) {
    return (
      <div className={`min-h-screen bg-white flex items-center justify-center ${rubik.variable} font-sans`}>
        <div className="text-xl text-red-600">Failed to load game data</div>
      </div>
    );
  }

  // Sort found categories by difficulty
  const sortedFoundCategories = [...foundCategories].sort((a, b) => {
    return DIFFICULTY_ORDER.indexOf(a.difficulty) - DIFFICULTY_ORDER.indexOf(b.difficulty);
  });

  return (
    <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
      <div className="w-full bg-white py-4 px-6">
        <div className="max-w-2xl mx-auto flex justify-end items-center">
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
          <div className="bg-white border-1 border-black p-6 rounded-lg max-w-sm mx-4 relative">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white  rounded-full flex items-center justify-center text-m font-bold hover:bg-gray-50"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="space-y-3 text-sm">
              <p>Find groups of four items that share something in common.</p>
              <p>Select four words and tap Submit to check if your guess is correct.</p>
              <p>Categories are grouped by difficulty:</p>
              <ul className="ml-4 space-y-1">
                <li><span className="inline-block w-4 h-4 bg-yellow-300 mr-2"></span>Easiest</li>
                <li><span className="inline-block w-4 h-4 bg-green-300 mr-2"></span>Easy</li>
                <li><span className="inline-block w-4 h-4 bg-blue-300 mr-2"></span>Medium</li>
                <li><span className="inline-block w-4 h-4 bg-purple-300 mr-2"></span>Hard</li>
              </ul>
              <p>You have 4 mistakes before the game ends.</p>
            </div>
          </div>
        </div>
      )}

      {/* Game Complete Popup */}
      {showGameComplete && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white border-2 border-black p-8 rounded-lg max-w-md mx-4 shadow-xl text-center relative">
            <button
              onClick={() => setShowGameComplete(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white border border-black rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-50"
            >
              ×
            </button>
            <h2 className="text-2xl font-bold mb-4">
              {gameStatus === 'won' ? 'Congratulations!' : 'Game Over'}
            </h2>
            <p className="mb-6">
              {gameStatus === 'won' 
                ? 'You successfully solved all categories!' 
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

      {/* Game Content */}
      <main className="max-w-2xl mx-auto px-6 py-8">
        {/* Found Categories */}
        {sortedFoundCategories.length > 0 && (
          <div className="space-y-3 mb-8">
            {sortedFoundCategories.map((category, index) => (
              <div
                key={index}
                className={`p-5 rounded-lg ${DIFFICULTY_COLORS[category.difficulty]} border-2 border-transparent`}
              >
                <div className="text-center">
                  <div className="font-bold text-black text-xl mb-2 tracking-wide">
                    {category.name.toUpperCase()}
                  </div>
                  <div className="text-black text-lg font-medium">
                    {category.words.join(', ')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Game Board */}
        {remainingWords.length > 0 && (
          <div className="grid grid-cols-4 gap-3 mb-8">
            {remainingWords.map((word, index) => (
              <button
                key={index}
                onClick={() => handleWordClick(word)}
                className={`
                  h-20 flex items-center justify-center rounded-lg font-bold uppercase transition-all duration-150 border
                  ${selectedWords.includes(word)
                    ? 'bg-pink-300 text-black border-gray-800 transform scale-95'
                    : 'bg-white text-black border-black hover:bg-gray-50'
                  }
                  ${gameStatus !== 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}
                  ${getFontSize(word)}
                `}
                disabled={gameStatus !== 'playing'}
              >
                <span className="text-center leading-tight px-2">{word}</span>
              </button>
            ))}
          </div>
        )}

        {/* Mistakes Counter */}
        <div className="text-center mb-8">
          <div className="text-gray-600 mb-3 text-lg font-medium">Mistakes remaining</div>
          <div className="flex justify-center space-x-2">
            {Array.from({ length: MAX_MISTAKES }, (_, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-full border-2 ${
                  i < mistakes 
                    ? 'bg-gray-800 border-gray-800' 
                    : 'bg-white border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`text-center py-4 rounded-lg mb-8 border-2 font-semibold text-lg ${
            message.includes('Correct') || message.includes('Congratulations')
              ? 'bg-green-50 text-green-800 border-green-200'
              : showOneAway
              ? 'bg-yellow-50 text-yellow-800 border-yellow-200'
              : message.includes('Game over')
              ? 'bg-red-50 text-red-800 border-red-200'
              : 'bg-blue-50 text-blue-800 border-blue-200'
          }`}>
            {message}
          </div>
        )}

        {/* Game Controls */}
        {gameStatus === 'playing' && remainingWords.length > 0 && (
          <div className="flex flex-col items-center space-y-6">
            <div className="flex flex-wrap justify-center gap-3">
              <button
                onClick={shuffleWords}
                className="px-5 py-2 bg-white text-black rounded-full border border-black hover:bg-gray-50 transition-all font-semibold text-base"
              >
                Shuffle
              </button>
              <button
                onClick={deselectOne}
                className="px-5 py-2 bg-white text-black rounded-full border border-black hover:bg-gray-50 transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedWords.length === 0}
              >
                Deselect one
              </button>
              <button
                onClick={clearSelection}
                className="px-5 py-2 bg-white text-black rounded-full border border-black hover:bg-gray-50 transition-all font-semibold text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedWords.length === 0}
              >
                Clear all
              </button>
            </div>
            
            <button
              onClick={checkGuess}
              className={`px-10 py-3 rounded-full font-bold text-lg transition-all border ${
                selectedWords.length === 4
                  ? 'bg-black text-white border-black hover:bg-gray-800 transform hover:scale-105'
                  : 'bg-gray-200 text-gray-500 border-gray-200 cursor-not-allowed'
              }`}
              disabled={selectedWords.length !== 4}
            >
              Submit
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
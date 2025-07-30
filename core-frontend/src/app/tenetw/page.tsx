'use client'

import { useState, useEffect } from 'react'
import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const wordList = [
  "cigar", "rebut", "sissy", "humph", "awake", "blush", "focal", "evade", "naval", "serve",
  "heath", "dwarf", "model", "karma", "stink", "grade", "quiet", "bench", "abate", "feign",
  "major", "death", "fresh", "crust", "stool", "colon", "abase", "marry", "react", "batty",
  "pride", "floss", "helix", "croak", "staff", "paper", "unfed", "whelp", "trawl", "outdo",
  "adobe", "crazy", "sower", "repay", "digit", "crate", "cluck", "spike", "mimic", "pound",
  "maxim", "linen", "unmet", "flesh", "booby", "forth", "first", "stand", "belly", "ivory",
  "seedy", "print", "yearn", "drain", "bribe", "stout", "panel", "crass", "flume", "offal",
  "agree", "error", "swirl", "argue", "bleed", "delta", "flick", "totem", "wooer", "front",
  "shrub", "parry", "biome", "lapel", "start", "greet", "goner", "golem", "lusty", "loopy",
  "round", "audit", "lying", "gamma", "labor", "islet", "civic", "forge", "corny", "moult",
  "basic", "salad", "agate", "spicy", "spray", "essay", "fjord", "spend", "kebab", "guild",
  "aback", "motor", "alone", "hatch", "hyper", "thumb", "dowry", "ought", "belch", "dutch",
  "pilot", "tweed", "comet", "jaunt", "enema", "steed", "abyss", "growl", "fling", "dozen",
  "boozy", "erode", "world", "gouge", "click", "briar", "great", "altar", "pulpy", "blurt",
  "coast", "duchy", "groin", "fixer", "group", "rogue", "badly", "smart", "pithy", "gaudy",
  "chill", "heron", "vodka", "finer", "surer", "radio", "rouge", "perch", "retch", "wrote",
  "clock", "tilde", "store", "prove", "bring", "solve", "cheat", "grime", "exult", "usher",
  "epoch", "triad", "break", "rhino", "viral", "conic", "masse", "sonic", "vital", "trace",
  "using", "peach", "champ", "baton", "brake", "pluck", "craze", "gripe", "weary", "picky",
  "acute", "ferry", "aside", "tapir", "troll", "unify", "rebus", "boost", "truss", "siege",
  "tiger", "banal", "slump", "crank", "gorge", "query", "drink", "favor", "abbey", "tangy",
  "panic", "solar", "shire", "proxy", "point", "robot", "prick", "wince", "crimp", "knoll",
  "sugar", "whack", "mount", "perky", "could", "wrung", "light", "those", "moist", "shard",
  "pleat", "aloft", "skill", "elder", "frame", "humor", "pause", "ulcer", "ultra", "robin",
  "cynic", "aroma", "caulk", "shake", "dodge", "swill", "tacit", "other", "thorn", "trove",
  "bloke", "vivid", "spill", "chant", "choke", "rupee", "nasty", "mourn", "ahead", "brine"
];


const fixedPositions = new Set(['0,0', '0,4', '4,0', '4,4', '2,2']);

export default function TenetGame() {
  const [originalWords, setOriginalWords] = useState<string[]>([]);
  const [currentBoard, setCurrentBoard] = useState<string[][]>([]);
  const [moves, setMoves] = useState(0);
  const [solvedWords, setSolvedWords] = useState(new Set<string>());
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<'row' | 'col'>('row');
  const [gameStatus, setGameStatus] = useState<'playing' | 'perfect' | 'all_words'>('playing');
  const [showCelebration, setShowCelebration] = useState(false);

  // Initialize game
  useEffect(() => {
    initializeGame();
  }, []);

  // Check solution after every board change
  useEffect(() => {
    if (currentBoard.length > 0) {
      checkSolution();
    }
  }, [currentBoard, originalWords]);

  const initializeGame = () => {
    // Select 5 random words
    const shuffled = [...wordList].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, 5).map(w => w.toUpperCase());
    setOriginalWords(selected);
    
    // Create initial board
    let board = selected.map(word => word.split(''));
    
    // Apply 4-5 random reverses
    const numReverses = 4 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numReverses; i++) {
      if (Math.random() < 0.5) {
        const row = Math.floor(Math.random() * 5);
        board = reverseRowOnBoard(board, row);
      } else {
        const col = Math.floor(Math.random() * 5);
        board = reverseColOnBoard(board, col);
      }
    }
    
    setCurrentBoard(board);
    setMoves(0);
    setSolvedWords(new Set<string>());
    setSelectedCell(null);
    setGameStatus('playing');
    setShowCelebration(false);
  };

  const reverseRowOnBoard = (board: string[][], row: number): string[][] => {
    const newBoard = board.map(r => [...r]);
    const original = [...newBoard[row]];
    const reversed = [...original].reverse();
    
    // Apply fixed position rules - keep fixed positions unchanged
    for (let col = 0; col < 5; col++) {
      if (fixedPositions.has(`${row},${col}`)) {
        reversed[col] = original[col]; // Keep the current letter in fixed position
      }
    }
    
    newBoard[row] = reversed;
    return newBoard;
  };

  const reverseColOnBoard = (board: string[][], col: number): string[][] => {
    const newBoard = board.map(r => [...r]);
    const original: string[] = [];
    for (let row = 0; row < 5; row++) {
      original.push(newBoard[row][col]);
    }
    const reversed = [...original].reverse();
    
    // Apply fixed position rules - keep fixed positions unchanged
    for (let row = 0; row < 5; row++) {
      if (fixedPositions.has(`${row},${col}`)) {
        reversed[row] = original[row]; // Keep the current letter in fixed position
      }
    }
    
    for (let row = 0; row < 5; row++) {
      newBoard[row][col] = reversed[row];
    }
    
    return newBoard;
  };

  const checkSolution = () => {
    if (originalWords.length === 0 || currentBoard.length === 0) return;

    // Check perfect solution
    let isPerfect = true;
    for (let i = 0; i < 5; i++) {
      if (currentBoard[i].join('') !== originalWords[i]) {
        isPerfect = false;
        break;
      }
    }

    // Check for found words - preserve previously found words
    const currentWords = new Set(currentBoard.map(row => row.join('')));
    const newSolved = new Set(solvedWords); // Keep existing solved words
    originalWords.forEach(word => {
      if (currentWords.has(word)) {
        newSolved.add(word);
      }
    });
    setSolvedWords(newSolved);

    if (isPerfect) {
      setGameStatus('perfect');
      setShowCelebration(true);
    } else if (newSolved.size === 5) {
      setGameStatus('all_words');
      setShowCelebration(true);
    }
  };

  const handleCellClick = (row: number, col: number) => {
    const cellKey = `${row},${col}`;
    
    if (selectedCell === cellKey) {
      // Toggle between row and column selection
      setSelectionMode(selectionMode === 'row' ? 'col' : 'row');
    } else {
      // Select new cell, default to row mode
      setSelectedCell(cellKey);
      setSelectionMode('row');
    }
  };

  const handleFlip = () => {
    if (!selectedCell || gameStatus !== 'playing') return;
    
    const [row, col] = selectedCell.split(',').map(Number);
    
    if (selectionMode === 'row') {
      setCurrentBoard(reverseRowOnBoard(currentBoard, row));
    } else {
      setCurrentBoard(reverseColOnBoard(currentBoard, col));
    }
    
    setMoves(moves + 1);
    setSelectedCell(null);
  };

  const getHighlightedCells = (): Set<string> => {
    if (!selectedCell) return new Set();
    
    const [row, col] = selectedCell.split(',').map(Number);
    const highlighted = new Set<string>();
    
    if (selectionMode === 'row') {
      for (let c = 0; c < 5; c++) {
        highlighted.add(`${row},${c}`);
      }
    } else {
      for (let r = 0; r < 5; r++) {
        highlighted.add(`${r},${col}`);
      }
    }
    
    return highlighted;
  };

  const highlightedCells = getHighlightedCells();

  return (
    <div className={`${rubik.variable} font-sans min-h-screen bg-white p-4`}>
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">TENET</h1>
          <p className="text-gray-600 text-sm">
            Flip rows and columns to restore the original words
          </p>
        </div>

        {/* Game Stats */}
        <div className="flex justify-between items-center mb-6 bg-gray-50 rounded-lg p-3">
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{moves}</div>
            <div className="text-xs text-gray-500">MOVES</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-gray-900">{solvedWords.size}/5</div>
            <div className="text-xs text-gray-500">WORDS FOUND</div>
          </div>
          <button
            onClick={initializeGame}
            className="px-3 py-1 bg-gray-900 text-white rounded text-sm hover:bg-gray-700 transition-colors"
          >
            NEW GAME
          </button>
        </div>

        {/* Game Board */}
        <div className="relative mb-6">
          {/* Column flip buttons (top) */}
          {selectedCell && selectionMode === 'col' && (
            <div className="flex justify-center mb-2">
              <button
                onClick={handleFlip}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ↕ FLIP COLUMN
              </button>
            </div>
          )}

          <div className="grid gap-1 bg-gray-200 p-2 rounded-lg">
            {currentBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 relative">
                {/* Row flip button (left) */}
                {selectedCell && selectionMode === 'row' && selectedCell.startsWith(`${rowIndex},`) && (
                  <button
                    onClick={handleFlip}
                    className="absolute -left-20 top-1/2 transform -translate-y-1/2 px-3 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium text-sm"
                  >
                    ↔ FLIP
                  </button>
                )}

                {row.map((letter, colIndex) => {
                  const cellKey = `${rowIndex},${colIndex}`;
                  const isFixed = fixedPositions.has(cellKey);
                  const isHighlighted = highlightedCells.has(cellKey);
                  const isSelected = selectedCell === cellKey;

                  return (
                    <button
                      key={colIndex}
                      onClick={() => handleCellClick(rowIndex, colIndex)}
                      disabled={gameStatus !== 'playing'}
                      className={`
                        w-12 h-12 flex items-center justify-center text-lg font-bold rounded
                        transition-all duration-200 transform hover:scale-105
                        ${isFixed 
                          ? 'bg-amber-100 border-2 border-amber-400 text-amber-800' 
                          : isHighlighted
                            ? selectionMode === 'row'
                              ? 'bg-blue-100 border-2 border-blue-400 text-blue-800'
                              : 'bg-green-100 border-2 border-green-400 text-green-800'
                            : 'bg-white border-2 border-gray-300 text-gray-900'
                        }
                        ${isSelected ? 'ring-2 ring-offset-1 ring-purple-400' : ''}
                        ${gameStatus !== 'playing' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:shadow-md'}
                      `}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Column flip buttons (bottom) */}
          {selectedCell && selectionMode === 'col' && (
            <div className="flex justify-center mt-2">
              <button
                onClick={handleFlip}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg shadow-lg hover:bg-blue-600 transition-colors font-medium"
              >
                ↕ FLIP COLUMN
              </button>
            </div>
          )}
        </div>

        {/* Instructions */}
        {gameStatus === 'playing' && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-blue-900 mb-2">How to play:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Click a cell to select its row (blue highlight)</li>
              <li>• Click again to select its column (green highlight)</li>
              <li>• Use flip buttons to reverse rows or columns</li>
              <li>• 🟡 Fixed positions stay in place when flipping</li>
              <li>• Goal: Restore original words or find all 5 words</li>
            </ul>
          </div>
        )}

        {/* Found Words */}
        {solvedWords.size > 0 && (
          <div className="bg-green-50 rounded-lg p-4 mb-4">
            <h3 className="font-semibold text-green-900 mb-2">Words Found ({solvedWords.size}/5):</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(solvedWords).sort().map(word => (
                <span key={word} className="px-2 py-1 bg-green-200 text-green-800 rounded text-sm font-medium">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Win Messages */}
        {gameStatus === 'perfect' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
            <h2 className="text-xl font-bold text-yellow-800 mb-2">🎉 Perfect Solution!</h2>
            <p className="text-yellow-700">You restored the board to its original state!</p>
          </div>
        )}

        {gameStatus === 'all_words' && gameStatus !== 'perfect' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
            <h2 className="text-xl font-bold text-green-800 mb-2">🎉 Well Done!</h2>
            <p className="text-green-700">You found all the original words!</p>
          </div>
        )}
      </div>
    </div>
  );
}
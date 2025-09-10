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
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [showGameComplete, setShowGameComplete] = useState(false);

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
    setShowGameComplete(false);
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
      setShowGameComplete(true);
    } else if (newSolved.size === 5) {
      setGameStatus('all_words');
      setShowCelebration(true);
      setShowGameComplete(true);
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
    <div className={`${rubik.variable} font-sans min-h-screen bg-white`}>
      {/* Header with Info Button - moved to right side */}
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
          <div className="bg-white border-2 border-black p-6 rounded-lg max-w-sm mx-4 relative">
            <button
              onClick={() => setShowHowToPlay(false)}
              className="absolute top-2 right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center text-sm font-bold hover:bg-gray-50"
            >
              ×
            </button>
            <h2 className="text-xl font-bold mb-4">How to Play</h2>
            <div className="space-y-3 text-sm">
              <p>Flip rows and columns to restore the original words.</p>
              <p>Click a cell to select its row, click again to select its column.</p>
              <p>Click the circular flip button to reverse the selected row or column.</p>
              <p>🟡 Yellow cells are fixed positions that won't change when flipping.</p>
              <p>Goal: Restore the original words or find all 5 words.</p>
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
              {gameStatus === 'perfect' ? 'Perfect Solution!' : 'Well Done!'}
            </h2>
            <p className="mb-6">
              {gameStatus === 'perfect' 
                ? 'You restored the board to its original state!' 
                : 'You found all the original words!'}
            </p>
            <button
              onClick={initializeGame}
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
            <div className="text-lg font-bold text-black">{moves}</div>
            <div className="text-xs text-gray-600">MOVES</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-black">{solvedWords.size}/5</div>
            <div className="text-xs text-gray-600">WORDS FOUND</div>
          </div>
          <button
            onClick={initializeGame}
            className="px-4 py-2 bg-white text-black rounded-full border border-black hover:bg-gray-50 transition-all font-semibold text-sm"
          >
            New Game
          </button>
        </div>

        {/* Game Board */}
        <div className="relative mb-8">
          {/* Column flip buttons (top) */}
          {selectedCell && selectionMode === 'col' && (
            <div className="flex justify-center mb-3">
              <button
                onClick={handleFlip}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all"
                aria-label="Flip column"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 7l7-7 7 7M5 17l7 7 7-7" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid gap-2">
            {currentBoard.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-2 relative justify-center">
                {/* Row flip button (left) - positioned extremely close to prevent going out of view */}
                {selectedCell && selectionMode === 'row' && selectedCell.startsWith(`${rowIndex},`) && (
                  <button
                    onClick={handleFlip}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all -ml-1"
                    aria-label="Flip row"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12h18M7 5l-4 7 4 7M17 19l4-7-4-7" />
                    </svg>
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
                        w-14 h-14 flex items-center justify-center text-xl font-bold rounded-lg border
                        transition-all duration-200 transform hover:scale-105
                        ${isFixed 
                          ? 'bg-red-400 border-black text-black' 
                          : isHighlighted
                            ? selectionMode === 'row'
                              ? 'bg-blue-300 border-blue-400 text-black'
                              : 'bg-blue-300 border-blue-400 text-black'
                            : 'bg-white border-black text-black'
                        }
                        ${isSelected ? 'ring-2 ring-offset-2 ring-purple-400' : ''}
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
            <div className="flex justify-center mt-3">
              <button
                onClick={handleFlip}
                className="w-10 h-10 bg-black text-white rounded-full flex items-center justify-center hover:bg-gray-800 transition-all"
                aria-label="Flip column"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 3v18M5 7l7-7 7 7M5 17l7 7 7-7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Words Found Section - underneath game grid, no background box */}
        {solvedWords.size > 0 && (
          <div className="mb-8 text-center">
            <h3 className="font-bold text-black mb-3">Words Found ({solvedWords.size}/5):</h3>
            <div className="flex flex-wrap justify-center gap-2">
              {Array.from(solvedWords).sort().map(word => (
                <span key={word} className="px-3 py-1 bg-gray-100 border border-gray-300 text-black rounded text-sm font-medium">
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
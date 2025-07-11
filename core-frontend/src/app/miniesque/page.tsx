'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface CrosswordData {
  width: number;
  height: number;
  solution: string;
  grid: string;
  clues: {
    across: { [key: number]: string };
    down: { [key: number]: string };
  };
  gridnums: number[];
  title: string;
  author: string;
  copyright: string;
}

interface Cell {
  letter: string;
  number?: number;
  isBlack: boolean;
  userLetter: string;
  isCorrect?: boolean;
}

interface SelectedCell {
  row: number;
  col: number;
}

interface ClueInfo {
  number: number;
  clue: string;
  direction: 'across' | 'down';
  startRow: number;
  startCol: number;
  length: number;
  cells: { row: number; col: number }[];
}

export default function MobileCrosswordPlayer() {
  const [crosswordData, setCrosswordData] = useState<CrosswordData | null>(null);
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<SelectedCell | null>(null);
  const [currentDirection, setCurrentDirection] = useState<'across' | 'down'>('across');
  const [selectedClue, setSelectedClue] = useState<ClueInfo | null>(null);
  const [clueMap, setClueMap] = useState<Map<string, ClueInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);
  const [showKeyboard, setShowKeyboard] = useState(true);
  const [autoCheck, setAutoCheck] = useState(true);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [showClues, setShowClues] = useState(false);
  const gridRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout>();

  // Timer functionality
  useEffect(() => {
    if (isTimerRunning) {
      timerRef.current = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
    
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isTimerRunning]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

const parsePuzFile = (buffer: ArrayBuffer): CrosswordData => {
    const data = new Uint8Array(buffer);
    let offset = 0;

    // Skip header (52 bytes)
    offset = 52;

    const width = data[44];
    const height = data[45];
    const numClues = (data[46] | (data[47] << 8));

    // Read solution and grid state
    const solution = Array.from(data.slice(offset, offset + width * height))
        .map(byte => String.fromCharCode(byte))
        .join('');
    offset += width * height;

    const gridState = Array.from(data.slice(offset, offset + width * height))
        .map(byte => String.fromCharCode(byte))
        .join('');
    offset += width * height;

    // Read strings (title, author, copyright)
    const strings: string[] = [];
    for (let i = 0; i < 3; i++) {
        let str = '';
        while (offset < data.length && data[offset] !== 0) {
            str += String.fromCharCode(data[offset]);
            offset++;
        }
        strings.push(str);
        offset++; // Skip null terminator
    }

    // Read ALL clues first
    const allClues: string[] = [];
    while (offset < data.length) {
        let clue = '';
        while (offset < data.length && data[offset] !== 0) {
            clue += String.fromCharCode(data[offset]);
            offset++;
        }
        if (clue) {
            allClues.push(clue);
        }
        offset++; // Skip null terminator
    }

    // Generate grid numbers and track clue positions
    const gridnums: number[] = new Array(width * height).fill(0);
    const cluePositions: {number: number, isAcross: boolean, isDown: boolean}[] = [];
    let clueNumber = 1;
    
    // First pass: Assign numbers and track word starts
    for (let row = 0; row < height; row++) {
        for (let col = 0; col < width; col++) {
            const index = row * width + col;
            if (solution[index] === '.') continue;

            const isAcrossStart = (col === 0 || solution[index - 1] === '.') && 
                                (col < width - 1 && solution[index + 1] !== '.');
            const isDownStart = (row === 0 || solution[index - width] === '.') && 
                               (row < height - 1 && solution[index + width] !== '.');

            if (isAcrossStart || isDownStart) {
                gridnums[index] = clueNumber;
                cluePositions.push({
                    number: clueNumber,
                    isAcross: isAcrossStart,
                    isDown: isDownStart
                });
                clueNumber++;
            }
        }
    }

    // Second pass: Assign clues in correct order with swapping
    const acrossClues: { [key: number]: string } = {};
    const downClues: { [key: number]: string } = {};
    let clueIndex = 0;

    // Process in grid order (left-to-right, top-to-bottom)
    for (const pos of cluePositions) {
        if (clueIndex >= allClues.length) break;

        // Check if this number has both across and down
        const hasBoth = pos.isAcross && pos.isDown;
        
        if (hasBoth && clueIndex + 1 < allClues.length) {
            // Swap the clues for this number
            downClues[pos.number] = allClues[clueIndex++];
            acrossClues[pos.number] = allClues[clueIndex++];
        } else {
            // Normal assignment
            if (pos.isAcross) {
                acrossClues[pos.number] = allClues[clueIndex++];
            }
            if (pos.isDown) {
                downClues[pos.number] = allClues[clueIndex++];
            }
        }
    }

    return {
        width,
        height,
        solution,
        grid: gridState,
        clues: { across: acrossClues, down: downClues },
        gridnums,
        title: strings[0] || 'Crossword Puzzle',
        author: strings[1] || 'Unknown',
        copyright: strings[2] || ''
    };
};



  // Load crossword from URL
  useEffect(() => {
    const loadCrossword = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Fetching crossword from https://thecodeworks.in/core/mini');
        
        const response = await fetch('https://thecodeworks.in/core/mini', {
          method: 'GET',
          headers: {
            'Accept': 'application/octet-stream, application/x-crossword, */*',
          },
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch crossword: ${response.status} ${response.statusText}`);
        }
        
        const buffer = await response.arrayBuffer();
        console.log('Received buffer of size:', buffer.byteLength);
        
        if (buffer.byteLength === 0) {
          throw new Error('Received empty file');
        }
        
        const data = parsePuzFile(buffer);
        console.log('Parsed crossword data:', {
          title: data.title,
          author: data.author,
          size: `${data.width}x${data.height}`,
          cluesCount: Object.keys(data.clues.across).length + Object.keys(data.clues.down).length
        });
        
        setCrosswordData(data);
        
        // Initialize grid
        const newGrid: Cell[][] = [];
        
        for (let row = 0; row < data.height; row++) {
          const gridRow: Cell[] = [];
          for (let col = 0; col < data.width; col++) {
            const index = row * data.width + col;
            const letter = data.solution[index] || '';
            const isBlack = letter === '.' || letter === ':' || letter === '';
            const number = data.gridnums[index] > 0 ? data.gridnums[index] : undefined;
            
            gridRow.push({
              letter: isBlack ? '' : letter,
              number,
              isBlack,
              userLetter: '',
              isCorrect: undefined
            });
          }
          newGrid.push(gridRow);
        }
        setGrid(newGrid);
        
        // Build clue map
        buildClueMap(data, newGrid);
        
        // Start timer
        setIsTimerRunning(true);
        
      } catch (err) {
        console.error('Error loading crossword:', err);
        setError(err instanceof Error ? err.message : 'Failed to load crossword');
      } finally {
        setLoading(false);
      }
    };

    loadCrossword();
  }, []);

  // Build clue map for easy lookup
  const buildClueMap = (data: CrosswordData, gridData: Cell[][]) => {
    const map = new Map<string, ClueInfo>();
    
    // Process across clues
    Object.entries(data.clues.across).forEach(([numStr, clue]) => {
      const number = parseInt(numStr);
      
      // Find starting position
      for (let row = 0; row < data.height; row++) {
        for (let col = 0; col < data.width; col++) {
          if (gridData[row][col].number === number) {
            const cells: { row: number; col: number }[] = [];
            let length = 0;
            for (let c = col; c < data.width && !gridData[row][c].isBlack; c++) {
              cells.push({ row, col: c });
              length++;
            }
            
            if (length > 1) { // Only add if it's actually a word
              map.set(`${number}-across`, {
                number,
                clue,
                direction: 'across',
                startRow: row,
                startCol: col,
                length,
                cells
              });
            }
            break;
          }
        }
      }
    });
    
    // Process down clues
    Object.entries(data.clues.down).forEach(([numStr, clue]) => {
      const number = parseInt(numStr);
      
      // Find starting position
      for (let row = 0; row < data.height; row++) {
        for (let col = 0; col < data.width; col++) {
          if (gridData[row][col].number === number) {
            const cells: { row: number; col: number }[] = [];
            let length = 0;
            for (let r = row; r < data.height && !gridData[r][col].isBlack; r++) {
              cells.push({ row: r, col });
              length++;
            }
            
            if (length > 1) { // Only add if it's actually a word
              map.set(`${number}-down`, {
                number,
                clue,
                direction: 'down',
                startRow: row,
                startCol: col,
                length,
                cells
              });
            }
            break;
          }
        }
      }
    });
    
    setClueMap(map);
    
    // Set initial clue
    const firstClue = map.get('1-across') || Array.from(map.values())[0];
    if (firstClue) {
      setSelectedClue(firstClue);
      setCurrentDirection(firstClue.direction);
      setSelectedCell({ row: firstClue.startRow, col: firstClue.startCol });
    }
  };

  // Get current clue info
  const getCurrentClueInfo = useCallback((row: number, col: number, direction: 'across' | 'down'): ClueInfo | null => {
    if (!crosswordData) return null;
    
    // Find the clue number for this position and direction
    for (const [key, clueInfo] of clueMap.entries()) {
      if (clueInfo.direction === direction) {
        const isInWord = clueInfo.cells.some(cell => cell.row === row && cell.col === col);
        if (isInWord) {
          return clueInfo;
        }
      }
    }
    
    return null;
  }, [clueMap, crosswordData]);

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (grid[row][col].isBlack) return;
    
    // If clicking the same cell, toggle direction
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      const newDirection = currentDirection === 'across' ? 'down' : 'across';
      const clueInfo = getCurrentClueInfo(row, col, newDirection);
      if (clueInfo) {
        setCurrentDirection(newDirection);
        setSelectedClue(clueInfo);
      }
    } else {
      setSelectedCell({ row, col });
      
      // Try current direction first, then the other
      let clueInfo = getCurrentClueInfo(row, col, currentDirection);
      if (!clueInfo) {
        const otherDirection = currentDirection === 'across' ? 'down' : 'across';
        clueInfo = getCurrentClueInfo(row, col, otherDirection);
        if (clueInfo) {
          setCurrentDirection(otherDirection);
        }
      }
      setSelectedClue(clueInfo);
    }
  };

  // Handle letter input
  const handleLetterInput = (letter: string) => {
    if (!selectedCell || !crosswordData) return;
    
    const { row, col } = selectedCell;
    
    // Update grid
    const newGrid = [...grid];
    newGrid[row][col].userLetter = letter;
    
    // Auto-check functionality
    if (autoCheck) {
      newGrid[row][col].isCorrect = letter === newGrid[row][col].letter;
    }
    
    setGrid(newGrid);
    
    // Move to next cell in current direction
    moveToNextCell();
    
    // Check if puzzle is completed
    checkCompletion(newGrid);
  };

  // Handle backspace
  const handleBackspace = () => {
    if (!selectedCell) return;
    
    const { row, col } = selectedCell;
    
    // Clear current cell
    const newGrid = [...grid];
    newGrid[row][col].userLetter = '';
    newGrid[row][col].isCorrect = undefined;
    setGrid(newGrid);
    
    // Move to previous cell
    moveToPreviousCell();
  };

  // Move to next cell in word
  const moveToNextCell = () => {
    if (!selectedCell || !selectedClue) return;
    
    const currentIndex = selectedClue.cells.findIndex(
      cell => cell.row === selectedCell.row && cell.col === selectedCell.col
    );
    
    if (currentIndex < selectedClue.cells.length - 1) {
      const nextCell = selectedClue.cells[currentIndex + 1];
      setSelectedCell({ row: nextCell.row, col: nextCell.col });
    } else {
      // Move to next clue
      jumpToNextClue();
    }
  };

  // Move to previous cell in word
  const moveToPreviousCell = () => {
    if (!selectedCell || !selectedClue) return;
    
    const currentIndex = selectedClue.cells.findIndex(
      cell => cell.row === selectedCell.row && cell.col === selectedCell.col
    );
    
    if (currentIndex > 0) {
      const prevCell = selectedClue.cells[currentIndex - 1];
      setSelectedCell({ row: prevCell.row, col: prevCell.col });
    }
  };

  // Jump to next/previous clue
  const jumpToNextClue = (previous: boolean = false) => {
    if (!selectedClue) return;
    
    const clueKeys = Array.from(clueMap.keys()).sort((a, b) => {
      const [numA, dirA] = a.split('-');
      const [numB, dirB] = b.split('-');
      
      if (dirA !== dirB) {
        return dirA === 'across' ? -1 : 1;
      }
      return parseInt(numA) - parseInt(numB);
    });
    
    const currentKey = `${selectedClue.number}-${selectedClue.direction}`;
    const currentIndex = clueKeys.indexOf(currentKey);
    
    let nextIndex;
    if (previous) {
      nextIndex = currentIndex > 0 ? currentIndex - 1 : clueKeys.length - 1;
    } else {
      nextIndex = currentIndex < clueKeys.length - 1 ? currentIndex + 1 : 0;
    }
    
    const nextClue = clueMap.get(clueKeys[nextIndex]);
    if (nextClue) {
      setSelectedClue(nextClue);
      setCurrentDirection(nextClue.direction);
      setSelectedCell({ row: nextClue.startRow, col: nextClue.startCol });
    }
  };

  // Check if puzzle is completed
  const checkCompletion = (currentGrid: Cell[][]) => {
    if (!crosswordData) return;
    
    let allFilled = true;
    let allCorrect = true;
    
    for (let row = 0; row < currentGrid.length; row++) {
      for (let col = 0; col < currentGrid[row].length; col++) {
        const cell = currentGrid[row][col];
        if (!cell.isBlack) {
          if (!cell.userLetter) {
            allFilled = false;
          } else if (cell.userLetter !== cell.letter) {
            allCorrect = false;
          }
        }
      }
    }
    
    if (allFilled && allCorrect) {
      setCompleted(true);
      setIsTimerRunning(false);
    }
  };

  // Handle clue click
  const handleClueClick = (clueInfo: ClueInfo) => {
    setSelectedClue(clueInfo);
    setCurrentDirection(clueInfo.direction);
    setSelectedCell({ row: clueInfo.startRow, col: clueInfo.startCol });
    setShowClues(false);
  };

  // Check if cell is part of selected word
  const isCellInSelectedWord = (row: number, col: number): boolean => {
    if (!selectedClue) return false;
    return selectedClue.cells.some(cell => cell.row === row && cell.col === col);
  };

  // Clear solution
  const clearSolution = () => {
    const newGrid = grid.map(row => 
      row.map(cell => ({ ...cell, userLetter: cell.isBlack ? '' : '', isCorrect: undefined }))
    );
    setGrid(newGrid);
    setCompleted(false);
    setTimer(0);
    setIsTimerRunning(true);
  };

  // Reveal solution
  const revealSolution = () => {
    const newGrid = grid.map(row => 
      row.map(cell => ({ 
        ...cell, 
        userLetter: cell.isBlack ? '' : cell.letter,
        isCorrect: cell.isBlack ? undefined : true
      }))
    );
    setGrid(newGrid);
    setCompleted(true);
    setIsTimerRunning(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading crossword...</p>
          <p className="text-sm text-gray-500 mt-2">Fetching puzzle from server</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center bg-white p-6 rounded-lg shadow-md max-w-sm">
          <div className="text-red-500 text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error Loading Crossword</h2>
          <p className="text-gray-600 mb-4 text-sm">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!crosswordData) return null;

  // Calculate cell size based on screen width and grid size
  const maxWidth = Math.min(window.innerWidth - 32, 400);
  const cellSize = Math.floor(maxWidth / Math.max(crosswordData.width, crosswordData.height));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-1">{crosswordData.title}</h1>
          <p className="text-sm text-gray-600">By {crosswordData.author}</p>
          {completed && (
            <div className="mt-2 p-2 bg-green-100 border border-green-400 rounded text-sm">
              <p className="text-green-800 font-semibold">🎉 Completed in {formatTime(timer)}!</p>
            </div>
          )}
        </div>
        
        {/* Controls */}
        <div className="flex justify-between items-center mt-4">
          <div className="text-lg font-mono text-blue-600">
            {formatTime(timer)}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={() => setAutoCheck(!autoCheck)}
              className={`px-3 py-1 rounded text-xs ${
                autoCheck 
                  ? 'bg-green-600 text-white' 
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              Auto-Check
            </button>
            <button
              onClick={() => setShowClues(!showClues)}
              className="bg-blue-600 text-white px-3 py-1 rounded text-xs"
            >
              Clues
            </button>
          </div>
        </div>
      </div>

      {/* Current Clue */}
      {selectedClue && (
        <div className="bg-blue-50 p-3 border-b">
          <div className="text-sm font-semibold text-blue-800 mb-1">
            {selectedClue.number} {selectedClue.direction.toUpperCase()}
          </div>
          <div className="text-sm text-gray-700">{selectedClue.clue}</div>
        </div>
      )}

      {/* Clues Panel */}
      {showClues && (
        <div className="absolute inset-0 bg-white z-50 overflow-y-auto">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Clues</h2>
              <button
                onClick={() => setShowClues(false)}
                className="text-gray-500 text-xl"
              >
                ✕
              </button>
            </div>
            
            {/* Across Clues */}
            <div className="mb-6">
              <h3 className="font-bold text-md mb-3 text-gray-800">Across</h3>
              <div className="space-y-2">
                {Object.entries(crosswordData.clues.across)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([number, clue]) => {
                    const clueInfo = clueMap.get(`${number}-across`);
                    const isSelected = selectedClue?.number === parseInt(number) && 
                                     selectedClue?.direction === 'across';
                    
                    return (
                      <div
                        key={number}
                        className={`
                          p-2 rounded cursor-pointer transition-colors text-sm
                          ${isSelected 
                            ? 'bg-blue-100 border-l-4 border-blue-500' 
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={() => clueInfo && handleClueClick(clueInfo)}
                      >
                        <span className="font-semibold text-blue-600">{number}.</span>
                        <span className="ml-2 text-gray-700">{clue}</span>
                      </div>
                    );
                  })}
              </div>
            </div>

            {/* Down Clues */}
            <div>
              <h3 className="font-bold text-md mb-3 text-gray-800">Down</h3>
              <div className="space-y-2">
                {Object.entries(crosswordData.clues.down)
                  .sort(([a], [b]) => parseInt(a) - parseInt(b))
                  .map(([number, clue]) => {
                    const clueInfo = clueMap.get(`${number}-down`);
                    const isSelected = selectedClue?.number === parseInt(number) && 
                                     selectedClue?.direction === 'down';
                    
                    return (
                      <div
                        key={number}
                        className={`
                          p-2 rounded cursor-pointer transition-colors text-sm
                          ${isSelected 
                            ? 'bg-blue-100 border-l-4 border-blue-500' 
                            : 'hover:bg-gray-50'
                          }
                        `}
                        onClick={() => clueInfo && handleClueClick(clueInfo)}
                      >
                        <span className="font-semibold text-blue-600">{number}.</span>
                        <span className="ml-2 text-gray-700">{clue}</span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 flex justify-center items-center p-4">
        <div
          ref={gridRef}
          className="inline-block border-2 border-gray-800"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${crosswordData.width}, ${cellSize}px)`,
            gridTemplateRows: `repeat(${crosswordData.height}, ${cellSize}px)`,
            gap: '1px',
            background: '#000'
          }}
        >
          {grid.map((row, rowIndex) =>
            row.map((cell, colIndex) => (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={`
                  relative cursor-pointer flex items-center justify-center font-bold
                  ${cell.isBlack 
                    ? 'bg-black' 
                    : selectedCell?.row === rowIndex && selectedCell?.col === colIndex
                      ? 'bg-yellow-200 border-2 border-yellow-500'
                      : isCellInSelectedWord(rowIndex, colIndex)
                        ? 'bg-blue-100'
                        : autoCheck && cell.isCorrect === false
                          ? 'bg-red-100'
                          : autoCheck && cell.isCorrect === true
                            ? 'bg-green-100'
                            : 'bg-white hover:bg-gray-100'
                  }
                  ${!cell.isBlack ? 'border border-gray-300' : ''}
                `}
                style={{ 
                  width: `${cellSize}px`, 
                  height: `${cellSize}px`,
                  fontSize: `${Math.max(12, cellSize * 0.6)}px`
                }}
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {!cell.isBlack && (
                  <>
                    {cell.number && (
                      <span 
                        className="absolute top-0.5 left-0.5 font-normal text-gray-700"
                        style={{ fontSize: `${Math.max(8, cellSize * 0.25)}px` }}

                  >
                    {cell.number}
                  </span>
                )}
                <span className={`${cell.userLetter ? 'visible' : 'invisible'}`}>
                  {cell.userLetter}
                </span>
              </>
            )}
          </div>
        ))
      )}
    </div>
  </div>

  {/* Keyboard Controls */}
  {showKeyboard && (
    <div className="bg-white border-t p-4">
      <div className="flex justify-center gap-1 mb-2">
        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].map(letter => (
          <button
            key={letter}
            onClick={() => handleLetterInput(letter)}
            className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-800 hover:bg-gray-300"
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-1 mb-2">
        {['J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R'].map(letter => (
          <button
            key={letter}
            onClick={() => handleLetterInput(letter)}
            className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-800 hover:bg-gray-300"
          >
            {letter}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-1">
        {['S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(letter => (
          <button
            key={letter}
            onClick={() => handleLetterInput(letter)}
            className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center font-bold text-gray-800 hover:bg-gray-300"
          >
            {letter}
          </button>
        ))}
        <button
          onClick={handleBackspace}
          className="w-16 h-10 bg-red-500 rounded flex items-center justify-center font-bold text-white hover:bg-red-600"
        >
          ⌫
        </button>
      </div>
    </div>
  )}

  {/* Bottom Controls */}
  <div className="bg-white border-t p-3 flex justify-between">
    <button
      onClick={() => jumpToNextClue(true)}
      className="px-4 py-2 bg-gray-200 rounded text-sm font-medium"
    >
      Previous Clue
    </button>
    <div className="flex gap-2">
      <button
        onClick={clearSolution}
        className="px-4 py-2 bg-gray-200 rounded text-sm font-medium"
      >
        Clear
      </button>
      <button
        onClick={revealSolution}
        className="px-4 py-2 bg-blue-600 text-white rounded text-sm font-medium"
      >
        Reveal
      </button>
    </div>
    <button
      onClick={() => jumpToNextClue()}
      className="px-4 py-2 bg-gray-200 rounded text-sm font-medium"
    >
      Next Clue
    </button>
  </div>
</div>
);
}
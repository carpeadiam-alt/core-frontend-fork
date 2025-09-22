'use client';

import { useState, useEffect } from 'react';
import { Rubik } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

// Add Yusei Magic font
const yuseiMagic = {
  fontFamily: 'Yusei Magic',
};

// DEFAULT LOGO SIZES (used if individual game doesn't specify)
const DEFAULT_TWO_TILE_LOGO_SIZE = 40;
const DEFAULT_FULL_TILE_LOGO_SIZE = 60;

interface GameOption {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  color: string;
  href: string;
  logoSize?: number;
}

interface LayoutRow {
  type: 'two-tiles' | 'full-tile';
  games: GameOption[];
  widerOnLeft?: boolean;
}

export default function Home() {
  const [greeting, setGreeting] = useState('Good Morning');
  const [isEvening, setIsEvening] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) {
        setGreeting('Good Morning');
        setIsEvening(false);
      } else if (hour < 18) {
        setGreeting('Good Afternoon');
        setIsEvening(false);
      } else {
        setGreeting('Good Evening');
        setIsEvening(true);
      }
    };

    // Get token from localStorage on component mount
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('bento_token');
      setToken(storedToken);
    }

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Image dimensions
  const timeIconWidth = 100;
  const timeIconHeight = 100;
  
  // Placeholder paths for time-based images
  const timeBasedImagePath = isEvening ? '/icons/night.svg' : '/icons/day.svg';

  // Function to generate URLs with token parameter for external links
  const getGameUrl = (baseUrl: string) => {
    if (token && (baseUrl.includes('thecodeworks.in') || baseUrl.includes('wordual.onrender.com') || baseUrl.includes('wikisprint.vercel.app'))) {
      // Add token parameter to external URLs
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
  };

  const gameOptions: GameOption[] = [
    {
      id: 'miniesque',
      title: 'Mini-esque',
      subtitle: 'Almost a mini.',
      icon: '/icons/miniesque.svg',
      color: 'bg-[#40FF4D]',
      href: '/minieque-fg',
      logoSize: 72
    },
    {
      id: 'connections',
      title: 'Connections',
      subtitle: 'Play the classic game.',
      icon: '/icons/connections.svg',
      color: 'bg-[#FFB1E2]',
      href: '/connections-fg',
      logoSize: 62
    },
    {
      id: 'archives',
      title: 'Archives',
      subtitle: 'Play Mini NYT archives',
      icon: '/icons/archives.svg',
      color: 'bg-[#B5DCFF]',
      href: 'archives-fg',
      logoSize: 42
    },
    {
      id: 'sudokuction',
      title: 'Sudokuction',
      subtitle: 'Jigsaw and Sudoku.',
      icon: '/icons/sudokuction.svg',
      color: 'bg-[#FF3333]',
      href: '/sudokuction-fg',
      logoSize: 44
    },
    {
      id: 'punchline',
      title: 'Punchline',
      subtitle: 'Not a game actually.',
      icon: '/icons/punchline.svg',
      color: 'bg-[#FFFC39]',
      href: '/punchline-fg',
      logoSize: 100
    },
    {
      id: 'trivia',
      title: 'Trivia',
      subtitle: 'Easy and Medium modes',
      icon: '/icons/trivia2.svg',
      color: 'bg-[#54E600]',
      href: getGameUrl('https://thecodeworks.in/coreTries/trivia.html'),
      logoSize: 64
    },
    {
      id: 'tenet',
      title: 'Tenet',
      subtitle: 'Word Flips',
      icon: '/icons/tnt.svg',
      color: 'bg-[#B5DCFF]',
      href: '/tenetw',
      logoSize: 62
    },
    {
      id: 'wordual',
      title: 'Wordual',
      subtitle: 'Two player Wordle!',
      icon: '/icons/wd.svg',
      color: 'bg-[#FFD21F]',
      href: 'https://wordual.onrender.com/',
      logoSize: 40
    },
    {
      id: 'shuffle',
      title: 'Shuffle',
      subtitle: 'Lock all pairs in memory',
      icon: '/icons/shf.svg',
      color: 'bg-[#FFB1E2]',
      href: getGameUrl('https://thecodeworks.in/coreTries/shuffle.html'),
      logoSize: 42
    },
    {
      id: 'six-degrees',
      title: 'Six Degrees',
      subtitle: 'The Connections Pt II',
      icon: '/icons/sd.svg',
      color: 'bg-[#69FFE8]',
      href: '/sixdegrees',
      logoSize: 72
    },
    {
      id: 'wikisprint',
      title: 'Wikisprint',
      subtitle: 'Link Travel',
      icon: '/icons/wiki2.svg',
      color: 'bg-[#D8D8D8]',
      href: 'https://wikisprint.vercel.app/',
      logoSize: 72
    },
    {
      id: 'big-lecrossski',
      title: 'The Big Lecrosski',
      subtitle: 'The Full Crossword',
      icon: '/icons/tfc.svg',
      color: 'bg-[#FFBEE7]',
      href: getGameUrl('https://thecodeworks.in/coreTries/exolve-player3.html'),
      logoSize: 44
    },
    {
      id: 'hopscotch',
      title: 'Hopscotch',
      subtitle: 'Numbers game',
      icon: '/icons/hopscotch.svg',
      color: 'bg-[#B5DCFF]',
      href: getGameUrl('https://thecodeworks.in/coreTries/hopscotch.html'),
      logoSize: 70
    },
    {
      id: 'charades',
      title: 'Charades',
      subtitle: 'Cryptic with a twist',
      icon: '/icons/charades1.svg',
      color: 'bg-[#76C985]',
      href: getGameUrl('https://thecodeworks.in/coreTries/cryptic.html'),
      logoSize: 72
    },
    {
      id: 'cipher',
      title: 'Cipher',
      subtitle: 'Decipher the code',
      icon: '/icons/cipher.svg',
      color: 'bg-[#CACCAF]',
      href: getGameUrl('https://thecodeworks.in/coreTries/cipher.html'),
      logoSize: 42
    },
    {
      id: 'whispers',
      title: 'Whispers',
      subtitle: 'Text Transformations',
      icon: '/icons/whispers.svg',
      color: 'bg-[#2698FF]',
      href: '/whispers',
      logoSize: 60
    },
  ];

  // Create alternating layout: odd rows have 2 tiles, even rows have 1 full tile
  const layoutRows: LayoutRow[] = [];
  let gameIndex = 0;

  while (gameIndex < gameOptions.length) {
    const currentRowIndex: number = layoutRows.length;
    const isOddRow: boolean = currentRowIndex % 2 === 0;
    
    if (isOddRow && gameIndex + 1 < gameOptions.length) {
      // Two tiles row - alternate which side the wider tile is on
      const isWiderOnLeft: boolean = Math.floor(currentRowIndex / 2) % 2 === 0;
      layoutRows.push({
        type: 'two-tiles',
        games: [gameOptions[gameIndex], gameOptions[gameIndex + 1]],
        widerOnLeft: isWiderOnLeft
      });
      gameIndex += 2;
    } else {
      // Single full tile row
      layoutRows.push({
        type: 'full-tile',
        games: [gameOptions[gameIndex]]
      });
      gameIndex += 1;
    }
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');
      `}</style>
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Time-based SVG Icon — kept as-is */}
            <div className="flex justify-center mb-4">
              <Image
                src={timeBasedImagePath}
                alt={`${greeting} icon`}
                width={timeIconWidth}
                height={timeIconHeight}
                className="object-contain"
              />
            </div>
            
            <h1 className="text-2xl font-medium text-gray-900 mb-2">
              {greeting}
            </h1>
            <p className="text-gray-600 text-sm">
              Play Unlimited.
            </p>
          </div>

          {/* Game Grid - Alternating layout */}
          <div className="space-y-3">
            {layoutRows.map((row, rowIndex) => (
              <div key={rowIndex}>
                {row.type === 'two-tiles' ? (
                  // Two tiles row
                  <div className="flex space-x-3">
                    {row.widerOnLeft ? (
                      <>
                        {/* Wider tile on left */}
                        <Link
                          href={row.games[0].href}
                          className="flex-1"
                          style={{ flexBasis: '65%' }}
                        >
                          <div className={`rounded-sm p-4  hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-36`}>
                            <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
                              {/* LOGO CENTERED */}
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: `${row.games[0].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                  height: `${row.games[0].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                }}
                              >
                                <div className="relative w-full h-full">
                                  <Image
                                    src={row.games[0].icon}
                                    alt={`${row.games[0].title} icon`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              {/* TEXT LEFT ALIGNED UNDERNEATH */}
                              <div className="text-left w-full px-2">
                                <h3 
                                  className="text-lg font-normal text-black truncate mb-1"
                                  style={yuseiMagic}
                                >
                                  {row.games[0].title}
                                </h3>
                                <p className="text-sm text-black truncate opacity-90">
                                  {row.games[0].subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                        {/* Smaller tile on right */}
                        <Link
                          href={row.games[1].href}
                          className="flex-1"
                          style={{ flexBasis: '35%' }}
                        >
                          <div className={`rounded-sm p-4  hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[1].color} h-36`}>
                            <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
                              {/* LOGO CENTERED */}
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: `${row.games[1].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                  height: `${row.games[1].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                }}
                              >
                                <div className="relative w-full h-full">
                                  <Image
                                    src={row.games[1].icon}
                                    alt={`${row.games[1].title} icon`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              {/* TEXT LEFT ALIGNED UNDERNEATH */}
                              <div className="text-left w-full px-2">
                                <h3 
                                  className="text-sm font-normal text-black truncate mb-1"
                                  style={yuseiMagic}
                                >
                                  {row.games[1].title}
                                </h3>
                                <p className="text-xs text-black truncate opacity-90">
                                  {row.games[1].subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </>
                    ) : (
                      <>
                        {/* Smaller tile on left */}
                        <Link
                          href={row.games[0].href}
                          className="flex-1"
                          style={{ flexBasis: '35%' }}
                        >
                          <div className={`rounded-sm p-4  hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-36`}>
                            <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
                              {/* LOGO CENTERED */}
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: `${row.games[0].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                  height: `${row.games[0].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                }}
                              >
                                <div className="relative w-full h-full">
                                  <Image
                                    src={row.games[0].icon}
                                    alt={`${row.games[0].title} icon`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              {/* TEXT LEFT ALIGNED UNDERNEATH */}
                              <div className="text-left w-full px-2">
                                <h3 
                                  className="text-sm font-normal text-black truncate mb-1"
                                  style={yuseiMagic}
                                >
                                  {row.games[0].title}
                                </h3>
                                <p className="text-xs text-black truncate opacity-90">
                                  {row.games[0].subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                        {/* Wider tile on right */}
                        <Link
                          href={row.games[1].href}
                          className="flex-1"
                          style={{ flexBasis: '65%' }}
                        >
                          <div className={`rounded-sm p-4  hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[1].color} h-36`}>
                            <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
                              {/* LOGO CENTERED */}
                              <div
                                className="flex items-center justify-center"
                                style={{
                                  width: `${row.games[1].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                  height: `${row.games[1].logoSize || DEFAULT_TWO_TILE_LOGO_SIZE}px`,
                                }}
                              >
                                <div className="relative w-full h-full">
                                  <Image
                                    src={row.games[1].icon}
                                    alt={`${row.games[1].title} icon`}
                                    fill
                                    className="object-contain"
                                  />
                                </div>
                              </div>
                              {/* TEXT LEFT ALIGNED UNDERNEATH */}
                              <div className="text-left w-full px-2">
                                <h3 
                                  className="text-lg font-normal text-black truncate mb-1"
                                  style={yuseiMagic}
                                >
                                  {row.games[1].title}
                                </h3>
                                <p className="text-sm text-black truncate opacity-90">
                                  {row.games[1].subtitle}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      </>
                    )}
                  </div>
                ) : (
                  // Full width single tile
                  <Link
                    href={row.games[0].href}
                  >
                    <div className={`rounded-sm p-4  hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-20`}>
                      <div className="flex items-center space-x-4 h-full">
                        <div
                          className="flex items-center justify-center flex-shrink-0"
                          style={{
                            width: `${row.games[0].logoSize || DEFAULT_FULL_TILE_LOGO_SIZE}px`,
                            height: `${row.games[0].logoSize || DEFAULT_FULL_TILE_LOGO_SIZE}px`,
                          }}
                        >
                          <div className="relative w-full h-full">
                            <Image
                              src={row.games[0].icon}
                              alt={`${row.games[0].title} icon`}
                              fill
                              className="object-contain"
                            />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 
                            className="text-xl font-normal text-black truncate mb-1"
                            style={yuseiMagic}
                          >
                            {row.games[0].title}
                          </h3>
                          <p className="text-sm text-black truncate opacity-90">
                            {row.games[0].subtitle}
                          </p>
                        </div>
                      </div>
                    </div>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
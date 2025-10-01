'use client';

import { useState, useEffect } from 'react';
import { Rubik } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const yuseiMagic = {
  fontFamily: 'Yusei Magic',
};

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('bento_token');
      const storedUsername = localStorage.getItem('bento_username');

      if (!storedToken || !storedUsername) {
        router.push('/');
        return;
      }

      setToken(storedToken);
    }

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

    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, [router]);

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bento_token');
      localStorage.removeItem('bento_username');
      localStorage.removeItem('bento_photo_index');
    }
    router.push('/');
  };

  const getGameUrl = (baseUrl: string) => {
    if (token && (baseUrl.includes('thecodeworks.in') || baseUrl.includes('wordual.onrender.com') || baseUrl.includes('wikisprint.vercel.app'))) {
      const cleanUrl = baseUrl.trim();
      const separator = cleanUrl.includes('?') ? '&' : '?';
      return `${cleanUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    return baseUrl.trim();
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
      href: '/archives-fg',
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
      href: '/trivia-fg',
      logoSize: 64
    },
    {
      id: 'tenet',
      title: 'Tenet',
      subtitle: 'Word Flips',
      icon: '/icons/tnt.svg',
      color: 'bg-[#B5DCFF]',
      href: '/tenet-fg',
      logoSize: 62
    },
    {
      id: 'wordual',
      title: 'Wordual',
      subtitle: 'Two player Wordle!',
      icon: '/icons/wd.svg',
      color: 'bg-[#FFD21F]',
      href: getGameUrl('https://wordual.onrender.com/    '),
      logoSize: 40
    },
    {
      id: 'shuffle',
      title: 'Shuffle',
      subtitle: 'Lock all pairs in memory',
      icon: '/icons/shf.svg',
      color: 'bg-[#FFB1E2]',
      href: '/shuffle-fg',
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
      href: getGameUrl('https://wikisprint.vercel.app/    '),
      logoSize: 72
    },
    {
      id: 'big-lecrossski',
      title: 'The Big Lecrossski',
      subtitle: 'The Full Crossword',
      icon: '/icons/tfc.svg',
      color: 'bg-[#FFBEE7]',
      href: '/bl-fg',
      logoSize: 44
    },
    {
      id: 'hopscotch',
      title: 'Hopscotch',
      subtitle: 'Numbers game',
      icon: '/icons/hopscotch.svg',
      color: 'bg-[#B5DCFF]',
      href: getGameUrl('https://thecodeworks.in/coreTries/hopscotch.html    '),
      logoSize: 70
    },
    {
      id: 'charades',
      title: 'Charades',
      subtitle: 'Cryptic with a twist',
      icon: '/icons/charades1.svg',
      color: 'bg-[#76C985]',
      href: getGameUrl('https://thecodeworks.in/coreTries/cryptic.html    '),
      logoSize: 72
    },
    {
      id: 'cipher',
      title: 'Cipher',
      subtitle: 'Decipher the code',
      icon: '/icons/cipher.svg',
      color: 'bg-[#CACCAF]',
      href: getGameUrl('https://thecodeworks.in/coreTries/cipher.html    '),
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

  const layoutRows: LayoutRow[] = [];
  let gameIndex = 0;

  while (gameIndex < gameOptions.length) {
    const currentRowIndex = layoutRows.length;
    const isOddRow = currentRowIndex % 2 === 0;

    if (isOddRow && gameIndex + 1 < gameOptions.length) {
      const isWiderOnLeft = Math.floor(currentRowIndex / 2) % 2 === 0;
      layoutRows.push({
        type: 'two-tiles',
        games: [gameOptions[gameIndex], gameOptions[gameIndex + 1]],
        widerOnLeft: isWiderOnLeft
      });
      gameIndex += 2;
    } else {
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

      {/* Sidebar (no overlay, white background, non-sticky menu button) */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
      >
        <div className="p-4  flex justify-between items-center">

          <button
            onClick={() => setSidebarOpen(false)}
            className="text-gray-600 hover:text-gray-900"
            aria-label="Close menu"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="p-4 space-y-3">
          <Link
            href="/home"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/friends"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Friends
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100 rounded-md"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
        {/* Non-sticky menu button: placed inside scrollable content at top-right */}
        <div className="relative">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full  hover:bg-gray-300 focus:outline-none"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="max-w-md mx-auto px-4 pb-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <Image
                  src={isEvening ? '/icons/night.svg' : '/icons/day.svg'}
                  alt={`${greeting} icon`}
                  width={100}
                  height={100}
                  className="object-contain"
                />
              </div>
              <h1 className="text-2xl font-medium text-gray-900 mb-2">{greeting}</h1>
              <p className="text-gray-600 text-sm">Play Unlimited.</p>
            </div>

            {/* Game Grid */}
            <div className="space-y-3">
              {layoutRows.map((row, rowIndex) => (
                <div key={rowIndex}>
                  {row.type === 'two-tiles' ? (
                    <div className="flex space-x-3">
                      {row.widerOnLeft ? (
                        <>
                          <Link href={row.games[0].href} className="flex-1" style={{ flexBasis: '65%' }}>
                            <div className={`rounded-sm p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-36`}>
                              <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
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
                                <div className="text-left w-full px-2">
                                  <h3 className="text-lg font-normal text-black truncate mb-1" style={yuseiMagic}>
                                    {row.games[0].title}
                                  </h3>
                                  <p className="text-sm text-black truncate opacity-90">{row.games[0].subtitle}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                          <Link href={row.games[1].href} className="flex-1" style={{ flexBasis: '35%' }}>
                            <div className={`rounded-sm p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[1].color} h-36`}>
                              <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
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
                                <div className="text-left w-full px-2">
                                  <h3 className="text-sm font-normal text-black truncate mb-1" style={yuseiMagic}>
                                    {row.games[1].title}
                                  </h3>
                                  <p className="text-xs text-black truncate opacity-90">{row.games[1].subtitle}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </>
                      ) : (
                        <>
                          <Link href={row.games[0].href} className="flex-1" style={{ flexBasis: '35%' }}>
                            <div className={`rounded-sm p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-36`}>
                              <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
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
                                <div className="text-left w-full px-2">
                                  <h3 className="text-sm font-normal text-black truncate mb-1" style={yuseiMagic}>
                                    {row.games[0].title}
                                  </h3>
                                  <p className="text-xs text-black truncate opacity-90">{row.games[0].subtitle}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                          <Link href={row.games[1].href} className="flex-1" style={{ flexBasis: '65%' }}>
                            <div className={`rounded-sm p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[1].color} h-36`}>
                              <div className="flex flex-col items-center justify-start h-full space-y-2 pt-3">
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
                                <div className="text-left w-full px-2">
                                  <h3 className="text-lg font-normal text-black truncate mb-1" style={yuseiMagic}>
                                    {row.games[1].title}
                                  </h3>
                                  <p className="text-sm text-black truncate opacity-90">{row.games[1].subtitle}</p>
                                </div>
                              </div>
                            </div>
                          </Link>
                        </>
                      )}
                    </div>
                  ) : (
                    <Link href={row.games[0].href}>
                      <div className={`rounded-sm p-4 hover:shadow-sm transition-shadow duration-200 cursor-pointer ${row.games[0].color} h-20`}>
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
                            <h3 className="text-xl font-normal text-black truncate mb-1" style={yuseiMagic}>
                              {row.games[0].title}
                            </h3>
                            <p className="text-sm text-black truncate opacity-90">{row.games[0].subtitle}</p>
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
      </div>
    </>
  );
}
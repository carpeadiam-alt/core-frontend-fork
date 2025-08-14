'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
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

export default function Home() {
  const [greeting, setGreeting] = useState('Good Morning');
  const [isEvening, setIsEvening] = useState(false);

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

    updateGreeting();
    // Update greeting every minute
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Image dimensions (you can adjust these)
  const timeIconWidth = 100;
  const timeIconHeight = 100;
  
  // Placeholder paths for time-based images
  const timeBasedImagePath = isEvening ? '/icons/night.svg' : '/icons/day.svg';

  const gameOptions = [
    {
      id: 'miniesque',
      title: 'Mini-esque',
      subtitle: 'Almost a mini.',
      icon: '/icons/miniesque.svg',
      href: '/minieque-fg'
    },
    {
      id: 'connections',
      title: 'Connections',
      subtitle: 'Play the classic game.',
      icon: '/icons/connections.svg',
      href: '/connections-fg'
    },
    {
      id: 'archives',
      title: 'Archives',
      subtitle: 'Play Mini NYT archives',
      icon: '/icons/archives.svg',
      href: 'https://thecodeworks.in/coreTries/exolve-player2.html'
    },
    {
      id: 'punchline',
      title: 'Punchline',
      subtitle: 'Not a game actually.',
      icon: '/icons/punchline.svg',
      href: '/punchline-fg'
    },
    {
      id: 'sudokuction',
      title: 'Sudokuction',
      subtitle: 'Jigsaw and Sudoku.',
      icon: '/icons/sudokuction.svg',
      href: '/sudokuction-fg'
    },
    {
      id: 'trivia',
      title: 'Trivia',
      subtitle: 'Easy and Medium modes',
      icon: '/icons/trivia (1).svg',
      href: 'https://thecodeworks.in/coreTries/trivia.html'
    },
    {
      id: 'tenet',
      title: 'Tenet',
      subtitle: 'Find all words through flips',
      icon: '/icons/tnt.svg',
      href: '/tenetw'
    },
    {
      id: 'shuffle',
      title: 'Shuffle',
      subtitle: 'Lock all pairs in this memory',
      icon: '/icons/shf.svg',
      href: 'https://thecodeworks.in/coreTries/shuffle.html'
    },
    {
      id: 'wordual',
      title: 'Wordual',
      subtitle: 'A two player twist on Wordle!',
      icon: '/icons/wd.svg',
      href: 'https://wordual.onrender.com'
    },
    {
      id: 'six degrees',
      title: 'Six Degrees',
      subtitle: 'The Connections Pt II',
      icon: '/icons/sd.svg',
      href: '/sixdegrees'
    },
    {
      id: 'wikisprint',
      title: 'Wikisprint',
      subtitle: 'Hop from link to link to get to the goal',
      icon: '/icons/ws.svg',
      href: 'https://wikisprint.vercel.app/'
    },
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');
      `}</style>
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
        <div className="max-w-md mx-auto px-4 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            {/* Time-based SVG Icon */}
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
              Choose from our large selection of games & puzzles.
            </p>
          </div>

          {/* Game Grid */}
          <div className="space-y-3">
            {gameOptions.map((game) => (
              <Link
                key={game.id}
                href={game.href}
                className="block w-full"
              >
                <div className="bg-white rounded-lg p-4 border border-gray-400 hover:shadow-sm transition-shadow duration-200 cursor-pointer">
                  <div className="flex items-center space-x-4">
                    {/* Icon */}
                    <div className="w-16 h-16 flex items-center justify-center flex-shrink-0">
                      <Image
                        src={game.icon}
                        alt={`${game.title} icon`}
                        width={70}
                        height={70}
                        className="w-12 h-12 object-contain"
                      />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <h3 
                        className="text-lg font-normal text-gray-900 truncate mb-1"
                        style={yuseiMagic}
                      >
                        {game.title}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">
                        {game.subtitle}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
'use client';
import { useState, useEffect } from 'react';
import { Rubik, Yusei_Magic } from 'next/font/google';
import Link from 'next/link';
import Image from 'next/image';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const yuseiMagic = Yusei_Magic({
  subsets: ['latin'],
  weight: '400', // Yusei Magic only has one weight
  variable: '--font-yusei-magic',
});

// Controllable parameters for logo SVG
const logoSize = 64;
const logoPath = '/icons/trivia-w.svg';

// Controllable parameters for button links
const easyHref = 'https://thecodeworks.in/coreTries/trivia2.html';
const mediumHref = 'https://thecodeworks.in/coreTries/trivia.html';

export default function Page() {
  // Controllable parameters for SVG illustration
  const svgWidth = 600;
  const svgHeight = 650;
  const svgScaleFactor = 0.8;
  const bottomOffset = -200;
  const svgPath = '/fores/t-fg.svg';

  // Calculate scaled dimensions
  const scaledWidth = svgWidth * svgScaleFactor;
  const scaledHeight = svgHeight * svgScaleFactor;

  const [token, setToken] = useState<string | null>(null);

  // Load token from localStorage after mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('bento_token');
      setToken(storedToken);
    }
  }, []);

  // Build URL with token if needed
  const getGameUrl = (baseUrl: string) => {
    if (
      token &&
      (baseUrl.includes('thecodeworks.in') ||
        baseUrl.includes('wordual.onrender.com') ||
        baseUrl.includes('wikisprint.vercel.app'))
    ) {
      const separator = baseUrl.includes('?') ? '&' : '?';
      return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    return baseUrl;
  };

  return (
    <div
      className={`min-h-screen bg-[#4AC900] relative overflow-hidden ${rubik.variable} ${yuseiMagic.variable}`}
    >
      {/* Main content container */}
      <div className="flex flex-col items-center justify-start pt-20 px-2">
        {/* Logo/Icon */}
        <div className="mb-8">
          <Image
            src={logoPath}
            alt="Mini-esque Logo"
            width={logoSize}
            height={logoSize}
            className="drop-shadow-lg"
            priority
          />
        </div>
                <h1
          className={`text-white text-4xl font-light mb-12 tracking-wide ${yuseiMagic.className}`}
        >
          Trivia
        </h1>
        <div className="flex flex-col gap-4">
          <a
            href={getGameUrl(easyHref)}
            className="bg-black text-white px-10 py-2 rounded-full text-lg font-medium shadow-lg inline-block text-center no-underline"
          >
            Easy
          </a>
          <a
            href={getGameUrl(mediumHref)}
            className="bg-black text-white px-10 py-2 rounded-full text-lg font-medium shadow-lg inline-block text-center no-underline"
          >
            Medium
          </a>
        </div>
      </div>
        {/* Title */}


        {/* Buttons */}


      {/* SVG Illustration */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{
          bottom: `${bottomOffset}px`,
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`,
        }}
      >
        <img
          src={svgPath}
          alt="Game illustration"
          style={{
            width: `${scaledWidth}px`,
            height: `${scaledHeight}px`,
            objectFit: 'contain',
          }}
        />
      </div>
    </div>
  );
}

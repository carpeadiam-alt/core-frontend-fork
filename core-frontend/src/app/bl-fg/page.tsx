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
const logoPath = '/icons/bl-w.svg';

// Controllable parameters for button link
const buttonHref = 'https://thecodeworks.in/coreTries/exolve-player3.html';
const buttonText = 'Play';

export default function Page() {
  // Token state
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

  // Detect external link
  const isExternalLink =
    buttonHref.startsWith('http://') ||
    buttonHref.startsWith('https://') ||
    buttonHref.startsWith('//');

  // Controllable parameters for SVG illustration
  const svgWidth = 600;
  const svgHeight = 400;
  const bottomOffset = -150;
  const svgPath = '/fores/m1bg.svg';

  return (
    <div
      className={`min-h-screen bg-[#FFBEE7] relative overflow-hidden ${rubik.variable} ${yuseiMagic.variable}`}
    >
      {/* Main content container */}
      <div className="flex flex-col items-center justify-start pt-20 px-8">
        {/* Logo */}
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

        {/* Title */}
        <h1
          className={`text-black text-4xl font-light mb-12 tracking-wide ${yuseiMagic.className}`}
        >
          The Big Lecrosski
        </h1>

        {/* Play Button */}
        {isExternalLink ? (
          <a
            href={getGameUrl(buttonHref)}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </a>
        ) : (
          <Link
            href={getGameUrl(buttonHref)}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium hover:bg-gray-800 transition-colors duration-200 shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </Link>
        )}
      </div>

      {/* SVG Illustration */}
      <div
        className="fixed left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{
          bottom: `${bottomOffset}px`,
          width: `${svgWidth}px`,
          height: `${svgHeight}px`,
        }}
      >
        <Image
          src={svgPath}
          alt="Game illustration"
          width={svgWidth}
          height={svgHeight}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}

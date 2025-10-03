'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
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
const logoSize = 64; // Size of the logo
const logoPath = "/icons/sdw.svg"; // Path to your logo SVG file

// Controllable parameters for button link
const buttonHref = "https://thecodeworks.in/coreTries/s2.html"; // Change this to your desired link (internal: "/page" or external: "https://example.com")
const buttonText = "Play"; // Button text

export default function Page() {
  // Controllable parameters for SVG illustration
  const svgWidth = 700; // Base width of the SVG
  const svgHeight = 450; // Base height of the SVG
  const svgScaleFactor = 1.25; // Scale factor (1.0 = original size, 1.5 = 150%, 2.0 = 200%, etc.)
  const bottomOffset = -150; // Height from bottom in pixels
  const svgPath = "/fores/sdfg.svg"; // Path to your SVG file
  
  // Calculate scaled dimensions
  const scaledWidth = svgWidth * svgScaleFactor;
  const scaledHeight = svgHeight * svgScaleFactor;

  
  
  // Check if the link is external
  const isExternalLink = buttonHref.startsWith('http://') || buttonHref.startsWith('https://') || buttonHref.startsWith('//');

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
    <div className={`min-h-screen bg-[#D45633] relative overflow-hidden ${rubik.variable} ${yuseiMagic.variable}`}>
      {/* Main content container */}
      <div className="flex flex-col items-center justify-start pt-20 px-8">
        {/* Logo/Icon - Now using uploaded SVG */}
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
          className={`text-white text-4xl font-light mb-12 tracking-wide ${yuseiMagic.className}`}
        >
          Sudokuction
        </h1>

        {/* Play Button */}
        {isExternalLink ? (
          <a 
            href={getGameUrl(buttonHref)}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium  shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </a>
        ) : (
          <Link 
            href={getGameUrl(buttonHref)}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </Link>
        )}
      </div>

      {/* SVG Illustration - Fixed position with controllable size, scaling factor, and bottom offset */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{ 
          bottom: `${bottomOffset}px`,
          width: `${scaledWidth}px`,
          height: `${scaledHeight}px`
        }}
      >
        <Image
          src={svgPath}
          alt="Game illustration"
          width={scaledWidth}
          height={scaledHeight}
          className="w-full h-full object-contain"
          priority
        />
      </div>
    </div>
  );
}
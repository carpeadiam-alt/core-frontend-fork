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
const logoPath = "/icons/sdw copy.svg"; // Path to your logo SVG file

// Controllable parameters for button link
const buttonHref = "/sixdegrees"; // Change this to your desired link (internal: "/page" or external: "https://example.com")
const buttonText = "Play"; // Button text

export default function Page() {
  // Controllable parameters for SVG illustration
  const svgWidth = 700; // Width of the SVG
  const svgHeight = 600; // Height of the SVG
  const bottomOffset = -200; // Height from bottom in pixels
  const svgPath = "/fores/sdg-fg.svg"; // Path to your SVG file
  
  // Check if the link is external
  const isExternalLink = buttonHref.startsWith('http://') || buttonHref.startsWith('https://') || buttonHref.startsWith('//');
  
  return (
    <div className={`min-h-screen bg-[#69FFE8] relative overflow-hidden ${rubik.variable} ${yuseiMagic.variable}`}>
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
          className={`text-black text-4xl font-light mb-12 tracking-wide ${yuseiMagic.className}`}
        >
          Six Degrees
        </h1>

        {/* Play Button */}
        {isExternalLink ? (
          <a 
            href={buttonHref}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium  shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </a>
        ) : (
          <Link 
            href={buttonHref}
            className="bg-black text-white px-12 py-2 rounded-full text-lg font-medium shadow-lg inline-block text-center no-underline"
          >
            {buttonText}
          </Link>
        )}
      </div>

      {/* SVG Illustration - Fixed position with controllable size and bottom offset */}
      <div 
        className="fixed left-1/2 transform -translate-x-1/2 pointer-events-none"
        style={{ 
          bottom: `${bottomOffset}px`,
          width: `${svgWidth}px`,
          height: `${svgHeight}px`
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
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Rubik, Yusei_Magic } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const yuseiMagic = Yusei_Magic({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-yusei-magic',
});

const profileImages = [
  '/profiles/0.svg',
  '/profiles/1.svg',
  '/profiles/2.svg',
  '/profiles/3.svg',
  '/profiles/4.svg',
  '/profiles/5.svg',
  '/profiles/6.svg',
  '/profiles/7.svg',
  '/profiles/8.svg',
  '/profiles/9.svg',
  '/profiles/10.svg',
  '/profiles/11.svg',
  '/profiles/12.svg',
  '/profiles/13.svg',
  '/profiles/14.svg',
];

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  const svgWidth = 500;
  const svgHeight = 300;
  const bottomOffset = -100; // keeps it slightly below visible area
  const svgPath = '/fores/auth-fg.svg';

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('bento_token') : null;
    const username = typeof window !== 'undefined' ? localStorage.getItem('bento_username') : null;
    if (token && username) {
      router.replace('/home');
    }
    setIsCheckingAuth(false);
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // ⚠️ Fix: Remove trailing spaces in URL!
      const baseUrl = 'https://thecodeworks.in/core_backend'; // ← NO SPACES!
      const endpoint = isLogin ? '/login' : '/register';
      const url = `${baseUrl}${endpoint}`;

      const payload = isLogin
        ? { username, dob }
        : { username, dob, photo_index: photoIndex };

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('bento_token', data.token);
        localStorage.setItem('bento_username', data.username);
        if (data.photo_index !== undefined) {
          localStorage.setItem('bento_photo_index', data.photo_index.toString());
        }
        router.replace('/home');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('Failed to connect to server');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const token = typeof window !== 'undefined' ? localStorage.getItem('bento_token') : null;
  const storedUsername = typeof window !== 'undefined' ? localStorage.getItem('bento_username') : null;

  if (isCheckingAuth) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-[#FFF900]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-black border-t-transparent mx-auto"></div>
          <p className="mt-3 text-black font-medium">Checking...</p>
        </div>
      </div>
    );
  }

  if (token && storedUsername) {
    return null;
  }

  return (
    <div className={`min-h-[100dvh] bg-[#FFF900] flex flex-col items-center pt-8 px-4 pb-28 relative ${rubik.variable} ${yuseiMagic.variable}`}>
      <h1 className={`text-black text-5xl md:text-6xl font-normal tracking-wide text-center ${yuseiMagic.className} mb-2`}>
        Bento Games
      </h1>

      <br />
      <br />

      {/* ✅ Compact Toggle: Narrower, taller, no gray background */}
      <div className="mb-6 flex justify-center">
        <div className="flex rounded-full border border-gray-300 p-1">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true);
              setError('');
              setUsername('');
              setDob('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
              isLogin
                ? 'bg-black text-white'
                : 'bg-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false);
              setError('');
              setUsername('');
              setDob('');
            }}
            className={`flex-1 py-2 px-4 text-sm font-medium rounded-full transition-colors ${
              !isLogin
                ? 'bg-black text-white'
                : 'bg-transparent text-gray-700 hover:text-gray-900'
            }`}
          >
            Register
          </button>
        </div>
      </div>

      <div className="w-full max-w-sm space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-base"
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-xs text-gray-600 mb-1 text-left px-1">
              Date of Birth
            </label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition text-base"
              required
            />
            <p className="text-xs text-gray-500 mt-1 px-1">This will count as account passkey</p>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Choose your avatar
              </label>
              <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2 gap-3 -mx-1 px-1">
                {profileImages.map((imagePath, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 w-14 h-14 rounded-xl overflow-hidden border-2 snap-start cursor-pointer transition-transform duration-150 ease-in-out ${
                      photoIndex === index
                        ? 'border-pink-500 scale-105'
                        : 'border-transparent hover:border-gray-400'
                    }`}
                    onClick={() => setPhotoIndex(index)}
                    role="radio"
                    aria-checked={photoIndex === index}
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && setPhotoIndex(index)}
                  >
                    <Image
                      src={imagePath}
                      alt={`Profile ${index + 1}`}
                      fill
                      className="object-contain p-1"
                    />
                    {photoIndex === index && (
                      <div className="absolute inset-0 bg-pink-500 bg-opacity-15 flex items-center justify-center">
                        <svg className="w-4 h-4 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-red-100 text-red-700 rounded-xl text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-4xl font-medium text-base transition-colors hover:bg-gray-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* ✅ FIXED SVG: stays at true bottom, doesn't jump on keyboard */}
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
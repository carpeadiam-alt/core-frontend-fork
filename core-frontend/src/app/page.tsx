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

// SVG illustration (from Shuffle page)
const svgWidth = 1000;
const svgHeight = 550;
const svgScaleFactor = 0.75;
const bottomOffset = -255; // Adjusted to avoid overlap
const svgPath = '/fores/bg.svg';

const scaledWidth = svgWidth * svgScaleFactor;
const scaledHeight = svgHeight * svgScaleFactor;

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [dob, setDob] = useState('');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

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
      const endpoint = isLogin ? '/login' : '/register';
      const payload = isLogin
        ? { username, dob }
        : { username, dob, photo_index: photoIndex };

      
      const response = await fetch(`https://thecodeworks.in/core_backend${endpoint}`, {
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
      <div className="min-h-screen flex items-center justify-center bg-[#F3FF48]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-black mx-auto"></div>
          <p className="mt-3 text-black">Checking...</p>
        </div>
      </div>
    );
  }

  if (token && storedUsername) {
    return null;
  }

  return (
    <div className={`min-h-screen bg-[#F3FF48] relative overflow-hidden ${rubik.variable} ${yuseiMagic.variable}`}>
      {/* Foreground SVG Illustration */}


      {/* Content */}
      <div className="relative z-10 flex flex-col items-center pt-12 px-6 pb-20">
        <h1 className={`text-black text-5xl font-normal tracking-wide ${yuseiMagic.className}`}>
          Bento Games
        </h1>

        <h2 className={`text-black text-2xl mt-6 mb-6 ${yuseiMagic.className}`}>
          {isLogin ? 'Welcome Back!' : 'Create Your Profile'}
        </h2>

        {/* Simplified Toggle */}
        <div className="text-center mb-6">
          <p
            className={`text-sm font-medium text-gray-700 cursor-pointer inline-flex items-center gap-1 transition-colors hover:text-pink-600 ${rubik.className}`}
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
          >
            {isLogin ? (
              <>
                New here?{' '}
                <span className="text-pink-600 font-semibold">Join Bento Games</span>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <span className="text-pink-600 font-semibold">Sign in</span>
              </>
            )}
          </p>
        </div>

        {/* Form */}
        <div className="w-full max-w-md space-y-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                id="username"
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            <div>
              <input
                id="dob"
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              />
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                  Choose your avatar
                </label>
                <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2 gap-3">
                  {profileImages.map((imagePath, index) => (
                    <div
                      key={index}
                      className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 snap-center cursor-pointer transition-transform ${
                        photoIndex === index
                          ? 'border-pink-500 scale-110'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => setPhotoIndex(index)}
                    >
                      <Image
                        src={imagePath}
                        alt={`Profile ${index + 1}`}
                        fill
                        className="object-contain p-1"
                      />
                      {photoIndex === index && (
                        <div className="absolute inset-0 bg-pink-500 bg-opacity-20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            )}

            {error && (
              <div className="p-3 bg-red-100/80 text-red-700 rounded-lg text-sm text-center backdrop-blur-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-3 rounded-full font-medium shadow hover:bg-gray-800 disabled:opacity-60 transition-colors"
            >
              {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
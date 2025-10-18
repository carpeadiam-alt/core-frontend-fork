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

const gameLogos = [
  '/icons/archives.svg',
  '/icons/charades1.svg',
  '/icons/cipher.svg',
  '/icons/connections.svg',
  '/icons/hopscotch.svg',
  '/icons/miniesque.svg',
  '/icons/punchline.svg',
];

const LOGO_PATH = '/icons/new_logo.svg';

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

      // 🔥 FIXED: Removed extra spaces in URL
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
      <div className="min-h-screen flex items-center justify-center bg-white">
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
    <div className={`min-h-screen bg-white flex flex-col items-center pt-12 px-4 pb-24 ${rubik.variable} ${yuseiMagic.variable} relative`}>
      {/* Main Content */}
      <div className="mb-6">
        <Image
          src={LOGO_PATH}
          alt="Bento Games Logo"
          width={80}
          height={80}
          priority
          className="drop-shadow-none"
        />
      </div>

      <h1 className={`text-black text-4xl md:text-5xl font-normal tracking-wide ${yuseiMagic.className}`}>
        Bento Games
      </h1>

      <h2 className={`text-black text-xl md:text-2xl mt-6 mb-8 ${yuseiMagic.className}`}>
        {isLogin ? 'Welcome Back!' : 'Create Your Profile'}
      </h2>

      <button
        type="button"
        onClick={() => {
          setIsLogin(!isLogin);
          setError('');
          setUsername('');
          setDob('');
        }}
        className={`mb-8 text-sm font-medium text-gray-700 transition-colors hover:text-pink-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-pink-500 rounded px-2 py-1 ${rubik.className}`}
      >
        {isLogin ? (
          <>
            New here?{' '}
            <span className="text-pink-600 font-semibold underline decoration-pink-300">Join Bento Games</span>
          </>
        ) : (
          <>
            Already have an account?{' '}
            <span className="text-pink-600 font-semibold underline decoration-pink-300">Sign in</span>
          </>
        )}
      </button>

      <div className="w-full max-w-md space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          <div>
            <label htmlFor="dob" className="sr-only">Date of Birth</label>
            <input
              id="dob"
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-4 py-3.5 bg-white border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                Choose your avatar
              </label>
              <div className="flex overflow-x-auto hide-scrollbar snap-x snap-mandatory py-2 gap-4 -mx-1 px-1">
                {profileImages.map((imagePath, index) => (
                  <div
                    key={index}
                    className={`relative flex-shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 snap-start cursor-pointer transition-transform duration-150 ease-in-out ${
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
                        <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="p-3.5 bg-red-100/80 text-red-700 rounded-xl text-sm text-center border border-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3.5 rounded-4xl font-medium transition-colors hover:bg-gray-900 active:scale-[0.99] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>

      {/* Fixed Game Logo Ticker at Bottom */}
{/* Fixed Game Logo Ticker at Bottom */}
<div className="fixed bottom-0 left-0 right-0 h-[72px] bg-white/90 backdrop-blur-sm  flex items-center overflow-hidden z-10">
  <div className="flex animate-scroll whitespace-nowrap px-4">
    {[...gameLogos, ...gameLogos].map((logo, index) => (
      <div key={index} className="mx-3 flex items-center justify-center h-full min-w-[56px]">
        {/* Use plain <img> for reliable SVG rendering */}
        <img
          src={logo}
          alt=""
          aria-hidden="true"
          className="h-[32px] w-auto max-w-[60px] object-contain"
          loading="eager"
        />
      </div>
    ))}
  </div>
</div>
    </div>
  );
}
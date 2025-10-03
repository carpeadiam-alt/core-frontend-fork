// pages/AddFriendPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { Rubik } from 'next/font/google';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

const yuseiMagic = {
  fontFamily: 'Yusei Magic',
};

export default function AddFriendPage() {
  const [friendToken, setFriendToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [username, setUsername] = useState<string | null>(null);
  const [photoIndex, setPhotoIndex] = useState<number>(0);
  const [shareUrl, setShareUrl] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null,
  });

  // Sidebar state
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const token = localStorage.getItem('bento_token');
    const user = localStorage.getItem('bento_username');
    
    if (!token || !user) {
      router.push('/');
      return;
    }
    
    setUserToken(token);
    setUsername(user);
    
    // Fetch profile
    fetch(`https://thecodeworks.in/core_backend/profile?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) {
          setPhotoIndex(data.photo_index ?? 0);
        }
      })
      .catch(console.error);
    
    // Generate share URL
    const currentUrl = window.location.origin;
    setShareUrl(`${currentUrl}/add-friend?myToken=${token}`);
  }, [router]);

  const handleAddFriend = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!friendToken.trim()) {
      setMessage({
        text: 'Please enter a friend token',
        type: 'error',
      });
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
      return;
    }
    
    setIsLoading(true);
    setMessage({ text: '', type: null });
    
    try {
      const response = await fetch('https://thecodeworks.in/core_backend/add_friend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: userToken,
          friend_token: friendToken.trim(),
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to add friend');
      }
      
      setMessage({
        text: `Friend ${data.friend_username} added successfully!`,
        type: 'success',
      });
      setFriendToken('');
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
    } catch (error) {
      console.error('Error adding friend:', error);
      setMessage({
        text: error instanceof Error ? error.message : 'Failed to add friend',
        type: 'error',
      });
      setTimeout(() => setMessage({ text: '', type: null }), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        setMessage({
          text: 'Link copied to clipboard!',
          type: 'success',
        });
        setTimeout(() => setMessage({ text: '', type: null }), 3000);
      })
      .catch(() => {
        setMessage({
          text: 'Failed to copy link',
          type: 'error',
        });
        setTimeout(() => setMessage({ text: '', type: null }), 3000);
      });
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('bento_token');
      localStorage.removeItem('bento_username');
      localStorage.removeItem('bento_photo_index');
    }
    router.push('/');
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Yusei+Magic&display=swap');
      `}</style>

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-64 bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        style={{ boxShadow: '0 0 10px rgba(0,0,0,0.1)' }}
      >
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 flex items-center justify-center">
              <img
                src={`/profiles/${photoIndex}.svg`}
                alt="Profile"
                className="w-full h-full object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/profiles/0.svg';
                }}
              />
            </div>
            <span className="font-medium text-gray-900 truncate max-w-[120px]">
              {username || 'User'}
            </span>
          </div>
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
        <nav className="p-4 space-y-3 border-t border-gray-200">
          <Link
            href="/home"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/leaderboard"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Leaderboard
          </Link>
          <Link
            href="/friends"
            className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-md"
            onClick={() => setSidebarOpen(false)}
          >
            Friends
          </Link>
          <button
            onClick={() => {
              handleLogout();
              setSidebarOpen(false);
            }}
            className="w-full text-left px-4 py-2 text-red-600 hover:bg-gray-50 rounded-md"
          >
            Logout
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`min-h-screen bg-white ${rubik.variable} font-sans`}>
        <div className="relative">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-gray-200 focus:outline-none"
              aria-label="Open menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="max-w-md mx-auto px-4 pb-8">
            {message.text && (
              <div 
                className={`mb-4 p-3 text-center rounded-lg text-white transition-opacity duration-300 ${
                  message.type === 'success' 
                    ? 'bg-green-500' 
                    : message.type === 'error' 
                      ? 'bg-red-500' 
                      : ''
                }`}
              >
                {message.text}
              </div>
            )}

            <div className="bg-white p-6 rounded-lg border border-gray-300">
              <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center" style={yuseiMagic}>
                Add Friends
              </h1>
              
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Friend Code</h2>
                <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-between border border-gray-200">
                  <span className="font-mono text-sm break-all">{userToken}</span>
                  <button
                    onClick={copyToClipboard}
                    className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 transition-colors"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Share this code with friends so they can add you
                </p>
              </div>

              <form onSubmit={handleAddFriend} className="space-y-4">
                <div>
                  <label htmlFor="friendToken" className="block text-sm font-medium text-gray-700 mb-2">
                    Enter Friend's Code
                  </label>
                  <input
                    id="friendToken"
                    type="text"
                    value={friendToken}
                    onChange={(e) => setFriendToken(e.target.value)}
                    placeholder="Enter friend's token"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    disabled={isLoading}
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isLoading ? 'Adding Friend...' : 'Add Friend'}
                </button>
              </form>
            </div>
            
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/leaderboard')}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                View Leaderboard →
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
// pages/AddFriendPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AddFriendPage() {
  const [friendToken, setFriendToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userToken, setUserToken] = useState('');
  const [username, setUsername] = useState('');
  const [shareUrl, setShareUrl] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | null }>({
    text: '',
    type: null,
  });

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('bento_token');
    const user = localStorage.getItem('bento_username');
    
    if (!token || !user) {
      router.push('/login');
      return;
    }
    
    setUserToken(token);
    setUsername(user);
    
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 p-4">
      <div className="max-w-md mx-auto">
        {message.text && (
          <div 
            className={`mb-4 p-3 rounded-lg text-white text-center transition-opacity duration-300 ${
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
        
        <div className="bg-white rounded-2xl shadow-xl p-6 mt-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">Add Friends</h1>
          
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-700 mb-3">Your Friend Code</h2>
            <div className="bg-gray-100 rounded-lg p-4 flex items-center justify-between">
              <span className="font-mono text-sm break-all">{userToken}</span>
              <button
                onClick={copyToClipboard}
                className="ml-2 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm"
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
  );
}
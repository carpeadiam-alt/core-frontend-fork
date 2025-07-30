'use client'

import { useState, useEffect } from 'react'
import { Rubik } from 'next/font/google';

const rubik = Rubik({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-rubik',
});

// Sample data - fallback if API fails
const sampleData = [
  {"punchline":"I have a bream.","setup":"What did MLK say to the fishmonger?"},
  {"punchline":"They have sects.","setup":"How do religions reproduce?"},
  {"punchline":"Because they're paid to.","setup":"Why do people at work always laugh at my jokes?"},
  {"punchline":"He didn't pass.","setup":"How did Kobe Bryant go on his math test?"},
  {"punchline":"A key.","setup":"What hangs at a man's thigh, and wants to poke the hole it's often poked before?"},
  {"punchline":"Ten Roofies.","setup":"What is Bill Cosby's favorite flavor of ice cream?"},
  {"punchline":"rabbit farts","setup":"what's invisible and smells like carrots?"},
  {"punchline":"He sai'd","setup":"What did the ninja do when he failed to kill his target?"}
]

export default function JokeFlashcards() {
  const [jokes, setJokes] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Load jokes on component mount
  useEffect(() => {
    const loadJokes = async () => {
      try {
        setLoading(true)
        const response = await fetch('https://thecodeworks.in/core/punchline')
        if (!response.ok) throw new Error('Failed to fetch jokes')
        const data = await response.json()
        setJokes(data)
      } catch (err) {
        console.error('Failed to load jokes:', err)
        setJokes(sampleData) // Fallback to sample data
        setError('Using sample data - API unavailable')
      } finally {
        setLoading(false)
      }
    }
    
    loadJokes()
  }, [])

  const handleCardClick = () => {
    setIsFlipped(!isFlipped)
  }

  const nextJoke = () => {
    setCurrentIndex((prev) => (prev + 1) % jokes.length)
    setIsFlipped(false)
  }

  const prevJoke = () => {
    setCurrentIndex((prev) => (prev - 1 + jokes.length) % jokes.length)
    setIsFlipped(false)
  }

  const resetCard = () => {
    setIsFlipped(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading jokes...</p>
        </div>
      </div>
    )
  }

  if (jokes.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 text-lg">No jokes available</p>
        </div>
      </div>
    )
  }

  const currentJoke = jokes[currentIndex]

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Joke Cards</h1>
            <p className="text-sm text-gray-600 mt-1">Click the card to reveal the punchline</p>
          </div>
          {error && (
            <div className="text-xs text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
              {error}
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Card Counter */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center bg-white rounded-full px-4 py-2 shadow-sm border border-gray-200">
              <span className="text-sm font-medium text-gray-700">
                {currentIndex + 1} of {jokes.length}
              </span>
            </div>
          </div>

          {/* Card Container */}
          <div className="relative flex items-center justify-center">
            {/* Previous Button */}
            <button
              onClick={prevJoke}
              disabled={jokes.length <= 1}
              className="absolute left-0 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Card */}
            <div className="perspective-1000 mx-16">
              <div
                className={`relative w-96 h-64 cursor-pointer transition-transform duration-700 transform-style-3d ${
                  isFlipped ? 'rotate-y-180' : ''
                }`}
                onClick={handleCardClick}
                style={{
                  transform: `${isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'} rotate(-2deg)`,
                  transformStyle: 'preserve-3d'
                }}
              >
                {/* Front of card */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-8 flex items-center justify-center backface-hidden"
                  style={{ backfaceVisibility: 'hidden' }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                      Setup
                    </div>
                    <p className="text-xl font-medium text-gray-900 leading-relaxed">
                      {currentJoke.setup}
                    </p>
                    <div className="mt-6 text-xs text-gray-400">
                      Click to reveal punchline
                    </div>
                  </div>
                </div>

                {/* Back of card */}
                <div
                  className="absolute inset-0 bg-white rounded-2xl shadow-xl border border-gray-200 p-8 flex items-center justify-center backface-hidden"
                  style={{ 
                    backfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)'
                  }}
                >
                  <div className="text-center">
                    <div className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                      Punchline
                    </div>
                    <p className="text-xl font-medium text-gray-900 leading-relaxed">
                      {currentJoke.punchline}
                    </p>
                    <div className="mt-6 text-xs text-gray-400">
                      Click to see setup again
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Next Button */}
            <button
              onClick={nextJoke}
              disabled={jokes.length <= 1}
              className="absolute right-0 z-10 p-3 rounded-full bg-white shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Controls */}
          <div className="flex justify-center mt-8 gap-4">
            <button
              onClick={resetCard}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 text-sm font-medium text-gray-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reset Card
            </button>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center mt-8 gap-2">
            {jokes.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentIndex(index)
                  setIsFlipped(false)
                }}
                className={`w-2 h-2 rounded-full transition-all duration-200 ${
                  index === currentIndex
                    ? 'bg-gray-900 w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
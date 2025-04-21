'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getJoke } from '@/lib/gemini';

interface Joke {
  style: string;
  theme: string;
  setup?: string;
  punchline?: string;
  content: string;
}

export default function Home() {
  const [jokes, setJokes] = useState<Joke[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchJokes = async () => {
    setLoading(true);
    try {
      const newJokes = await getJoke();
      setJokes(newJokes);
    } catch (error) {
      console.error('Error fetching jokes:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-8">Joke Time! 😄</h1>
        
        <div className="min-h-[400px] flex flex-col items-center justify-center mb-8 space-y-6">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          ) : jokes.length > 0 ? (
            <div className="space-y-8 w-full">
              {jokes.map((joke, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.2 }}
                  className="bg-purple-50 rounded-xl p-6 text-left"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-full text-sm font-medium">
                      {joke.style}
                    </span>
                    <span className="px-3 py-1 bg-pink-200 text-pink-700 rounded-full text-sm font-medium">
                      {joke.theme}
                    </span>
                  </div>
                  {joke.setup && joke.punchline ? (
                    <div className="space-y-2">
                      <p className="text-gray-700">{joke.setup}</p>
                      <p className="text-purple-700 font-medium">{joke.punchline}</p>
                    </div>
                  ) : (
                    <p className="text-gray-700">{joke.content}</p>
                  )}
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">Click the button below to get some jokes!</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchJokes}
          disabled={loading}
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Tell me some jokes!'}
        </motion.button>
      </motion.div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { getJoke } from '@/lib/gemini';

export default function Home() {
  const [joke, setJoke] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const fetchJoke = async () => {
    setLoading(true);
    try {
      const newJoke = await getJoke();
      setJoke(newJoke);
    } catch (error) {
      console.error('Error fetching joke:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-100 to-pink-100 flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 text-center"
      >
        <h1 className="text-4xl font-bold text-purple-600 mb-8">Joke Time! 😄</h1>
        
        <div className="min-h-[200px] flex items-center justify-center mb-8">
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"
            />
          ) : joke ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xl text-gray-700"
            >
              {joke}
            </motion.p>
          ) : (
            <p className="text-gray-500">Click the button below to get a joke!</p>
          )}
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={fetchJoke}
          disabled={loading}
          className="bg-purple-600 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Loading...' : 'Tell me a joke!'}
        </motion.button>
      </motion.div>
    </main>
  );
}

import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { motion } from 'motion/react';

interface JoinProps {
  onJoin: (username: string) => void;
}

export default function Join({ onJoin }: JoinProps) {
  const [username, setUsername] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      onJoin(username.trim());
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 bg-zinc-900">
      <motion.div 
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md bg-zinc-800 rounded-2xl p-6 shadow-xl border border-zinc-700/50"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-indigo-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-indigo-500/20">
            <MessageSquare className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-zinc-400 text-center">Enter a username to join the chat room.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="How should we call you?"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
              maxLength={20}
              autoFocus
              required
            />
          </div>
          
          <button
            type="submit"
            disabled={!username.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-700 disabled:text-zinc-500 text-white font-medium py-3 rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-zinc-800"
          >
            Join Room
          </button>
        </form>
      </motion.div>
    </div>
  );
}

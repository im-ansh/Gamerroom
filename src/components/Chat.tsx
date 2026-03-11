import React, { useState, useRef, useEffect } from 'react';
import { User, Message } from '../types';
import { Menu, Hash, Users, Send, X } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'motion/react';

interface ChatProps {
  currentUser: User;
  users: User[];
  messages: Message[];
  onSendMessage: (text: string) => void;
}

export default function Chat({ currentUser, users, messages, onSendMessage }: ChatProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      onSendMessage(inputText.trim());
      setInputText('');
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full relative overflow-hidden bg-zinc-800">
      {/* Header */}
      <header className="h-14 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 z-10 shadow-sm">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-2 rounded-lg text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 transition-colors md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2 text-zinc-100 font-semibold">
            <Hash className="w-5 h-5 text-zinc-500" />
            <span>general</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
            <Users className="w-4 h-4" />
            <span>{users.length}</span>
          </div>
          <div className="hidden md:flex items-center gap-2">
            <div 
              className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm"
              style={{ backgroundColor: currentUser.color }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-zinc-300">{currentUser.username}</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden relative">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-zinc-800">
          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6 scroll-smooth">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-zinc-500 space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center border border-zinc-700">
                  <Hash className="w-8 h-8 text-zinc-600" />
                </div>
                <div className="text-center">
                  <h3 className="text-xl font-bold text-zinc-300 mb-1">Welcome to #general!</h3>
                  <p className="text-sm">This is the start of the #general channel.</p>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => {
                const isSystem = msg.userId === 'system';
                const isConsecutive = index > 0 && 
                                      messages[index - 1].userId === msg.userId && 
                                      !isSystem &&
                                      (msg.timestamp - messages[index - 1].timestamp < 300000); // 5 mins

                if (isSystem) {
                  return (
                    <div key={msg.id} className="flex items-center justify-center my-4">
                      <div className="bg-zinc-800/80 px-4 py-1.5 rounded-full text-xs font-medium text-zinc-400 border border-zinc-700/50 shadow-sm">
                        {msg.text}
                      </div>
                    </div>
                  );
                }

                return (
                  <div key={msg.id} className={`flex gap-4 group ${isConsecutive ? 'mt-1' : 'mt-6'}`}>
                    {/* Avatar */}
                    <div className="shrink-0 w-10 flex justify-center">
                      {!isConsecutive ? (
                        <div 
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm"
                          style={{ backgroundColor: msg.color }}
                        >
                          {msg.username.charAt(0).toUpperCase()}
                        </div>
                      ) : (
                        <div className="w-10 text-[10px] text-zinc-500 opacity-0 group-hover:opacity-100 text-center pt-1">
                          {format(msg.timestamp, 'HH:mm')}
                        </div>
                      )}
                    </div>
                    
                    {/* Message Content */}
                    <div className="flex-1 min-w-0">
                      {!isConsecutive && (
                        <div className="flex items-baseline gap-2 mb-1">
                          <span 
                            className="font-semibold text-[15px] hover:underline cursor-pointer"
                            style={{ color: msg.color }}
                          >
                            {msg.username}
                          </span>
                          <span className="text-xs text-zinc-500 font-medium">
                            {format(msg.timestamp, 'MM/dd/yyyy HH:mm')}
                          </span>
                        </div>
                      )}
                      <div className="text-zinc-200 text-[15px] leading-relaxed break-words whitespace-pre-wrap">
                        {msg.text}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} className="h-1" />
          </div>

          {/* Message Input */}
          <div className="p-4 bg-zinc-800 shrink-0">
            <form onSubmit={handleSend} className="relative flex items-end bg-zinc-700 rounded-xl border border-zinc-600 focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500 transition-all shadow-sm">
              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                placeholder="Message #general"
                className="w-full bg-transparent text-zinc-100 placeholder:text-zinc-400 px-4 py-3.5 max-h-32 min-h-[52px] resize-none focus:outline-none"
                rows={1}
              />
              <div className="p-2 shrink-0">
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="p-2 bg-indigo-500 hover:bg-indigo-600 disabled:bg-zinc-600 disabled:text-zinc-400 text-white rounded-lg transition-colors flex items-center justify-center shadow-sm"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
            <div className="mt-2 text-xs text-zinc-500 text-center md:text-left px-2">
              <span className="hidden md:inline">Press Enter to send, Shift + Enter for new line.</span>
            </div>
          </div>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
                onClick={() => setIsSidebarOpen(false)}
              />
              <motion.div
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-y-0 left-0 w-72 bg-zinc-900 border-r border-zinc-800 z-30 flex flex-col shadow-2xl md:relative md:translate-x-0 md:w-64 md:border-l md:border-r-0 md:shadow-none"
              >
                <div className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-900/95 backdrop-blur">
                  <h2 className="font-bold text-zinc-100">Online Users</h2>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 -mr-2 text-zinc-400 hover:text-zinc-100 md:hidden rounded-lg hover:bg-zinc-800 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex-1 overflow-y-auto p-3 space-y-1">
                  <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 py-2 mb-1">
                    Online — {users.length}
                  </div>
                  {users.map(user => (
                    <div 
                      key={user.id} 
                      className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer group"
                    >
                      <div className="relative">
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                          style={{ backgroundColor: user.color }}
                        >
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                      </div>
                      <span className="font-medium text-zinc-300 group-hover:text-zinc-100 truncate">
                        {user.username}
                        {user.id === currentUser.id && <span className="ml-2 text-xs text-zinc-500 font-normal">(You)</span>}
                      </span>
                    </div>
                  ))}
                </div>
                
                {/* Current User Profile (Mobile only) */}
                <div className="p-4 bg-zinc-900/95 border-t border-zinc-800 md:hidden shrink-0">
                  <div className="flex items-center gap-3 bg-zinc-800/50 p-3 rounded-xl border border-zinc-700/50">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm"
                      style={{ backgroundColor: currentUser.color }}
                    >
                      {currentUser.username.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-zinc-100 truncate">{currentUser.username}</div>
                      <div className="text-xs text-zinc-400 truncate">Online</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
        
        {/* Desktop Sidebar */}
        <div className="hidden md:flex flex-col w-64 bg-zinc-900 border-l border-zinc-800 shrink-0">
          <div className="h-14 border-b border-zinc-800 flex items-center px-4 shrink-0">
            <h2 className="font-bold text-zinc-100">Online Users</h2>
          </div>
          
          <div className="flex-1 overflow-y-auto p-3 space-y-1">
            <div className="text-xs font-bold text-zinc-500 uppercase tracking-wider px-2 py-2 mb-1">
              Online — {users.length}
            </div>
            {users.map(user => (
              <div 
                key={user.id} 
                className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800/80 transition-colors cursor-pointer group"
              >
                <div className="relative">
                  <div 
                    className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-zinc-900 rounded-full"></div>
                </div>
                <span className="font-medium text-zinc-300 group-hover:text-zinc-100 truncate">
                  {user.username}
                  {user.id === currentUser.id && <span className="ml-2 text-xs text-zinc-500 font-normal">(You)</span>}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

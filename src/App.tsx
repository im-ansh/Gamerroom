import { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import { User, Message } from './types';
import Join from './components/Join';
import Chat from './components/Chat';

// Connect to the same host that serves the page
const socket: Socket = io();

export default function App() {
  const [isConnected, setIsConnected] = useState(socket.connected);
  const [isJoined, setIsJoined] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    function onConnect() {
      setIsConnected(true);
    }

    function onDisconnect() {
      setIsConnected(false);
      setIsJoined(false);
      setCurrentUser(null);
    }

    function onInit(data: { users: User[], messages: Message[] }) {
      setUsers(data.users);
      setMessages(data.messages);
      
      // Find current user
      const me = data.users.find(u => u.id === socket.id);
      if (me) {
        setCurrentUser(me);
        setIsJoined(true);
      }
    }

    function onUserJoined(user: User) {
      setUsers(prev => [...prev, user]);
    }

    function onUserLeft(userId: string) {
      setUsers(prev => prev.filter(u => u.id !== userId));
    }

    function onMessage(message: Message) {
      setMessages(prev => {
        const newMessages = [...prev, message];
        // Keep only last 100 messages in client memory
        if (newMessages.length > 100) {
          return newMessages.slice(newMessages.length - 100);
        }
        return newMessages;
      });
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('init', onInit);
    socket.on('userJoined', onUserJoined);
    socket.on('userLeft', onUserLeft);
    socket.on('message', onMessage);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('init', onInit);
      socket.off('userJoined', onUserJoined);
      socket.off('userLeft', onUserLeft);
      socket.off('message', onMessage);
    };
  }, []);

  const handleJoin = (username: string) => {
    socket.emit('join', username);
  };

  const handleSendMessage = (text: string) => {
    socket.emit('sendMessage', text);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-zinc-900 text-zinc-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-zinc-400 font-medium">Connecting to server...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-[100dvh] w-full bg-zinc-900 text-zinc-100 overflow-hidden flex flex-col font-sans">
      {!isJoined ? (
        <Join onJoin={handleJoin} />
      ) : (
        <Chat 
          currentUser={currentUser!} 
          users={users} 
          messages={messages} 
          onSendMessage={handleSendMessage} 
        />
      )}
    </div>
  );
}

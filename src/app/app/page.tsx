'use client';

import { useEffect, useState, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, query, orderBy, limit, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase/config';
import { ScrollText, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

export default function Chat() {
  const [user, setUser] = useState(null);
  const [messages, setMessages] = useState<Array<{ id: string; text: string; from: 'user' | 'agent' }>>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Firebase auth (anonymous for simplicity)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
      } else {
        // Sign in anonymously if no user
        signInAnonymously(auth).catch(console.error);
      }
    });

    return () => unsubscribe();
  }, []);

  // Load messages when user is authenticated
  useEffect(() => {
    if (!user) return;

    const messagesRef = collection(db, 'users', user.uid, 'chats', 'latest', 'messages');
    const q = query(messagesRef, orderBy('timestamp', 'asc'), limit(100));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const loadedMessages = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Array<{ id: string; text: string; from: 'user' | 'agent' }>;
      setMessages(loadedMessages);
      // Scroll to bottom
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [user]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || !user) return;

    const text = input.trim();
    setInput('');
    setLoading(true);

    try {
      // Add user message to Firestore
      await addDoc(collection(db, 'users', user.uid, 'chats', 'latest', 'messages'), {
        text,
        from: 'user',
        timestamp: serverTimestamp(),
      });

      // Call backend API to get agent response (which will also store agent message)
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: text }),
      });

      if (!response.ok) {
        throw new Error('Failed to get agent response');
      }

      const data = await response.json();
      // The agent's response is already stored by the backend, so we just wait for snapshot to update
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally add an error message
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-b from-emerald-900 to-black">
        <div className="text-center">
          <Loader2 className="h-8 w-8 text-emerald-400 mb-4 mx-auto" />
          <p className="text-emerald-300">Connexion à KONGOX AI...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-b from-emerald-900 to-black">
      <header className="bg-emerald-900/50 backdrop-blur-sm border-b border-emerald-800/50 px-4 py-3">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <LucideReact className="h-5 w-5" /> KONGOX AI
          </h1>
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <span>Connecté en tant qu'utilisateur anonym</span>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`max-w-[80%] ${
              msg.from === 'user'
                ? 'ml-auto bg-emerald-800/50 rounded-br-lg rounded-bl-lg rounded-tl-lg'
                : 'mr-auto bg-emerald-900/50 rounded-br-lg rounded-bl-lg rounded-tr-lg'
            } p-3`}
          >
            <p className="text-emerald-100">{msg.text}</p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </main>

      <form onSubmit={sendMessage} className="flex items-center gap-2 px-4 py-3 bg-emerald-900/50 backdrop-blur-sm border-t border-emerald-800/50">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Message KONGOX AI..."
          className="flex-1 min-h-[44px] resize-none rounded-md bg-emerald-800/50 border border-emerald-700/50 px-3 py-2 text-emerald-100 placeholder-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md flex items-center gap-2 transition-colors disabled:opacity-50"
        >
          <Send className="h-4 w-4" />
          Envoyer
        </button>
      </form>
    </div>
  );
}
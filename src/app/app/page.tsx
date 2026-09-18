'use client';

import { useState, useEffect } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { ScrollText, Loader2, Send } from 'lucide-react';
import clsx from 'clsx';

interface Message {
  role: 'user' | 'model';
  text: string;
}

export default function Chat() {
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!auth || !auth.app) return;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    setInput('');
    
    // 1. Ajouter immédiatement le message de l'utilisateur à l'écran
    const newMessages: Message[] = [...messages, { role: 'user', text: userText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userText }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Erreur lors de la réponse API');
      }

      // 2. Ajouter la réponse de l'IA à l'écran
      setMessages([...newMessages, { role: 'model', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'model', text: `Erreur: ${err.message || 'Impossible de contacter le serveur.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-900 text-white">
      <header className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-800">
        <ScrollText className="w-6 h-6 text-blue-400" />
        <h1 className="text-xl font-bold">KONGOX AI</h1>
      </header>

      <div className="flex-1 overflow-y-auto space-y-4 mb-4 p-2">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={clsx('p-3 rounded-lg max-w-[80%] text-sm md:text-base', {
              'bg-blue-600 text-white ml-auto': msg.role === 'user',
              'bg-gray-800 text-gray-100 mr-auto border border-gray-700': msg.role === 'model',
            })}
          >
            {msg.text}
          </div>
        ))}
        {loading && (
          <div className="bg-gray-800 text-gray-400 p-3 rounded-lg mr-auto border border-gray-700 flex items-center gap-2 max-w-[80%]">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>KONGOX AI réfléchit...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Posez votre question..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 flex items-center justify-center transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
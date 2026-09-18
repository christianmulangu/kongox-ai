'use client';

import { useState, useEffect, useRef } from 'react';
import { onAuthStateChanged, signInAnonymously, User } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { ScrollText, Loader2, Send, Bot, User as UserIcon } from 'lucide-react';
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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll vers le dernier message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  // Connexion anonyme Firebase
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
        throw new Error(data.error || 'Erreur de communication avec le serveur');
      }

      setMessages([...newMessages, { role: 'model', text: data.response }]);
    } catch (err: any) {
      console.error(err);
      setMessages([
        ...newMessages,
        { role: 'model', text: `Erreur: ${err.message || 'Impossible de joindre le serveur.'}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto p-4 bg-gray-900 text-white">
      {/* Header */}
      <header className="flex items-center justify-between pb-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-blue-400" />
          <h1 className="text-xl font-bold">KONGOX AI</h1>
        </div>
        {user && (
          <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
            ID: {user.uid.slice(0, 6)}...
          </span>
        )}
      </header>

      {/* Zone de conversation */}
      <div className="flex-1 overflow-y-auto space-y-4 my-4 p-2">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <Bot className="w-12 h-12 mb-2 text-gray-600" />
            <p>Posez votre première question à KONGOX AI</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div
              key={index}
              className={clsx('flex gap-3 max-w-[85%]', {
                'ml-auto flex-row-reverse': msg.role === 'user',
                'mr-auto': msg.role === 'model',
              })}
            >
              <div
                className={clsx('w-8 h-8 rounded-full flex items-center justify-center shrink-0', {
                  'bg-blue-600': msg.role === 'user',
                  'bg-gray-700': msg.role === 'model',
                })}
              >
                {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div
                className={clsx('p-3 rounded-lg text-sm md:text-base whitespace-pre-wrap', {
                  'bg-blue-600 text-white': msg.role === 'user',
                  'bg-gray-800 text-gray-100 border border-gray-700': msg.role === 'model',
                })}
              >
                {msg.text}
              </div>
            </div>
          ))
        )}

        {loading && (
          <div className="flex gap-3 mr-auto max-w-[85%] items-center">
            <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4 text-blue-400" />
            </div>
            <div className="bg-gray-800 text-gray-400 p-3 rounded-lg border border-gray-700 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-400" />
              <span>KONGOX AI formule sa réponse...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Formulaire d'envoi */}
      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Écrivez votre message..."
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 rounded-lg disabled:opacity-50 flex items-center justify-center transition-colors"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        </button>
      </form>
    </div>
  );
}
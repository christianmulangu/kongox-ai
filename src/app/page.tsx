import Link from 'next/link';
import { Sparkles, Brain, ShieldCheck, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <Sparkles className="w-8 h-8 text-yellow-500" />
          KONGOX AI
        </h1>
        <Link
          href="/app"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Ouvrir l'application
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-12 w-full max-w-5xl">
        <div className="p-6 border rounded-xl flex flex-col items-center text-center gap-3">
          <Brain className="w-10 h-10 text-blue-500" />
          <h2 className="text-xl font-bold">Intelligence Avancée</h2>
          <p className="text-gray-500">Propulsé par les derniers modèles Gemini 1.5 Pro.</p>
        </div>

        <div className="p-6 border rounded-xl flex flex-col items-center text-center gap-3">
          <ShieldCheck className="w-10 h-10 text-green-500" />
          <h2 className="text-xl font-bold">Sécurisé & Fiable</h2>
          <p className="text-gray-500">Authentification et persistance gérées via Firebase.</p>
        </div>

        <div className="p-6 border rounded-xl flex flex-col items-center text-center gap-3">
          <Terminal className="w-10 h-10 text-purple-500" />
          <h2 className="text-xl font-bold">Performances Dev</h2>
          <p className="text-gray-500">Déployé sur l'infrastructure Vercel Edge Network.</p>
        </div>
      </div>
    </main>
  );
}
import Link from 'next/link';
import { LucideReact, Sparkles, Brain, ShieldCheck, Terminal } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-900 to-black text-white">
      <header className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5" /> KONGOX AI
            </h1>
            <Link href="/app" className="flex items-center gap-2 px-4 py-2 bg-emerald-600/20 rounded-lg hover:bg-emerald-600/30 transition-colors">
              <Terminal className="h-4 w-4" />
              <span>Commencer</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <section className="text-center">
          <h2 className="text-4xl font-bold mb-6">
            L'agent qui agit pour toi
          </h2>
          <p className="text-xl text-emerald-300 mb-8 max-w-2xl mx-auto">
            KONGOX AI est un agent autonome moderne capable de comprendre un objectif utilisateur,
            d'exécuter des outils (calcul, recherche web, structuration de document) et de fournir
            un résultat complet et structuré.
          </p>
        </section>

        <section className="grid gap-8 mt-16 sm:grid-cols-2 lg:grid-cols-4">
          <div className="text-center bg-emerald-900/50 rounded-lg p-6">
            <Brain className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
            <h3 className="font-semibold mb-2">Compréhension avancée</h3>
            <p className="text-emerald-300">
              Analyse vos intentions et décompose les objectifs en étapes exécutables.
            </p>
          </div>

          <div className="text-center bg-emerald-900/50 rounded-lg p-6">
            <Sparkles className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
            <h3 className="font-semibold mb-2">Outils puissants</h3>
            <p className="text-emerald-300">
              Calculatrice, recherche web, structuration de documents et bien plus encore.
            </p>
          </div>

          <div className="text-center bg-emerald-900/50 rounded-lg p-6">
            <ShieldCheck className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
            <h3 className="font-semibold mb-2">Sécurisé & privé</h3>
            <p className="text-emerald-300">
              Vos données restent protégées grâce à Firebase et à l'exécution côté serveur.
            </p>
          </div>

          <div className="text-center bg-emerald-900/50 rounded-lg p-6">
            <Terminal className="mx-auto h-10 w-10 text-emerald-400 mb-4" />
            <h3 className="font-semibold mb-2">Mode ReAct</h3>
            <p className="text-emerald-300">
              Boucle d'orchestration qui raisonne, agit et observe jusqu'à atteindre l'objectif.
            </p>
          </div>
        </section>

        <section className="mt-20 text-center">
          <Link href="/app" className="inline-block px-8 py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center gap-3">
            <Terminal className="h-5 w-5" />
            <span>Essayer KONGOX AI</span>
          </Link>
        </section>
      </main>

      <footer className="py-8 text-emerald-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p>&copy; {new Date().getFullYear()} KONGOX AI. Tous droits réservés.</p>
        </div>
      </footer>
    </div>
  );
}
import Image from "next/image";
import AuthForm from "./components/AuthForm";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-800 p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden w-full max-w-md border border-white/20">
        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-10 w-10 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
                />
              </svg>
            </div>
          </div>
          
          <h2 className="text-white text-3xl font-bold mb-2 text-center font-sans">
            Bienvenue sur <span className="text-cyan-300">SmartEnglish+</span>
          </h2>
          
          <p className="text-white/80 text-center mb-8 text-lg">
            Connectez-vous pour accéder à votre coaching d'anglais personnalisé
          </p>
          
          <AuthForm />
          
          <div className="mt-6 text-center">
            <p className="text-sm text-white/60">
              Nouveau sur SmartEnglish+?{' '}
              <a href="#" className="text-cyan-300 hover:text-cyan-200 font-medium transition">
                Créer un compte
              </a>
            </p>
          </div>
        </div>
        
        <div className="bg-black/20 px-6 py-4 text-center">
          <p className="text-xs text-white/50">
            © {new Date().getFullYear()} SmartEnglish+. Tous droits réservés.
          </p>
        </div>
      </div>
    </main>
  );
}
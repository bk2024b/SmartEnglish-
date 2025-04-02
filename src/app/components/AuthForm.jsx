'use client'
import { useState } from "react";
import { supabase } from "../utils/supabaseClient.js";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isNewUser, setIsNewUser] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleLogin(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email, 
      password
    });

    if (authError) {
      setError(authError.message);
      setIsLoading(false);
    } else {
      router.push('/dashboard');
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          display_name: fullName
        }
      }
    });
    
    if (signUpError) {
      setError(signUpError.message);
      setIsLoading(false);
      return;
    }
    
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email, 
      password
    });
    
    if (signInError) {
      setError(signInError.message);
      setIsLoading(false);
      return;
    }
    
    router.push('/dashboard');
  }

  return (
    <div className="space-y-6 w-full">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-white">
          {isNewUser ? 'Créer un compte' : 'Connectez-vous'}
        </h2>
        <p className="mt-2 text-white/80">
          {isNewUser ? 'Commencez votre voyage linguistique' : 'Reprenez votre apprentissage'}
        </p>
      </div>

      {error && (
        <div className="bg-red-500/20 border border-red-500/50 text-red-100 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <form onSubmit={isNewUser ? handleSignUp : handleLogin} className="space-y-5">
        {isNewUser && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-white/80">Nom complet</label>
            <div className="relative">
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent placeholder-white/30 transition-all duration-200"
                placeholder="Prénom et Nom"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-sm font-medium text-white/80">Adresse email</label>
          <div className="relative">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent placeholder-white/30 transition-all duration-200"
              placeholder="email@exemple.com"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-1">
          <label className="block text-sm font-medium text-white/80">Mot de passe</label>
          <div className="relative">
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:border-transparent placeholder-white/30 transition-all duration-200"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="h-5 w-5 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full flex justify-center items-center py-3 px-4 rounded-lg font-medium transition-all duration-300 ${isLoading 
              ? 'bg-cyan-400/80 cursor-not-allowed' 
              : 'bg-cyan-400 hover:bg-cyan-300 shadow-lg hover:shadow-cyan-400/30'}`}
          >
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {isNewUser ? 'Inscription...' : 'Connexion...'}
              </>
            ) : (
              isNewUser ? 'S\'inscrire' : 'Se connecter'
            )}
          </button>
        </div>
      </form>

      <div className="text-center text-sm text-white/70">
        <button
          type="button"
          onClick={() => setIsNewUser(!isNewUser)}
          className="font-medium text-cyan-300 hover:text-cyan-200 underline underline-offset-4 transition-colors"
        >
          {isNewUser 
            ? 'Vous avez déjà un compte? Se connecter' 
            : 'Pas encore de compte? S\'inscrire'}
        </button>
      </div>
    </div>
  );
}
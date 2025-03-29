'use client'
import { useState } from "react";
import { supabase } from "../utils/supabaseClient.js";
import { useRouter } from "next/navigation";

export default function AuthForm() {
  const [isNewUser, setIsNewUser] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const router = useRouter()

  async function handleLogin(e) {
    e.preventDefault();
    setIsSigningIn(true)
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    })
    console.log({ error, data })
    if (!error) {
      router.push('/dashboard')
    } else {
      setIsSigningIn(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault();
    setIsSigningUp(true)
    const { data, error } = await supabase.auth.signUp({
      email,
      password
    })
    if (!error) {
      setIsSigningUp(true)
    } else {
      setIsSigningUp(false)
    }
    console.log({data, error})
  }

  let signInMessage = 'Se connecter';
  if (isSigningIn) {
    signInMessage = 'Connexion...'
  } else if (isNewUser) {
    signInMessage = 'S\'inscrire'
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {isNewUser ? 'Créer un compte' : 'Connexion à votre compte'}
          </h2>
        </div>
        <form onSubmit={isNewUser ? handleSignUp : handleLogin} className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Adresse email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-4 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSigningIn || isSigningUp}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 ease-in-out disabled:bg-indigo-400"
            >
              {isSigningIn || isSigningUp ? (
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : null}
              {signInMessage}
            </button>
          </div>

          <div className="text-sm text-center">
            {isNewUser ? (
              <p>
                Vous avez déjà un compte? {' '}
                <button
                  type="button"
                  onClick={() => setIsNewUser(false)}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  Se connecter
                </button>
              </p>
            ) : (
              <p>
                Vous n'avez pas de compte? {' '}
                <button
                  type="button"
                  onClick={() => setIsNewUser(true)}
                  className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none"
                >
                  S'inscrire
                </button>
              </p>
            )}
          </div>

          {isSigningUp && (
            <div className="mt-4 p-4 bg-green-100 rounded-md">
              <p className="text-center text-green-800">
                Email de confirmation envoyé ! Vérifiez votre mail pour confirmer votre inscription.
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
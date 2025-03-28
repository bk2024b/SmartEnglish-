'use client'
import { useState } from "react";
import { supabase } from "../utils/supabaseClient.js";

export default function AuthForm() {
    const [isNewUser, setIsNewUser] = useState(false)
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [isSigningIn, setIsSigningIn] = useState(false)
    const [isSigningUp, setIsSigningUp] = useState(false)

    async function handleLogin(e) {
        e.preventDefault();
        // handleLogin
    }

    async function handleSignUp(e) {
        e.preventDefault();
        // handleSignUp
        const { data, error } = await supabase.auth.signUp({
            email,
            password
        })
        if (!error) {
            setIsSigningUp(true)
        }
        console.log({data, error})
    }

    let signInMessage = 'Se connecter';

    if (isSigningIn) {
        signInMessage = 'Connexion'
    } else if (isNewUser) {
        signInMessage = 'S\'inscrire'
    }

    const signUpMessage = <p className="text-center text-white"> Email de confirmation envoyé ! Vérifiez votre mail pour confirmer votre inscription.</p>

    return (
        <form onSubmit={isNewUser ? handleSignUp : handleLogin} className="space-y-8">
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-600"
                placeholder="Email"
            />
            <input
                type="password"
                value={password} 
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-600"
                placeholder="Mot de passe"
            />
            <button type="submit" className="group relative w-full flex justify-center py-2 px-4 border ">
                {signInMessage}
            </button>
            <p>
                {
                    isNewUser ? (
                        <>
                            Vous avez déjà un compte? {''}
                            <button
                                type="button"
                                onClick={() => setIsNewUser(false)}
                                className="text-indigo-400 hover:text-indigo-600"
                            >
                                Se connecter
                            </button>
                        </>
                    ) : (
                            <>
                                Vous n'avez pas de compte? {''}
                                <button
                                    type="button"
                                    onClick={() => setIsNewUser(true)}
                                    className="text-indigo-400 hover:text-indigo-600"
                                >
                                    S'inscrire
                                </button>
                            </>
                    )
                }
            </p>
            {
                isSigningUp && signUpMessage
            }
        </form>
    )
}
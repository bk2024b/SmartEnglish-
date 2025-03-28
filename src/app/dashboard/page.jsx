import React from 'react';
import SignOutButton from "../components/SignOutButton";

export default function Dashboard({ user, progress, xp, weekBadge, avatarUrl }) {
  // Calcul du progrès (à adapter selon votre logique)
  const daysCompleted = progress?.daysCompleted || 0;
  const totalDays = progress?.totalDays || 180; // 6 mois = ~180 jours
  const progressPercentage = Math.floor((daysCompleted / totalDays) * 100);
  
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col justify-between relative p-4">
      {/* En-tête */}
      <header className="flex justify-between items-center py-3">
        <div className="flex flex-col">
          <p className="text-sm text-gray-300">{user?.email || "Utilisateur inconnu"}</p>
          <div className="mt-1 bg-gray-700 rounded-full h-4 w-44 overflow-hidden border border-gray-600">
            <div 
              className="bg-gradient-to-r from-purple-600 to-blue-500 h-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <p className="text-xs mt-1 text-blue-300">{daysCompleted} / {totalDays} jours</p>
        </div>
        <div className="flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-2 rounded-lg font-bold shadow-lg">
          <span className="text-lg mr-1">⚡</span>
          <span>{xp || 0} XP</span>
        </div>
      </header>

      {/* Contenu : Affichage de l'avatar */}
      <section className="flex flex-col justify-center items-center mt-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-70 animate-pulse"></div>
          <img
            src={avatarUrl || "/placeholder-avatar.png"}
            alt="Avatar de l'apprenant"
            className="relative w-44 h-44 rounded-full border-4 border-yellow-400 object-cover z-10"
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-1 rounded-full border border-gray-600 z-20">
            <p className="text-xs text-center text-gray-300">Niveau {Math.floor((xp || 0) / 100) + 1}</p>
          </div>
        </div>
        
        <div className="mt-6 text-center">
          <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
            Parcours d'apprentissage
          </h2>
          <p className="text-gray-400 text-sm mt-1">Continuez vos tâches quotidiennes</p>
        </div>
      </section>

      {/* Pied de page : Menu de navigation */}
      <footer className="flex justify-around items-center py-6 px-4 bg-gray-900 rounded-t-3xl shadow-lg relative mt-auto">
        <button className="text-center w-1/3 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">📋</span>
          <span className="text-sm font-medium">Tâches</span>
        </button>
        
        <div className="relative w-1/3">
          <button className="text-center w-full transition-transform hover:scale-110">
            <span className="block text-lg mb-1">🛒</span>
            <span className="text-sm font-medium">Boutique</span>
          </button>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Semaine {weekBadge || 1}
          </span>
        </div>
        
        <button className="text-center w-1/3 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">🏆</span>
          <span className="text-sm font-medium">Activités</span>
        </button>
      </footer>

      {/* Bouton de déconnexion */}
      <div className="absolute bottom-20 right-4">
        <SignOutButton />
      </div>
    </main>
  );
}
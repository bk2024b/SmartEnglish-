import React, { useState } from 'react';
import SignOutButton from "../components/SignOutButton";

export default function TasksPage({ user, progress, xp, weekBadge }) {
  // États pour gérer l'ouverture des différents popups
  const [isReportOpen, setReportOpen] = useState(null); // 'daily', 'weekly', 'monthly' ou null
  
  // Calcul du progrès
  const daysCompleted = progress?.daysCompleted || 0;
  const totalDays = progress?.totalDays || 180; // 6 mois = ~180 jours
  const progressPercentage = Math.floor((daysCompleted / totalDays) * 100);
  
  // Rapports simulés (ces données viendraient normalement de votre backend)
  const reportsStatus = {
    daily: { completed: 15, total: 180 },
    weekly: { completed: 2, total: 24 },
    monthly: { completed: 0, total: 6 }
  };
  
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

      {/* Contenu principal: Rapports */}
      <section className="flex flex-col items-center justify-center flex-grow py-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-blue-400 bg-clip-text text-transparent mb-8">
          Mes Rapports de Progression
        </h1>
        
        <div className="w-full max-w-md space-y-4">
          {/* Rapport quotidien */}
          <div 
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-blue-500 transition-all cursor-pointer"
            onClick={() => setReportOpen('daily')}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-blue-400">Rapport Quotidien</h2>
                <p className="text-gray-400 text-sm mt-1">Suivi de vos activités journalières</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-blue-900 bg-opacity-50 rounded-lg px-3 py-1 text-sm">
                  <span className="text-blue-300 font-medium">{reportsStatus.daily.completed}</span>
                  <span className="text-gray-400">/{reportsStatus.daily.total}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">rapports complétés</span>
              </div>
            </div>
            
            <div className="mt-3 bg-gray-900 bg-opacity-50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full" 
                style={{ width: `${(reportsStatus.daily.completed / reportsStatus.daily.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Rapport hebdomadaire */}
          <div 
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-purple-500 transition-all cursor-pointer"
            onClick={() => setReportOpen('weekly')}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-purple-400">Rapport Hebdomadaire</h2>
                <p className="text-gray-400 text-sm mt-1">Bilan de votre semaine d'apprentissage</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-purple-900 bg-opacity-50 rounded-lg px-3 py-1 text-sm">
                  <span className="text-purple-300 font-medium">{reportsStatus.weekly.completed}</span>
                  <span className="text-gray-400">/{reportsStatus.weekly.total}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">rapports complétés</span>
              </div>
            </div>
            
            <div className="mt-3 bg-gray-900 bg-opacity-50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-full" 
                style={{ width: `${(reportsStatus.weekly.completed / reportsStatus.weekly.total) * 100}%` }}
              ></div>
            </div>
          </div>
          
          {/* Rapport mensuel */}
          <div 
            className="bg-gradient-to-r from-gray-800 to-gray-700 rounded-xl p-4 shadow-lg border border-gray-700 hover:border-green-500 transition-all cursor-pointer"
            onClick={() => setReportOpen('monthly')}
          >
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-green-400">Rapport Mensuel</h2>
                <p className="text-gray-400 text-sm mt-1">Synthèse mensuelle de vos progrès</p>
              </div>
              <div className="flex flex-col items-end">
                <div className="bg-green-900 bg-opacity-50 rounded-lg px-3 py-1 text-sm">
                  <span className="text-green-300 font-medium">{reportsStatus.monthly.completed}</span>
                  <span className="text-gray-400">/{reportsStatus.monthly.total}</span>
                </div>
                <span className="text-xs text-gray-500 mt-1">rapports complétés</span>
              </div>
            </div>
            
            <div className="mt-3 bg-gray-900 bg-opacity-50 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-green-500 to-green-400 h-full" 
                style={{ width: `${(reportsStatus.monthly.completed / reportsStatus.monthly.total) * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </section>

      {/* Pied de page : Menu de navigation */}
      <footer className="flex justify-around items-center py-6 px-4 bg-gray-900 rounded-t-3xl shadow-lg relative mt-auto">
        <button className="text-center w-1/3 text-blue-400 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">📋</span>
          <span className="text-sm font-medium">Tâches</span>
        </button>
        
        <div className="relative w-1/3">
          <button 
            className="text-center w-full text-gray-400 transition-transform hover:scale-110"
            onClick={() => window.location.href = '/store'} // À adapter selon votre routage
          >
            <span className="block text-lg mb-1">🛒</span>
            <span className="text-sm font-medium">Boutique</span>
          </button>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Semaine {weekBadge || 1}
          </span>
        </div>
        
        <button 
          className="text-center w-1/3 text-gray-400 transition-transform hover:scale-110"
          onClick={() => window.location.href = '/dashboard'} // À adapter selon votre routage
        >
          <span className="block text-lg mb-1">🏠</span>
          <span className="text-sm font-medium">Accueil</span>
        </button>
      </footer>

      {/* Popups des rapports - ils seront rendus conditionnellement */}
      {isReportOpen && (
        <DailyReportPopup 
          isOpen={isReportOpen === 'daily'} 
          onClose={() => setReportOpen(null)} 
        />
      )}
      
      {isReportOpen && (
        <WeeklyReportPopup 
          isOpen={isReportOpen === 'weekly'} 
          onClose={() => setReportOpen(null)} 
        />
      )}
      
      {isReportOpen && (
        <MonthlyReportPopup 
          isOpen={isReportOpen === 'monthly'} 
          onClose={() => setReportOpen(null)} 
        />
      )}

      {/* Bouton de déconnexion */}
      <div className="absolute bottom-20 right-4">
        <SignOutButton />
      </div>
    </main>
  );
}

// Importation des composants de popup (à créer dans des fichiers séparés)
import DailyReportPopup from "../components/DailyReportPopup";
import WeeklyReportPopup from "../components/WeeklyReportPopup";
import MonthlyReportPopup from "../components/MonthlyReportPopup";
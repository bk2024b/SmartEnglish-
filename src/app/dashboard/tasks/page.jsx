'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from "../../utils/supabaseClient";
import Link from 'next/link';
import ActivitiesPopup from "../../components/ActivitiesPopup";
import AudioUploadPopup from "../../components/AudioUploadPopup";
import DailyReportPopup from "../../components/DailyReportPopup";
import WeeklyReportPopup from "../../components/WeeklyReportPopup";
import MonthlyReportPopup from "../../components/MonthlyReportPopup";

export default function TasksPage() {
  const [user, setUser] = useState(null);
  const [progress, setProgress] = useState({ daysCompleted: 0, totalDays: 180 });
  const [isReportOpen, setReportOpen] = useState(null); // 'daily', 'weekly', 'monthly' ou null
  const [isActivitiesPopupOpen, setActivitiesPopupOpen] = useState(false);
  const [isAudioPopupOpen, setAudioPopupOpen] = useState(false);
  const [activitiesData, setActivitiesData] = useState([]);
  const [coachingStarted, setCoachingStarted] = useState(true);

  // Rapports simulés (ces données viendraient normalement de votre backend)
  const reportsStatus = {
    daily: { completed: 15, total: 180 },
    weekly: { completed: 2, total: 24 },
    monthly: { completed: 0, total: 6 }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);

        // Vérifier si le coaching a commencé
        const startDate = new Date('2025-04-07');
        const currentDate = new Date();
        const hasCoachingStarted = currentDate >= startDate;
        setCoachingStarted(hasCoachingStarted);
        
        if (hasCoachingStarted) {
          // Calculer le nombre de jours écoulés depuis le début du coaching
          const diffTime = currentDate - startDate;
          const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
          
          // Ne pas dépasser le total de jours
          const daysCompleted = Math.min(diffDays, 180);
          
          setProgress({
            daysCompleted,
            totalDays: 180
          });
        }
      }
    };
  
    fetchUserData();
  }, []);

  const progressPercentage = Math.floor((progress.daysCompleted / progress.totalDays) * 100);
  
  // Obtenir le nom complet ou utiliser une valeur par défaut
  const fullName = user?.user_metadata?.display_name || user?.email || "Utilisateur";

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col justify-between relative p-4 pb-20">
      {/* En-tête */}
      <header className="flex justify-between items-center py-3">
        <div className="flex flex-col">
          <p className="text-sm text-gray-300">{fullName}</p>
          
          {coachingStarted && (
            <>
              <div className="mt-1 bg-gray-700 rounded-full h-4 w-44 overflow-hidden border border-gray-600">
                <div 
                  className="bg-gradient-to-r from-purple-600 to-blue-500 h-full" 
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <p className="text-xs mt-1 text-blue-300">{progress.daysCompleted} / {progress.totalDays} jours</p>
            </>
          )}
        </div>
        
        <div className="flex items-center">
          <button onClick={() => setAudioPopupOpen(true)} className="bg-red-600 rounded-full p-2 shadow-lg hover:bg-red-700 transition mr-3">
            <span className="text-lg">🎙️</span>
          </button>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 transition flex items-center justify-center"
              aria-label="Se déconnecter"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h7a1 1 0 1 0 0-2H4V5h6a1 1 0 1 0 0-2H3zm11.707 4.707a1 1 0 0 0-1.414-1.414l-3 3a1 1 0 0 0 0 1.414l3 3a1 1 0 0 0 1.414-1.414L13.414 11H17a1 1 0 1 0 0-2h-3.586l1.293-1.293z" clipRule="evenodd" />
              </svg>
            </button>
          </form>
        </div>
      </header>

      {/* Contenu principal: Rapports */}
      <section className="flex flex-col items-center justify-center flex-grow py-6">
        {!coachingStarted ? (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              Le coaching commence le 7 avril 2025
            </h2>
          </div>
        ) : (
          <>
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
          </>
        )}
      </section>

      {/* Pied de page : Menu de navigation */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-5 px-4 bg-gray-900 rounded-t-3xl shadow-lg">
        <Link href="/dashboard/tasks" className="text-center w-1/3 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">📋</span>
          <span className="text-sm font-medium">Formulaires</span>
        </Link>
        <Link href="/dashboard" className="text-center w-1/3 block transition-transform hover:scale-110">
          <span className="block text-lg mb-1">🏠</span>
          <span className="text-sm font-medium">Accueil</span>
        </Link>
        <button 
          className="text-center w-1/3 transition-transform hover:scale-110"
          onClick={() => setActivitiesPopupOpen(true)}
        >
          <span className="block text-lg mb-1">🏆</span>
          <span className="text-sm font-medium">Activités</span>
        </button>
      </footer>

      {/* Popups */}
      {isReportOpen === 'daily' && (
        <DailyReportPopup 
          isOpen={true} 
          onClose={() => setReportOpen(null)} 
        />
      )}
      
      {isReportOpen === 'weekly' && (
        <WeeklyReportPopup 
          isOpen={true} 
          onClose={() => setReportOpen(null)} 
        />
      )}
      
      {isReportOpen === 'monthly' && (
        <MonthlyReportPopup 
          isOpen={true} 
          onClose={() => setReportOpen(null)} 
        />
      )}

      {/* Popup d'activités */}
      <ActivitiesPopup 
        isOpen={isActivitiesPopupOpen}
        onClose={() => setActivitiesPopupOpen(false)}
        activitiesData={activitiesData}
      />

      {/* Popup d'enregistrement audio */}
      <AudioUploadPopup 
        isOpen={isAudioPopupOpen}
        onClose={() => setAudioPopupOpen(false)}
        userId={user?.id}
      />
    </main>
  );
}
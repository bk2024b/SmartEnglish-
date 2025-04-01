"use client";

import React, { useState, useEffect } from 'react';
import SignOutButton from "../components/SignOutButton";
import ActivitiesPopup from "../components/ActivitiesPopup";
import AudioUploadPopup from "../components/AudioUploadPopup";
import { supabase } from "../utils/supabaseClient";
import Link from 'next/link';

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const [isActivitiesPopupOpen, setActivitiesPopupOpen] = useState(false);
  const [isAudioPopupOpen, setAudioPopupOpen] = useState(false);
  const [weekBadge, setWeekBadge] = useState(1);
  const [level, setLevel] = useState(1);
  const [activitiesData, setActivitiesData] = useState([]);
  const [progress, setProgress] = useState({ daysCompleted: 0, totalDays: 180 });
  const [coachingStarted, setCoachingStarted] = useState(false);
  
  const avatars = [
    "/avatars/stage1.jpg",
    "/avatars/stage2.webp",
    "/avatars/stage3.jpg",
    "/avatars/stage4.jpg",
    "/avatars/stage5.webp",
    "/avatars/stage6.webp"
  ];
  
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
        
        // Récupération de l'avatar et des autres infos
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar, weekBadge, daysCompleted, totalDays')
          .eq('id', user.id)
          .single();
  
        if (!error && profile) {
          let avatar = profile.avatar || "/avatars/stage1.jpg"; // Utiliser l'avatar par défaut si absent
          setAvatarUrl(avatar);
          
          // Initialiser la progression
          setProgress({
            daysCompleted: profile.daysCompleted || 0,
            totalDays: profile.totalDays || 180,
          });
          
          if (hasCoachingStarted) {
            // Calculer le nombre de jours écoulés depuis le début du coaching
            const diffTime = currentDate - startDate;
            const diffDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
            
            // Ne pas dépasser le total de jours
            const daysCompleted = Math.min(diffDays, profile.totalDays || 180);
            
            // Mettre à jour la progression si différente
            if (daysCompleted !== profile.daysCompleted) {
              setProgress({
                daysCompleted,
                totalDays: profile.totalDays || 180
              });
              
              // Mettre à jour Supabase
              await supabase
                .from('profiles')
                .update({ daysCompleted })
                .eq('id', user.id);
            }
          }
          
          // Calculer le nombre de semaines depuis le 7 avril 2025
          const diffTime = currentDate - startDate;
          const diffWeeks = Math.max(1, Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24 * 7)) + 1);
          setWeekBadge(diffWeeks);
          
          // Calculer le niveau en fonction du nombre de mois écoulés
          const diffMonths = Math.max(1, Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24 * 30)) + 1);
          setLevel(diffMonths);
          
          // Déterminer l'avatar en fonction du mois
          const avatarIndex = Math.min(diffMonths - 1, avatars.length - 1);
          const newAvatar = avatars[avatarIndex];
          setAvatarUrl(newAvatar);
          
          // Mise à jour dans Supabase si nécessaire
          if (profile.avatar !== newAvatar || profile.weekBadge !== diffWeeks) {
            await supabase
              .from('profiles')
              .update({ 
                avatar: newAvatar,
                weekBadge: diffWeeks
              })
              .eq('id', user.id);
          }
        }
      }
    };
  
    fetchUserData();
  }, []);

  const progressPercentage = Math.floor((progress.daysCompleted / progress.totalDays) * 100);

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white flex flex-col justify-between relative p-4 pb-20">
      {/* En-tête */}
      <header className="flex justify-between items-center py-3">
        <div className="flex flex-col">
          <p className="text-sm text-gray-300">{user?.email || "Utilisateur inconnu"}</p>
          
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
          <button onClick={() => setAudioPopupOpen(true)} className="bg-red-600 rounded-full p-2 shadow-lg hover:bg-red-700 transition">
            <span className="text-lg">🎙️</span>
          </button>
          <button onClick={() => {}/* Action de déconnexion */} className="ml-3 bg-gray-700 rounded-full p-2 shadow-lg hover:bg-gray-600 transition">
            <span className="text-lg">⏻</span>
          </button>
        </div>
      </header>

      {/* Contenu : Affichage de l'avatar */}
      <section className="flex flex-col justify-center items-center flex-grow my-8">
        {!coachingStarted ? (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              Le coaching commence le 7 avril 2025
            </h2>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-300 to-purple-400 bg-clip-text text-transparent">
              Parcours d'apprentissage
            </h2>
            <p className="text-gray-400 text-sm mt-1">Continuez vos tâches quotidiennes</p>
          </div>
        )}
        
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-70 animate-pulse"></div>
          <img
            src={avatarUrl || "/avatars/stage1.jpg"}
            alt="Avatar de l'apprenant"
            className="relative w-52 h-52 rounded-full border-4 border-yellow-400 object-cover z-10"
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-1 rounded-full border border-gray-600 z-20">
            <p className="text-xs text-center text-gray-300">Niveau {level}</p>
          </div>
        </div>
      </section>

      {/* Semaine Badge - Séparé du menu */}
      <div className="fixed bottom-16 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-4 py-1.5 rounded-full text-xs font-bold shadow-lg border border-indigo-300 z-20">
        Semaine {weekBadge}
      </div>

      {/* Pied de page : Menu de navigation */}
      <footer className="fixed bottom-0 left-0 right-0 flex justify-around items-center py-5 px-4 bg-gray-900 rounded-t-3xl shadow-lg">
        <Link href="/dashboard/tasks" className="text-center w-1/3 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">📋</span>
          <span className="text-sm font-medium">Tâches</span>
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
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
  const [xp, setXp] = useState(0);
  const [progress, setProgress] = useState({ daysCompleted: 0, totalDays: 180 });
  const [weekBadge, setWeekBadge] = useState(1);
  const [activitiesData, setActivitiesData] = useState([]);
  const avatars = [
    "/avatars/stage1.jpg",
    "/avatars/stage2.webp",
    "/avatars/stage3.jpg",
    "/avatars/stage4.jpg",
    "/avatars/stage5.webp",
    "/avatars/stage6.webp"
  ];
  
  const updateAvatar = async () => {
    if (!user) return;
  
    // Trouver l'index actuel de l'avatar
    const currentIndex = avatars.indexOf(avatarUrl);
    const nextIndex = Math.min(currentIndex + 1, avatars.length - 1);
    const newAvatar = avatars[nextIndex];
  
    // Mise à jour dans Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ avatar: newAvatar })
      .eq('id', user.id);
  
    if (error) {
      console.error("Erreur lors de la mise à jour de l'avatar:", error);
    } else {
      setAvatarUrl(newAvatar); // Mise à jour de l'état local
    }
  };
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
  
        // Récupération de l'avatar et des autres infos
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('avatar, xp, daysCompleted, totalDays, weekBadge')
          .eq('id', user.id)
          .single();
  
        if (!error && profile) {
          let avatar = profile.avatar || "/avatars/stage1.jpg"; // Utiliser l'avatar par défaut si absent
          setAvatarUrl(avatar);
          setXp(profile.xp || 1);
          setProgress({
            daysCompleted: profile.daysCompleted || 0,
            totalDays: profile.totalDays || 180,
          });
          setWeekBadge(profile.weekBadge || 1);
  
          // Si l'avatar était null dans la base, mettre à jour Supabase avec stage1.jpg
          if (!profile.avatar) {
            await supabase
              .from('profiles')
              .update({ avatar: "/avatars/stage1.jpg" })
              .eq('id', user.id);
          }
        }
      }
    };
  
    fetchUserData();
  }, []);
  
  const progressPercentage = Math.floor((progress.daysCompleted / progress.totalDays) * 100);

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
          <p className="text-xs mt-1 text-blue-300">{progress.daysCompleted} / {progress.totalDays} jours</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex items-center bg-gradient-to-r from-yellow-500 to-amber-500 text-black px-4 py-2 rounded-lg font-bold shadow-lg">
            <span className="text-lg mr-1">⚡</span>
            <span>{xp} XP</span>
          </div>
          <button 
            onClick={updateAvatar}
            className="mt-2 px-3 py-1 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition text-sm"
          >
            Changer d'avatar
          </button>
        </div>
      </header>

      {/* Contenu : Affichage de l'avatar */}
      <section className="flex flex-col justify-center items-center mt-4 mb-8">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-md opacity-70 animate-pulse"></div>
          <img
            src={avatarUrl || "/avatars/stage1.jpg"}
            alt="Avatar de l'apprenant"
            className="relative w-44 h-44 rounded-full border-4 border-yellow-400 object-cover z-10"
          />
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-gray-800 px-4 py-1 rounded-full border border-gray-600 z-20">
            <p className="text-xs text-center text-gray-300">Niveau {Math.floor(xp / 100) + 1}</p>
          </div>
          
          {/* Bouton d'enregistrement vocal */}
          <button 
            onClick={() => setAudioPopupOpen(true)}
            className="absolute -top-2 -right-2 bg-red-600 rounded-full p-3 shadow-lg z-20 hover:bg-red-700 transition transform hover:scale-110"
            aria-label="Ajouter un enregistrement vocal"
          >
            <span className="text-lg">🎙️</span>
          </button>
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
        <Link href="/dashboard/tasks" className="text-center w-1/3 transition-transform hover:scale-110">
          <span className="block text-lg mb-1">📋</span>
          <span className="text-sm font-medium">Tâches</span>
        </Link>
        <div className="relative w-1/3">
          <button className="text-center w-full transition-transform hover:scale-110">
            <span className="block text-lg mb-1">🛒</span>
            <span className="text-sm font-medium">Boutique</span>
          </button>
          <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-amber-500 text-black px-3 py-1 rounded-full text-xs font-bold shadow-lg">
            Semaine {weekBadge}
          </span>
        </div>
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

      {/* Bouton de déconnexion */}
      <div className="absolute bottom-20 right-4">
        <SignOutButton />
      </div>
    </main>
  );
}
"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ActivitiesPopup({ isOpen, onClose }) {
  const [activitiesData, setActivitiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('objectifs');
  const [niveau, setNiveau] = useState('debutant');

  useEffect(() => { 
    if (!isOpen) return;

    async function fetchActivities() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erreur de chargement des activités:', error);
      } else {
        setActivitiesData(data[0]); // Récupère la dernière activité
      }
      setLoading(false);
    }

    fetchActivities();
  }, [isOpen]);

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  // Données par défaut si aucune donnée n'est disponible
  const data = activitiesData || {
    date: new Date().toISOString().split('T')[0],
    objectif_mensuel: "Maîtriser les expressions courantes",
    objectif_hebdomadaire: "S'exprimer avec fluidité dans des conversations simples",
    objectif_du_jour: "Apprendre et utiliser des expressions en contexte",
    conseil_du_jour: "L'immersion est la clé ! Écoute, répète et applique.",
    
    activite_matin_duree: "15 min",
    activite_matin_titre: "Compréhension et extraction des expressions",
    activite_matin_consigne_debutant: "Note 3 expressions simples que tu comprends facilement",
    activite_matin_consigne_intermediaire: "Note 5 expressions, y compris des phrasal verbs ou expressions idiomatiques",
    activite_matin_consigne_avance: "Identifie 7 expressions ou tournures complexes et cherche à en comprendre l'usage précis",
    
    activite_midi_duree: "15 min",
    activite_midi_titre: "Pratique du shadowing",
    activite_midi_consigne_debutant: "Répète mot pour mot après l'audio en insistant sur la prononciation.",
    activite_midi_consigne_intermediaire: "Joue avec l'intonation et le rythme pour rendre ton imitation plus naturelle.",
    activite_midi_consigne_avance: "Imite non seulement la prononciation, mais aussi l'émotion et le ton du locuteur.",
    
    activite_soir_duree: "30 min",
    activite_soir_titre: "Application et mise en pratique",
    activite_soir_consigne_debutant: "Écris un mini-dialogue de 4 répliques intégrant les expressions et joue-le devant un miroir ou en t'enregistrant.",
    activite_soir_consigne_intermediaire: "Écris un dialogue plus fluide et ajoute une mini-situation (ex. : rencontre entre collègues).",
    activite_soir_consigne_avance: "Improvise un dialogue plus long, en y intégrant des nuances et des expressions adaptées au ton de la conversation. Joue-le en variant les émotions."
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        <div className="bg-gradient-to-r from-purple-600 to-blue-500 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Activités du jour</h2>
          <div className="flex items-center">
            <span className="text-white text-sm mr-2">{data.date}</span>
            <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">✕</button>
          </div>
        </div>

        <div className="flex border-b border-gray-700">
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'objectifs' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('objectifs')}
          >
            Objectifs
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'activites' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-gray-400'}`}
            onClick={() => setActiveTab('activites')}
          >
            Activités
          </button>
        </div>

        {/* Contenu principal */}
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {activeTab === 'objectifs' ? (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-gray-700 bg-opacity-40 rounded-lg p-3">
                <h3 className="text-yellow-400 font-medium mb-1">Objectif mensuel</h3>
                <p className="text-gray-200 text-sm">{data.objectif_mensuel}</p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-40 rounded-lg p-3">
                <h3 className="text-blue-400 font-medium mb-1">Objectif hebdomadaire</h3>
                <p className="text-gray-200 text-sm">{data.objectif_hebdomadaire}</p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-40 rounded-lg p-3">
                <h3 className="text-purple-400 font-medium mb-1">Objectif du jour</h3>
                <p className="text-gray-200 text-sm">{data.objectif_du_jour}</p>
              </div>
              
              <div className="bg-gray-700 bg-opacity-40 rounded-lg p-3 border-l-4 border-green-500">
                <h3 className="text-green-400 font-medium mb-1">Conseil du jour</h3>
                <p className="text-gray-200 text-sm italic">{data.conseil_du_jour}</p>
              </div>
            </div>
          ) : (
            <div className="animate-fadeIn">
              {/* Sélecteur de niveau pour les activités */}
              <div className="mb-4 flex justify-center space-x-2">
                <button 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${niveau === 'debutant' ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                  onClick={() => setNiveau('debutant')}
                >
                  Débutant
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${niveau === 'intermediaire' ? 'bg-blue-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                  onClick={() => setNiveau('intermediaire')}
                >
                  Intermédiaire
                </button>
                <button 
                  className={`px-3 py-1 rounded-full text-xs font-medium ${niveau === 'avance' ? 'bg-purple-500 text-white' : 'bg-gray-600 text-gray-300'}`}
                  onClick={() => setNiveau('avance')}
                >
                  Avancé
                </button>
              </div>

              <div className="space-y-4">
                <TimeBasedActivityCard 
                  time="Matin" 
                  duration={data.activite_matin_duree} 
                  title={data.activite_matin_titre} 
                  instructions={data[`activite_matin_consigne_${niveau}`]}
                  color="blue"
                />
                <TimeBasedActivityCard 
                  time="Midi" 
                  duration={data.activite_midi_duree} 
                  title={data.activite_midi_titre} 
                  instructions={data[`activite_midi_consigne_${niveau}`]}
                  color="yellow"
                />
                <TimeBasedActivityCard 
                  time="Soir" 
                  duration={data.activite_soir_duree} 
                  title={data.activite_soir_titre} 
                  instructions={data[`activite_soir_consigne_${niveau}`]}
                  color="purple"
                />
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-700 flex justify-center">
          <button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-full text-sm transition-colors">
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function TimeBasedActivityCard({ time, duration, title, instructions, color }) {
  const [expanded, setExpanded] = useState(false);
  
  const colorMap = {
    'blue': 'from-blue-500 to-blue-600',
    'yellow': 'from-yellow-500 to-yellow-600',
    'purple': 'from-purple-500 to-purple-600',
    'green': 'from-green-500 to-green-600',
  };
  
  const bgGradient = colorMap[color] || 'from-blue-500 to-blue-600';
  
  return (
    <div className="bg-gray-700 bg-opacity-30 rounded-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${bgGradient} px-4 py-3 flex justify-between items-center cursor-pointer`} onClick={() => setExpanded(!expanded)}>
        <h3 className="font-medium text-white flex items-center">
          <span className="bg-white text-gray-800 rounded-full px-2 py-1 mr-2 text-xs font-bold">{time} • {duration}</span>
          {title}
        </h3>
        <span className="text-white text-lg">{expanded ? '−' : '+'}</span>
      </div>
      {expanded && <div className="p-4"><p className="text-gray-200 text-sm">{instructions}</p></div>}
    </div>
  );
}
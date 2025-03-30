import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient'; // Import du client Supabase

export default function ActivitiesPopup({ isOpen, onClose }) {
  const [activitiesData, setActivitiesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('objectifs');

  useEffect(() => {
    if (!isOpen) return; // Ne charge les données que si le popup est ouvert

    async function fetchActivities() {
      setLoading(true);
      const { data, error } = await supabase
        .from('activities') // Remplace par le nom de ta table Supabase
        .select('*')
        .order('created_at', { ascending: false }) // Trier du plus récent au plus ancien

      if (error) {
        console.error('Erreur de chargement des activités:', error);
      } else {
        setActivitiesData(data[0]); // Supposons qu'on récupère la dernière activité
      }
      setLoading(false);
    }

    fetchActivities();
  }, [isOpen]); // Recharge les données à chaque ouverture du popup

  if (!isOpen) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70">
        <p className="text-white">Chargement...</p>
      </div>
    );
  }

  const data = activitiesData || {
    date: new Date().toISOString().split('T')[0],
    objectif_mensuel: "Terminer 3 modules de formation",
    objectif_hebdomadaire: "Compléter 2 exercices pratiques",
    objectif_du_jour: "Visionner la vidéo introductive et prendre des notes",
    conseil_du_jour: "Prenez 5 minutes pour réviser vos notes d'hier avant de commencer",
    activite_1_titre: "Lecture du cours",
    activite_1_consignes: "Lire le chapitre 3 sur les fondamentaux",
    activite_2_titre: "Exercice pratique",
    activite_2_consignes: "Compléter l'exercice 2.1 dans votre cahier de travail",
    activite_3_titre: "Quiz d'évaluation",
    activite_3_consignes: "Répondre au quiz en ligne pour valider vos connaissances"
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
            <div className="space-y-4 animate-fadeIn">
              <ActivityCard number={1} title={data.activite_1_titre} instructions={data.activite_1_consignes} />
              <ActivityCard number={2} title={data.activite_2_titre} instructions={data.activite_2_consignes} />
              <ActivityCard number={3} title={data.activite_3_titre} instructions={data.activite_3_consignes} />
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

function ActivityCard({ number, title, instructions }) {
  const [expanded, setExpanded] = useState(false);
  
  const colors = {
    1: 'from-blue-500 to-blue-600',
    2: 'from-purple-500 to-purple-600',
    3: 'from-green-500 to-green-600',
  };
  
  return (
    <div className="bg-gray-700 bg-opacity-30 rounded-lg overflow-hidden">
      <div className={`bg-gradient-to-r ${colors[number]} px-4 py-3 flex justify-between items-center cursor-pointer`} onClick={() => setExpanded(!expanded)}>
        <h3 className="font-medium text-white flex items-center">
          <span className="bg-white text-gray-800 rounded-full w-6 h-6 flex items-center justify-center mr-2 text-xs font-bold">{number}</span>
          {title}
        </h3>
        <span className="text-white text-lg">{expanded ? '−' : '+'}</span>
      </div>
      {expanded && <div className="p-4"><p className="text-gray-200 text-sm">{instructions}</p></div>}
    </div>
  );
}

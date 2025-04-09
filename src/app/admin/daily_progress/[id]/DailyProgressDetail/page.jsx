// /src/app/admin/daily_progress/[id]/DailyProgressDetail.jsx
"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/app/utils/supabaseClient';


export default function DailyProgressDetail({ progressData, error, id }) {
  const router = useRouter();

  // Fonction pour afficher proprement les données JSON
  const renderJsonData = (data, title) => {
    if (!data) return null;
    
    try {
      const jsonData = typeof data === 'string' ? JSON.parse(data) : data;
      
      return (
        <div className="mt-4">
          <h3 className="font-semibold text-lg">{title}</h3>
          {Array.isArray(jsonData) ? (
            <ul className="list-disc pl-5">
              {jsonData.map((item, index) => (
                <li key={index}>{typeof item === 'object' ? JSON.stringify(item) : item}</li>
              ))}
            </ul>
          ) : (
            <div className="bg-gray-50 p-3 rounded">
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(jsonData, null, 2)}
              </pre>
            </div>
          )}
        </div>
      );
    } catch (e) {
      return <p>{String(data)}</p>;
    }
  };

  if (error) {
    return <div className="text-red-500 text-center p-4">Erreur: {error}</div>;
  }

  if (!progressData) {
    return <div className="text-center p-4">Entrée non trouvée</div>;
  }

  // Fonction pour gérer la suppression
  const handleDelete = async () => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette entrée ?')) {
      try {
        const { error } = await supabase
          .from('daily_progress')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        router.push('/admin/daily_progress');
      } catch (err) {
        alert(`Erreur lors de la suppression: ${err.message}`);
      }
    }
  };

  return (
    <>
      <Link href="/admin/daily_progress">
        <span className="text-blue-600 hover:underline mb-4 flex items-center cursor-pointer">
          &larr; Retour à la liste
        </span>
      </Link>
      
      <div className="bg-white shadow-md rounded-lg p-6 mt-4">
        <h1 className="text-2xl font-bold mb-6">
          Détails du suivi quotidien - {new Date(progressData.date).toLocaleDateString()}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Informations utilisateur</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nom:</span> {progressData.profiles?.full_name || 'Non spécifié'}</p>
              <p><span className="font-medium">Email:</span> {progressData.profiles?.email || 'Non spécifié'}</p>
              <p><span className="font-medium">Date:</span> {new Date(progressData.date).toLocaleDateString()}</p>
              <p><span className="font-medium">Temps passé:</span> {progressData.time_spent}</p>
              <p><span className="font-medium">Points XP:</span> {progressData.xp_points || 0}</p>
              <p><span className="font-medium">Niveau de confiance:</span> {progressData.confidence_score}/10</p>
            </div>
          </div>
          
          <div>
            <h2 className="text-xl font-semibold mb-4">Progrès et défis</h2>
            <div className="space-y-2">
              <p><span className="font-medium">Nouvelles expressions:</span> {progressData.new_expressions_count || '0'}</p>
              <p><span className="font-medium">Stratégies:</span> {progressData.overcoming_strategies || 'Non spécifié'}</p>
            </div>
            
            {renderJsonData(progressData.activities_done, "Activités réalisées")}
            {renderJsonData(progressData.difficulties, "Difficultés rencontrées")}
            {renderJsonData(progressData.difficultiesOther, "Autres difficultés")}
          </div>
        </div>
        
        <div className="mt-8 border-t pt-4">
          <h2 className="text-xl font-semibold mb-4">Actions administratives</h2>
          <div className="flex space-x-4">
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              onClick={() => router.push(`/admin/daily_progress/edit/${id}`)}
            >
              Éditer
            </button>
            <button 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={handleDelete}
            >
              Supprimer
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
'use client'

// /pages/admin/daily-progress.js
import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '@/app/utils/supabaseClient';

export default function AdminDailyProgress({ initialData, error }) {
  const [progressData] = useState(initialData || []);
  const router = useRouter();

  // Fonction pour formater les données JSON pour l'affichage
  const formatJsonData = (jsonData) => {
    if (!jsonData) return 'Aucune donnée';
    
    try {
      if (typeof jsonData === 'string') {
        jsonData = JSON.parse(jsonData);
      }
      
      // Si c'est un tableau, liste les éléments
      if (Array.isArray(jsonData)) {
        return jsonData.join(', ');
      }
      
      // Si c'est un objet, affiche les clés et valeurs
      return Object.entries(jsonData)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
    } catch (e) {
      return String(jsonData);
    }
  };

  if (error) {
    return <div className="text-red-500 text-center p-4">Erreur: {error}</div>;
  }

  return (
    <>
      <Head>
        <title>Admin - Suivi quotidien des utilisateurs</title>
      </Head>

      <div className="container mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">Suivi quotidien des utilisateurs</h1>
          <p className="text-gray-600">Affichage des progrès quotidiens de tous les utilisateurs</p>
        </div>

        <div className="overflow-x-auto shadow-md sm:rounded-lg">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 uppercase bg-gray-100">
              <tr>
                <th className="px-6 py-3">Date</th>
                <th className="px-6 py-3">Utilisateur</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Temps passé</th>
                <th className="px-6 py-3">Points XP</th>
                <th className="px-6 py-3">Activités réalisées</th>
                <th className="px-6 py-3">Niveau de confiance</th>
                <th className="px-6 py-3">Difficultés</th>
                <th className="px-6 py-3">Stratégies</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {progressData.length > 0 ? (
                progressData.map((item) => (
                  <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                    <td className="px-6 py-4">{new Date(item.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {item.profiles?.full_name || 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4">{item.profiles?.email || 'Non spécifié'}</td>
                    <td className="px-6 py-4">{item.time_spent}</td>
                    <td className="px-6 py-4">{item.xp_points || 0}</td>
                    <td className="px-6 py-4">
                      {formatJsonData(item.activities_done)}
                    </td>
                    <td className="px-6 py-4">
                      {item.confidence_score}/10
                    </td>
                    <td className="px-6 py-4">
                      {formatJsonData(item.difficulties) || 'Aucune difficulté'}
                      {item.difficultiesOther && `, ${formatJsonData(item.difficultiesOther)}`}
                    </td>
                    <td className="px-6 py-4">
                      {item.overcoming_strategies || 'Non spécifié'}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => router.push(`/admin/daily-progress/${item.id}`)}
                        className="text-blue-600 hover:underline mr-2"
                      >
                        Détails
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-4 text-center">
                    Aucune donnée de progression disponible
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// Récupération des données côté serveur
export async function getServerSideProps() {
  try {
    
    const { data, error } = await supabase
      .from('daily_progress')
      .select(`
        *,
        profiles:profile_id (id, full_name, email)
      `)
      .order('date', { ascending: false });
    
    if (error) {
      throw error;
    }
    
    return {
      props: {
        initialData: data,
        error: null,
      },
    };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return {
      props: {
        initialData: [],
        error: "Impossible de récupérer les données",
      },
    };
  }
}
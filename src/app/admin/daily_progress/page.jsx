'use client'
// /src/app/admin/daily_progress/page.jsx

import DailyProgressList from './DailyProgressList/page';
import { supabase } from '@/app/utils/supabaseClient';
// Cette fonction est exécutée côté serveur
async function getDailyProgressData() {
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
    
    return { data, error: null };
  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    return { data: [], error: "Impossible de récupérer les données" };
  }
}

export default async function AdminDailyProgress() {
  const { data, error } = await getDailyProgressData();
  
  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Suivi quotidien des utilisateurs</h1>
        <p className="text-gray-600">Affichage des progrès quotidiens de tous les utilisateurs</p>
      </div>

      {/* Le composant client qui gère l'interactivité */}
      <DailyProgressList initialData={data} error={error} />
    </div>
  );
}
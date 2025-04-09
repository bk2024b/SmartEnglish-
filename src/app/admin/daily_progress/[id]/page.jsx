'use client'

// /src/app/admin/daily_progress/[id]/page.jsx

import { supabase } from "@/app/utils/supabaseClient";
import DailyProgressDetail from "./DailyProgressDetail/page";

// Cette fonction est exécutée côté serveur
async function getDailyProgressDetail(id) {
  try {
   
    const { data, error } = await supabase
      .from('daily_progress')
      .select(`
        *,
        profiles:profile_id (id, full_name, email)
      `)
      .eq('id', id)
      .single();
    
    if (error) throw error;
    
    if (!data) {
      return { data: null, error: "Entrée non trouvée" };
    }
    
    return { data, error: null };
  } catch (error) {
    console.error('Erreur:', error);
    return { data: null, error: "Impossible de récupérer les données" };
  }
}

export default async function DailyProgressDetailPage({ params }) {
  const { id } = params;
  const { data, error } = await getDailyProgressDetail(id);
  
  return (
    <div className="container mx-auto p-4">
      {/* Le composant client qui gère l'interactivité */}
      <DailyProgressDetail progressData={data} error={error} id={id} />
    </div>
  );
}
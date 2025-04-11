'use client'
// pages/admin/daily-progress.jsx

import { useEffect, useState } from 'react';

import { supabase } from '@/app/utils/supabaseClient';

export default function DailyProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      const { data, error } = await supabase
        .from('daily_progress')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erreur lors du chargement des réponses :', error);
      } else {
          setProgressData(data || []);
          console.log(data);
      }
      setLoading(false);
    };

    fetchProgress();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-6">Réponses des apprenants - Daily Progress</h1>

      {loading ? (
        <p>Chargement des données...</p>
      ) : progressData.length === 0 ? (
        <p>Aucune réponse pour le moment.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white shadow-md rounded-lg overflow-hidden">
            <thead className="bg-gray-200">
              <tr>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">User ID</th>
                <th className="py-3 px-4 text-left">Answer 1</th>
                <th className="py-3 px-4 text-left">Answer 2</th>
                <th className="py-3 px-4 text-left">Créé le</th>
              </tr>
            </thead>
            <tbody>
              {progressData.map((progress) => (
                <tr key={progress.id} className="border-b">
                  <td className="py-2 px-4">{progress.date}</td>
                  <td className="py-2 px-4">{progress.user_id}</td>
                  <td className="py-2 px-4">{progress.answer1}</td>
                  <td className="py-2 px-4">{progress.answer2}</td>
                  <td className="py-2 px-4">{new Date(progress.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

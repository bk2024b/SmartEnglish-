'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ActivityFormPopup from '../../components/ActivityFormPopup';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Fonction utilitaire pour parser en toute sécurité
const safeJsonParse = (jsonString) => {
  if (!jsonString) return [];
  
  try {
    // Si c'est déjà un tableau, on le retourne tel quel
    if (Array.isArray(jsonString)) return jsonString;
    
    return JSON.parse(jsonString);
  } catch (error) {
    console.error('Erreur de parsing JSON:', error);
    return [];
  }
};

export default function CoachAdminDashboard() {
  const [profiles, setProfiles] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [dailyProgress, setDailyProgress] = useState([]);
  const [weeklyProgress, setWeeklyProgress] = useState([]);
  const [monthlyProgress, setMonthlyProgress] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showActivityPopup, setShowActivityPopup] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'all'
  const [showAnalytics, setShowAnalytics] = useState(false);

  // Fetch all learner profiles
  useEffect(() => {
    const fetchProfiles = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching profiles:', error);
      } else {
        setProfiles(data);
        if (data.length > 0) setSelectedProfile(data[0].id);
      }
    };

    fetchProfiles();
  }, []);

  // Fetch progress data based on selected tab and profile
  useEffect(() => {
    if (!selectedProfile) return;

    const fetchProgressData = async () => {
      setIsLoading(true);
      
      try {
        if (activeTab === 'daily') {
          let query = supabase
            .from('daily_progress')
            .select('*');
          
          if (viewMode === 'individual') {
            query = query.eq('profile_id', selectedProfile);
          }
          
          const { data, error } = await query;
          if (error) throw error;
          setDailyProgress(data);
        } 
        else if (activeTab === 'weekly') {
          let query = supabase
            .from('weekly_progress')
            .select('*');
          
          if (viewMode === 'individual') {
            query = query.eq('profile_id', selectedProfile);
          }
          
          const { data, error } = await query;
          if (error) throw error;
          setWeeklyProgress(data);
        } 
        else if (activeTab === 'monthly') {
          let query = supabase
            .from('monthly_progress')
            .select('*');
          
          if (viewMode === 'individual') {
            query = query.eq('profile_id', selectedProfile);
          }
          
          const { data, error } = await query;
          if (error) throw error;
          setMonthlyProgress(data);
        }
      } catch (error) {
        console.error('Error fetching progress data:', error);
        
      } finally {
        setIsLoading(false);
      }
    };

    fetchProgressData();
  }, [selectedProfile, activeTab, viewMode]);

  // Prepare data for analytics charts
  const prepareConfidenceData = () => {
    const data = profiles.map(profile => {
      const dailyScores = dailyProgress.filter(p => p.profile_id === profile.id).map(p => p.confidence_score);
      const avgDailyScore = dailyScores.length > 0 ? 
        dailyScores.reduce((a, b) => a + b, 0) / dailyScores.length : 0;

      return {
        name: profile.full_name || `Apprenant ${profile.id.slice(0, 5)}`,
        score: Math.round(avgDailyScore * 10) / 10
      };
    });

    return data.sort((a, b) => b.score - a.score);
  };

  const prepareActivityCompletionData = () => {
    if (viewMode === 'individual') {
      return dailyProgress
        .filter(p => p.profile_id === selectedProfile)
        .map(p => ({
          date: p.date,
          completed: p.activities_done ? safeJsonParse(p.activities_done).length : 0
        }));
    } else {
      // Aggregate data for all learners
      const dateMap = {};
      
      dailyProgress.forEach(p => {
        if (!dateMap[p.date]) dateMap[p.date] = 0;
        dateMap[p.date] += p.activities_done ? safeJsonParse(p.activities_done).length : 0;
      });

      return Object.keys(dateMap).map(date => ({
        date,
        completed: dateMap[date] / profiles.length // Average per learner
      })).sort((a, b) => new Date(a.date) - new Date(b.date));
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-6">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tableau de bord du Coach</h1>
        <p className="text-base text-gray-700 mt-1">Suivi des apprenants et gestion des activités</p>
      </header>

      <div className="flex flex-col gap-6">
        {/* Main content */}
        <div className="flex-1">
          {/* Controls */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <button
                  onClick={() => setShowActivityPopup(true)}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
                >
                  Ajouter des activités
                </button>

                <button
                  onClick={() => setShowAnalytics(!showAnalytics)}
                  className="w-full sm:w-auto mt-2 sm:mt-0 bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md text-sm transition-colors"
                >
                  {showAnalytics ? 'Masquer les analyses' : 'Afficher les analyses'}
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-3 md:mt-0">
                <select
                  value={selectedProfile || ''}
                  onChange={(e) => setSelectedProfile(e.target.value)}
                  className="w-full sm:w-auto border border-gray-300 rounded-md px-3 py-2 text-sm bg-white"
                  disabled={viewMode === 'all'}
                >
                  {profiles.map(profile => (
                    <option key={profile.id} value={profile.id}>
                      {profile.full_name || `Apprenant ${profile.id.slice(0, 5)}`}
                    </option>
                  ))}
                </select>

                <div className="flex w-full sm:w-auto border rounded-md overflow-hidden mt-2 sm:mt-0">
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${viewMode === 'individual' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
                    onClick={() => setViewMode('individual')}
                  >
                    Individuel
                  </button>
                  <button
                    className={`flex-1 px-4 py-2 text-sm font-medium ${viewMode === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-white text-gray-700'}`}
                    onClick={() => setViewMode('all')}
                  >
                    Tous
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Analytics Section */}
          {showAnalytics && (
            <div className="bg-white rounded-lg shadow-md p-4 md:p-6 mb-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-800">Niveau de confiance moyen</h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareConfidenceData()} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} height={60} tickMargin={10} angle={-45} textAnchor="end" />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 14 }} />
                      <Legend wrapperStyle={{ fontSize: 14 }} />
                      <Bar dataKey="score" fill="#8884d8" name="Score de confiance" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-4 text-gray-800">
                  {viewMode === 'individual' ? 'Activités complétées' : 'Activités moyennes complétées'}
                </h3>
                <div className="h-64 md:h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareActivityCompletionData()} margin={{ top: 5, right: 20, left: 0, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="date" tick={{ fontSize: 12 }} height={60} tickMargin={10} angle={-45} textAnchor="end" />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip contentStyle={{ fontSize: 14 }} />
                      <Legend wrapperStyle={{ fontSize: 14 }} />
                      <Bar dataKey="completed" fill="#82ca9d" name="Activités complétées" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}

          {/* Progress Tabs */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'daily' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('daily')}
              >
                Journalier
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'weekly' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('weekly')}
              >
                Hebdomadaire
              </button>
              <button
                className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === 'monthly' ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50' : 'text-gray-700 hover:bg-gray-50'}`}
                onClick={() => setActiveTab('monthly')}
              >
                Mensuel
              </button>
            </div>

            <div className="p-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  {activeTab === 'daily' && (
                    <DailyProgressTable data={dailyProgress} viewMode={viewMode} profiles={profiles} />
                  )}
                  {activeTab === 'weekly' && (
                    <WeeklyProgressTable data={weeklyProgress} viewMode={viewMode} profiles={profiles} />
                  )}
                  {activeTab === 'monthly' && (
                    <MonthlyProgressTable data={monthlyProgress} viewMode={viewMode} profiles={profiles} />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Activity Form Popup */}
      {showActivityPopup && (
        <ActivityFormPopup 
          isOpen={showActivityPopup} 
          onClose={() => setShowActivityPopup(false)} 
        />
      )}
    </div>
  );
}

// Component for Daily Progress Table
function DailyProgressTable({ data, viewMode, profiles }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {viewMode === 'all' && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Apprenant</th>}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Date</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Temps passé</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Activités</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Confiance</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={viewMode === 'all' ? 6 : 5} className="px-4 py-4 text-center text-gray-600 font-medium">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {viewMode === 'all' && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {profiles.find(p => p.id === item.profile_id)?.full_name || `Apprenant ${item.profile_id.slice(0, 5)}`}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{item.date}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{item.time_spent}</td>
                <td className="px-4 py-4 text-sm text-gray-800">
                  {item.activities_done ? safeJsonParse(item.activities_done).join(', ') : 'Aucune'}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                  <div className="flex items-center">
                    <div className="h-3 bg-gray-200 rounded-full flex-1 mr-2 overflow-hidden">
                      <div 
                        className="h-3 bg-blue-600 rounded-full" 
                        style={{ width: `${item.confidence_score * 10}%` }}
                      ></div>
                    </div>
                    <span className="font-medium">{item.confidence_score}/10</span>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Détails
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Component for Weekly Progress Table
function WeeklyProgressTable({ data, viewMode, profiles }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {viewMode === 'all' && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Apprenant</th>}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Semaine</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Temps</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Progrès</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Défi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={viewMode === 'all' ? 6 : 5} className="px-4 py-4 text-center text-gray-600 font-medium">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {viewMode === 'all' && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {profiles.find(p => p.id === item.profile_id)?.full_name || `Apprenant ${item.profile_id.slice(0, 5)}`}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">
                  {new Date(item.week_start_date).toLocaleDateString()} - {new Date(item.week_end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{item.weekly_time_spent}</td>
                <td className="px-4 py-4 text-sm text-gray-800">{item.biggest_progress}</td>
                <td className="px-4 py-4 text-sm text-gray-800">{item.biggest_challenge}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Détails
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Component for Monthly Progress Table
function MonthlyProgressTable({ data, viewMode, profiles }) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            {viewMode === 'all' && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Apprenant</th>}
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Mois</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Évaluation</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Changements</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Défi</th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={viewMode === 'all' ? 6 : 5} className="px-4 py-4 text-center text-gray-600 font-medium">
                Aucune donnée disponible
              </td>
            </tr>
          ) : (
            data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50">
                {viewMode === 'all' && (
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                    {profiles.find(p => p.id === item.profile_id)?.full_name || `Apprenant ${item.profile_id.slice(0, 5)}`}
                  </td>
                )}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-800">{item.month}</td>
                <td className="px-4 py-4 text-sm text-gray-800">{item.progression_evaluation}</td>
                <td className="px-4 py-4 text-sm text-gray-800">{item.changes_noticed || 'Non spécifié'}</td>
                <td className="px-4 py-4 text-sm text-gray-800">{item.biggest_monthly_challenge || 'Non spécifié'}</td>
                <td className="px-4 py-4 whitespace-nowrap text-sm">
                  <button className="text-blue-600 hover:text-blue-800 font-medium transition-colors">
                    Détails
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
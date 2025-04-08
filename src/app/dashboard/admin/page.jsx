'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import ActivityFormPopup from '@/app/components/ActivityFormPopup';
import { FiUser, FiFileText, FiCalendar, FiClock, FiTrendingUp, FiActivity, FiMic, FiSliders } from 'react-icons/fi';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedForm, setSelectedForm] = useState('daily');
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);
  const [formProgress, setFormProgress] = useState({
    dailyCount: 0,
    weeklyCount: 0,
    monthlyCount: 0
  });
  const [isAnalyticsView, setIsAnalyticsView] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      setUsers(profilesData || []);
      if (profilesData?.length) setSelectedUser(profilesData[0].id);
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;
    
    const fetchFormData = async () => {
      setLoading(true);
      
      try {
        // Calculer les dates basées sur la plage de temps sélectionnée
        const now = new Date();
        let startDate = new Date();
        
        switch(timeRange) {
          case '24h': startDate.setDate(now.getDate() - 1); break;
          case 'week': startDate.setDate(now.getDate() - 7); break;
          case 'month': startDate.setMonth(now.getMonth() - 1); break;
          case '3months': startDate.setMonth(now.getMonth() - 3); break;
          case 'all': startDate.setFullYear(now.getFullYear() - 1); break;
          default: startDate.setDate(now.getDate() - 7);
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        const [dailyData, weeklyData, monthlyData] = await Promise.all([
          supabase
            .from('daily_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .gte('date', formattedStartDate)
            .order('date', { ascending: false }),
          
          supabase
            .from('weekly_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .gte('week_start_date', formattedStartDate)
            .order('week_start_date', { ascending: false }),
          
          supabase
            .from('monthly_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .order('created_at', { ascending: false })
        ]);

        setFormData({
          daily: dailyData.data || [],
          weekly: weeklyData.data || [],
          monthly: monthlyData.data || []
        });

        setFormProgress({
          dailyCount: dailyData.data?.length || 0,
          weeklyCount: weeklyData.data?.length || 0,
          monthlyCount: monthlyData.data?.length || 0
        });

      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
  }, [selectedUser, timeRange]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderFormContent = () => {
    const data = formData[selectedForm];
    
    if (!data || data.length === 0) {
      return (
        <div className="text-center py-8 text-gray-500">
          Aucune donnée disponible pour ce formulaire
        </div>
      );
    }

    return (
      <div className="space-y-6">
        {data.map((item) => {
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center text-gray-700">
                  <FiCalendar className="mr-2" />
                  {selectedForm === 'daily' && (
                    <span>Rapport du {formatDate(item.date)}</span>
                  )}
                  {selectedForm === 'weekly' && (
                    <span>Semaine du {formatDate(item.week_start_date)} au {formatDate(item.week_end_date)}</span>
                  )}
                  {selectedForm === 'monthly' && (
                    <span>Rapport mensuel - {item.month}</span>
                  )}
                </div>
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                  {new Date(item.created_at).toLocaleString('fr-FR')}
                </span>
              </div>
              
              <div className="p-4">
                {selectedForm === 'daily' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Temps d'étude</h3>
                      <p className="text-gray-600">{item.time_spent || 'Non spécifié'}</p>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Niveau de confiance</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${(item.confidence_score/10)*100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{item.confidence_score}/10</span>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Activités réalisées</h3>
                      {item.activities_done && Object.keys(item.activities_done).length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-600">
                          {Object.entries(item.activities_done).map(([activity, done]) => (
                            done && <li key={activity}>{activity}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">Aucune activité spécifiée</p>
                      )}
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Nouvelles expressions</h3>
                      <p className="text-gray-600">{item.new_expressions_count || '0'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Difficultés rencontrées</h3>
                      {item.difficulties && Object.keys(item.difficulties).length > 0 ? (
                        <ul className="list-disc pl-5 text-gray-600">
                          {Object.entries(item.difficulties).map(([difficulty, present]) => (
                            present && <li key={difficulty}>{difficulty}</li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-500 italic">Aucune difficulté spécifiée</p>
                      )}
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Stratégies pour surmonter les difficultés</h3>
                      <p className="text-gray-600">{item.overcoming_strategies || 'Non spécifié'}</p>
                    </div>
                  </div>
                )}
                
                {selectedForm === 'weekly' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Temps d'étude total</h3>
                      <p className="text-gray-600">{item.weekly_time_spent || item.totalTime || 'Non spécifié'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Activité la plus efficace</h3>
                      <p className="text-gray-600">{item.most_effective_activity || 'Non spécifié'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Plus grand progrès</h3>
                      <p className="text-gray-600">{item.biggest_progress || 'Non spécifié'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Plus grand défi</h3>
                      <p className="text-gray-600">{item.biggest_challenge || 'Non spécifié'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Actions pour la semaine suivante</h3>
                      <p className="text-gray-600">{item.next_week_action || 'Non spécifié'}</p>
                    </div>
                    
                    {item.voice_record_sent && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-700 mb-2">Enregistrement vocal</h3>
                        <p className="text-gray-600">{item.voice_record_sent}</p>
                      </div>
                    )}
                  </div>
                )}
                
                {selectedForm === 'monthly' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Évaluation de la progression</h3>
                      <p className="text-gray-600">{item.progression_evaluation || 'Non spécifié'}</p>
                    </div>
                    
                    <div>
                      <h3 className="font-medium text-gray-700 mb-2">Niveau de confiance</h3>
                      <div className="flex items-center">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-500 h-2.5 rounded-full" 
                            style={{ width: `${(item.confidence_score/10)*100}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm text-gray-600">{item.confidence_score}/10</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Changements observés</h3>
                      <p className="text-gray-600">{item.changes_noticed || 'Non spécifié'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Plus grand défi du mois</h3>
                      <p className="text-gray-600">{item.biggest_monthly_challenge || 'Non spécifié'}</p>
                    </div>
                    
                    <div className="md:col-span-2">
                      <h3 className="font-medium text-gray-700 mb-2">Nouvelles compétences acquises</h3>
                      <ul className="list-disc pl-5 text-gray-600">
                        {item.newSkill1 && <li>{item.newSkill1}</li>}
                        {item.newSkill2 && <li>{item.newSkill2}</li>}
                        {item.newSkill3 && <li>{item.newSkill3}</li>}
                        {!item.newSkill1 && !item.newSkill2 && !item.newSkill3 && (
                          <li className="text-gray-500 italic">Aucune compétence spécifiée</li>
                        )}
                      </ul>
                    </div>
                    <button 
  className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-2 px-4 rounded"
  onClick={() => {
    // Rechargement forcé des données
    if (selectedUser) {
      console.log('Force refreshing data for user:', selectedUser);
      // Réexécuter vos fetchFormData ici
    }
  }}
>
  Actualiser les données
</button>
                    {item.voice_record_sent && (
                      <div className="md:col-span-2">
                        <h3 className="font-medium text-gray-700 mb-2">Enregistrement vocal</h3>
                        <p className="text-gray-600">{item.voice_record_sent}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderAnalyticsView = () => {
    // Ces graphiques seraient plus élaborés, mais je les simplifie pour l'exemple
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Aperçu des statistiques</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Formulaires quotidiens</p>
                  <p className="text-xl font-semibold text-blue-600">{formProgress.dailyCount}</p>
                </div>
                <FiFileText className="text-blue-500" size={24} />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Formulaires hebdomadaires</p>
                  <p className="text-xl font-semibold text-green-600">{formProgress.weeklyCount}</p>
                </div>
                <FiFileText className="text-green-500" size={24} />
              </div>
            </div>
            
            <div className="bg-amber-50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-600">Formulaires mensuels</p>
                  <p className="text-xl font-semibold text-amber-600">{formProgress.monthlyCount}</p>
                </div>
                <FiFileText className="text-amber-500" size={24} />
              </div>
            </div>
          </div>
          
          <div className="mt-6 border-t pt-4 border-gray-200">
            <p className="text-gray-600">
              Pour des graphiques et analyses détaillés, veuillez utiliser le mode d'analyse complet.
            </p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Tableau de bord administrateur</h1>
            <p className="text-sm md:text-base text-gray-500">Suivi des progrès des apprenants</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.full_name || user.email}</option>
              ))}
            </select>
            
            <select
              className="bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              <option value="24h">24 dernières heures</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="all">Toutes les données</option>
            </select>

            <div className="flex flex-row gap-2">
              <button
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
                onClick={() => setActivityFormOpen(true)}
              >
                Ajouter une activité
              </button>
              
              <button
                className={`${
                  isAnalyticsView 
                    ? "bg-gray-200 text-gray-700 hover:bg-gray-300" 
                    : "bg-purple-600 hover:bg-purple-700 text-white"
                } px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap flex items-center gap-2`}
                onClick={() => setIsAnalyticsView(!isAnalyticsView)}
              >
                <FiSliders size={16} />
                {isAnalyticsView ? 'Voir les formulaires' : 'Analytics'}
              </button>
            </div>
          </div>
        </div>

        {/* Form Type Selector */}
        {!isAnalyticsView && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-2 mb-6">
            <div className="flex gap-2">
              <button
                className={`flex-1 py-2 px-4 rounded-md text-center ${
                  selectedForm === 'daily' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedForm('daily')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiFileText size={16} />
                  <span>Formulaires quotidiens</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{formProgress.dailyCount}</span>
                </div>
              </button>
              
              <button
                className={`flex-1 py-2 px-4 rounded-md text-center ${
                  selectedForm === 'weekly' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedForm('weekly')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiFileText size={16} />
                  <span>Formulaires hebdomadaires</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{formProgress.weeklyCount}</span>
                </div>
              </button>
              
              <button
                className={`flex-1 py-2 px-4 rounded-md text-center ${
                  selectedForm === 'monthly' 
                    ? 'bg-blue-100 text-blue-700 font-medium' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
                onClick={() => setSelectedForm('monthly')}
              >
                <div className="flex items-center justify-center gap-2">
                  <FiFileText size={16} />
                  <span>Formulaires mensuels</span>
                  <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">{formProgress.monthlyCount}</span>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Main Content */}
        {loading ? (
          <div className="flex justify-center items-center h-64 bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center space-x-2 text-gray-500">
              <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Chargement des données...</span>
            </div>
          </div>
        ) : (
          <>
            {isAnalyticsView ? renderAnalyticsView() : renderFormContent()}
          </>
        )}
      </div>

      <ActivityFormPopup
        isOpen={isActivityFormOpen}
        onClose={() => setActivityFormOpen(false)}
      />
    </div>
  );
}
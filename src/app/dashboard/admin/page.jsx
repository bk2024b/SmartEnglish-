'use client'

import ActivityFormPopup from '@/app/components/ActivityFormPopup';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [dailyProgressData, setDailyProgressData] = useState([]);
  const [weeklyProgressData, setWeeklyProgressData] = useState([]);
  const [monthlyProgressData, setMonthlyProgressData] = useState([]);
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [timeRange, setTimeRange] = useState('week'); // 'week', 'month', '3months', 'all'
  const [loading, setLoading] = useState(true);
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);

  // Couleurs pour les graphiques - plus vives pour meilleur contraste
  const COLORS = ['#0066FF', '#00B050', '#FF9900', '#FF3333', '#8834FF', '#00CCCC'];

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUser) {
      fetchData(selectedUser);
    }
  }, [selectedUser, timeRange]);

  const fetchUsers = async () => {
    try {
      // Utiliser la table profiles que nous venons de créer
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email');
      
      if (profilesError) throw profilesError;
      
      const formattedUsers = profilesData || [];
      setUsers(formattedUsers);
      
      if (formattedUsers.length > 0) {
        setSelectedUser(formattedUsers[0].id);
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchData = async (userId) => {
    setLoading(true);
    
    try {
      // Déterminer les dates de début en fonction du timeRange
      const now = new Date();
      let startDate = new Date();
      
      switch(timeRange) {
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case '3months':
          startDate.setMonth(now.getMonth() - 3);
          break;
        case 'all':
          startDate.setMonth(now.getMonth() - 6);
          break;
        default:
          startDate.setDate(now.getDate() - 7);
      }
      
      const formattedStartDate = startDate.toISOString().split('T')[0];
      
      // Récupérer les données quotidiennes
      const { data: dailyData, error: dailyError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('profile_id', userId)
        .gte('date', formattedStartDate)
        .order('date', { ascending: true });
      
      if (dailyError) throw dailyError;
      setDailyProgressData(dailyData);
      
      // Récupérer les données hebdomadaires
      const { data: weeklyData, error: weeklyError } = await supabase
        .from('weekly_progress')
        .select('*')
        .eq('profile_id', userId)
        .gte('week_start_date', formattedStartDate)
        .order('week_start_date', { ascending: true });
      
      if (weeklyError) throw weeklyError;
      setWeeklyProgressData(weeklyData);
      
      // Récupérer les données mensuelles
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_progress')
        .select('*')
        .eq('profile_id', userId)
        .order('month', { ascending: true });
      
      if (monthlyError) throw monthlyError;
      setMonthlyProgressData(monthlyData);
      
      // Récupérer les enregistrements audio
      const { data: audioData, error: audioError } = await supabase
        .from('audio_notes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (audioError) throw audioError;
      setAudioRecordings(audioData);
      
    } catch (error) {
      console.error('Erreur lors de la récupération des données:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour convertir les temps en minutes
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    
    const regex = /(\d+)h\s*(\d+)min/;
    const match = timeString.match(regex);
    
    if (match) {
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      return hours * 60 + minutes;
    }
    
    return 0;
  };

  // Préparation des données pour les graphiques
  const prepareTimeSpentData = () => {
    return dailyProgressData.map(day => ({
      date: day.date,
      timeSpent: convertTimeToMinutes(day.time_spent)
    }));
  };

  const prepareConfidenceData = () => {
    return dailyProgressData.map(day => ({
      date: day.date,
      confidence: day.confidence_score
    }));
  };

  const prepareActivitiesData = () => {
    const activities = {};
    
    dailyProgressData.forEach(day => {
      if (day.activities_done && typeof day.activities_done === 'object') {
        Object.entries(day.activities_done).forEach(([activity, value]) => {
          if (value === true) {
            activities[activity] = (activities[activity] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(activities).map(([name, count]) => ({
      name,
      count
    }));
  };
  
  const prepareDifficultiesData = () => {
    const difficulties = {};
    
    dailyProgressData.forEach(day => {
      if (day.difficulties && typeof day.difficulties === 'object') {
        Object.entries(day.difficulties).forEach(([difficulty, value]) => {
          if (value === true) {
            difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
          }
        });
      }
    });
    
    return Object.entries(difficulties).map(([name, count]) => ({
      name,
      count
    }));
  };

  const prepareNewExpressionsData = () => {
    return dailyProgressData.map(day => ({
      date: day.date,
      count: parseInt(day.new_expressions_count || 0)
    }));
  };

  // Calcul des statistiques globales
  const calculateStats = () => {
    if (!dailyProgressData.length) return { totalTimeSpent: 0, avgConfidence: 0, totalActivities: 0, totalExpressions: 0 };
    
    const totalTimeSpent = dailyProgressData.reduce((sum, day) => sum + convertTimeToMinutes(day.time_spent), 0);
    const avgConfidence = dailyProgressData.reduce((sum, day) => sum + (day.confidence_score || 0), 0) / dailyProgressData.length;
    
    const activitiesCount = dailyProgressData.reduce((sum, day) => {
      if (day.activities_done && typeof day.activities_done === 'object') {
        return sum + Object.values(day.activities_done).filter(v => v === true).length;
      }
      return sum;
    }, 0);
    
    const totalExpressions = dailyProgressData.reduce((sum, day) => sum + parseInt(day.new_expressions_count || 0), 0);
    
    return {
      totalTimeSpent,
      avgConfidence,
      activitiesCount,
      totalExpressions
    };
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-white">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Dashboard de Suivi des Apprenants</h1>
      
      {/* Sélecteur d'utilisateur et de période */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="w-64">
          <label className="block text-base font-medium text-gray-800 mb-1">Sélectionner un apprenant</label>
          <select 
            className="w-full p-2 border border-gray-400 rounded-md text-gray-800 bg-white"
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value)}
            disabled={loading}
          >
            {users.map(user => (
              <option key={user.id} value={user.id}>{user.email}</option>
            ))}
          </select>
        </div>
        
        <div className="w-64">
          <label className="block text-base font-medium text-gray-800 mb-1">Période</label>
          <select 
            className="w-full p-2 border border-gray-400 rounded-md text-gray-800 bg-white"
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            disabled={loading}
          >
            <option value="week">7 derniers jours</option>
            <option value="month">30 derniers jours</option>
            <option value="3months">3 derniers mois</option>
            <option value="all">Programme entier (6 mois)</option>
          </select>
        </div>
        
        <div className="flex items-end">
          <button 
            className="bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800 font-medium"
            onClick={() => setActivityFormOpen(true)}
          >
            Ajouter une activité
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-800">Chargement des données...</div>
        </div>
      ) : (
        <>
          {/* Statistiques principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {(() => {
              const stats = calculateStats();
              return (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg shadow border border-blue-100">
                    <h3 className="text-lg font-semibold text-gray-800">Temps Total</h3>
                    <p className="text-2xl font-bold text-blue-700">{Math.floor(stats.totalTimeSpent / 60)}h {stats.totalTimeSpent % 60}min</p>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg shadow border border-green-100">
                    <h3 className="text-lg font-semibold text-gray-800">Confiance Moyenne</h3>
                    <p className="text-2xl font-bold text-green-700">{stats.avgConfidence.toFixed(1)}/10</p>
                  </div>
                  
                  <div className="bg-amber-50 p-4 rounded-lg shadow border border-amber-100">
                    <h3 className="text-lg font-semibold text-gray-800">Activités Complétées</h3>
                    <p className="text-2xl font-bold text-amber-700">{stats.activitiesCount}</p>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg shadow border border-purple-100">
                    <h3 className="text-lg font-semibold text-gray-800">Nouvelles Expressions</h3>
                    <p className="text-2xl font-bold text-purple-700">{stats.totalExpressions}</p>
                  </div>
                </>
              );
            })()}
          </div>
          
          {/* Graphiques */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Temps passé par jour */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Temps d'étude quotidien (en minutes)</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareTimeSpentData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="date" tick={{fill: '#333'}} />
                    <YAxis tick={{fill: '#333'}} />
                    <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #ccc'}} />
                    <Legend wrapperStyle={{color: '#333'}} />
                    <Line type="monotone" dataKey="timeSpent" stroke="#0066FF" strokeWidth={2} name="Temps (min)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Niveau de confiance */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Évolution du niveau de confiance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={prepareConfidenceData()}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="date" tick={{fill: '#333'}} />
                    <YAxis domain={[0, 10]} tick={{fill: '#333'}} />
                    <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #ccc'}} />
                    <Legend wrapperStyle={{color: '#333'}} />
                    <Line type="monotone" dataKey="confidence" stroke="#00B050" strokeWidth={2} name="Confiance (/10)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Activités réalisées */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Activités les plus pratiquées</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={prepareActivitiesData().sort((a, b) => b.count - a.count).slice(0, 5)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                    <XAxis dataKey="name" tick={{fill: '#333'}} />
                    <YAxis tick={{fill: '#333'}} />
                    <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #ccc'}} />
                    <Legend wrapperStyle={{color: '#333'}} />
                    <Bar dataKey="count" fill="#FF9900" name="Fréquence" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Difficultés rencontrées */}
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Difficultés rencontrées</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={prepareDifficultiesData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {prepareDifficultiesData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #ccc'}} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Progression sur 6 mois */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Progression sur le programme de 6 mois</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ccc" />
                  <XAxis dataKey="month" tick={{fill: '#333'}} />
                  <YAxis domain={[0, 10]} tick={{fill: '#333'}} />
                  <Tooltip contentStyle={{backgroundColor: 'white', border: '1px solid #ccc'}} />
                  <Legend wrapperStyle={{color: '#333'}} />
                  <Line type="monotone" dataKey="confidence_score" stroke="#FF3333" strokeWidth={2} name="Confiance" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          {/* Enregistrements vocaux */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Enregistrements vocaux récents</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Titre</th>
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Date</th>
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {audioRecordings.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="p-3 text-center text-gray-700">Aucun enregistrement disponible</td>
                    </tr>
                  ) : (
                    audioRecordings.map(recording => (
                      <tr key={recording.id} className="border-t hover:bg-gray-50">
                        <td className="p-3 text-gray-700">{recording.title}</td>
                        <td className="p-3 text-gray-700">{new Date(recording.created_at).toLocaleDateString()}</td>
                        <td className="p-3">
                          <a 
                            href={recording.file_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-700 hover:underline font-medium"
                          >
                            Écouter
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Résumé des stratégies et défis */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Stratégies utilisées</h3>
              <ul className="space-y-2">
                {dailyProgressData.slice(-5).map((day, index) => (
                  <li key={index} className="p-3 bg-blue-50 rounded border border-blue-100">
                    <span className="font-medium text-blue-800">{day.date}</span>: 
                    <span className="text-gray-800 ml-2">{day.overcoming_strategies || "Aucune stratégie notée"}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Défis hebdomadaires</h3>
              <ul className="space-y-2">
                {weeklyProgressData.slice(-5).map((week, index) => (
                  <li key={index} className="p-3 bg-purple-50 rounded border border-purple-100">
                    <span className="font-medium text-purple-800">{week.week_start_date} - {week.week_end_date}</span>: 
                    <span className="text-gray-800 ml-2">{week.biggest_challenge || "Aucun défi noté"}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          {/* Nouvelles compétences acquises */}
          <div className="bg-white p-4 rounded-lg shadow border border-gray-200 mb-6">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Nouvelles compétences acquises</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Mois</th>
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Compétence 1</th>
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Compétence 2</th>
                    <th className="p-3 text-left font-semibold text-gray-800 border-b-2 border-gray-300">Compétence 3</th>
                  </tr>
                </thead>
                <tbody>
                  {monthlyProgressData.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-3 text-center text-gray-700">Aucune compétence enregistrée</td>
                    </tr>
                  ) : (
                    monthlyProgressData.map(month => (
                      <tr key={month.id || month.month} className="border-t hover:bg-gray-50">
                        <td className="p-3 font-medium text-gray-800">{month.month}</td>
                        <td className="p-3 text-gray-700">{month.newSkill1 || "-"}</td>
                        <td className="p-3 text-gray-700">{month.newSkill2 || "-"}</td>
                        <td className="p-3 text-gray-700">{month.newSkill3 || "-"}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
      
      {/* Formulaire d'ajout d'activité (utilise la popup existante) */}
      <ActivityFormPopup
        isOpen={isActivityFormOpen}
        onClose={() => setActivityFormOpen(false)}
      />
    </div>
  );
};
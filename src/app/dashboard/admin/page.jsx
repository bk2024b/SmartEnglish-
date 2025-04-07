'use client'

import ActivityFormPopup from '@/app/components/ActivityFormPopup';
import React, { useState, useEffect } from 'react';
import { supabase } from '../../utils/supabaseClient';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell
} from 'recharts';
import { FiUser, FiClock, FiActivity, FiAward, FiTrendingUp, FiMic, FiCalendar } from 'react-icons/fi';

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [progressData, setProgressData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [timeRange, setTimeRange] = useState('24h'); // Ajout de 24h comme valeur par défaut
  const [loading, setLoading] = useState(true);
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);

  // Couleurs plus contrastées pour une meilleure lisibilité
  const COLORS = ['#2563eb', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2'];
  const TEXT_COLORS = {
    primary: 'text-gray-900',
    secondary: 'text-gray-700',
    muted: 'text-gray-500'
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, full_name');
      
      setUsers(profilesData || []);
      if (profilesData?.length) setSelectedUser(profilesData[0].id);
    };

    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchUserData = async () => {
      setLoading(true);
      
      try {
        const now = new Date();
        let startDate = new Date();
        
        switch(timeRange) {
          case '24h': 
            startDate.setDate(now.getDate() - 1); 
            break;
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
            startDate.setDate(now.getDate() - 1);
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        const [
          { data: dailyData },
          { data: weeklyData },
          { data: monthlyData },
          { data: audioData }
        ] = await Promise.all([
          supabase
            .from('daily_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .gte('date', formattedStartDate)
            .order('date', { ascending: true }),
          
          supabase
            .from('weekly_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .gte('week_start_date', formattedStartDate)
            .order('week_start_date', { ascending: true }),
          
          supabase
            .from('monthly_progress')
            .select('*')
            .eq('profile_id', selectedUser)
            .order('month', { ascending: true }),
          
          supabase
            .from('audio_notes')
            .select('*')
            .eq('user_id', selectedUser)
            .order('created_at', { ascending: false })
        ]);

        setProgressData({
          daily: dailyData || [],
          weekly: weeklyData || [],
          monthly: monthlyData || []
        });
        setAudioRecordings(audioData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedUser, timeRange]);

  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+)h\s*(\d+)min/);
    return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
  };

  const prepareChartData = {
    timeSpent: () => progressData.daily.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      value: convertTimeToMinutes(day.time_spent)
    })),
    
    confidence: () => progressData.daily.map(day => ({
      date: new Date(day.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }),
      value: day.confidence_score || 0
    })),
    
    activities: () => {
      const activities = {};
      progressData.daily.forEach(day => {
        if (day.activities_done) {
          Object.entries(day.activities_done).forEach(([activity, done]) => {
            if (done) activities[activity] = (activities[activity] || 0) + 1;
          });
        }
      });
      return Object.entries(activities)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);
    },
    
    difficulties: () => {
      const difficulties = {};
      progressData.daily.forEach(day => {
        if (day.difficulties) {
          Object.entries(day.difficulties).forEach(([difficulty, present]) => {
            if (present) difficulties[difficulty] = (difficulties[difficulty] || 0) + 1;
          });
        }
      });
      return Object.entries(difficulties).map(([name, count]) => ({ name, count }));
    }
  };

  const calculateStats = () => {
    const daily = progressData.daily;
    if (!daily.length) return {
      totalTime: 0,
      avgConfidence: 0,
      totalActivities: 0,
      totalExpressions: 0
    };

    const totalTime = daily.reduce((sum, day) => sum + convertTimeToMinutes(day.time_spent), 0);
    const avgConfidence = daily.reduce((sum, day) => sum + (day.confidence_score || 0), 0) / daily.length;
    const totalActivities = daily.reduce((sum, day) => {
      return sum + (day.activities_done ? Object.values(day.activities_done).filter(v => v).length : 0);
    }, 0);
    const totalExpressions = daily.reduce((sum, day) => sum + parseInt(day.new_expressions_count || 0), 0);

    return { totalTime, avgConfidence, totalActivities, totalExpressions };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className={`text-2xl md:text-3xl font-bold ${TEXT_COLORS.primary}`}>Tableau de bord administrateur</h1>
            <p className={`text-sm md:text-base ${TEXT_COLORS.muted}`}>Suivi des progrès des apprenants</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <select
              className={`bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${TEXT_COLORS.primary}`}
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
            
            <select
              className={`bg-white border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${TEXT_COLORS.primary}`}
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              <option value="24h">24 dernières heures</option>
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="all">Tout le programme</option>
            </select>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap"
              onClick={() => setActivityFormOpen(true)}
            >
              Ajouter une activité
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className={`animate-pulse ${TEXT_COLORS.muted}`}>Chargement des données...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${TEXT_COLORS.muted}`}>Temps total</h3>
                    <p className={`text-xl font-bold mt-1 text-blue-600`}>
                      {Math.floor(stats.totalTime / 60)}h {stats.totalTime % 60}min
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50">
                    <FiClock className="text-blue-500" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${TEXT_COLORS.muted}`}>Confiance moyenne</h3>
                    <p className={`text-xl font-bold mt-1 text-green-600`}>
                      {stats.avgConfidence.toFixed(1)}/10
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-green-50">
                    <FiTrendingUp className="text-green-500" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${TEXT_COLORS.muted}`}>Activités complétées</h3>
                    <p className={`text-xl font-bold mt-1 text-amber-600`}>
                      {stats.totalActivities}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-amber-50">
                    <FiActivity className="text-amber-500" size={20} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className={`text-sm font-medium ${TEXT_COLORS.muted}`}>Nouvelles expressions</h3>
                    <p className={`text-xl font-bold mt-1 text-purple-600`}>
                      {stats.totalExpressions}
                    </p>
                  </div>
                  <div className="p-2 rounded-full bg-purple-50">
                    <FiAward className="text-purple-500" size={20} />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="space-y-6">
              {/* Time and Confidence Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Temps d'étude (minutes)</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData.timeSpent()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#374151' }} 
                          tickMargin={10}
                        />
                        <YAxis 
                          tick={{ fill: '#374151' }}
                          tickMargin={10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                            border: '1px solid #e5e7eb',
                            color: '#111827'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#2563eb" 
                          strokeWidth={2} 
                          dot={{ r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Niveau de confiance</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={prepareChartData.confidence()}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fill: '#374151' }}
                          tickMargin={10}
                        />
                        <YAxis 
                          domain={[0, 10]} 
                          tick={{ fill: '#374151' }}
                          tickMargin={10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            color: '#111827'
                          }} 
                        />
                        <Line 
                          type="monotone" 
                          dataKey="value" 
                          stroke="#059669" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6, strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Activities and Difficulties Charts */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Activités fréquentes</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={prepareChartData.activities()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                        <XAxis 
                          dataKey="name" 
                          tick={{ fill: '#374151' }}
                          tickMargin={10}
                        />
                        <YAxis 
                          tick={{ fill: '#374151' }}
                          tickMargin={10}
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            color: '#111827'
                          }} 
                        />
                        <Bar 
                          dataKey="count" 
                          fill="#d97706" 
                          radius={[4, 4, 0, 0]}
                          animationDuration={1500}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Difficultés rencontrées</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={prepareChartData.difficulties()}
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="count"
                          nameKey="name"
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                          labelLine={false}
                        >
                          {prepareChartData.difficulties().map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'white',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            color: '#111827'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Monthly Progress */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Progression mensuelle</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={progressData.monthly}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                      <XAxis 
                        dataKey="month" 
                        tick={{ fill: '#374151' }}
                        tickMargin={10}
                      />
                      <YAxis 
                        domain={[0, 10]} 
                        tick={{ fill: '#374151' }}
                        tickMargin={10}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white',
                          borderRadius: '0.5rem',
                          border: '1px solid #e5e7eb',
                          color: '#111827'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="confidence_score" 
                        stroke="#7c3aed" 
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        activeDot={{ r: 6, strokeWidth: 2 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Recent Recordings */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className={`text-lg font-semibold ${TEXT_COLORS.primary}`}>Enregistrements vocaux</h3>
                  <div className={`flex items-center ${TEXT_COLORS.muted}`}>
                    <FiMic className="mr-2" size={18} />
                    <span className="text-sm">{audioRecordings.length} enregistrement(s)</span>
                  </div>
                </div>
                
                {audioRecordings.length > 0 ? (
                  <div className="space-y-3">
                    {audioRecordings.slice(0, 5).map(recording => (
                      <div key={recording.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <h4 className={`font-medium ${TEXT_COLORS.primary}`}>{recording.title}</h4>
                          <p className={`text-xs ${TEXT_COLORS.muted}`}>
                            {new Date(recording.created_at).toLocaleDateString('fr-FR', {
                              day: 'numeric',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                        <a
                          href={recording.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                        >
                          Écouter
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={`text-center py-6 ${TEXT_COLORS.muted}`}>
                    Aucun enregistrement disponible
                  </div>
                )}
              </div>

              {/* Challenges and Skills */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Défis récents</h3>
                  <div className="space-y-3">
                    {progressData.weekly.slice(0, 3).map((week, index) => (
                      <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-center text-amber-800 mb-1">
                          <FiCalendar className="mr-2" size={16} />
                          <span className="font-medium text-sm">
                            {new Date(week.week_start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - 
                            {new Date(week.week_end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                          </span>
                        </div>
                        <p className={`text-sm ${TEXT_COLORS.primary}`}>
                          {week.biggest_challenge || "Aucun défi noté cette semaine"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
                  <h3 className={`text-lg font-semibold mb-4 ${TEXT_COLORS.primary}`}>Compétences acquises</h3>
                  <div className="space-y-3">
                    {progressData.monthly.slice(0, 3).map((month, index) => (
                      <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <div className="flex items-center text-green-800 mb-1">
                          <FiCalendar className="mr-2" size={16} />
                          <span className="font-medium text-sm">{month.month}</span>
                        </div>
                        <ul className="list-disc list-inside space-y-1">
                          {[month.newSkill1, month.newSkill2, month.newSkill3]
                            .filter(skill => skill)
                            .map((skill, i) => (
                              <li key={i} className={`text-sm ${TEXT_COLORS.primary}`}>{skill}</li>
                            ))}
                          {![month.newSkill1, month.newSkill2, month.newSkill3].some(Boolean) && (
                            <li className={`text-xs ${TEXT_COLORS.muted}`}>Aucune compétence enregistrée</li>
                          )}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
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
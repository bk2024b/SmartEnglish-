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
  const [users, setUsers] = useState<{id: string, email: string}[]>([]);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [progressData, setProgressData] = useState({
    daily: [],
    weekly: [],
    monthly: []
  });
  const [audioRecordings, setAudioRecordings] = useState([]);
  const [timeRange, setTimeRange] = useState('week');
  const [loading, setLoading] = useState(true);
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

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
        // Calculate date range
        const now = new Date();
        let startDate = new Date();
        
        switch(timeRange) {
          case 'week': startDate.setDate(now.getDate() - 7); break;
          case 'month': startDate.setMonth(now.getMonth() - 1); break;
          case '3months': startDate.setMonth(now.getMonth() - 3); break;
          case 'all': startDate.setMonth(now.getMonth() - 6); break;
          default: startDate.setDate(now.getDate() - 7);
        }

        const formattedStartDate = startDate.toISOString().split('T')[0];
        
        // Fetch all data in parallel
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

  // Data processing functions
  const convertTimeToMinutes = (timeString) => {
    if (!timeString) return 0;
    const match = timeString.match(/(\d+)h\s*(\d+)min/);
    return match ? parseInt(match[1]) * 60 + parseInt(match[2]) : 0;
  };

  const prepareChartData = {
    timeSpent: () => progressData.daily.map(day => ({
      date: day.date,
      value: convertTimeToMinutes(day.time_spent)
    })),
    
    confidence: () => progressData.daily.map(day => ({
      date: day.date,
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
    },
    
    expressions: () => progressData.daily.map(day => ({
      date: day.date,
      value: parseInt(day.new_expressions_count || 0)
    }))
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
      return sum + (day.activities_done ? Object.values(day.activities_done).filter(Boolean).length : 0);
    }, 0);
    const totalExpressions = daily.reduce((sum, day) => sum + parseInt(day.new_expressions_count || 0), 0);

    return { totalTime, avgConfidence, totalActivities, totalExpressions };
  };

  const stats = calculateStats();

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Tableau de bord administrateur</h1>
            <p className="text-gray-600">Suivi des progrès des apprenants</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 mt-4 md:mt-0">
            <select
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={selectedUser || ''}
              onChange={(e) => setSelectedUser(e.target.value)}
              disabled={loading}
            >
              {users.map(user => (
                <option key={user.id} value={user.id}>{user.email}</option>
              ))}
            </select>
            
            <select
              className="bg-white border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              disabled={loading}
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="3months">3 derniers mois</option>
              <option value="all">Tout le programme</option>
            </select>
            
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              onClick={() => setActivityFormOpen(true)}
            >
              Ajouter une activité
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-500">Chargement des données...</div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard 
                icon={<FiClock className="text-blue-500" size={24} />}
                title="Temps total"
                value={`${Math.floor(stats.totalTime / 60)}h ${stats.totalTime % 60}min`}
                color="blue"
              />
              
              <StatCard 
                icon={<FiTrendingUp className="text-green-500" size={24} />}
                title="Confiance moyenne"
                value={`${stats.avgConfidence.toFixed(1)}/10`}
                color="green"
              />
              
              <StatCard 
                icon={<FiActivity className="text-amber-500" size={24} />}
                title="Activités complétées"
                value={stats.totalActivities}
                color="amber"
              />
              
              <StatCard 
                icon={<FiAward className="text-purple-500" size={24} />}
                title="Nouvelles expressions"
                value={stats.totalExpressions}
                color="purple"
              />
            </div>

            {/* Main Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Temps d'étude quotidien (minutes)">
                <LineChart data={prepareChartData.timeSpent()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white',
                      borderRadius: '0.5rem',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      border: 'none'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#3B82F6" 
                    strokeWidth={2} 
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartCard>

              <ChartCard title="Niveau de confiance">
                <LineChart data={prepareChartData.confidence()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" tick={{ fill: '#6b7280' }} />
                  <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: 'none' }} />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 2 }}
                  />
                </LineChart>
              </ChartCard>
            </div>

            {/* Secondary Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <ChartCard title="Activités les plus pratiquées">
                <BarChart data={prepareChartData.activities()}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280' }} />
                  <YAxis tick={{ fill: '#6b7280' }} />
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: 'none' }} />
                  <Bar 
                    dataKey="count" 
                    fill="#F59E0B" 
                    radius={[4, 4, 0, 0]}
                    animationDuration={1500}
                  />
                </BarChart>
              </ChartCard>

              <ChartCard title="Difficultés rencontrées">
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
                  <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: 'none' }} />
                </PieChart>
              </ChartCard>
            </div>

            {/* Monthly Progress */}
            <ChartCard 
              title="Progression mensuelle" 
              className="mb-8"
              fullWidth
            >
              <LineChart data={progressData.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="month" tick={{ fill: '#6b7280' }} />
                <YAxis domain={[0, 10]} tick={{ fill: '#6b7280' }} />
                <Tooltip contentStyle={{ backgroundColor: 'white', borderRadius: '0.5rem', border: 'none' }} />
                <Line 
                  type="monotone" 
                  dataKey="confidence_score" 
                  stroke="#8B5CF6" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6, strokeWidth: 2 }}
                />
              </LineChart>
            </ChartCard>

            {/* Recent Recordings */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900">Enregistrements vocaux</h3>
                <div className="flex items-center text-gray-500">
                  <FiMic className="mr-2" />
                  <span>{audioRecordings.length} enregistrement(s)</span>
                </div>
              </div>
              
              {audioRecordings.length > 0 ? (
                <div className="space-y-4">
                  {audioRecordings.slice(0, 5).map(recording => (
                    <div key={recording.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{recording.title}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(recording.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      </div>
                      <a
                        href={recording.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        Écouter
                      </a>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun enregistrement disponible pour cet apprenant
                </div>
              )}
            </div>

            {/* Challenges and Skills */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Défis récents</h3>
                <div className="space-y-4">
                  {progressData.weekly.slice(0, 3).map((week, index) => (
                    <div key={index} className="p-4 bg-amber-50 rounded-lg border border-amber-100">
                      <div className="flex items-center text-amber-800 mb-2">
                        <FiCalendar className="mr-2" />
                        <span className="font-medium">
                          {new Date(week.week_start_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - 
                          {new Date(week.week_end_date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        </span>
                      </div>
                      <p className="text-gray-800">
                        {week.biggest_challenge || "Aucun défi noté cette semaine"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Compétences acquises</h3>
                <div className="space-y-4">
                  {progressData.monthly.slice(0, 3).map((month, index) => (
                    <div key={index} className="p-4 bg-green-50 rounded-lg border border-green-100">
                      <div className="flex items-center text-green-800 mb-2">
                        <FiCalendar className="mr-2" />
                        <span className="font-medium">{month.month}</span>
                      </div>
                      <ul className="list-disc list-inside text-gray-800 space-y-1">
                        {[month.newSkill1, month.newSkill2, month.newSkill3]
                          .filter(skill => skill)
                          .map((skill, i) => (
                            <li key={i}>{skill}</li>
                          ))}
                        {![month.newSkill1, month.newSkill2, month.newSkill3].some(Boolean) && (
                          <li className="text-gray-500">Aucune compétence enregistrée</li>
                        )}
                      </ul>
                    </div>
                  ))}
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

// Reusable components
const StatCard = ({ icon, title, value, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-100',
    green: 'bg-green-50 border-green-100',
    amber: 'bg-amber-50 border-amber-100',
    purple: 'bg-purple-50 border-purple-100'
  };

  const textColors = {
    blue: 'text-blue-600',
    green: 'text-green-600',
    amber: 'text-amber-600',
    purple: 'text-purple-600'
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-xl border shadow-sm`}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className={`${textColors[color]} text-2xl font-bold mt-2`}>{value}</p>
        </div>
        <div className="p-3 rounded-full bg-white shadow-sm">
          {icon}
        </div>
      </div>
    </div>
  );
};

const ChartCard = ({ title, children, className = '', fullWidth = false }) => {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-6 ${className} ${
      fullWidth ? 'col-span-1 lg:col-span-2' : ''
    }`}>
      <h3 className="text-xl font-semibold text-gray-900 mb-6">{title}</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
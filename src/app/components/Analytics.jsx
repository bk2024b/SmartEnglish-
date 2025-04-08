'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

function Analytics() {
  const [stats, setStats] = useState({
    totalStudents: 0,
    averageConfidence: 0,
    totalActivities: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  async function fetchAnalytics() {
    try {
      setLoading(true);
      
      // Fetch total students
      const { count: studentsCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Fetch average confidence
      const { data: confidenceData } = await supabase
        .from('daily_progress')
        .select('confidence_score');
      
      const averageConfidence = confidenceData?.reduce((acc, curr) => acc + curr.confidence_score, 0) / (confidenceData?.length || 1);

      // Fetch total activities
      const { count: activitiesCount } = await supabase
        .from('activities')
        .select('*', { count: 'exact' });

      setStats({
        totalStudents: studentsCount || 0,
        averageConfidence: Math.round(averageConfidence * 10) / 10,
        totalActivities: activitiesCount || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Analytics Overview</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Students</h3>
            <p className="text-2xl md:text-3xl font-bold text-blue-600 mt-2">{stats.totalStudents}</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900">Average Confidence</h3>
            <p className="text-2xl md:text-3xl font-bold text-green-600 mt-2">{stats.averageConfidence}/10</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-4 md:p-6">
            <h3 className="text-lg font-semibold text-gray-900">Total Activities</h3>
            <p className="text-2xl md:text-3xl font-bold text-purple-600 mt-2">{stats.totalActivities}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Analytics;
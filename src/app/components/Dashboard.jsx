'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { format } from 'date-fns';
import { PlusCircle, ChevronRight, ChevronLeft } from 'lucide-react';

function Dashboard() {
  const [dailyProgress, setDailyProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const itemsPerPage = 10;

  useEffect(() => {
    fetchDailyProgress();
  }, [currentPage]);

  async function fetchDailyProgress() {
    try {
      setLoading(true);
      
      // First, get the total count for pagination
      const { count } = await supabase
        .from('daily_progress')
        .select('*', { count: 'exact', head: true });
      
      setTotalCount(count || 0);
      
      // Fetch daily progress data
      const { data: progressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('*')
        .order('date', { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (progressError) throw progressError;
      
      // For each progress item, fetch the related profile separately
      const enrichedData = await Promise.all(
        (progressData || []).map(async (progress) => {
          // Assuming daily_progress has a profile_id column referring to profiles.id
          const { data: profileData } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', progress.profile_id)
            .single();
            
          return {
            ...progress,
            profile: profileData
          };
        })
      );
      
      setDailyProgress(enrichedData);
    } catch (error) {
      console.error('Error fetching daily progress:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleAddActivity = () => {
    window.dispatchEvent(new CustomEvent('openActivityModal'));
  };
  
  const totalPages = Math.ceil(totalCount / itemsPerPage);

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 md:mb-0">Daily Progress Overview</h1>
        <button
          onClick={handleAddActivity}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          Add Daily Activities
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white shadow rounded-lg overflow-x-auto">
          <div className="min-w-full">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Time Spent
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Confidence
                  </th>
                  <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {dailyProgress.map((progress) => (
                  <tr key={progress.id}>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {progress.profile?.full_name || 'Unknown Student'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {progress.profile?.email || 'No email'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {progress.date ? format(new Date(progress.date), 'PPP') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{progress.time_spent || 'N/A'}</div>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        progress.confidence_score >= 7
                          ? 'bg-green-100 text-green-800'
                          : progress.confidence_score >= 4
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {progress.confidence_score}/10
                      </span>
                    </td>
                    <td className="px-4 md:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <button 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => window.location.href = `/student-progress/${progress.profile_id}`}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between">
              <button
                onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Previous
              </button>
              <span className="text-sm text-gray-700">
                Page {currentPage} of {totalPages || 1}
              </span>
              <button
                onClick={() => setCurrentPage(page => (page < totalPages ? page + 1 : page))}
                disabled={currentPage >= totalPages}
                className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${currentPage >= totalPages ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Next
                <ChevronRight className="w-5 h-5 ml-2" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
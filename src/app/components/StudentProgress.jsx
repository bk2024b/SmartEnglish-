'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import { format } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

function StudentProgress({ params }) {
  const [student, setStudent] = useState(null);
  const [progress, setProgress] = useState([]);
  const [loading, setLoading] = useState(true);
  const studentId = params?.studentId;

  useEffect(() => {
    if (studentId) {
      fetchStudentData();
    }
  }, [studentId]);

  async function fetchStudentData() {
    try {
      setLoading(true);
      
      // Fetch student profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', studentId)
        .single();
        
      if (profileError) {
        console.error('Error fetching profile:', profileError);
        throw profileError;
      }
      setStudent(profileData);
      
      // Fetch student progress
      const { data: progressData, error: progressError } = await supabase
        .from('daily_progress')
        .select('*')
        .eq('profile_id', studentId)
        .order('date', { ascending: false });
        
      if (progressError) {
        console.error('Error fetching daily progress:', progressError);
        throw progressError;
      }
      
      console.log('Progress data:', progressData); // Pour déboguer
      setProgress(progressData || []);
      
    } catch (error) {
      console.error('Error fetching student data:', error);
    } finally {
      setLoading(false);
    }
  }

  const goBack = () => {
    window.history.back();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Student not found</h1>
        <button
          onClick={goBack}
          className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex items-center mb-6">
        <button
          onClick={goBack}
          className="mr-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">
          Progress for {student.full_name}
        </h1>
      </div>

      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Student Information</h2>
        <div className="bg-white shadow rounded-lg p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-500">Name</p>
              <p className="text-base font-medium text-gray-900">{student.full_name}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Email</p>
              <p className="text-base font-medium text-gray-900">{student.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Daily Progress</h2>
        {progress.length > 0 ? (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time Spent</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Activities Done</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Expressions</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Confidence</th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">XP Points</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {progress.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.date ? format(new Date(item.date), 'PPP') : 'N/A'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.time_spent || 'N/A'}
                      </td>
                      <td className="px-4 md:px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {item.activities_done ? 
                            (typeof item.activities_done === 'string' 
                              ? item.activities_done 
                              : JSON.stringify(item.activities_done)
                            ) 
                            : 'None'}
                        </div>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.new_expressions_count || '0'}
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.confidence_score >= 7
                            ? 'bg-green-100 text-green-800'
                            : item.confidence_score >= 4
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.confidence_score}/10
                        </span>
                      </td>
                      <td className="px-4 md:px-6 py-4 whitespace-nowrap">
                        {item.xp_points || '0'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No progress data available for this student.
          </div>
        )}
      </div>

      <div className="mb-8">
        <h2 className="text-lg md:text-xl font-semibold text-gray-800 mb-4">Difficulties & Strategies</h2>
        {progress.length > 0 ? (
          <div className="bg-white shadow rounded-lg p-4 md:p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Difficulties</h3>
                <div className="space-y-2">
                  {progress.map(item => (
                    <div key={`diff-${item.id}`} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'N/A'}:</span>
                        {' '}
                        {item.difficulties ? 
                          (typeof item.difficulties === 'string' 
                            ? item.difficulties 
                            : JSON.stringify(item.difficulties)
                          ) 
                          : 'None reported'}
                        {item.difficultiesOther && 
                          `, Other: ${typeof item.difficultiesOther === 'string' 
                            ? item.difficultiesOther 
                            : JSON.stringify(item.difficultiesOther)}`
                        }
                      </p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-2">Overcoming Strategies</h3>
                <div className="space-y-2">
                  {progress.map(item => (
                    <div key={`strat-${item.id}`} className="p-3 bg-gray-50 rounded-md">
                      <p className="text-sm text-gray-900">
                        <span className="font-medium">{item.date ? format(new Date(item.date), 'MMM d, yyyy') : 'N/A'}:</span>
                        {' '}
                        {item.overcoming_strategies || 'None provided'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
            No data available.
          </div>
        )}
      </div>
    </div>
  );
}

export default StudentProgress;
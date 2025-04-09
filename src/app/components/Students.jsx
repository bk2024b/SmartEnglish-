'use client'

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';
import Link from 'next/link';

function Students() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudents();
  }, []);

  async function fetchStudents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('full_name', { ascending: true });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error fetching students:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6">
      <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Students</h1>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {students.map((student) => (
            <div key={student.id} className="bg-white rounded-lg shadow p-4 md:p-6">
              <h3 className="text-lg font-semibold text-gray-900">{student.full_name}</h3>
              <p className="text-gray-600 text-sm truncate">{student.email}</p>
              <div className="mt-4">
                <Link 
                  href={`/student-progress/${student.id}`}
                  className="text-blue-600 hover:text-blue-900 font-medium"
                >
                  View Progress
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Students;
import React from 'react';
import Link from 'next/link';
import { LayoutGrid, Users, Calendar, BarChart } from 'lucide-react';
import Dashboard from '../components/Dashboard';
import Students from '../components/Students';
import Activities from '../components/Activities';
import Analytics from '../components/Analytics';

function App() {
  return (
    <>
      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow-md">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
          </div>
          <nav className="mt-6">
            <Link
              href="/"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <LayoutGrid className="w-5 h-5 mr-3" />
              Dashboard
            </Link>
            <Link
              href="/students"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Users className="w-5 h-5 mr-3" />
              Students
            </Link>
            <Link
              href="/activities"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <Calendar className="w-5 h-5 mr-3" />
              Activities
            </Link>
            <Link
              href="/analytics"
              className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100"
            >
              <BarChart className="w-5 h-5 mr-3" />
              Analytics
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto">
          
            <Dashboard />
            <Students />
            <Activities />
            <Analytics />
          
        </main>
      </div>
    </>
  );
}

export default App;
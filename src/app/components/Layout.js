import React, { useState } from 'react';
import Link from 'next/link';
import { LayoutGrid, Users, Calendar, BarChart, Menu, X } from 'lucide-react';

export default function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Mobile menu button */}
      <div className="md:hidden p-4 bg-white shadow-sm">
        <button 
          onClick={toggleSidebar}
          className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none"
        >
          {sidebarOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <Menu className="h-6 w-6" />
          )}
        </button>
      </div>
      
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'block' : 'hidden'
      } md:block w-full md:w-64 bg-white shadow-md md:min-h-screen z-10`}>
        <div className="p-6">
          <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        </div>
        <nav className="mt-6">
          <Link href="/" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <LayoutGrid className="w-5 h-5 mr-3" />
            Dashboard
          </Link>
          <Link href="/students" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Users className="w-5 h-5 mr-3" />
            Students
          </Link>
          <Link href="/activities" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <Calendar className="w-5 h-5 mr-3" />
            Activities
          </Link>
          <Link href="/analytics" className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100">
            <BarChart className="w-5 h-5 mr-3" />
            Analytics
          </Link>
        </nav>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-gray-600 bg-opacity-50 z-0"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from "../../utils/supabaseClient";
import Link from 'next/link';
import ActivityFormPopup from "../../components/ActivityFormPopup.jsx";

export default function AdminDashboard() {
  const [user, setUser] = useState(null);
  const [learners, setLearners] = useState([]);
  const [isActivityFormOpen, setActivityFormOpen] = useState(false);
  const [weekNumber, setWeekNumber] = useState(1);
  const [statistics, setStatistics] = useState({
    totalLearners: 0,
    activeToday: 0,
    completionRate: 0,
    audioSubmissions: 0
  });
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      // Vérifier si l'utilisateur est connecté et a un rôle admin
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        setUser(user);
        
        // Vérifier le rôle admin dans la table profiles
        //const { data: profile, error: profileError } = await supabase
        //  .from('profiles')
         // .select('role')
         // .eq('id', user.id)
         // .single();
          
        //if (profileError || profile.role !== 'admin') {
         // console.error("Accès non autorisé");
          // Rediriger vers la page d'accueil ou afficher une erreur
          return;
        }
        
        // Calculer la semaine actuelle depuis le début du coaching (7 avril 2025)
        const startDate = new Date('2025-04-07');
        const currentDate = new Date();
        const diffTime = currentDate - startDate;
        const diffWeeks = Math.max(1, Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24 * 7)) + 1);
        setWeekNumber(diffWeeks);
        
        // Récupérer la liste des apprenants
        const { data: learnersData, error: learnersError } = await supabase
          .from('profiles')
          .select(`
            id, 
            email, 
            first_name, 
            last_name, 
            avatar, 
            daysCompleted, 
            totalDays, 
            weekBadge,
            last_active,
            audio_submissions(count)
          `)
          .eq('role', 'learner');
        
        if (learnersError) {
          console.error("Erreur lors de la récupération des apprenants:", learnersError);
        } else {
          setLearners(learnersData.map(learner => ({
            ...learner,
            progressPercentage: Math.floor((learner.daysCompleted / learner.totalDays) * 100),
            audioSubmissionsCount: learner.audio_submissions.length
          })));
          
          // Calculer les statistiques
          const today = new Date().setHours(0, 0, 0, 0);
          const activeToday = learnersData.filter(learner => 
            learner.last_active && new Date(learner.last_active).setHours(0, 0, 0, 0) === today
          ).length;
          
          const totalAudioSubmissions = learnersData.reduce((sum, learner) => 
            sum + learner.audio_submissions.length, 0
          );
          
          const avgCompletionRate = learnersData.reduce((sum, learner) => 
            sum + (learner.daysCompleted / learner.totalDays), 0
          ) / learnersData.length * 100;
          
          setStatistics({
            totalLearners: learnersData.length,
            activeToday,
            completionRate: Math.floor(avgCompletionRate),
            audioSubmissions: totalAudioSubmissions
          });
        }
      }
      
      setLoading(false);
    })
    
    fetchAdminData();
}[];;
  
  // Filtrer les apprenants en fonction du filtre sélectionné et de la recherche
  const filteredLearners = learners
    .filter(learner => {
      // Filtre par état
      if (selectedFilter === 'active') {
        const today = new Date().setHours(0, 0, 0, 0);
        return learner.last_active && new Date(learner.last_active).setHours(0, 0, 0, 0) === today;
      } else if (selectedFilter === 'at-risk') {
        // Considérer "à risque" si moins de 50% de progression à ce stade
        return learner.progressPercentage < 50;
      } else if (selectedFilter === 'excellent') {
        // Considérer "excellent" si plus de 80% de progression
        return learner.progressPercentage > 80;
      }
      return true; // 'all'
    })
    .filter(learner => {
      // Recherche par nom ou email
      if (!searchQuery) return true;
      const fullName = `${learner.first_name || ''} ${learner.last_name || ''}`.toLowerCase();
      const email = (learner.email || '').toLowerCase();
      return fullName.includes(searchQuery.toLowerCase()) || email.includes(searchQuery.toLowerCase());
    });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-gray-700">Chargement du tableau de bord administrateur...</div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      {/* En-tête */}
      <header className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md">
        <div className="container mx-auto py-4 px-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-sm opacity-90">Coaching d'anglais - Semaine {weekNumber}</p>
          </div>
          
          <div className="flex items-center">
            <span className="mr-4">{user?.email}</span>
            <Link href="/auth/signout" className="bg-white text-blue-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors">
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      {/* Section des statistiques */}
      <section className="container mx-auto py-6 px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-gray-500 text-sm font-medium">Apprenants inscrits</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-gray-800">{statistics.totalLearners}</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-gray-500 text-sm font-medium">Actifs aujourd'hui</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-green-600">{statistics.activeToday}</span>
              <span className="text-sm text-gray-500 ml-2">
                ({Math.round((statistics.activeToday / statistics.totalLearners) * 100)}%)
              </span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-gray-500 text-sm font-medium">Taux de complétion moyen</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-blue-600">{statistics.completionRate}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-5">
            <h3 className="text-gray-500 text-sm font-medium">Enregistrements audio soumis</h3>
            <div className="flex items-center">
              <span className="text-3xl font-bold text-purple-600">{statistics.audioSubmissions}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'action */}
      <section className="container mx-auto py-2 px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div className="mb-4 md:mb-0">
            <h2 className="text-xl font-bold text-gray-800">Gestion des apprenants</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => setActivityFormOpen(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
            >
              <span className="mr-2">+</span>
              Définir les activités du jour
            </button>
            <Link href="/admin/reports" className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 transition-colors">
              Rapports d'activité
            </Link>
          </div>
        </div>
      </section>

      {/* Section filtres et recherche */}
      <section className="container mx-auto py-2 px-6">
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0">
            <div className="flex space-x-2">
              <button 
                onClick={() => setSelectedFilter('all')}
                className={`px-4 py-2 rounded-md text-sm ${selectedFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tous
              </button>
              <button 
                onClick={() => setSelectedFilter('active')}
                className={`px-4 py-2 rounded-md text-sm ${selectedFilter === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Actifs aujourd'hui
              </button>
              <button 
                onClick={() => setSelectedFilter('at-risk')}
                className={`px-4 py-2 rounded-md text-sm ${selectedFilter === 'at-risk' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                À risque
              </button>
              <button 
                onClick={() => setSelectedFilter('excellent')}
                className={`px-4 py-2 rounded-md text-sm ${selectedFilter === 'excellent' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Excellents
              </button>
            </div>
            
            <div className="relative">
              <input
                type="text"
                placeholder="Rechercher un apprenant..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full md:w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des apprenants */}
      <section className="container mx-auto py-2 px-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Apprenant
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progression
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Niveau
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière activité
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Audio
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLearners.length === 0 ? (
                <tr>
                  <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                    {searchQuery ? 'Aucun apprenant ne correspond à votre recherche' : 'Aucun apprenant dans cette catégorie'}
                  </td>
                </tr>
              ) : (
                filteredLearners.map((learner) => {
                  // Calculer le niveau en fonction du nombre de mois écoulés
                  const startDate = new Date('2025-04-07');
                  const currentDate = new Date();
                  const diffTime = currentDate - startDate;
                  const diffMonths = Math.max(1, Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24 * 30)) + 1);
                  const level = Math.min(diffMonths, 6);

                  // Déterminer la couleur de la progression
                  let progressColor;
                  if (learner.progressPercentage < 40) progressColor = 'bg-red-500';
                  else if (learner.progressPercentage < 70) progressColor = 'bg-yellow-500';
                  else progressColor = 'bg-green-500';

                  // Formater la date de dernière activité
                  const lastActive = learner.last_active ? new Date(learner.last_active) : null;
                  const today = new Date();
                  const isToday = lastActive && lastActive.setHours(0, 0, 0, 0) === today.setHours(0, 0, 0, 0);
                  const lastActiveFormatted = isToday 
                    ? `Aujourd'hui ${lastActive.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}` 
                    : lastActive ? lastActive.toLocaleDateString('fr-FR') : 'Jamais';

                  return (
                    <tr key={learner.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img 
                              className="h-10 w-10 rounded-full object-cover"
                              src={learner.avatar || "/avatars/stage1.jpg"}
                              alt="Avatar de l'apprenant"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {`${learner.first_name || ''} ${learner.last_name || ''}` || 'Apprenant sans nom'}
                            </div>
                            <div className="text-sm text-gray-500">{learner.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2">
                            <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${learner.progressPercentage}%` }}></div>
                          </div>
                          <span className="text-sm text-gray-500">{learner.progressPercentage}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Niveau {level}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-sm ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
                          {lastActiveFormatted}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {learner.audioSubmissionsCount || 0} soumissions
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Link href={`/admin/learner/${learner.id}`} className="text-blue-600 hover:text-blue-900 mr-3">
                          Détails
                        </Link>
                        <button className="text-gray-600 hover:text-gray-900">Message</button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Popup pour l'ajout d'activités */}
      <ActivityFormPopup
        isOpen={isActivityFormOpen}
        onClose={() => setActivityFormOpen(false)}
      />
    </main>
  );

"use client";
import React, { useState, useEffect } from 'react';
// import { supabase } from "../../utils/supabaseClient";
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
      // Commenté : Vérification de l'utilisateur connecté avec supabase
      /*
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUser(user);
        // Vérifier le rôle admin dans la table profiles
        //const { data: profile, error: profileError } = await supabase
        // .from('profiles')
        // .select('role')
        // .eq('id', user.id)
        // .single();
        //if (profileError || profile.role !== 'admin') {
        // console.error("Accès non autorisé");
        // Rediriger vers la page d'accueil ou afficher une erreur
        // return;
        //}
      */
      // Pour le développement, on simule un utilisateur
      setUser({ email: "admin@example.com" });

      // Calculer la semaine actuelle depuis le début du coaching (7 avril 2025)
      const startDate = new Date('2025-04-07');
      const currentDate = new Date();
      const diffTime = currentDate - startDate;
      const diffWeeks = Math.max(1, Math.floor(Math.max(0, diffTime) / (1000 * 60 * 60 * 24 * 7)) + 1);
      setWeekNumber(diffWeeks);

      // Commenté : Récupération des données des apprenants depuis supabase
      /*
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
      */

      // Pour le développement, on utilise des données fictives
      const mockLearners = [
        {
          id: 1,
          email: "learner1@example.com",
          first_name: "Jean",
          last_name: "Dupont",
          avatar: "/avatars/stage1.jpg",
          daysCompleted: 15,
          totalDays: 30,
          weekBadge: 2,
          last_active: new Date().toISOString(),
          audio_submissions: [1, 2, 3],
          progressPercentage: 50,
          audioSubmissionsCount: 3
        },
        {
          id: 2,
          email: "learner2@example.com",
          first_name: "Marie",
          last_name: "Laurent",
          avatar: "/avatars/stage2.jpg",
          daysCompleted: 25,
          totalDays: 30,
          weekBadge: 3,
          last_active: new Date().toISOString(),
          audio_submissions: [1, 2, 3, 4],
          progressPercentage: 83,
          audioSubmissionsCount: 4
        },
        {
          id: 3,
          email: "learner3@example.com",
          first_name: "Pierre",
          last_name: "Martin",
          avatar: "/avatars/stage1.jpg",
          daysCompleted: 10,
          totalDays: 30,
          weekBadge: 1,
          last_active: new Date(new Date().setDate(new Date().getDate() - 3)).toISOString(),
          audio_submissions: [1],
          progressPercentage: 33,
          audioSubmissionsCount: 1
        }
      ];
      
      setLearners(mockLearners);
      setStatistics({
        totalLearners: mockLearners.length,
        activeToday: mockLearners.filter(l => new Date(l.last_active).setHours(0, 0, 0, 0) === new Date().setHours(0, 0, 0, 0)).length,
        completionRate: Math.floor(mockLearners.reduce((sum, l) => sum + l.progressPercentage, 0) / mockLearners.length),
        audioSubmissions: mockLearners.reduce((sum, l) => sum + l.audioSubmissionsCount, 0)
      });
      
      setLoading(false);
    };
    
    fetchAdminData();
  }, []);
  
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
        <div className="container mx-auto py-4 px-4 sm:px-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold">Dashboard Admin</h1>
            <p className="text-xs sm:text-sm opacity-90">Coaching d'anglais - Semaine {weekNumber}</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4 w-full sm:w-auto">
            <span className="text-sm sm:mr-4 truncate max-w-xs">{user?.email}</span>
            <Link href="/auth/signout" className="bg-white text-blue-600 px-3 py-1 sm:px-4 sm:py-2 rounded-md text-sm font-medium hover:bg-gray-100 transition-colors whitespace-nowrap">
              Déconnexion
            </Link>
          </div>
        </div>
      </header>

      {/* Section des statistiques */}
      <section className="container mx-auto py-4 sm:py-6 px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Apprenants inscrits</h3>
            <div className="flex items-center">
              <span className="text-xl sm:text-3xl font-bold text-gray-800">{statistics.totalLearners}</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Actifs aujourd'hui</h3>
            <div className="flex items-center">
              <span className="text-xl sm:text-3xl font-bold text-green-600">{statistics.activeToday}</span>
              <span className="text-xs sm:text-sm text-gray-500 ml-2">
                ({Math.round((statistics.activeToday / statistics.totalLearners) * 100)}%)
              </span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Taux de complétion moyen</h3>
            <div className="flex items-center">
              <span className="text-xl sm:text-3xl font-bold text-blue-600">{statistics.completionRate}%</span>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <h3 className="text-gray-500 text-xs sm:text-sm font-medium">Enregistrements audio soumis</h3>
            <div className="flex items-center">
              <span className="text-xl sm:text-3xl font-bold text-purple-600">{statistics.audioSubmissions}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Section d'action */}
      <section className="container mx-auto py-2 px-4 sm:px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6 gap-3">
          <div className="mb-2 md:mb-0">
            <h2 className="text-lg sm:text-xl font-bold text-gray-800">Gestion des apprenants</h2>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full sm:w-auto">
            <button
              onClick={() => setActivityFormOpen(true)}
              className="bg-blue-600 text-white px-3 py-2 sm:px-4 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center sm:justify-start text-sm"
            >
              <span className="mr-2">+</span>
              Définir les activités du jour
            </button>
            <Link href="/admin/reports" className="bg-gray-200 text-gray-700 px-3 py-2 sm:px-4 rounded-md hover:bg-gray-300 transition-colors text-center sm:text-left text-sm">
              Rapports d'activité
            </Link>
          </div>
        </div>
      </section>

      {/* Section filtres et recherche */}
      <section className="container mx-auto py-2 px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow p-3 sm:p-4 mb-4 sm:mb-6">
          <div className="flex flex-col md:flex-row justify-between space-y-3 md:space-y-0 md:space-x-3">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedFilter('all')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${selectedFilter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Tous
              </button>
              <button
                onClick={() => setSelectedFilter('active')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${selectedFilter === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Actifs aujourd'hui
              </button>
              <button
                onClick={() => setSelectedFilter('at-risk')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${selectedFilter === 'at-risk' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                À risque
              </button>
              <button
                onClick={() => setSelectedFilter('excellent')}
                className={`px-2 sm:px-4 py-1 sm:py-2 rounded-md text-xs sm:text-sm ${selectedFilter === 'excellent' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Excellents
              </button>
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder="Rechercher un apprenant..."
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
            </div>
          </div>
        </div>
      </section>

      {/* Liste des apprenants */}
      <section className="container mx-auto py-2 px-4 sm:px-6 mb-8">
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Apprenant
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Progression
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    Niveau
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    Dernière activité
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    Audio
                  </th>
                  <th scope="col" className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-3 sm:px-6 py-4 text-center text-gray-500">
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
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-8 w-8 sm:h-10 sm:w-10 flex-shrink-0">
                              <img
                                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover"
                                src={learner.avatar || "/avatars/stage1.jpg"}
                                alt="Avatar de l'apprenant"
                              />
                            </div>
                            <div className="ml-2 sm:ml-4">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 line-clamp-1">
                                {`${learner.first_name || ''} ${learner.last_name || ''}` || 'Apprenant sans nom'}
                              </div>
                              <div className="text-xs sm:text-sm text-gray-500 line-clamp-1">{learner.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-16 sm:w-24 bg-gray-200 rounded-full h-2 mr-2">
                              <div className={`h-2 rounded-full ${progressColor}`} style={{ width: `${learner.progressPercentage}%` }}></div>
                            </div>
                            <span className="text-xs sm:text-sm text-gray-500">{learner.progressPercentage}%</span>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden sm:table-cell">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                            Niveau {level}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap hidden md:table-cell">
                          <span className={`text-xs sm:text-sm ${isToday ? 'text-green-600' : 'text-gray-500'}`}>
                            {lastActiveFormatted}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500 hidden lg:table-cell">
                          {learner.audioSubmissionsCount || 0} soumissions
                        </td>
                        <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium">
                          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <Link href={`/admin/learner/${learner.id}`} className="text-blue-600 hover:text-blue-900">
                              Détails
                            </Link>
                            <button className="text-gray-600 hover:text-gray-900">Message</button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Popup pour l'ajout d'activités */}
      <ActivityFormPopup
        isOpen={isActivityFormOpen}
        onClose={() => setActivityFormOpen(false)}
      />
    </main>
  );
}
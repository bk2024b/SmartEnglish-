import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useEffect } from 'react';

export default function WeeklyReportPopup({ isOpen, onClose, userId }) {
  // Si le popup n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  
  // État pour suivre la soumission du formulaire
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  // Calculer les dates de début et fin de la semaine courante
  const getWeekDates = () => {
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 = dimanche, 1 = lundi, etc.
    
    // On considère que la semaine commence le lundi
    const startDate = new Date(now);
    startDate.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1));
    
    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    
    return {
      start: startDate.toISOString().split('T')[0],
      end: endDate.toISOString().split('T')[0]
    };
  };
  
  const weekDates = getWeekDates();
  
  // État pour stocker les réponses du formulaire
  const [formData, setFormData] = useState({
    week_start_date: weekDates.start,
    week_end_date: weekDates.end,
    weekly_time_spent: '',
    most_effective_activity: '',
    mostEffectiveActivityOther: '',
    biggest_progress: '',
    biggest_challenge: '',
    next_week_action: '',
    voice_record_sent: '',
    user_id: null, // Récupération de l'ID utilisateur
  });

  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
        return;
      }
      setFormData((prevData) => ({
        ...prevData,
        user_id: data.user?.id || null, // Assurer que l'ID utilisateur est bien défini
      }));
    };

    fetchUserData();
  }, []);

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked ? value : ''
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
   
    try {
      // Envoyer les données à Supabase
      const { data, error } = await supabase
        .from('weekly_progress')
        .insert([formData]);
        
      if (error) throw error;
      
      // Afficher le message de succès
      setSubmitSuccess(true);
      
      // Fermer le popup après 1,5 secondes
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      setSubmitError("Une erreur est survenue lors de l'envoi du rapport. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        {/* En-tête du popup */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">Rapport Hebdomadaire</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            x
          </button>
        </div>

        {/* Formulaire avec animation de défilement fluide */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-purple-400 font-medium mb-2">PROGRESSION HEBDOMADAIRE – SMART ENGLISH+</h3>
              <p className="text-gray-300 text-sm">À compléter chaque dimanche pour analyser ta progression et planifier la semaine suivante.</p>
            </div>

            {submitSuccess ? (
              <div className="bg-green-500 bg-opacity-25 border border-green-500 text-green-100 rounded-lg p-4 text-center my-8">
                <p className="text-lg font-medium">Rapport envoyé avec succès !</p>
                <p className="text-sm mt-2">Merci pour ton retour hebdomadaire.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Période */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Semaine du</label>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <input 
                        type="date" 
                        name="week_start_date" 
                        value={formData.week_start_date} 
                        onChange={handleChange}
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <div className="flex items-center">
                        <span className="text-gray-400 mr-2">au</span>
                        <input 
                          type="date" 
                          name="week_end_date" 
                          value={formData.week_end_date} 
                          onChange={handleChange}
                          className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Temps total */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Temps total d'apprentissage cette semaine</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="totalTime" 
                        value="Moins de 3h" 
                        checked={formData.totalTime === "Moins de 3h"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                        required
                      />
                      <span className="text-gray-300">Moins de 3h</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="totalTime" 
                        value="3-5h" 
                        checked={formData.totalTime === "3-5h"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">3-5h</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="totalTime" 
                        value="5-7h" 
                        checked={formData.totalTime === "5-7h"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">5-7h</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="totalTime" 
                        value="Plus de 7h" 
                        checked={formData.totalTime === "Plus de 7h"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Plus de 7h</span>
                    </label>
                  </div>
                </div>
                
                {/* Activité la plus efficace */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Activité la plus efficace pour moi cette semaine</label>
                  <div className="grid grid-cols-2 gap-3">
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="most_effective_activity" 
                        value="Écoute immersive" 
                        checked={formData.most_effective_activity === "Écoute immersive"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                        required
                      />
                      <span className="text-gray-300">Écoute immersive</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="most_effective_activity" 
                        value="Shadowing" 
                        checked={formData.most_effective_activity === "Shadowing"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Shadowing</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="most_effective_activity" 
                        value="Conversations" 
                        checked={formData.most_effective_activity === "Conversations"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Conversations</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="most_effective_activity" 
                        value="Lecture" 
                        checked={formData.most_effective_activity === "Lecture"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Lecture</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors col-span-2">
                      <input 
                        type="radio" 
                        name="most_effective_activity" 
                        value="Autre" 
                        checked={formData.most_effective_activity === "Autre"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Autre</span>
                    </label>
                    {formData.most_effective_activity === "Autre" && (
                      <input 
                        type="text" 
                        name="most_effective_activity" 
                        value={formData.mostEffectiveActivityOther} 
                        onChange={handleChange}
                        placeholder="Précisez..."
                        className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors col-span-2 mt-2"
                        required
                      />
                    )}
                  </div>
                </div>
                
                {/* Plus grand progrès */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Mon plus grand progrès cette semaine</label>
                  <textarea 
                    name="biggest_progress" 
                    value={formData.biggest_progress} 
                    onChange={handleChange}
                    placeholder="Exemple : meilleure prononciation, plus à l'aise à l'oral, meilleure compréhension..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors h-24 resize-none"
                    required
                  ></textarea>
                </div>
                
                {/* Plus grand défi */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Mon plus grand défi cette semaine</label>
                  <textarea 
                    name="biggest_challenge" 
                    value={formData.biggest_challenge} 
                    onChange={handleChange}
                    placeholder="Exemple : peur de parler, manque de temps, difficulté à comprendre les natifs..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors h-24 resize-none"
                    required
                  ></textarea>
                </div>
                
                {/* Action pour progresser */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Action que je vais mettre en place pour progresser encore plus la semaine prochaine</label>
                  <textarea 
                    name="next_week_action" 
                    value={formData.next_week_action} 
                    onChange={handleChange}
                    placeholder="Décrivez l'action concrète que vous allez mettre en place..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-purple-400 focus:outline-none transition-colors h-24 resize-none"
                    required
                  ></textarea>
                </div>
                
                {/* Enregistrement vocal */}
                <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                  <label className="block text-purple-300 font-medium mb-2">Enregistrement vocal hebdomadaire envoyé ?</label>
                  <div className="flex space-x-4">
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors flex-1 justify-center">
                      <input 
                        type="radio" 
                        name="voice_record_sent" 
                        value="Oui" 
                        checked={formData.voice_record_sent === "Oui"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                        required
                      />
                      <span className="text-gray-300">Oui</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-purple-400 cursor-pointer transition-colors flex-1 justify-center">
                      <input 
                        type="radio" 
                        name="voice_record_sent" 
                        value="Non" 
                        checked={formData.voice_record_sent === "Non"}
                        onChange={handleChange}
                        className="w-4 h-4 text-purple-500"
                      />
                      <span className="text-gray-300">Non</span>
                    </label>
                  </div>
                  {formData.voice_record_sent === "Non" && (
                    <div className="mt-3 p-3 bg-gray-800 rounded-lg border border-purple-800 text-gray-300 text-sm">
                      N'oublie pas d'envoyer ton enregistrement hebdomadaire pour que ton coach puisse évaluer ta progression !
                    </div>
                  )}
                </div>
                
                {/* Message d'erreur */}
                {submitError && (
                  <div className="bg-red-500 bg-opacity-25 border border-red-500 text-red-100 rounded-lg p-3 text-sm">
                    {submitError}
                  </div>
                )}
                
                {/* Boutons d'action */}
                <div className="flex justify-between pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                    disabled={isSubmitting}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className={`bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Envoi en cours...' : 'Envoyer le rapport'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
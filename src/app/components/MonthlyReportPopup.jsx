import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';
import { useEffect } from 'react';

export default function MonthlyReportPopup({ isOpen, onClose }) {
  // Si le popup n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  

  
  // Obtenir le mois actuel
  const getCurrentMonth = () => {
    const months = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 
                    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const now = new Date();
    return months[now.getMonth()];
  };
  
  // État pour stocker les réponses du formulaire
  const [formData, setFormData] = useState({
    month: getCurrentMonth(),
    progression_evaluation: '',
    changes_noticed: '',
    biggest_monthly_challenge: '',
    newSkill1: '',
    newSkill2: '',
    newSkill3: '',
    confidence_score: '',
    voice_record_sent: ''
  });
  const updateAvatar = async () => {
    if (!user) return;
  
    // Trouver l'index actuel de l'avatar
    const currentIndex = avatars.indexOf(avatarUrl);
    const nextIndex = Math.min(currentIndex + 1, avatars.length - 1);
    const newAvatar = avatars[nextIndex];
  
    // Mise à jour dans Supabase
    const { error } = await supabase
      .from('profiles')
      .update({ avatar: newAvatar })
      .eq('id', user.id);
  
    if (error) {
      console.error("Erreur lors de la mise à jour de l'avatar:", error);
    } else {
      setAvatarUrl(newAvatar); // Mise à jour de l'état local
    }
  };
  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? e.target.checked : value
    }));
  };
  

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Envoyer les données à Supabase
      const { data, error } = await supabase
        .from('weekly_progress')
        .insert([formData]);
        
      if (error) throw error;
      
      // Afficher le message de succès
      updateAvatar();
      alert("Bilan mensuel enregistré avec succès !");
      onClose();
      
    } catch (error) {
      console.error("Erreur lors de l'envoi des données:", error);
      
    } 
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        {/* En-tête du popup */}
        <div className="bg-gradient-to-r from-green-600 to-teal-500 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">Bilan Mensuel</h2>
          <div className="flex items-center gap-3">
            <span className="text-green-100 text-xs bg-green-700 px-2 py-1 rounded-full">+100 XP</span>
            <button 
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Formulaire avec animation de défilement fluide */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-green-400 font-medium mb-2">BILAN MENSUEL – SMART ENGLISH+</h3>
              <p className="text-gray-300 text-sm">À compléter à la fin de chaque mois pour mesurer tes progrès et adapter ton apprentissage.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Mois */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Mois</label>
                <select 
                  name="month" 
                  value={formData.month} 
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors"
                  required
                >
                  <option value="Janvier">Janvier</option>
                  <option value="Février">Février</option>
                  <option value="Mars">Mars</option>
                  <option value="Avril">Avril</option>
                  <option value="Mai">Mai</option>
                  <option value="Juin">Juin</option>
                  <option value="Juillet">Juillet</option>
                  <option value="Août">Août</option>
                  <option value="Septembre">Septembre</option>
                  <option value="Octobre">Octobre</option>
                  <option value="Novembre">Novembre</option>
                  <option value="Décembre">Décembre</option>
                </select>
              </div>
              
              {/* Évaluation de la progression */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Comment évalues-tu ta progression ce mois-ci ?</label>
                <div className="space-y-3">
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-colors w-full">
                    <input 
                      type="radio" 
                      name="progression_evaluation" 
                      value="Lente mais je progresse" 
                      checked={formData.progression_evaluation === "Lente mais je progresse"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-gray-300">Lente mais je progresse</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-colors w-full">
                    <input 
                      type="radio" 
                      name="progression_evaluation" 
                      value="Bonne progression" 
                      checked={formData.progression_evaluation === "Bonne progression"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-gray-300">Bonne progression</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-colors w-full">
                    <input 
                      type="radio" 
                      name="progression_evaluation" 
                      value="Très grande amélioration !" 
                      checked={formData.progression_evaluation === "Très grande amélioration !"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-gray-300">Très grande amélioration !</span>
                  </label>
                </div>
              </div>
              
              {/* Changements remarqués */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Quels changements as-tu remarqués dans ta compréhension et ton expression orale ?</label>
                <textarea 
                  name="changes_noticed" 
                  value={formData.changes_noticed} 
                  onChange={handleChange}
                  placeholder="Décrivez brièvement les changements que vous avez remarqués..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors h-24 resize-none"
                ></textarea>
              </div>
              
              {/* Plus grand challenge */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Quel a été ton plus grand challenge ce mois-ci ?</label>
                <textarea 
                  name="biggest_monthly_challenge" 
                  value={formData.biggest_monthly_challenge} 
                  onChange={handleChange}
                  placeholder="Exemple : trouver du temps, surmonter la peur de parler..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors h-24 resize-none"
                ></textarea>
              </div>
              
              {/* Nouvelles compétences */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Quelles sont les 3 nouvelles choses que tu sais faire en anglais aujourd'hui que tu ne pouvais pas faire au début du programme ?</label>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <span className="text-gray-300 font-medium mr-2 min-w-[24px]">1.</span>
                    <input 
                      type="text" 
                      name="newSkill1" 
                      value={formData.newSkill1} 
                      onChange={handleChange}
                      placeholder="Nouvelle compétence 1"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300 font-medium mr-2 min-w-[24px]">2.</span>
                    <input 
                      type="text" 
                      name="newSkill2" 
                      value={formData.newSkill2} 
                      onChange={handleChange}
                      placeholder="Nouvelle compétence 2"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="flex items-center">
                    <span className="text-gray-300 font-medium mr-2 min-w-[24px]">3.</span>
                    <input 
                      type="text" 
                      name="newSkill3" 
                      value={formData.newSkill3} 
                      onChange={handleChange}
                      placeholder="Nouvelle compétence 3"
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-green-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              </div>
              
              {/* Score de confiance */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Sur une échelle de 1 à 5, comment te sens-tu en confiance pour parler anglais maintenant ?</label>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-2">
                  <label className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-all text-center space-y-1 hover:bg-gray-700">
                    <input 
                      type="radio" 
                      name="confidence_score" 
                      value="1" 
                      checked={formData.confidence_score === "1"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${formData.confidence_score === "1" ? "text-green-400" : "text-gray-400"}`}>1</span>
                    <span className="text-xs text-gray-400">Toujours stressé(e)</span>
                  </label>
                  <label className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-all text-center space-y-1 hover:bg-gray-700">
                    <input 
                      type="radio" 
                      name="confidence_score" 
                      value="2" 
                      checked={formData.confidence_score === "2"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${formData.confidenceScore === "2" ? "text-green-400" : "text-gray-400"}`}>2</span>
                    <span className="text-xs text-gray-400">Encore difficile</span>
                  </label>
                  <label className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-all text-center space-y-1 hover:bg-gray-700">
                    <input 
                      type="radio" 
                      name="confidence_score" 
                      value="3" 
                      checked={formData.confidence_score === "3"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${formData.confidenceScore === "3" ? "text-green-400" : "text-gray-400"}`}>3</span>
                    <span className="text-xs text-gray-400">Je m'améliore</span>
                  </label>
                  <label className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-all text-center space-y-1 hover:bg-gray-700">
                    <input 
                      type="radio" 
                      name="confidence_score" 
                      value="4" 
                      checked={formData.confidence_score === "4"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${formData.confidenceScore === "4" ? "text-green-400" : "text-gray-400"}`}>4</span>
                    <span className="text-xs text-gray-400">Presque fluide</span>
                  </label>
                  <label className="flex flex-col items-center p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-all text-center space-y-1 hover:bg-gray-700">
                    <input 
                      type="radio" 
                      name="confidence_score" 
                      value="5" 
                      checked={formData.confidence_score === "5"}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <span className={`text-xl font-bold ${formData.confidence_score === "5" ? "text-green-400" : "text-gray-400"}`}>5</span>
                    <span className="text-xs text-gray-400">Je parle sans problème !</span>
                  </label>
                </div>
              </div>
              
              {/* Enregistrement vocal */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-green-300 font-medium mb-2">Enregistrement vocal mensuel envoyé ?</label>
                <div className="flex gap-3">
                  <label className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="voice_record_sent" 
                      value="Oui" 
                      checked={formData.voice_record_sent === "Oui"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-gray-300">Oui</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg border border-gray-700 hover:border-green-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="voice_record_sent" 
                      value="Non" 
                      checked={formData.voice_record_sent === "Non"}
                      onChange={handleChange}
                      className="w-4 h-4 text-green-500"
                    />
                    <span className="text-gray-300">Non</span>
                  </label>
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full sm:w-1/2 px-4 py-3 rounded-lg bg-gray-700 text-gray-300 font-medium hover:bg-gray-600 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-1/2 px-4 py-3 rounded-lg bg-gradient-to-r from-green-500 to-teal-500 text-white font-medium hover:from-green-600 hover:to-teal-600 transition-colors shadow-lg"
                >
                  Soumettre mon bilan
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
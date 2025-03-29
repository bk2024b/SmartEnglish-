import React, { useState } from 'react';

export default function DailyReportPopup({ isOpen, onClose }) {
  // Si le popup n'est pas ouvert, ne rien afficher
  if (!isOpen) return null;
  
  // État pour stocker les réponses du formulaire
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    timeSpent: '',
    activities: [],
    phrasesLearned: '',
    difficulties: [],
    difficultiesOther: '',
    solutionApplied: '',
    confidenceScore: ''
  });

  // Gestion des changements dans le formulaire
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      if (checked) {
        setFormData({
          ...formData,
          [name]: [...formData[name], value]
        });
      } else {
        setFormData({
          ...formData,
          [name]: formData[name].filter(item => item !== value)
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  // Soumission du formulaire
  const handleSubmit = (e) => {
    e.preventDefault();
    // Ici, vous enverriez normalement les données au serveur
    console.log("Données du rapport quotidien:", formData);
    // Fermer le popup et éventuellement montrer un message de succès
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        {/* En-tête du popup */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">Rapport Quotidien</h2>
          <div className="flex items-center gap-3">
            <span className="text-blue-100 text-xs bg-blue-700 px-2 py-1 rounded-full">+10 XP</span>
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
              <h3 className="text-blue-400 font-medium mb-2">FICHE D'EXÉCUTION & DE PROGRESSION – SMART ENGLISH+</h3>
              <p className="text-gray-300 text-sm">Cette fiche est à remplir chaque jour pour suivre tes progrès et rester motivé(e).</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Date */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Date</label>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleChange}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors"
                  required
                />
              </div>
              
              {/* Temps consacré */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Temps total consacré aujourd'hui</label>
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="timeSpent" 
                      value="Moins de 30 min" 
                      checked={formData.timeSpent === "Moins de 30 min"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Moins de 30 min</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="timeSpent" 
                      value="30-45 min" 
                      checked={formData.timeSpent === "30-45 min"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">30-45 min</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="timeSpent" 
                      value="1h" 
                      checked={formData.timeSpent === "1h"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">1h</span>
                  </label>
                  <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="timeSpent" 
                      value="Plus de 1h" 
                      checked={formData.timeSpent === "Plus de 1h"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Plus de 1h</span>
                  </label>
                </div>
              </div>
              
              {/* Activités réalisées */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Activités réalisées</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="activities" 
                      value="Écoute immersive" 
                      checked={formData.activities.includes("Écoute immersive")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Écoute immersive (podcasts, dialogues, vidéos)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="activities" 
                      value="Shadowing" 
                      checked={formData.activities.includes("Shadowing")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Shadowing (répétition après un natif)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="activities" 
                      value="Lecture et narration" 
                      checked={formData.activities.includes("Lecture et narration")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Lecture et narration (résumé oral ou écrit)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="activities" 
                      value="Exercice d'expression orale" 
                      checked={formData.activities.includes("Exercice d'expression orale")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Exercice d'expression orale (monologue, conversation)</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="activities" 
                      value="Échange avec un natif" 
                      checked={formData.activities.includes("Échange avec un natif")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Échange avec un natif ou un autre apprenant</span>
                  </label>
                </div>
              </div>
              
              {/* Phrases retenues */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Combien de nouvelles phrases ou expressions as-tu retenues aujourd'hui ?</label>
                <div className="flex space-x-3">
                  <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="phrasesLearned" 
                      value="1-2" 
                      checked={formData.phrasesLearned === "1-2"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">1-2</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="phrasesLearned" 
                      value="3-5" 
                      checked={formData.phrasesLearned === "3-5"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">3-5</span>
                  </label>
                  <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name="phrasesLearned" 
                      value="Plus de 5" 
                      checked={formData.phrasesLearned === "Plus de 5"}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Plus de 5</span>
                  </label>
                </div>
              </div>
              
              {/* Difficultés rencontrées */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Difficultés rencontrées aujourd'hui</label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="difficulties" 
                      value="Compréhension orale" 
                      checked={formData.difficulties.includes("Compréhension orale")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Compréhension orale</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="difficulties" 
                      value="Trouver mes mots en parlant" 
                      checked={formData.difficulties.includes("Trouver mes mots en parlant")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Trouver mes mots en parlant</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="difficulties" 
                      value="Prononciation" 
                      checked={formData.difficulties.includes("Prononciation")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Prononciation</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="difficulties" 
                      value="Motivation / manque de temps" 
                      checked={formData.difficulties.includes("Motivation / manque de temps")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Motivation / manque de temps</span>
                  </label>
                  <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                    <input 
                      type="checkbox" 
                      name="difficulties" 
                      value="Autre" 
                      checked={formData.difficulties.includes("Autre")}
                      onChange={handleChange}
                      className="w-4 h-4 text-blue-500"
                    />
                    <span className="text-gray-300">Autre</span>
                  </label>
                  {formData.difficulties.includes("Autre") && (
                    <input 
                      type="text" 
                      name="difficultiesOther" 
                      value={formData.difficultiesOther} 
                      onChange={handleChange}
                      placeholder="Précisez..."
                      className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors mt-2"
                    />
                  )}
                </div>
              </div>
              
              {/* Solution appliquée */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Comment as-tu surmonté ces difficultés ?</label>
                <textarea 
                  name="solutionApplied" 
                  value={formData.solutionApplied} 
                  onChange={handleChange}
                  placeholder="Décrivez brièvement..."
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors h-24 resize-none"
                ></textarea>
              </div>
              
              {/* Score de confiance */}
              <div className="bg-gray-700 bg-opacity-30 rounded-lg p-4">
                <label className="block text-blue-300 font-medium mb-2">Score de confiance aujourd'hui</label>
                <div className="flex items-center justify-between">
                  {[1, 2, 3, 4, 5].map((score) => (
                    <label 
                      key={score}
                      className={`flex flex-col items-center p-2 rounded-lg cursor-pointer transition-all ${
                        formData.confidenceScore === score.toString() 
                          ? 'bg-blue-500 text-white scale-110' 
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                      style={{width: '18%'}}
                    >
                      <input 
                        type="radio" 
                        name="confidenceScore" 
                        value={score} 
                        checked={formData.confidenceScore === score.toString()}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <span className="text-2xl mb-1">
                        {score === 1 ? '😔' : 
                         score === 2 ? '😐' : 
                         score === 3 ? '🙂' : 
                         score === 4 ? '😊' : '🤩'}
                      </span>
                      <span className="text-xs text-center">
                        {score === 1 ? 'Frustré(e)' : 
                         score === 2 ? 'Peu motivé(e)' : 
                         score === 3 ? 'Ça va' : 
                         score === 4 ? 'Confiant(e)' : 'Super motivé(e) !'}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Boutons d'action */}
              <div className="flex justify-between pt-4">
                <button 
                  type="button"
                  onClick={onClose}
                  className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                >
                  Annuler
                </button>
                <button 
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3
                  ">
                    Soumettre le rapport
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  </div>
  );
}
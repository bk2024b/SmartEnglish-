"use client"

import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function DailyReportPopup({ isOpen, onClose, userId }) {
  if (!isOpen) return null;

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    time_spent: '',
    activities_done: [],
    new_expressions_count: '',
    difficulties: [],
    difficultiesOther: '',
    overcoming_strategies: '',
    confidence_score: '',
    profile_id: null,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  useEffect(() => {
    const fetchUserData = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        console.error("Erreur de récupération de l'utilisateur :", error);
        setErrorMessage("Impossible de récupérer l'utilisateur.");
        return;
      }
      setFormData((prevData) => ({
        ...prevData,
        profile_id: data.user?.id || null,
      }));
    };

    fetchUserData();
  }, [userId]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      if (type === 'checkbox') {
        const updatedArray = checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value);
        return { ...prev, [name]: updatedArray };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const { error } = await supabase.from('daily_progress').insert([formData]);

    if (error) {
      console.error("Erreur lors de l'envoi :", error);
      setErrorMessage("Erreur lors de l'envoi du formulaire.");
      setLoading(false);
    } else {
      console.log("Rapport enregistré !");
      setSubmitSuccess(true);
      
      // Fermer automatiquement après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        {/* En-tête du popup */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-500 px-4 py-3 flex justify-between items-center sticky top-0 z-10">
          <h2 className="text-white font-bold text-lg">Rapport Quotidien</h2>
          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Formulaire avec animation de défilement fluide */}
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <div className="max-w-md mx-auto">
            <div className="text-center mb-6">
              <h3 className="text-blue-400 font-medium mb-2">FICHE D'EXÉCUTION & DE PROGRESSION – SMART ENGLISH+</h3>
              <p className="text-gray-300 text-sm">Cette fiche est à remplir chaque jour pour suivre tes progrès et rester motivé(e).</p>
            </div>

            {submitSuccess ? (
              <div className="bg-green-500 bg-opacity-25 border border-green-500 text-green-100 rounded-lg p-6 text-center my-8 animate-fadeIn">
                <div className="text-4xl mb-3">🎉</div>
                <p className="text-xl font-medium">Bravo pour ton engagement !</p>
                <p className="text-base mt-3">Ton rapport quotidien a été enregistré avec succès.</p>
                <p className="text-sm mt-4">Continue comme ça ! La régularité est la clé du succès dans l'apprentissage d'une langue.</p>
              </div>
            ) : (
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
                        name="time_spent" 
                        value="Moins de 30 min" 
                        checked={formData.time_spent === "Moins de 30 min"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                        required
                      />
                      <span className="text-gray-300">Moins de 30 min</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="time_spent" 
                        value="30-45 min" 
                        checked={formData.time_spent === "30-45 min"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">30-45 min</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="time_spent" 
                        value="1h" 
                        checked={formData.time_spent === "1h"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">1h</span>
                    </label>
                    <label className="flex items-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="time_spent" 
                        value="Plus de 1h" 
                        checked={formData.time_spent === "Plus de 1h"}
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
                        name="activities_done" 
                        value="Écoute immersive" 
                        checked={formData.activities_done.includes("Écoute immersive")}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                        required
                      />
                      <span className="text-gray-300">Écoute immersive (podcasts, dialogues, vidéos)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name="activities_done" 
                        value="Shadowing" 
                        checked={formData.activities_done.includes("Shadowing")}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">Shadowing (répétition après un natif)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name="activities_done" 
                        value="Lecture et narration" 
                        checked={formData.activities_done.includes("Lecture et narration")}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">Lecture et narration (résumé oral ou écrit)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name="activities_done" 
                        value="Exercice d'expression orale" 
                        checked={formData.activities_done.includes("Exercice d'expression orale")}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">Exercice d'expression orale (monologue, conversation)</span>
                    </label>
                    <label className="flex items-center space-x-3 p-2 hover:bg-gray-800 rounded-lg cursor-pointer transition-colors">
                      <input 
                        type="checkbox" 
                        name="activities_done" 
                        value="Échange avec un natif" 
                        checked={formData.activities_done.includes("Échange avec un natif")}
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
                        name="new_expressions_count" 
                        value="1-2" 
                        checked={formData.new_expressions_count === "1-2"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                        required  
                      />
                      <span className="text-gray-300">1-2</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="new_expressions_count" 
                        value="3-5" 
                        checked={formData.new_expressions_count === "3-5"}
                        onChange={handleChange}
                        className="w-4 h-4 text-blue-500"
                      />
                      <span className="text-gray-300">3-5</span>
                    </label>
                    <label className="flex-1 flex items-center justify-center space-x-2 bg-gray-800 p-3 rounded-lg border border-gray-700 hover:border-blue-400 cursor-pointer transition-colors">
                      <input 
                        type="radio" 
                        name="new_expressions_count" 
                        value="Plus de 5" 
                        checked={formData.new_expressions_count === "Plus de 5"}
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
                        required
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
                    name="overcoming_strategies" 
                    value={formData.overcoming_strategies} 
                    onChange={handleChange}
                    placeholder="Décrivez brièvement..."
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-400 focus:outline-none transition-colors h-24 resize-none"
                    required
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
                          formData.confidence_score === score.toString() 
                            ? 'bg-blue-500 text-white scale-110' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                        style={{width: '18%'}}
                      >
                        <input 
                          type="radio" 
                          name="confidence_score" 
                          value={score} 
                          checked={formData.confidence_score === score.toString()}
                          onChange={handleChange}
                          className="hidden"
                          required
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
                
                {/* Message d'erreur */}
                {errorMessage && (
                  <div className="bg-red-500 bg-opacity-20 text-red-300 p-3 rounded-lg">
                    {errorMessage}
                  </div>
                )}
                
                {/* Boutons d'action */}
                <div className="flex justify-between pt-4">
                  <button 
                    type="button"
                    onClick={onClose}
                    className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    Annuler
                  </button>
                  <button 
                    type="submit"
                    className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white px-6 py-3 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    {loading ? "Envoi en cours..." : "Soumettre le rapport"}
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
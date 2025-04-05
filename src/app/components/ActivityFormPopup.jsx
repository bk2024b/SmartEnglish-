'use client'
import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ActivityFormPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    objectif_mensuel: '',
    objectif_hebdomadaire: '',
    objectif_du_jour: '',
    conseil_du_jour: '',
    
    // Activité du matin
    activite_matin_duree: '15 min',
    activite_matin_titre: '',
    activite_matin_consigne_debutant: '',
    activite_matin_consigne_intermediaire: '',
    activite_matin_consigne_avance: '',
    
    // Activité du midi
    activite_midi_duree: '15 min',
    activite_midi_titre: '',
    activite_midi_consigne_debutant: '',
    activite_midi_consigne_intermediaire: '',
    activite_midi_consigne_avance: '',
    
    // Activité du soir
    activite_soir_duree: '30 min',
    activite_soir_titre: '',
    activite_soir_consigne_debutant: '',
    activite_soir_consigne_intermediaire: '',
    activite_soir_consigne_avance: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activeTab, setActiveTab] = useState('objectifs');
  const [activeActivityTab, setActiveActivityTab] = useState('matin');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);
    setSaveError(null);
    
    try {
      // Insérer les nouvelles activités dans la base de données
      const { data, error } = await supabase
        .from('activities')
        .insert([formData]);
        
      if (error) throw error;
      
      setSaveSuccess(true);
      
      // Réinitialiser le formulaire après 2 secondes
      setTimeout(() => {
        setFormData({
          date: new Date().toISOString().split('T')[0],
          objectif_mensuel: '',
          objectif_hebdomadaire: '',
          objectif_du_jour: '',
          conseil_du_jour: '',
          
          activite_matin_duree: '15 min',
          activite_matin_titre: '',
          activite_matin_consigne_debutant: '',
          activite_matin_consigne_intermediaire: '',
          activite_matin_consigne_avance: '',
          
          activite_midi_duree: '15 min',
          activite_midi_titre: '',
          activite_midi_consigne_debutant: '',
          activite_midi_consigne_intermediaire: '',
          activite_midi_consigne_avance: '',
          
          activite_soir_duree: '30 min',
          activite_soir_titre: '',
          activite_soir_consigne_debutant: '',
          activite_soir_consigne_intermediaire: '',
          activite_soir_consigne_avance: ''
        });
        onClose();
        setSaveSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error("Erreur lors de l'enregistrement des activités:", error);
      setSaveError("Une erreur est survenue lors de l'enregistrement des activités.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  // Style personnalisé pour tous les champs de saisie
  const inputStyle = "block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-gray-900";
  const textareaStyle = "block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-gray-900";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold text-lg">Définir les activités du jour</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200 transition-colors">✕</button>
        </div>
        
        <div className="flex border-b border-gray-200">
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'objectifs' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('objectifs')}
          >
            Objectifs
          </button>
          <button 
            className={`flex-1 py-3 text-sm font-medium ${activeTab === 'activites' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('activites')}
          >
            Activités
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="p-6 overflow-y-auto max-h-[60vh]">
            {/* Champ de date commun */}
            <div className="mb-6">
              <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">Date</label>
              <input
                type="date"
                id="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className={inputStyle}
                required
              />
            </div>
            
            {activeTab === 'objectifs' ? (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <label htmlFor="objectif_mensuel" className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif mensuel
                  </label>
                  <textarea
                    id="objectif_mensuel"
                    name="objectif_mensuel"
                    rows="2"
                    value={formData.objectif_mensuel}
                    onChange={handleChange}
                    placeholder="Définir l'objectif mensuel pour les apprenants"
                    className={textareaStyle}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="objectif_hebdomadaire" className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif hebdomadaire
                  </label>
                  <textarea
                    id="objectif_hebdomadaire"
                    name="objectif_hebdomadaire"
                    rows="2"
                    value={formData.objectif_hebdomadaire}
                    onChange={handleChange}
                    placeholder="Définir l'objectif hebdomadaire pour les apprenants"
                    className={textareaStyle}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="objectif_du_jour" className="block text-sm font-medium text-gray-700 mb-1">
                    Objectif du jour
                  </label>
                  <textarea
                    id="objectif_du_jour"
                    name="objectif_du_jour"
                    rows="2"
                    value={formData.objectif_du_jour}
                    onChange={handleChange}
                    placeholder="Définir l'objectif du jour pour les apprenants"
                    className={textareaStyle}
                    required
                  ></textarea>
                </div>
                
                <div>
                  <label htmlFor="conseil_du_jour" className="block text-sm font-medium text-gray-700 mb-1">
                    Conseil du jour
                  </label>
                  <textarea
                    id="conseil_du_jour"
                    name="conseil_du_jour"
                    rows="2"
                    value={formData.conseil_du_jour}
                    onChange={handleChange}
                    placeholder="Donner un conseil pratique aux apprenants"
                    className={textareaStyle}
                    required
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="animate-fadeIn">
                {/* Onglets pour les moments de la journée */}
                <div className="flex mb-4 border-b border-gray-200">
                  <button 
                    type="button"
                    className={`py-2 px-4 text-sm font-medium ${activeActivityTab === 'matin' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
                    onClick={() => setActiveActivityTab('matin')}
                  >
                    Matin
                  </button>
                  <button 
                    type="button"
                    className={`py-2 px-4 text-sm font-medium ${activeActivityTab === 'midi' ? 'text-yellow-600 border-b-2 border-yellow-600' : 'text-gray-500'}`}
                    onClick={() => setActiveActivityTab('midi')}
                  >
                    Midi
                  </button>
                  <button 
                    type="button"
                    className={`py-2 px-4 text-sm font-medium ${activeActivityTab === 'soir' ? 'text-purple-600 border-b-2 border-purple-600' : 'text-gray-500'}`}
                    onClick={() => setActiveActivityTab('soir')}
                  >
                    Soir
                  </button>
                </div>

                {/* Activité du Matin */}
                {activeActivityTab === 'matin' && (
                  <div className="space-y-4 border-l-4 border-blue-500 pl-4 pb-2 animate-fadeIn">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor="activite_matin_titre" className="block text-sm font-medium text-gray-700 mb-1">
                          Titre de l'activité
                        </label>
                        <input
                          type="text"
                          id="activite_matin_titre"
                          name="activite_matin_titre"
                          value={formData.activite_matin_titre}
                          onChange={handleChange}
                          placeholder="Ex: Compréhension et extraction des expressions"
                          className={inputStyle}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label htmlFor="activite_matin_duree" className="block text-sm font-medium text-gray-700 mb-1">
                          Durée
                        </label>
                        <input
                          type="text"
                          id="activite_matin_duree"
                          name="activite_matin_duree"
                          value={formData.activite_matin_duree}
                          onChange={handleChange}
                          placeholder="Ex: 15 min"
                          className={inputStyle}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consignes par niveau
                      </label>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-green-50">
                        <label htmlFor="activite_matin_consigne_debutant" className="block text-sm font-medium text-green-700 mb-1">
                          Niveau Débutant
                        </label>
                        <textarea
                          id="activite_matin_consigne_debutant"
                          name="activite_matin_consigne_debutant"
                          rows="2"
                          value={formData.activite_matin_consigne_debutant}
                          onChange={handleChange}
                          placeholder="Consignes pour les débutants"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-blue-50">
                        <label htmlFor="activite_matin_consigne_intermediaire" className="block text-sm font-medium text-blue-700 mb-1">
                          Niveau Intermédiaire
                        </label>
                        <textarea
                          id="activite_matin_consigne_intermediaire"
                          name="activite_matin_consigne_intermediaire"
                          rows="2"
                          value={formData.activite_matin_consigne_intermediaire}
                          onChange={handleChange}
                          placeholder="Consignes pour les intermédiaires"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-purple-50">
                        <label htmlFor="activite_matin_consigne_avance" className="block text-sm font-medium text-purple-700 mb-1">
                          Niveau Avancé
                        </label>
                        <textarea
                          id="activite_matin_consigne_avance"
                          name="activite_matin_consigne_avance"
                          rows="2"
                          value={formData.activite_matin_consigne_avance}
                          onChange={handleChange}
                          placeholder="Consignes pour les avancés"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activité du Midi */}
                {activeActivityTab === 'midi' && (
                  <div className="space-y-4 border-l-4 border-yellow-500 pl-4 pb-2 animate-fadeIn">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor="activite_midi_titre" className="block text-sm font-medium text-gray-700 mb-1">
                          Titre de l'activité
                        </label>
                        <input
                          type="text"
                          id="activite_midi_titre"
                          name="activite_midi_titre"
                          value={formData.activite_midi_titre}
                          onChange={handleChange}
                          placeholder="Ex: Pratique du shadowing"
                          className={inputStyle}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label htmlFor="activite_midi_duree" className="block text-sm font-medium text-gray-700 mb-1">
                          Durée
                        </label>
                        <input
                          type="text"
                          id="activite_midi_duree"
                          name="activite_midi_duree"
                          value={formData.activite_midi_duree}
                          onChange={handleChange}
                          placeholder="Ex: 15 min"
                          className={inputStyle}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consignes par niveau
                      </label>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-green-50">
                        <label htmlFor="activite_midi_consigne_debutant" className="block text-sm font-medium text-green-700 mb-1">
                          Niveau Débutant
                        </label>
                        <textarea
                          id="activite_midi_consigne_debutant"
                          name="activite_midi_consigne_debutant"
                          rows="2"
                          value={formData.activite_midi_consigne_debutant}
                          onChange={handleChange}
                          placeholder="Consignes pour les débutants"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-blue-50">
                        <label htmlFor="activite_midi_consigne_intermediaire" className="block text-sm font-medium text-blue-700 mb-1">
                          Niveau Intermédiaire
                        </label>
                        <textarea
                          id="activite_midi_consigne_intermediaire"
                          name="activite_midi_consigne_intermediaire"
                          rows="2"
                          value={formData.activite_midi_consigne_intermediaire}
                          onChange={handleChange}
                          placeholder="Consignes pour les intermédiaires"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-purple-50">
                        <label htmlFor="activite_midi_consigne_avance" className="block text-sm font-medium text-purple-700 mb-1">
                          Niveau Avancé
                        </label>
                        <textarea
                          id="activite_midi_consigne_avance"
                          name="activite_midi_consigne_avance"
                          rows="2"
                          value={formData.activite_midi_consigne_avance}
                          onChange={handleChange}
                          placeholder="Consignes pour les avancés"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}

                {/* Activité du Soir */}
                {activeActivityTab === 'soir' && (
                  <div className="space-y-4 border-l-4 border-purple-500 pl-4 pb-2 animate-fadeIn">
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <label htmlFor="activite_soir_titre" className="block text-sm font-medium text-gray-700 mb-1">
                          Titre de l'activité
                        </label>
                        <input
                          type="text"
                          id="activite_soir_titre"
                          name="activite_soir_titre"
                          value={formData.activite_soir_titre}
                          onChange={handleChange}
                          placeholder="Ex: Application et mise en pratique"
                          className={inputStyle}
                          required
                        />
                      </div>
                      <div className="w-32">
                        <label htmlFor="activite_soir_duree" className="block text-sm font-medium text-gray-700 mb-1">
                          Durée
                        </label>
                        <input
                          type="text"
                          id="activite_soir_duree"
                          name="activite_soir_duree"
                          value={formData.activite_soir_duree}
                          onChange={handleChange}
                          placeholder="Ex: 30 min"
                          className={inputStyle}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Consignes par niveau
                      </label>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-green-50">
                        <label htmlFor="activite_soir_consigne_debutant" className="block text-sm font-medium text-green-700 mb-1">
                          Niveau Débutant
                        </label>
                        <textarea
                          id="activite_soir_consigne_debutant"
                          name="activite_soir_consigne_debutant"
                          rows="2"
                          value={formData.activite_soir_consigne_debutant}
                          onChange={handleChange}
                          placeholder="Consignes pour les débutants"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="mb-3 border rounded-lg p-3 bg-blue-50">
                        <label htmlFor="activite_soir_consigne_intermediaire" className="block text-sm font-medium text-blue-700 mb-1">
                          Niveau Intermédiaire
                        </label>
                        <textarea
                          id="activite_soir_consigne_intermediaire"
                          name="activite_soir_consigne_intermediaire"
                          rows="2"
                          value={formData.activite_soir_consigne_intermediaire}
                          onChange={handleChange}
                          placeholder="Consignes pour les intermédiaires"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                      
                      <div className="border rounded-lg p-3 bg-purple-50">
                        <label htmlFor="activite_soir_consigne_avance" className="block text-sm font-medium text-purple-700 mb-1">
                          Niveau Avancé
                        </label>
                        <textarea
                          id="activite_soir_consigne_avance"
                          name="activite_soir_consigne_avance"
                          rows="2"
                          value={formData.activite_soir_consigne_avance}
                          onChange={handleChange}
                          placeholder="Consignes pour les avancés"
                          className="block w-full rounded-md border border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 py-2 px-3 text-gray-900"
                          required
                        ></textarea>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-gray-200 flex justify-between items-center">
            {saveError && <p className="text-red-500 text-sm">{saveError}</p>}
            {saveSuccess && <p className="text-green-500 text-sm">Activités enregistrées avec succès!</p>}
            
            <div className="flex gap-3 ml-auto">
              <button 
                type="button" 
                onClick={onClose} 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm transition-colors"
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md text-sm transition-colors flex items-center"
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enregistrement...
                  </>
                ) : "Enregistrer"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
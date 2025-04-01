import React, { useState } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function ActivityFormPopup({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    objectif_mensuel: '',
    objectif_hebdomadaire: '',
    objectif_du_jour: '',
    conseil_du_jour: '',
    activite_1_titre: '',
    activite_1_consignes: '',
    activite_2_titre: '',
    activite_2_consignes: '',
    activite_3_titre: '',
    activite_3_consignes: ''
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [activeTab, setActiveTab] = useState('objectifs');

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
          activite_1_titre: '',
          activite_1_consignes: '',
          activite_2_titre: '',
          activite_2_consignes: '',
          activite_3_titre: '',
          activite_3_consignes: ''
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 animate-fadeIn">
      <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-xl animate-scaleIn">
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
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  ></textarea>
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                {/* Activité 1 */}
                <div className="border-l-4 border-blue-500 pl-3 pb-1">
                  <h3 className="font-medium text-blue-600 mb-2">Activité 1</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="activite_1_titre" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="activite_1_titre"
                      name="activite_1_titre"
                      value={formData.activite_1_titre}
                      onChange={handleChange}
                      placeholder="Ex: Lecture du cours"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="activite_1_consignes" className="block text-sm font-medium text-gray-700 mb-1">
                      Consignes
                    </label>
                    <textarea
                      id="activite_1_consignes"
                      name="activite_1_consignes"
                      rows="2"
                      value={formData.activite_1_consignes}
                      onChange={handleChange}
                      placeholder="Détaillez les instructions pour cette activité"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                </div>
                
                {/* Activité 2 */}
                <div className="border-l-4 border-purple-500 pl-3 pb-1">
                  <h3 className="font-medium text-purple-600 mb-2">Activité 2</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="activite_2_titre" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="activite_2_titre"
                      name="activite_2_titre"
                      value={formData.activite_2_titre}
                      onChange={handleChange}
                      placeholder="Ex: Exercice pratique"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="activite_2_consignes" className="block text-sm font-medium text-gray-700 mb-1">
                      Consignes
                    </label>
                    <textarea
                      id="activite_2_consignes"
                      name="activite_2_consignes"
                      rows="2"
                      value={formData.activite_2_consignes}
                      onChange={handleChange}
                      placeholder="Détaillez les instructions pour cette activité"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                </div>
                
                {/* Activité 3 */}
                <div className="border-l-4 border-green-500 pl-3 pb-1">
                  <h3 className="font-medium text-green-600 mb-2">Activité 3</h3>
                  
                  <div className="mb-4">
                    <label htmlFor="activite_3_titre" className="block text-sm font-medium text-gray-700 mb-1">
                      Titre
                    </label>
                    <input
                      type="text"
                      id="activite_3_titre"
                      name="activite_3_titre"
                      value={formData.activite_3_titre}
                      onChange={handleChange}
                      placeholder="Ex: Quiz d'évaluation"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="activite_3_consignes" className="block text-sm font-medium text-gray-700 mb-1">
                      Consignes
                    </label>
                    <textarea
                      id="activite_3_consignes"
                      name="activite_3_consignes"
                      rows="2"
                      value={formData.activite_3_consignes}
                      onChange={handleChange}
                      placeholder="Détaillez les instructions pour cette activité"
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    ></textarea>
                  </div>
                </div>
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
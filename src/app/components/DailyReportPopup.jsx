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
    xp_points: xpEarned,
  });

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const calculateXP = (formData) => {
    let xp = 10; // XP de base
  
    if (formData.time_spent === "Plus de 1h") xp += 15;
    else if (formData.time_spent === "1h") xp += 10;
    else if (formData.time_spent === "30-45 min") xp += 5;
  
    xp += formData.activities_done.length * 5; // 5 XP par activité réalisée
  
    if (formData.new_expressions_count === "3-5") xp += 5;
    else if (formData.new_expressions_count === "6 ou plus") xp += 10;
  
    return xp;
  };
  

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

    const xpEarned = calculateXP(formData);

    const { error } = await supabase.from('daily_progress').insert([formData]);


    if (error) {
      console.error("Erreur lors de l'envoi :", error);
      setErrorMessage("Erreur lors de l'envoi du formulaire.");
    } else {
      console.log("Rapport enregistré !");
      onClose();
    }
    setLoading(false);

    // Mettre à jour le total XP dans le profil utilisateur
    const { error: profileError } = await supabase
    .from("profiles")
    .update({ xp: supabase.raw("xp + " + xpEarned) })
    .eq("id", formData.profile_id); 

    if (profileError) {
      console.error("Erreur lors de la mise à jour des XP :", profileError);
    }
    console.log("Rapport enregistré avec XP :", xpEarned);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70">
      <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[90vh] shadow-xl">
        <div className="bg-blue-600 px-4 py-3 flex justify-between items-center">
          <h2 className="text-white font-bold">Rapport Quotidien</h2>
          <button onClick={onClose} className="text-white hover:text-gray-200">
            ✕
          </button>
        </div>
        <div className="overflow-y-auto max-h-[70vh] p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-blue-300">Date</label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                className="w-full bg-gray-800 border rounded-lg px-3 py-2 text-white"
                required
              />
            </div>

            {/* Temps consacré */}
            <div>
              <label className="block text-blue-300">Temps consacré</label>
              <div className="grid grid-cols-2 gap-3">
                {["Moins de 30 min", "30-45 min", "1h", "Plus de 1h"].map((time) => (
                  <label key={time} className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="time_spent"
                      value={time}
                      checked={formData.time_spent === time}
                      onChange={handleChange}
                    />
                    <span className="text-gray-300">{time}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Activités réalisées */}
            <div>
              <label className="block text-blue-300">Activités réalisées</label>
              {[
                "Écoute immersive",
                "Shadowing",
                "Lecture et narration",
                "Exercice d'expression orale",
                "Échange avec un natif",
              ].map((activity) => (
                <label key={activity} className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    name="activities_done"
                    value={activity}
                    checked={formData.activities_done.includes(activity)}
                    onChange={handleChange}
                  />
                  <span className="text-gray-300">{activity}</span>
                </label>
              ))}
            </div>

            {/* Bouton de soumission */}
            <button
              type="submit"
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 transition"
              disabled={loading}
            >
              {loading ? "Envoi en cours..." : "Enregistrer"}
            </button>

            {/* Message d'erreur */}
            {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

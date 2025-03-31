"use client";

import React, { useState, useRef } from 'react';
import { supabase } from "../utils/supabaseClient";

export default function AudioUploadPopup({ isOpen, onClose, userId }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [title, setTitle] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // Démarrer l'enregistrement
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (e) => {
        audioChunksRef.current.push(e.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        setAudioBlob(audioBlob);
        setAudioURL(audioUrl);
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setErrorMessage("");
    } catch (error) {
      console.error("Erreur lors de l'accès au microphone:", error);
      setErrorMessage("Impossible d'accéder au microphone. Vérifiez vos permissions.");
    }
  };

  // Arrêter l'enregistrement
  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      // Arrêter les tracks du stream
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
    }
  };

  // Gérer l'upload de fichier
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAudioBlob(file);
      setAudioURL(URL.createObjectURL(file));
      setErrorMessage("");
    }
  };

  // Sauvegarder l'audio
  const saveAudio = async () => {
    // Dans la fonction saveAudio
    const { error: dbError } = await supabase
        .from('audio_notes')
        .insert({
        user_id: userId,
        title: title,
        file_path: fileName,
        file_url: urlData.publicUrl,
        created_at: new Date().toISOString()
        })
    .select(); // Ajoutez .select() pour contourner certaines limitations RLS
    if (!audioBlob) {
      setErrorMessage("Aucun audio à enregistrer");
      return;
    }

    if (!title.trim()) {
      setErrorMessage("Veuillez donner un titre à votre enregistrement");
      return;
    }

    setIsUploading(true);
    setErrorMessage("");

    try {
      const fileName = `${userId}_${Date.now()}.webm`;
      const { data, error } = await supabase.storage
        .from('audio-recordings')
        .upload(fileName, audioBlob);

      if (error) throw error;

      // Récupérer l'URL publique du fichier
      const { data: urlData } = supabase.storage
        .from('audio-recordings')
        .getPublicUrl(fileName);

      // Enregistrer les métadonnées dans la base de données
      const { error: dbError } = await supabase
        .from('audio_notes')
        .insert({
          user_id: userId,
          title: title,
          file_path: fileName,
          file_url: urlData.publicUrl,
          created_at: new Date().toISOString()
        });

      if (dbError) throw dbError;

      setSuccessMessage("Enregistrement audio sauvegardé avec succès!");
      setTimeout(() => {
        resetForm();
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Erreur lors de l'enregistrement de l'audio:", error);
      setErrorMessage("Erreur lors de la sauvegarde de l'enregistrement");
    } finally {
      setIsUploading(false);
    }
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setAudioBlob(null);
    setAudioURL(null);
    setTitle("");
    setErrorMessage("");
    setSuccessMessage("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl shadow-xl max-w-md w-full p-6 relative">
        {/* Bouton de fermeture */}
        <button 
          onClick={() => {
            resetForm();
            onClose();
          }}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-center mb-6 text-white">Note Vocale</h2>

        {/* Titre de l'enregistrement */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Titre de votre note
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-gray-700 rounded-lg border border-gray-600 py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Mon enregistrement..."
          />
        </div>

        {/* Affichage de l'audio si disponible */}
        {audioURL && (
          <div className="mb-6">
            <audio src={audioURL} controls className="w-full mt-2" />
          </div>
        )}

        {/* Boutons d'action */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {!isRecording ? (
            <button
              onClick={startRecording}
              disabled={isUploading}
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg flex items-center justify-center"
            >
              <span className="mr-2">🎙️</span>
              Enregistrer
            </button>
          ) : (
            <button
              onClick={stopRecording}
              className="bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded-lg flex items-center justify-center animate-pulse"
            >
              <span className="mr-2">⏹️</span>
              Arrêter
            </button>
          )}

          <button
            onClick={() => fileInputRef.current.click()}
            disabled={isUploading || isRecording}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
          >
            <span className="mr-2">📁</span>
            Importer
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="audio/*"
            className="hidden"
          />
        </div>

        {/* Messages d'erreur ou de succès */}
        {errorMessage && (
          <p className="text-red-400 text-sm mb-4">{errorMessage}</p>
        )}
        {successMessage && (
          <p className="text-green-400 text-sm mb-4">{successMessage}</p>
        )}

        {/* Bouton de sauvegarde */}
        <button
          onClick={saveAudio}
          disabled={isUploading || isRecording || !audioBlob}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center disabled:opacity-50"
        >
          {isUploading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sauvegarde en cours...
            </span>
          ) : (
            <>
              <span className="mr-2">💾</span>
              Sauvegarder
            </>
          )}
        </button>
      </div>
    </div>
  );
}
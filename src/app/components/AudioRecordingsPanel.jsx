'use client'
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/supabaseClient';

export default function AudioRecordingsPanel() {
  const [audioNotes, setAudioNotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedAudio, setSelectedAudio] = useState(null);
  const [filterByUser, setFilterByUser] = useState('');
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  // Fetch all audio notes and users on component mount
  useEffect(() => {
    const fetchAudioNotes = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch audio notes from the database
        const { data: notesData, error: notesError } = await supabase
          .from('audio_notes')
          .select('*, profiles:user_id(id, full_name)')
          .order('created_at', { ascending: false });
        
        if (notesError) throw notesError;
        
        // Get signed URLs for each audio file
        const notesWithUrls = await Promise.all(
          notesData.map(async (note) => {
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from('audio-recordings')
              .createSignedUrl(note.file_path, 3600); // URL valid for 1 hour
            
            if (urlError) {
              console.error('Error getting signed URL:', urlError);
              return { ...note, signedUrl: null };
            }
            
            return { ...note, signedUrl: urlData?.signedUrl };
          })
        );
        
        setAudioNotes(notesWithUrls);
        
        // Extract unique users from the data
        const uniqueUsers = [...new Set(notesData
          .filter(note => note.profiles && note.profiles.full_name)
          .map(note => ({
            id: note.user_id,
            name: note.profiles.full_name
          })))];
        
        setUsers(uniqueUsers);
      } catch (error) {
        console.error('Error fetching audio notes:', error);
        setError('Une erreur est survenue lors du chargement des enregistrements audio');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAudioNotes();
  }, []);

  // Handle filtering by user
  const filteredNotes = filterByUser
    ? audioNotes.filter(note => note.user_id === filterByUser)
    : audioNotes;

  // Handle audio download
  const handleDownload = async (note) => {
    if (!note.signedUrl) {
      alert('Impossible de télécharger cet audio pour le moment.');
      return;
    }
    
    try {
      // Create an anchor element and simulate a click
      const a = document.createElement('a');
      a.href = note.signedUrl;
      a.download = note.title || 'audio-note.mp3';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading audio:', error);
      alert('Erreur lors du téléchargement de l\'audio');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 md:p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Enregistrements Audio</h2>
      
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-4">
          {error}
        </div>
      )}
      
      <div className="mb-4">
        <label htmlFor="filterUser" className="block text-sm font-medium text-gray-700 mb-1">
          Filtrer par apprenant
        </label>
        <select
          id="filterUser"
          value={filterByUser}
          onChange={(e) => setFilterByUser(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 w-full sm:w-64 text-gray-900"
        >
          <option value="">Tous les apprenants</option>
          {users.map(user => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : filteredNotes.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Aucun enregistrement audio disponible.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNotes.map((note) => (
            <div 
              key={note.id} 
              className="border border-gray-200 rounded-lg p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
            >
              <h3 className="font-medium text-gray-900 mb-1">{note.title || 'Sans titre'}</h3>
              <p className="text-sm text-gray-500 mb-3">
                {note.profiles?.full_name || 'Apprenant inconnu'} | {new Date(note.created_at).toLocaleDateString()}
              </p>
              
              {note.signedUrl ? (
                <div className="space-y-3">
                  <audio
                    controls
                    src={note.signedUrl}
                    className="w-full"
                    onPlay={() => setSelectedAudio(note.id)}
                  >
                    Votre navigateur ne supporte pas l'élément audio.
                  </audio>
                  
                  <button
                    onClick={() => handleDownload(note)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium px-3 py-1.5 rounded-md text-sm transition-colors flex items-center justify-center gap-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                      <line x1="12" y1="15" x2="12" y2="3"></line>
                    </svg>
                    Télécharger
                  </button>
                </div>
              ) : (
                <div className="text-sm text-red-500 italic">
                  Audio non disponible
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
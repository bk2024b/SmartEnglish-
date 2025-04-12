// src/app/components/ProgressDetailsModal.jsx
'use client'
import React from 'react';

export default function ProgressDetailsModal({ isOpen, onClose, data, progressType }) {
  if (!isOpen) return null;

  const renderDailyDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Date" value={data.date} />
        <DetailItem label="Temps passé" value={data.time_spent} />
        <DetailItem label="Points XP" value={data.xp_points || 'Non spécifié'} />
        <DetailItem label="Confiance" value={`${data.confidence_score}/5`} />
        <DetailItem label="Nombre d'expressions" value={data.new_expressions_count} />
      </div>
      
      <DetailSection title="Activités réalisées">
        {Array.isArray(data.activities_done) ? (
          <ul className="list-disc pl-5 space-y-1">
            {data.activities_done.map((activity, i) => (
              <li key={i} className="text-gray-700">{activity}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">Aucune activité enregistrée</p>
        )}
      </DetailSection>
      
      <DetailSection title="Difficultés rencontrées">
        {data.difficulties && Object.keys(data.difficulties).length > 0 ? (
          <ul className="list-disc pl-5 space-y-1">
            {Object.entries(data.difficulties).map(([key, value]) => (
              value && <li key={key} className="text-gray-700">{key}: {typeof value === 'boolean' ? 'Oui' : value}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-700">Aucune difficulté signalée</p>
        )}
      </DetailSection>
      
      <DetailSection title="Autres difficultés">
        {data.difficultiesOther ? (
          <p className="text-gray-700">{JSON.stringify(data.difficultiesOther)}</p>
        ) : (
          <p className="text-gray-700">Aucune</p>
        )}
      </DetailSection>
      
      <DetailSection title="Stratégies pour surmonter les difficultés">
        <p className="text-gray-700">{data.overcoming_strategies || 'Non spécifié'}</p>
      </DetailSection>
    </div>
  );

  const renderWeeklyDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Période" value={`${new Date(data.week_start_date).toLocaleDateString()} - ${new Date(data.week_end_date).toLocaleDateString()}`} />
        <DetailItem label="Temps total" value={data.weekly_time_spent} />
        <DetailItem label="Temps total (minutes)" value={data.totalTime || 'Non spécifié'} />
      </div>
      
      <DetailSection title="Activité la plus efficace">
        <p className="text-gray-700">{data.most_effective_activity}</p>
      </DetailSection>
      
      <DetailSection title="Autres activités efficaces">
        {data.mostEffectiveActivityOther ? (
          <p className="text-gray-700">{JSON.stringify(data.mostEffectiveActivityOther)}</p>
        ) : (
          <p className="text-gray-700">Aucune</p>
        )}
      </DetailSection>
      
      <DetailSection title="Plus grand progrès">
        <p className="text-gray-700">{data.biggest_progress}</p>
      </DetailSection>
      
      <DetailSection title="Plus grand défi">
        <p className="text-gray-700">{data.biggest_challenge}</p>
      </DetailSection>
      
      <DetailSection title="Action pour la semaine prochaine">
        <p className="text-gray-700">{data.next_week_action}</p>
      </DetailSection>
      
      <DetailSection title="Enregistrement vocal">
        <p className="text-gray-700">{data.voice_record_sent || 'Non envoyé'}</p>
      </DetailSection>
    </div>
  );

  const renderMonthlyDetails = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Mois" value={data.month} />
        <DetailItem label="Score de confiance" value={`${data.confidence_score}/5`} />
      </div>
      
      <DetailSection title="Évaluation de la progression">
        <p className="text-gray-700">{data.progression_evaluation}</p>
      </DetailSection>
      
      <DetailSection title="Changements remarqués">
        <p className="text-gray-700">{data.changes_noticed || 'Non spécifié'}</p>
      </DetailSection>
      
      <DetailSection title="Plus grand défi du mois">
        <p className="text-gray-700">{data.biggest_monthly_challenge || 'Non spécifié'}</p>
      </DetailSection>
      
      <DetailSection title="Nouvelles compétences acquises">
        <ul className="list-disc pl-5 space-y-1">
          {data.newSkill1 && <li className="text-gray-700">{data.newSkill1}</li>}
          {data.newSkill2 && <li className="text-gray-700">{data.newSkill2}</li>}
          {data.newSkill3 && <li className="text-gray-700">{data.newSkill3}</li>}
        </ul>
      </DetailSection>
      
      <DetailSection title="Enregistrement vocal">
        <p className="text-gray-700">{data.voice_record_sent || 'Non envoyé'}</p>
      </DetailSection>
    </div>
  );

  const getDetailContent = () => {
    switch (progressType) {
      case 'daily':
        return renderDailyDetails();
      case 'weekly':
        return renderWeeklyDetails();
      case 'monthly':
        return renderMonthlyDetails();
      default:
        return <p>Aucune donnée disponible</p>;
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            {progressType === 'daily' && 'Détails du progrès journalier'}
            {progressType === 'weekly' && 'Détails du progrès hebdomadaire'}
            {progressType === 'monthly' && 'Détails du progrès mensuel'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          {getDetailContent()}
        </div>
        
        <div className="px-6 py-4 border-t bg-gray-50 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md font-medium transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

// Composants utilitaires pour l'affichage des détails
function DetailItem({ label, value }) {
  return (
    <div className="bg-gray-50 p-3 rounded-md">
      <p className="text-sm text-gray-600 font-medium">{label}</p>
      <p className="text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function DetailSection({ title, children }) {
  return (
    <div>
      <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
      <div className="bg-gray-50 p-3 rounded-md">
        {children}
      </div>
    </div>
  );
}
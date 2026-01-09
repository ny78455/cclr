import React from 'react';
import { StatCardProps } from '../types';
import { BookOpen, Users, Brain, Activity } from 'lucide-react';

interface StatsOverviewProps {
  novelCount: number;
  characterCount: number;
  embeddingCount: number;
  accuracy: number | null;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, trend, icon: Icon }) => (
  <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-5 hover:bg-slate-800 transition-colors">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2 bg-indigo-500/10 rounded-lg">
        <Icon className="w-5 h-5 text-indigo-400" />
      </div>
      {trend && (
        <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-full">
          {trend}
        </span>
      )}
    </div>
    <div className="text-2xl font-bold text-slate-100 mb-1">{value}</div>
    <div className="text-sm text-slate-400">{label}</div>
  </div>
);

export const StatsOverview: React.FC<StatsOverviewProps> = ({ 
  novelCount, 
  characterCount, 
  embeddingCount, 
  accuracy 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <StatCard 
        label="Novels Processed" 
        value={novelCount} 
        trend={novelCount > 0 ? "Active" : "No Data"}
        icon={BookOpen} 
      />
      <StatCard 
        label="Character Profiles" 
        value={characterCount} 
        icon={Users} 
      />
      <StatCard 
        label="Memory Embeddings" 
        value={embeddingCount > 1000 ? `${(embeddingCount / 1000).toFixed(1)}k` : embeddingCount} 
        trend={embeddingCount > 0 ? "Indexed" : undefined}
        icon={Brain} 
      />
      <StatCard 
        label="Reasoning Accuracy" 
        value={accuracy !== null ? `${accuracy.toFixed(1)}%` : "N/A"} 
        trend={accuracy !== null ? "Calculated on Train Set" : "Upload Train CSV"}
        icon={Activity} 
      />
    </div>
  );
};
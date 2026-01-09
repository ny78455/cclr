import React from 'react';
import { PipelineStep } from '../types';
import { Database, FileText, Layers, BrainCircuit, Search, CheckCircle2, Circle } from 'lucide-react';

interface Props {
  currentStep: PipelineStep;
}

const steps = [
  { id: PipelineStep.INGESTION, label: 'Data Ingestion', icon: Database },
  { id: PipelineStep.CHUNKING, label: 'Text Chunking', icon: FileText },
  { id: PipelineStep.EMBEDDING, label: 'Vector Embedding', icon: Layers },
  { id: PipelineStep.CLUSTERING, label: 'Memory Clustering', icon: BrainCircuit },
  { id: PipelineStep.RETRIEVAL, label: 'Context Retrieval', icon: Search },
  { id: PipelineStep.REASONING, label: 'Gemini Reasoning', icon: BrainCircuit },
];

export const PipelineVisualizer: React.FC<Props> = ({ currentStep }) => {
  const getStepStatus = (stepId: PipelineStep) => {
    const stepOrder = steps.findIndex(s => s.id === stepId);
    const currentOrder = steps.findIndex(s => s.id === currentStep);
    
    if (currentStep === PipelineStep.COMPLETE) return 'completed';
    if (currentStep === PipelineStep.IDLE) return 'pending';
    
    if (stepOrder < currentOrder) return 'completed';
    if (stepOrder === currentOrder) return 'active';
    return 'pending';
  };

  return (
    <div className="w-full bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8">
      <h3 className="text-lg font-semibold text-slate-200 mb-6 flex items-center gap-2">
        <BrainCircuit className="w-5 h-5 text-indigo-400" />
        Pipeline Status
      </h3>
      
      <div className="relative flex justify-between items-center px-4">
        {/* Connecting Line */}
        <div className="absolute left-4 right-4 top-1/2 h-0.5 bg-slate-800 -z-0" />
        
        {steps.map((step) => {
          const status = getStepStatus(step.id);
          const Icon = step.icon;
          
          let circleClass = "bg-slate-800 border-slate-600 text-slate-500";
          let labelClass = "text-slate-500";
          
          if (status === 'completed') {
            circleClass = "bg-emerald-500/10 border-emerald-500 text-emerald-500";
            labelClass = "text-emerald-500";
          } else if (status === 'active') {
            circleClass = "bg-indigo-500 border-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]";
            labelClass = "text-indigo-400 font-medium";
          }

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${circleClass}`}>
                {status === 'completed' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <Icon className="w-6 h-6" />
                )}
              </div>
              <span className={`text-xs uppercase tracking-wider font-semibold ${labelClass}`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
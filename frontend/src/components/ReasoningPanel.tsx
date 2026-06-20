import React from 'react';
import type { ActionPlan } from '../types/agent';
import { Brain, Cpu, MessageSquare } from 'lucide-react';

interface ReasoningPanelProps {
  plan: ActionPlan | null;
}

export const ReasoningPanel: React.FC<ReasoningPanelProps> = ({ plan }) => {
  if (!plan || !plan.reasoning) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[180px] flex flex-col items-center justify-center text-zinc-500">
        <Brain className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">Waiting for AI reasoning data...</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <Cpu className="w-4 h-4 text-purple-400" />
        Gemini Cognitive Reasoning
      </h3>
      
      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-4 relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition duration-300">
          <Brain className="w-16 h-16 text-purple-400" />
        </div>
        <div className="flex gap-3 items-start relative z-10">
          <div className="p-2 bg-purple-950/40 border border-purple-800/40 text-purple-300 rounded-lg shrink-0">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div className="space-y-1.5">
            <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider">Thought Process</span>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans select-text">
              {plan.reasoning}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';

interface AgentStatusProps {
  currentStatus: string;
}

interface Step {
  label: string;
  match: string[];
  active?: string[];
  failed?: string[];
}

const STEPS: Step[] = [
  { label: 'Browser Opened', match: ['Browser Opened', 'Page Loaded', 'Observation Running', 'Observation Complete', 'Planning Running', 'Planning Complete', 'Execution Running', 'Verification Complete', 'Recovery Running', 'Completed', 'Failed'] },
  { label: 'Page Loaded', match: ['Page Loaded', 'Observation Running', 'Observation Complete', 'Planning Running', 'Planning Complete', 'Execution Running', 'Verification Complete', 'Recovery Running', 'Completed', 'Failed'] },
  { label: 'Observation Complete', match: ['Observation Complete', 'Planning Running', 'Planning Complete', 'Execution Running', 'Verification Complete', 'Recovery Running', 'Completed', 'Failed'], active: ['Observation Running'] },
  { label: 'Planning Complete', match: ['Planning Complete', 'Execution Running', 'Verification Complete', 'Recovery Running', 'Completed', 'Failed'], active: ['Planning Running'] },
  { label: 'Execution Running', match: ['Execution Running', 'Verification Complete', 'Recovery Running', 'Completed', 'Failed'], active: ['Execution Running'] },
  { label: 'Verification Complete', match: ['Verification Complete', 'Completed', 'Failed'], active: ['Verification Running'] },
  { label: 'Recovery Active', match: ['Recovery Running', 'Completed'], active: ['Recovery Running'] },
  { label: 'Task Finished', match: ['Completed'], active: [], failed: ['Failed'] },
];

export const AgentStatus: React.FC<AgentStatusProps> = ({ currentStatus }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
        Agent Lifecycle State
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STEPS.map((step, idx) => {
          let status: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
          
          if (step.match.includes(currentStatus)) {
            status = 'completed';
          } else if (step.active?.includes(currentStatus)) {
            status = 'running';
          } else if (step.failed?.includes(currentStatus)) {
            status = 'failed';
          }
          
          // Exception if agent fails on this step
          if (currentStatus === 'Failed' && idx === STEPS.length - 1) {
            status = 'failed';
          }

          return (
            <div
              key={idx}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-200 ${
                status === 'completed'
                  ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300'
                  : status === 'running'
                  ? 'bg-cyan-950/30 border-cyan-800/80 text-cyan-300 animate-pulse'
                  : status === 'failed'
                  ? 'bg-rose-950/20 border-rose-900/50 text-rose-300'
                  : 'bg-zinc-950/40 border-zinc-900 text-zinc-600'
              }`}
            >
              {status === 'completed' && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />}
              {status === 'running' && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin shrink-0" />}
              {status === 'failed' && <XCircle className="w-4 h-4 text-rose-400 shrink-0" />}
              {status === 'pending' && <Circle className="w-4 h-4 text-zinc-800 shrink-0" />}
              
              <span className="text-xs font-medium truncate">{step.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

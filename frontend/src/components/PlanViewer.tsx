import React from 'react';
import type { ActionPlan } from '../types/agent';
import { ClipboardList, MousePointerClick, Keyboard, Move, Camera, Globe, Navigation } from 'lucide-react';

interface PlanViewerProps {
  plan: ActionPlan | null;
}

const getActionIcon = (actionType: string) => {
  switch (actionType) {
    case 'OPEN_BROWSER':
      return <Globe className="w-4 h-4 text-cyan-400" />;
    case 'NAVIGATE':
      return <Navigation className="w-4 h-4 text-emerald-400" />;
    case 'CLICK':
    case 'DOUBLE_CLICK':
      return <MousePointerClick className="w-4 h-4 text-yellow-400" />;
    case 'SEND_KEYS':
      return <Keyboard className="w-4 h-4 text-blue-400" />;
    case 'SCROLL':
      return <Move className="w-4 h-4 text-purple-400" />;
    case 'SCREENSHOT':
      return <Camera className="w-4 h-4 text-pink-400" />;
    default:
      return <ClipboardList className="w-4 h-4 text-zinc-400" />;
  }
};

export const PlanViewer: React.FC<PlanViewerProps> = ({ plan }) => {
  if (!plan || !plan.actions || plan.actions.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[280px] flex flex-col items-center justify-center text-zinc-500">
        <ClipboardList className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">No action plan generated yet</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col h-[340px]">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-pink-400" />
        Generated Action Plan ({plan.actions.length} steps)
      </h3>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {plan.actions.map((act, idx) => (
          <div
            key={idx}
            className="bg-zinc-950/80 border border-zinc-850 hover:border-zinc-800 rounded-lg p-3.5 flex items-start gap-3.5 transition duration-200"
          >
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 w-5 h-5 rounded-full flex items-center justify-center shrink-0">
                {idx + 1}
              </span>
              {idx < plan.actions.length - 1 && (
                <div className="w-0.5 h-8 bg-zinc-800 my-1"></div>
              )}
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-zinc-900 border border-zinc-800 rounded">
                  {getActionIcon(act.action)}
                </span>
                <span className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  {act.action}
                </span>
              </div>

              {act.selector && (
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Target Selector</span>
                  <div className="text-[10px] text-zinc-400 font-mono bg-zinc-900 px-2 py-1 rounded border border-zinc-850 truncate select-all">
                    {act.selector}
                  </div>
                </div>
              )}

              {act.value && (
                <div className="space-y-1">
                  <span className="text-[9px] font-semibold text-zinc-500 uppercase tracking-wide">Parameter Value</span>
                  <div className="text-[10px] text-zinc-300 font-sans bg-zinc-905 px-2 py-1 rounded border border-zinc-850/80 select-all">
                    {act.value}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

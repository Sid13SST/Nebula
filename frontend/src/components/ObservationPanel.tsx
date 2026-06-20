import type { PageObservation } from '../types/agent';
import { Eye, EyeOff, LayoutGrid, Terminal, Type } from 'lucide-react';

interface ObservationPanelProps {
  observation: PageObservation | null;
}

export const ObservationPanel: React.FC<ObservationPanelProps> = ({ observation }) => {
  if (!observation || !observation.elements || observation.elements.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[300px] flex flex-col items-center justify-center text-zinc-500">
        <LayoutGrid className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">No page observation data loaded</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col h-[380px]">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
          <Terminal className="w-4 h-4 text-cyan-400" />
          Page Observation ({observation.elements.length} elements)
        </h3>
        <span className="text-[10px] text-zinc-500 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-850 truncate max-w-[200px]">
          {observation.url}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
        {observation.elements.map((el, idx) => (
          <div
            key={el.id || idx}
            className="bg-zinc-950/80 border border-zinc-850 hover:border-zinc-800 rounded-lg p-3 space-y-1.5 transition duration-200"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-300 uppercase tracking-wider">
                  {el.type}
                </span>
                <span className="text-xs font-semibold text-zinc-200">
                  {el.label || el.placeholder || 'unlabeled'}
                </span>
              </div>
              <span className="text-zinc-600">
                {el.isVisible ? (
                  <span title="Visible"><Eye className="w-3.5 h-3.5 text-cyan-500/70" /></span>
                ) : (
                  <span title="Hidden"><EyeOff className="w-3.5 h-3.5" /></span>
                )}
              </span>
            </div>

            <div className="text-[10px] text-zinc-500 font-mono bg-zinc-900/50 p-1.5 rounded border border-zinc-900/80 break-all select-all">
              {el.selector}
            </div>
            
            {el.placeholder && (
              <div className="text-[10px] text-zinc-400 flex items-center gap-1">
                <Type className="w-3 h-3 opacity-60" />
                Placeholder: <span className="text-zinc-300">{el.placeholder}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

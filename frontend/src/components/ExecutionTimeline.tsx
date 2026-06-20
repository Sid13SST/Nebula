import React from 'react';
import type { ActionHistoryEntry } from '../types/agent';
import { History, Check, X, ShieldAlert, Sparkles, Clock } from 'lucide-react';

interface ExecutionTimelineProps {
  history: ActionHistoryEntry[];
}

export const ExecutionTimeline: React.FC<ExecutionTimelineProps> = ({ history }) => {
  if (!history || history.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[300px] flex flex-col items-center justify-center text-zinc-500">
        <History className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">Waiting for live action executions...</span>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col h-[340px]">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <History className="w-4 h-4 text-emerald-400" />
        Execution Timeline
      </h3>

      <div className="flex-1 overflow-y-auto pr-1 space-y-3.5 custom-scrollbar">
        {history.map((entry, idx) => {
          const timestampStr = new Date(entry.timestamp).toLocaleTimeString();
          const isSuccess = entry.status === 'success';
          const isRecovered = entry.status === 'recovered';
          
          return (
            <div
              key={idx}
              className={`border rounded-lg p-3.5 space-y-2.5 transition-all duration-200 ${
                isSuccess
                  ? 'bg-zinc-950/60 border-zinc-850 hover:border-zinc-800'
                  : isRecovered
                  ? 'bg-amber-950/10 border-amber-900/40 hover:border-amber-900/60'
                  : 'bg-rose-950/10 border-rose-900/40 hover:border-rose-900/60'
              }`}
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`p-1.5 rounded-full shrink-0 ${
                      isSuccess
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                        : isRecovered
                        ? 'bg-amber-950 text-amber-400 border border-amber-900/30'
                        : 'bg-rose-950 text-rose-400 border border-rose-900/30'
                    }`}
                  >
                    {isSuccess && <Check className="w-3 h-3" />}
                    {isRecovered && <Sparkles className="w-3 h-3" />}
                    {!isSuccess && !isRecovered && <X className="w-3 h-3" />}
                  </span>
                  
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      {entry.action.action}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {timestampStr}
                    </span>
                  </div>
                </div>

                {/* Status Badges */}
                <div className="flex items-center gap-1.5 text-[10px] font-bold">
                  {entry.retryCount > 0 && (
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                      {entry.retryCount} Retries
                    </span>
                  )}
                  <span
                    className={`px-2 py-0.5 rounded uppercase tracking-wider ${
                      isSuccess
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/50'
                        : isRecovered
                        ? 'bg-amber-950/40 text-amber-400 border border-amber-900/50'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-900/50'
                    }`}
                  >
                    {entry.status}
                  </span>
                </div>
              </div>

              {/* Action target details */}
              {entry.action.selector && (
                <div className="text-[10px] text-zinc-400 font-mono bg-zinc-900/70 p-2 rounded border border-zinc-900 break-all select-all">
                  {entry.action.selector}
                  {entry.action.value && (
                    <div className="mt-1 pt-1 border-t border-zinc-850/60 font-sans text-zinc-300">
                      Value: <span className="font-semibold text-zinc-200">{entry.action.value}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Verification Message */}
              {entry.verificationResult && (
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/30 p-2 rounded border border-zinc-900">
                  <Clock className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">
                    Verification: <span className="font-semibold text-zinc-300">{entry.verificationResult.message}</span>
                  </span>
                </div>
              )}

              {/* Error messages if failed */}
              {entry.error && (
                <div className="flex items-start gap-1.5 text-[10px] text-rose-400 bg-rose-950/5 border border-rose-900/30 p-2 rounded">
                  <ShieldAlert className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{entry.error}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

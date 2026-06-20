import React from 'react';
import type { ExecutionReport as ReportType } from '../types/agent';
import { FileText, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

interface ExecutionReportProps {
  report: ReportType | null;
}

export const ExecutionReport: React.FC<ExecutionReportProps> = ({ report }) => {
  if (!report) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <FileText className="w-4 h-4 text-purple-400" />
        Execution Report Summary
      </h3>

      <div className="bg-zinc-950 border border-zinc-850 rounded-lg p-5 space-y-4">
        {/* Status banner */}
        <div className={`flex items-center gap-3 p-4 rounded-lg border ${
          report.success 
            ? 'bg-emerald-950/20 border-emerald-900/50 text-emerald-300' 
            : 'bg-rose-950/20 border-rose-900/50 text-rose-300'
        }`}>
          {report.success ? (
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
          )}
          <div>
            <h4 className="text-sm font-bold">
              {report.success ? 'Goal Succeeded' : 'Goal Failed'}
            </h4>
            <p className="text-xs opacity-80 leading-relaxed mt-0.5">
              The agent finished execution in {((report.duration || 0) / 1000).toFixed(2)} seconds.
            </p>
          </div>
        </div>

        {/* Goals & Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1">
            <span className="text-zinc-500 font-medium">Objective</span>
            <p className="text-zinc-200 font-semibold">{report.goal}</p>
          </div>
          <div className="space-y-1">
            <span className="text-zinc-500 font-medium">Target URL</span>
            <p className="text-zinc-200 font-semibold truncate select-all">{report.url}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 border-t border-zinc-850 pt-4 text-center">
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Steps Executed</span>
            <span className="text-base font-bold text-zinc-200">{report.actionsExecuted}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Self-Heals</span>
            <span className="text-base font-bold text-zinc-200">{report.recoveries.totalRecoveries}</span>
          </div>
          <div>
            <span className="block text-[10px] text-zinc-500 uppercase tracking-wider">Re-plans</span>
            <span className="text-base font-bold text-zinc-200">{report.recoveries.replansTriggered}</span>
          </div>
        </div>

        {/* Errors list */}
        {report.errors.length > 0 && (
          <div className="border-t border-zinc-850 pt-4 space-y-2">
            <span className="text-[10px] text-rose-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              Intercepted Failures & Errors
            </span>
            <div className="space-y-1.5">
              {report.errors.map((err, idx) => (
                <div key={idx} className="text-xs text-rose-300 bg-rose-950/10 border border-rose-900/30 p-2.5 rounded">
                  {err}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

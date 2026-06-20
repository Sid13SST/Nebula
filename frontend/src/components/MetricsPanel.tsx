import React from 'react';
import type { ExecutionReport } from '../types/agent';
import { Gauge, Clock, Cpu, Eye, Zap } from 'lucide-react';

interface MetricsPanelProps {
  report: ExecutionReport | null;
}

export const MetricsPanel: React.FC<MetricsPanelProps> = ({ report }) => {
  const metrics = [
    {
      label: 'Observation Time',
      value: report?.metrics.observationTimeMs ? `${(report.metrics.observationTimeMs / 1000).toFixed(2)}s` : '0.00s',
      icon: <Eye className="w-4 h-4 text-cyan-400" />,
      bg: 'bg-cyan-950/20 border-cyan-900/30',
    },
    {
      label: 'AI Planning Time',
      value: report?.metrics.planningTimeMs ? `${(report.metrics.planningTimeMs / 1000).toFixed(2)}s` : '0.00s',
      icon: <Cpu className="w-4 h-4 text-purple-400" />,
      bg: 'bg-purple-950/20 border-purple-900/30',
    },
    {
      label: 'Execution Duration',
      value: report?.metrics.executionTimeMs ? `${(report.metrics.executionTimeMs / 1000).toFixed(2)}s` : '0.00s',
      icon: <Clock className="w-4 h-4 text-emerald-400" />,
      bg: 'bg-emerald-950/20 border-emerald-900/30',
    },
    {
      label: 'Self-Heals Resolved',
      value: report?.metrics.recoveryCount !== undefined ? report.metrics.recoveryCount : 0,
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      bg: 'bg-amber-950/20 border-amber-900/30',
    },
  ];

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <Gauge className="w-4 h-4 text-cyan-400" />
        Agent Execution Metrics
      </h3>

      <div className="grid grid-cols-2 gap-4">
        {metrics.map((m, idx) => (
          <div
            key={idx}
            className={`border rounded-lg p-4 flex flex-col gap-1.5 transition duration-200 ${m.bg}`}
          >
            <div className="flex items-center gap-2 text-zinc-400">
              {m.icon}
              <span className="text-[10px] font-semibold uppercase tracking-wider">{m.label}</span>
            </div>
            <span className="text-xl font-bold text-zinc-100 font-mono tracking-tight">
              {m.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

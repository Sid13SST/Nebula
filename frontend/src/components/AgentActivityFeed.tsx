import React, { useEffect, useRef } from 'react';
import type { LogEntry } from '../types/agent';
import { Terminal } from 'lucide-react';

interface AgentActivityFeedProps {
  logs: LogEntry[];
}

export const AgentActivityFeed: React.FC<AgentActivityFeedProps> = ({ logs }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [logs]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4 flex flex-col h-[300px]">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <Terminal className="w-4 h-4 text-cyan-400" />
        Activity Feed / Streaming Logs
      </h3>

      <div
        ref={containerRef}
        className="flex-1 bg-zinc-950 border border-zinc-850 rounded-lg p-4 font-mono text-xs text-zinc-300 overflow-y-auto space-y-2 select-text custom-scrollbar"
      >
        {logs.length === 0 ? (
          <div className="text-zinc-600 italic">Listening for agent lifecycle events...</div>
        ) : (
          logs.map((log, idx) => {
            const timeStr = new Date(log.timestamp).toLocaleTimeString();
            const isError = log.message.toLowerCase().includes('failed') || log.message.toLowerCase().includes('error');
            const isWarning = log.message.toLowerCase().includes('warn') || log.message.toLowerCase().includes('retry');
            
            return (
              <div
                key={idx}
                className={`flex gap-2.5 items-start leading-relaxed ${
                  isError ? 'text-rose-400' : isWarning ? 'text-amber-400' : 'text-zinc-300'
                }`}
              >
                <span className="text-zinc-650 shrink-0 select-none">[{timeStr}]</span>
                <span className="break-all">{log.message}</span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

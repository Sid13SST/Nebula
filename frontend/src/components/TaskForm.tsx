import React, { useState } from 'react';
import { Play, Loader2, Globe, Target } from 'lucide-react';

interface TaskFormProps {
  onRun: (url: string, goal: string) => void;
  isRunning: boolean;
}

export const TaskForm: React.FC<TaskFormProps> = ({ onRun, isRunning }) => {
  const [url, setUrl] = useState('https://ui.shadcn.com/docs/forms/react-hook-form');
  const [goal, setGoal] = useState('Input text into the Bug Title field');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim() && goal.trim()) {
      onRun(url.trim(), goal.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <div className="flex flex-col md:flex-row gap-4">
        {/* URL Input */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            Target URL
          </label>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={isRunning}
            placeholder="e.g., https://example.com"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition duration-250 disabled:opacity-50"
          />
        </div>

        {/* Goal Input */}
        <div className="flex-1 space-y-2">
          <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-purple-400" />
            Agent Objective / Goal
          </label>
          <input
            type="text"
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            disabled={isRunning}
            placeholder="e.g., Click 'Sign In' or Fill Form details"
            className="w-full bg-zinc-950 border border-zinc-800 focus:border-zinc-700 focus:ring-1 focus:ring-zinc-700 rounded-lg px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none transition duration-250 disabled:opacity-50"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={isRunning || !url || !goal}
        className="w-full bg-zinc-100 hover:bg-white text-zinc-950 disabled:bg-zinc-800 disabled:text-zinc-600 font-semibold text-sm rounded-lg py-3 flex items-center justify-center gap-2 transition duration-200"
      >
        {isRunning ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Orchestrating agent...
          </>
        ) : (
          <>
            <Play className="w-4 h-4 fill-current" />
            Execute Nebula Agent
          </>
        )}
      </button>
    </form>
  );
};

import React, { useState } from 'react';
import { Camera, Eye, Maximize2, X } from 'lucide-react';
import { api } from '../services/api';

interface ScreenshotViewerProps {
  screenshots: {
    before?: string;
    after?: string;
    failure?: string;
  };
}

export const ScreenshotViewer: React.FC<ScreenshotViewerProps> = ({ screenshots }) => {
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const getUrl = (path?: string) => {
    if (!path) return '';
    return api.getScreenshotUrl(path);
  };

  const hasScreenshots = screenshots.before || screenshots.after || screenshots.failure;

  if (!hasScreenshots) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl h-[300px] flex flex-col items-center justify-center text-zinc-500">
        <Camera className="w-8 h-8 mb-2 opacity-50" />
        <span className="text-sm">No screenshot snapshots captured yet</span>
      </div>
    );
  }

  const panels = [
    { label: 'Initial State (Before)', path: screenshots.before, style: 'border-zinc-800' },
    { label: 'Final State (After)', path: screenshots.after, style: 'border-emerald-900/40' },
    { label: 'Failure Snapshot', path: screenshots.failure, style: 'border-rose-900/40 text-rose-400' },
  ].filter(p => p.path);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-xl space-y-4">
      <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
        <Camera className="w-4 h-4 text-pink-400" />
        Captured Screenshots
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {panels.map((panel, idx) => (
          <div
            key={idx}
            className={`bg-zinc-950 border rounded-lg overflow-hidden flex flex-col ${panel.style} group transition duration-300 hover:border-zinc-700`}
          >
            <div className="px-3 py-2 border-b border-zinc-900 bg-zinc-950/40 flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                {panel.label}
              </span>
              <button
                onClick={() => setFullscreenImage(getUrl(panel.path))}
                className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-905 rounded transition duration-200"
              >
                <Maximize2 className="w-3.5 h-3.5 text-zinc-400 hover:text-white" />
              </button>
            </div>
            
            <div className="relative overflow-hidden h-[180px] bg-zinc-905 flex items-center justify-center">
              <img
                src={getUrl(panel.path)}
                alt={panel.label}
                className="w-full h-full object-contain transition duration-500 group-hover:scale-102 cursor-pointer"
                onClick={() => setFullscreenImage(getUrl(panel.path))}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center pointer-events-none">
                <Eye className="w-6 h-6 text-white animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Lightbox Modal */}
      {fullscreenImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="absolute top-4 right-4">
            <button
              onClick={() => setFullscreenImage(null)}
              className="p-2 hover:bg-zinc-900 rounded-full transition text-zinc-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="max-w-5xl max-h-[90vh] w-full flex items-center justify-center">
            <img
              src={fullscreenImage}
              alt="Fullscreen Preview"
              className="max-w-full max-h-[85vh] object-contain rounded border border-zinc-800 shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

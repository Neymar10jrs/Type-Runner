import React from 'react';
import { Play, RotateCcw, Home } from 'lucide-react';

interface PauseModalProps {
  onResume: () => void;
  onRestart: () => void;
  onReturnHome: () => void;
}

export const PauseModal: React.FC<PauseModalProps> = ({
  onResume,
  onRestart,
  onReturnHome
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-center">
        <h2 className="text-2xl font-black text-white font-heading mb-2">RUN PAUSED</h2>
        <p className="text-xs text-slate-400 font-mono mb-6">
          Take a breath. The pursuer is suspended in place.
        </p>

        <div className="space-y-3">
          <button
            onClick={onResume}
            className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/25 transition"
          >
            <Play className="w-4 h-4 fill-current" /> RESUME RUN (ESC)
          </button>

          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <RotateCcw className="w-4 h-4" /> RESTART RUN
          </button>

          <button
            onClick={onReturnHome}
            className="w-full py-3 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 border border-slate-800 transition"
          >
            <Home className="w-4 h-4" /> MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
};

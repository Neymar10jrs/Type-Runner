import React from 'react';
import type { ChallengeDef } from '../types/game';
import { CHALLENGES_LIST } from '../engine/storage';
import { CHASERS } from '../engine/chasers';
import {
  X,
  Award,
  Play,
  Zap,
  Target,
  Sparkles,
  ShieldAlert,
  Compass
} from 'lucide-react';

interface ChallengesModalProps {
  onStartChallenge: (challenge: ChallengeDef) => void;
  onClose: () => void;
}

export const ChallengesModal: React.FC<ChallengesModalProps> = ({
  onStartChallenge,
  onClose
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/20 border border-amber-500/40 rounded-2xl text-amber-400">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-heading">
                CHALLENGE GAUNTLETS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Rigorous operational objectives with high-value coin & XP rewards
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Challenge list */}
        <div className="space-y-4">
          {CHALLENGES_LIST.map(challenge => {
            const chaser = CHASERS[challenge.chaserId] || CHASERS.dragon;

            return (
              <div
                key={challenge.id}
                className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="text-base font-bold text-slate-100">{challenge.title}</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-800 text-cyan-400 border border-slate-700">
                      Pursuer: {chaser.name}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-3">
                    {challenge.description}
                  </p>

                  {/* Conditions & Criteria */}
                  <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-slate-300">
                    <span className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5 text-amber-400" /> Min {challenge.targetWpm} WPM
                    </span>
                    <span className="flex items-center gap-1">
                      <Target className="w-3.5 h-3.5 text-emerald-400" /> Min {challenge.targetAccuracy}% Acc
                    </span>
                    {challenge.zeroMistakesAllowed && (
                      <span className="flex items-center gap-1 text-red-400 font-bold">
                        <ShieldAlert className="w-3.5 h-3.5" /> 0 Errors Permitted
                      </span>
                    )}
                    {challenge.targetDistanceMeters && (
                      <span className="flex items-center gap-1">
                        <Compass className="w-3.5 h-3.5 text-cyan-400" /> {challenge.targetDistanceMeters}m
                      </span>
                    )}
                  </div>
                </div>

                {/* Rewards & Launch Button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg font-mono">
                      <Sparkles className="w-3 h-3 text-amber-400" /> +{challenge.rewardCoins}
                    </div>
                    <div className="flex items-center gap-1 text-xs font-bold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 px-2 py-1 rounded-lg font-mono">
                      <Award className="w-3 h-3 text-cyan-400" /> +{challenge.rewardXp}
                    </div>
                  </div>

                  <button
                    onClick={() => onStartChallenge(challenge)}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition transform hover:-translate-y-0.5"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" /> Launch Trial
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

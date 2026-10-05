import React, { useEffect } from 'react';
import type { RunRecord, ChaserConfig } from '../types/game';
import confetti from 'canvas-confetti';
import {
  RotateCcw,
  Home,
  BookOpen,
  Trophy,
  Zap,
  Target,
  Flame,
  Clock,
  Compass,
  Sparkles,
  AlertTriangle,
  Award
} from 'lucide-react';

interface GameOverModalProps {
  record: RunRecord;
  chaser: ChaserConfig;
  isNewBest: boolean;
  onPlayAgain: () => void;
  onPracticeSpeed: () => void;
  onReturnHome: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  record,
  chaser,
  isNewBest,
  onPlayAgain,
  onPracticeSpeed,
  onReturnHome
}) => {
  useEffect(() => {
    if (isNewBest || record.won) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isNewBest, record.won]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getModalTitle = () => {
    if (record.mode === 'time_attack') {
      return '90s SPRINT COMPLETE!';
    }
    if (record.mode === 'practice') {
      return 'PRACTICE SESSION FINISHED';
    }
    if (record.mode === 'creature_hunt') {
      return record.won ? `${chaser.name.toUpperCase()} OUTRUN!` : `OVERTAKEN BY ${chaser.name.toUpperCase()}`;
    }
    if (record.mode === 'disaster_run') {
      return record.won ? 'CATACLYSM EVACUATED!' : `OVERWHELMED BY ${chaser.name.toUpperCase()}`;
    }
    if (record.mode === 'challenge') {
      return record.won ? 'CHALLENGE ACCOMPLISHED!' : 'TRIAL OBJECTIVE FAILED';
    }
    return record.won ? 'RUN COMPLETE — ESCAPED!' : 'OVERTAKEN BY PURSUER';
  };

  const getModalSubtitle = () => {
    if (record.mode === 'time_attack') {
      return `You sprinted ${Math.round(record.distanceMeters)} meters in 90 seconds with an average speed of ${record.wpm} WPM!`;
    }
    if (record.mode === 'practice') {
      return `Great practice session! Logged ${Math.round(record.distanceMeters)} meters with ${Math.round(record.accuracy)}% accuracy.`;
    }
    if (record.mode === 'creature_hunt') {
      return record.won
        ? `You successfully outpaced ${chaser.name} across ${Math.round(record.distanceMeters)} meters!`
        : `${chaser.name} closed the distance at ${Math.round(record.distanceMeters)} meters.`;
    }
    if (record.mode === 'disaster_run') {
      return record.won
        ? `You reached the emergency perimeter bunker at ${Math.round(record.distanceMeters)}m, escaping ${chaser.name}!`
        : `${chaser.name} engulfed the route at ${Math.round(record.distanceMeters)} meters.`;
    }
    if (record.mode === 'challenge') {
      return record.won
        ? `Objective fulfilled! Bounties claimed: +${record.coinsEarned} Coins, +${record.xpEarned} XP.`
        : 'Objective criteria were not fully satisfied. Regroup and try again!';
    }
    return record.won
      ? `You successfully broke away from ${chaser.name} at ${Math.round(record.distanceMeters)} meters!`
      : `${chaser.name} closed the distance at ${Math.round(record.distanceMeters)} meters.`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] max-h-[90dvh] overflow-y-auto">
        {/* Background glow header */}
        <div
          className={`absolute top-0 left-0 right-0 h-3 ${
            record.won
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500'
              : 'bg-gradient-to-r from-red-500 via-rose-600 to-orange-500'
          }`}
        />

        {/* STATUS TITLE & PERSONAL BEST BADGE */}
        <div className="text-center mb-6">
          {isNewBest && (
            <div className="inline-flex items-center gap-1.5 px-4 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2 animate-bounce">
              <Trophy className="w-4 h-4 text-amber-400" /> New Personal Best!
            </div>
          )}

          <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white font-heading">
            {getModalTitle()}
          </h2>
          <p className="text-slate-400 text-sm mt-1">
            <span className={record.won ? 'text-emerald-400 font-semibold' : 'text-slate-300'}>
              {getModalSubtitle()}
            </span>
          </p>
        </div>

        {/* STATS MATRIX */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {/* WPM */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Velocity
            </div>
            <div className="text-2xl font-black font-mono text-amber-300">
              {Math.round(record.wpm)}
            </div>
            <div className="text-[10px] text-slate-400">Peak: {Math.round(record.maxWpm)} WPM</div>
          </div>

          {/* Accuracy */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-400" /> Accuracy
            </div>
            <div className="text-2xl font-black font-mono text-emerald-300">
              {Math.round(record.accuracy)}%
            </div>
            <div className="text-[10px] text-slate-400">Precision rate</div>
          </div>

          {/* Max Streak */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Max Streak
            </div>
            <div className="text-2xl font-black font-mono text-orange-300">
              {record.maxCombo}
            </div>
            <div className="text-[10px] text-slate-400">Characters</div>
          </div>

          {/* Distance */}
          <div className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-center">
            <div className="flex items-center justify-center gap-1 text-[11px] uppercase tracking-wider text-slate-400 font-bold mb-1">
              <Compass className="w-3.5 h-3.5 text-cyan-400" /> Distance
            </div>
            <div className="text-2xl font-black font-mono text-cyan-300">
              {Math.round(record.distanceMeters)}m
            </div>
            <div className="text-[10px] text-slate-400">{formatTime(record.survivalSeconds)} time</div>
          </div>
        </div>

        {/* SCORE & REWARDS ROW */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between mb-6">
          <div>
            <div className="text-xs uppercase font-bold text-slate-400">Final Score</div>
            <div className="text-3xl font-black font-mono text-purple-300">
              {record.score.toLocaleString()}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300">+{record.coinsEarned}</span>
              <span className="text-[10px] uppercase text-slate-400 font-bold">Coins</span>
            </div>

            <div className="flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 px-3 py-1.5 rounded-xl">
              <Award className="w-4 h-4 text-cyan-400" />
              <span className="font-mono font-bold text-cyan-300">+{record.xpEarned}</span>
              <span className="text-[10px] uppercase text-slate-400 font-bold">XP</span>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={onPlayAgain}
            className="w-full sm:flex-1 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-base flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/30 transition transform hover:-translate-y-0.5"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>

          <button
            onClick={onPracticeSpeed}
            className="w-full sm:flex-1 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-base flex items-center justify-center gap-2 border border-slate-700 transition"
          >
            <BookOpen className="w-4 h-4 text-cyan-400" /> PRACTICE THIS SPEED
          </button>

          <button
            onClick={onReturnHome}
            className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-white font-semibold text-sm flex items-center justify-center gap-1.5 border border-slate-800 transition"
          >
            <Home className="w-4 h-4" /> MENU
          </button>
        </div>
      </div>
    </div>
  );
};

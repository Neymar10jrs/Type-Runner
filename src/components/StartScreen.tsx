import React, { useState } from 'react';
import type { GameMode, PlayerProfile, GameSettings } from '../types/game';
import { CHASERS } from '../engine/chasers';
import {
  Play,
  Crosshair,
  Clock,
  Shield,
  Zap,
  BookOpen,
  Shirt,
  BarChart3,
  Settings as SettingsIcon,
  Flame,
  Award,
  ChevronRight,
  Sparkles
} from 'lucide-react';

interface StartScreenProps {
  profile: PlayerProfile;
  settings: GameSettings;
  onStartGame: (mode: GameMode, selectedChaserId?: string) => void;
  onOpenLocker: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  settings,
  onStartGame,
  onOpenLocker,
  onOpenStats,
  onOpenSettings,
  onOpenChallenges
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('endless');
  const [selectedChaserId, setSelectedChaserId] = useState<string>('dragon');

  const chaserList = Object.values(CHASERS);
  const currentChaser = CHASERS[selectedChaserId as keyof typeof CHASERS] || chaserList[0];

  const modes: { id: GameMode; title: string; subtitle: string; icon: React.ReactNode; tag: string }[] = [
    {
      id: 'endless',
      title: 'Endless Run',
      subtitle: 'Infinite adaptive chase with randomized encounters.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      tag: 'Flagship'
    },
    {
      id: 'creature_hunt',
      title: 'Creature Hunt',
      subtitle: 'Outrun legendary mythical beasts and alpha predators.',
      icon: <Crosshair className="w-5 h-5 text-purple-400" />,
      tag: 'Boss Chase'
    },
    {
      id: 'disaster_run',
      title: 'Disaster Run',
      subtitle: 'Flee catastrophic tornadoes, tsunamis, and volcanoes.',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      tag: 'Cataclysm'
    },
    {
      id: 'time_attack',
      title: 'Time Attack',
      subtitle: '90-second sprint to achieve maximum distance.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      tag: 'Speed Run'
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      subtitle: 'Serene track with zero chaser pressure. Pure typing flow.',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      tag: 'Training'
    }
  ];

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-6 sm:p-10 select-none overflow-y-auto">
      {/* HEADER BAR: PROFILE & COINS */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center font-bold text-xl shadow-lg shadow-cyan-500/30">
            {profile.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-100">{profile.username}</span>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                {profile.equippedTitle}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Level {profile.level} • {profile.xp} XP
            </div>
          </div>
        </div>

        {/* Currency & Quick Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-4 py-2 rounded-xl shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-lg">{profile.coins}</span>
            <span className="text-xs uppercase text-slate-400 font-bold">Coins</span>
          </div>

          <button
            onClick={onOpenLocker}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl transition text-sm font-semibold text-slate-200"
            title="Character Skins & Trails"
          >
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Locker</span>
          </button>

          <button
            onClick={onOpenStats}
            className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3.5 py-2.5 rounded-xl transition text-sm font-semibold text-slate-200"
            title="Statistics & Charts"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition text-slate-300 hover:text-white"
            title="Settings & Accessibility"
          >
            <SettingsIcon className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* HERO SECTION */}
      <main className="w-full max-w-6xl mx-auto my-8">
        <div className="text-center sm:text-left mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-3">
            <Zap className="w-3.5 h-3.5" /> Next-Gen Adaptive Typing Engine
          </div>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-xl font-heading">
            TYPING RUNNER
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-xl mt-2 font-medium">
            Type fast. Run faster. Survive. Your typing rhythm directly controls your stride, acceleration, and distance from the encroaching apocalypse.
          </p>
        </div>

        {/* MODE SELECTION GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {modes.map(mode => {
            const isSelected = selectedMode === mode.id;
            return (
              <div
                key={mode.id}
                onClick={() => setSelectedMode(mode.id)}
                className={`cursor-pointer p-5 rounded-2xl border transition-all duration-200 relative overflow-hidden backdrop-blur-xl ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-500 shadow-xl shadow-cyan-500/10 -translate-y-1'
                    : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2.5 rounded-xl bg-slate-800/70">{mode.icon}</div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                    {mode.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">{mode.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{mode.subtitle}</p>
              </div>
            );
          })}

          {/* CHALLENGES SPECIAL CARD */}
          <div
            onClick={onOpenChallenges}
            className="cursor-pointer p-5 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950/80 hover:border-amber-400 transition-all duration-200 relative overflow-hidden backdrop-blur-xl flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Special
                </span>
              </div>
              <h3 className="text-lg font-bold text-amber-200 mb-1">Challenge Gauntlets</h3>
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Curated objective trials with coin & XP bounties.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 mt-4">
              Explore Missions <ChevronRight className="w-4 h-4 ml-1" />
            </div>
          </div>
        </div>

        {/* CHASER SELECTOR (When in Creature Hunt or Disaster Run) */}
        {(selectedMode === 'creature_hunt' || selectedMode === 'disaster_run') && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 mb-8">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                Select Your Pursuer:
              </h4>
              <span className="text-xs text-cyan-400 font-mono">
                {currentChaser.category.toUpperCase()} • BASE SPEED {currentChaser.baseSpeed} m/s
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2.5">
              {chaserList
                .filter(c =>
                  selectedMode === 'creature_hunt'
                    ? c.category === 'creature'
                    : c.category === 'disaster'
                )
                .map(c => {
                  const isCur = c.id === selectedChaserId;
                  return (
                    <button
                      key={c.id}
                      onClick={() => setSelectedChaserId(c.id)}
                      className={`p-3 rounded-xl border text-left transition ${
                        isCur
                          ? 'bg-cyan-950/80 border-cyan-400 text-white shadow-md shadow-cyan-500/20'
                          : 'bg-slate-950/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="font-bold text-xs truncate">{c.name}</div>
                      <div className="text-[10px] text-slate-500 truncate">{c.title}</div>
                    </button>
                  );
                })}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
              <div>
                <strong className="text-slate-200">{currentChaser.name}:</strong>{' '}
                {currentChaser.threatDescription}
              </div>
              <div className="italic text-slate-400">"{currentChaser.roarText}"</div>
            </div>
          </div>
        )}

        {/* START RUN BUTTON */}
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onStartGame(selectedMode, selectedChaserId)}
            className="w-full sm:w-auto px-10 py-5 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-xl tracking-wider flex items-center justify-center gap-3 shadow-2xl shadow-cyan-500/40 hover:shadow-cyan-500/60 transition-all duration-300 transform hover:-translate-y-0.5"
          >
            <Play className="w-6 h-6 fill-current" /> START RUN
          </button>

          <div className="text-xs text-slate-400 font-mono text-center sm:text-left">
            Keyboard focus enabled • Press keys smoothly to build combo momentum
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-900 pt-4">
        <span>TYPING RUNNER v1.0 • Survival Practice</span>
        <span>Best WPM: <strong className="text-amber-400">{profile.bestWpm}</strong> • High Score: <strong className="text-purple-400">{profile.bestScore.toLocaleString()}</strong></span>
      </footer>
    </div>
  );
};

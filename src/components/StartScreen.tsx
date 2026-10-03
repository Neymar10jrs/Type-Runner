import React, { useState, useEffect } from 'react';
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
  Sparkles,
  Compass
} from 'lucide-react';

interface StartScreenProps {
  profile: PlayerProfile;
  settings: GameSettings;
  initialSentence: string;
  onStartGame: (mode: GameMode, selectedChaserId?: string) => void;
  onOpenLocker: () => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
  onOpenChallenges: () => void;
}

export const StartScreen: React.FC<StartScreenProps> = ({
  profile,
  settings,
  initialSentence,
  onStartGame,
  onOpenLocker,
  onOpenStats,
  onOpenSettings,
  onOpenChallenges
}) => {
  const [selectedMode, setSelectedMode] = useState<GameMode>('endless');
  const [selectedChaserId, setSelectedChaserId] = useState<string>('dragon');

  // Allow pressing Enter on the start screen to immediately launch into the chosen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        onStartGame(selectedMode, selectedChaserId);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedMode, selectedChaserId, onStartGame]);

  const chaserList = Object.values(CHASERS);
  const currentChaser = CHASERS[selectedChaserId as keyof typeof CHASERS] || chaserList[0];

  const modes: { id: GameMode; title: string; subtitle: string; icon: React.ReactNode; tag: string }[] = [
    {
      id: 'endless',
      title: 'Endless Run',
      subtitle: 'Infinite adaptive chase with randomized encounters and escalating speed.',
      icon: <Flame className="w-5 h-5 text-amber-400" />,
      tag: 'Flagship'
    },
    {
      id: 'creature_hunt',
      title: 'Creature Hunt',
      subtitle: 'Select and outrun legendary mythical beasts and alpha predators.',
      icon: <Crosshair className="w-5 h-5 text-purple-400" />,
      tag: 'Boss Chase'
    },
    {
      id: 'disaster_run',
      title: 'Disaster Run',
      subtitle: 'Flee catastrophic tornadoes, mega-tsunamis, and volcanic surges.',
      icon: <Shield className="w-5 h-5 text-blue-400" />,
      tag: 'Cataclysm'
    },
    {
      id: 'time_attack',
      title: 'Time Attack',
      subtitle: '90-second intense sprint to achieve maximum distance & high score.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
      tag: 'Speed Run'
    },
    {
      id: 'practice',
      title: 'Practice Mode',
      subtitle: 'Serene track with zero chaser pressure. Pure typing flow training.',
      icon: <BookOpen className="w-5 h-5 text-cyan-400" />,
      tag: 'Training'
    }
  ];

  // Dynamic button label based on mode
  const getStartButtonLabel = () => {
    switch (selectedMode) {
      case 'endless':
        return 'START ENDLESS RUN';
      case 'creature_hunt':
        return `ESCAPE ${currentChaser.name.toUpperCase()}`;
      case 'disaster_run':
        return `OUTRUN ${currentChaser.name.toUpperCase()}`;
      case 'time_attack':
        return 'START 90s TIME ATTACK';
      case 'practice':
        return 'ENTER PRACTICE MODE (ZEN)';
      default:
        return 'START RUN';
    }
  };

  return (
    <div className="relative z-10 w-full min-h-screen flex flex-col justify-between p-4 sm:p-8 select-none overflow-y-auto bg-black/45 backdrop-blur-[2px]">
      {/* HEADER BAR: PROFILE & TOOLS */}
      <header className="flex items-center justify-between w-full max-w-6xl mx-auto">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-400 flex items-center justify-center font-bold text-lg shadow-lg shadow-cyan-500/30">
            {profile.level}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base sm:text-lg text-slate-100">{profile.username}</span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-cyan-400 bg-cyan-950/80 border border-cyan-800/80 px-2 py-0.5 rounded-full">
                {profile.equippedTitle}
              </span>
            </div>
            <div className="text-xs text-slate-400 font-mono">
              Level {profile.level} • {profile.xp} XP
            </div>
          </div>
        </div>

        {/* Currency & Quick Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 px-3.5 py-1.5 rounded-xl shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="font-mono font-bold text-amber-300 text-base">{profile.coins}</span>
            <span className="text-[10px] uppercase text-slate-400 font-bold">Coins</span>
          </div>

          <button
            onClick={onOpenLocker}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition text-xs font-semibold text-slate-200"
            title="Character Skins & Trails"
          >
            <Shirt className="w-4 h-4 text-cyan-400" />
            <span className="hidden sm:inline">Locker</span>
          </button>

          <button
            onClick={onOpenStats}
            className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 px-3 py-2 rounded-xl transition text-xs font-semibold text-slate-200"
            title="Statistics & Charts"
          >
            <BarChart3 className="w-4 h-4 text-emerald-400" />
            <span className="hidden sm:inline">Analytics</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-2 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition text-slate-300 hover:text-white"
            title="Settings & Accessibility"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* HERO & MODE SELECTION */}
      <main className="w-full max-w-6xl mx-auto my-4 sm:my-6">
        <div className="text-center sm:text-left mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/80 text-cyan-300 text-xs font-mono uppercase tracking-widest mb-2">
            <Zap className="w-3.5 h-3.5" /> Select Game Mode To Begin
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400 drop-shadow-xl font-heading">
            TYPING RUNNER
          </h1>
          <p className="text-slate-300 text-sm sm:text-base max-w-xl mt-1 font-medium drop-shadow-md">
            Choose your game mode below. After selection, the game starts immediately according to that mode!
          </p>
        </div>

        {/* MODE SELECTION GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
          {modes.map(m => {
            const isSelected = selectedMode === m.id;
            return (
              <div
                key={m.id}
                onClick={() => setSelectedMode(m.id)}
                className={`cursor-pointer p-4 rounded-2xl border transition-all duration-200 relative overflow-hidden backdrop-blur-md ${
                  isSelected
                    ? 'bg-slate-900/90 border-cyan-400 shadow-xl shadow-cyan-500/20 scale-[1.02]'
                    : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="p-2 rounded-xl bg-slate-800/70">{m.icon}</div>
                  <span
                    className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                      isSelected ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {m.tag}
                  </span>
                </div>
                <h3 className="text-base font-bold text-slate-100 mb-0.5">{m.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{m.subtitle}</p>
              </div>
            );
          })}

          {/* CHALLENGES SPECIAL CARD */}
          <div
            onClick={onOpenChallenges}
            className="cursor-pointer p-4 rounded-2xl border border-amber-500/40 bg-gradient-to-br from-amber-950/30 to-slate-950/80 hover:border-amber-400 transition-all duration-200 relative overflow-hidden backdrop-blur-md flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
                  <Award className="w-5 h-5" />
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Trials
                </span>
              </div>
              <h3 className="text-base font-bold text-amber-200 mb-0.5">Challenge Gauntlets</h3>
              <p className="text-xs text-amber-300/70 leading-relaxed">
                Curated objective trials with coin & XP bounties.
              </p>
            </div>
            <div className="flex items-center text-xs font-bold text-amber-400 mt-2">
              Launch Missions <Play className="w-3.5 h-3.5 ml-1 fill-current" />
            </div>
          </div>
        </div>

        {/* CHASER SELECTOR (When in Creature Hunt or Disaster Run) */}
        {(selectedMode === 'creature_hunt' || selectedMode === 'disaster_run') && (
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 mb-5">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Choose Specific Pursuer:
              </h4>
              <span className="text-xs text-cyan-400 font-mono">
                {currentChaser.category.toUpperCase()} • BASE SPEED {currentChaser.baseSpeed} m/s
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-2">
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
                      className={`p-2.5 rounded-xl border text-left transition ${
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

            <div className="mt-3 pt-2 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-slate-400">
              <div>
                <strong className="text-slate-200">{currentChaser.name}:</strong>{' '}
                {currentChaser.threatDescription}
              </div>
              <div className="italic text-slate-400 text-[11px]">"{currentChaser.roarText}"</div>
            </div>
          </div>
        )}

        {/* FRONTPAGE SENTENCE DISPLAY (SEE-THROUGH GLASS BOX) */}
        <div className="mb-5 bg-black/25 backdrop-blur-[1px] border border-cyan-400/40 rounded-3xl p-4 sm:p-5 shadow-[0_4px_30px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between text-xs font-mono text-slate-300 mb-2 pb-1.5 border-b border-cyan-500/20">
            <span className="flex items-center gap-1.5 text-cyan-300 font-semibold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              <Compass className="w-4 h-4 animate-spin" />
              OPENING SENTENCE • SELECTED MODE: <strong className="text-white uppercase">{selectedMode.replace('_', ' ')}</strong>
            </span>
            <span className="text-[11px] text-slate-400">Watch runner in background</span>
          </div>

          <div className="font-mono text-xl sm:text-2xl tracking-wide leading-relaxed text-white font-medium drop-shadow-[0_2px_4px_rgba(0,0,0,0.95)]">
            <span className="border-b-4 border-cyan-400 bg-cyan-950/60 px-1 rounded animate-pulse shadow-[0_0_12px_rgba(56,189,248,0.9)]">
              {initialSentence.slice(0, 1)}
            </span>
            <span className="text-slate-200">{initialSentence.slice(1)}</span>
          </div>
        </div>

        {/* START BUTTON TRIGGER */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => onStartGame(selectedMode, selectedChaserId)}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-black text-lg tracking-wider flex items-center justify-center gap-2.5 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 transition-all duration-200 transform hover:-translate-y-0.5"
          >
            <Play className="w-5 h-5 fill-current" /> {getStartButtonLabel()}
          </button>

          <div className="text-xs text-slate-300 font-mono text-center sm:text-left drop-shadow-md">
            Click to start in <strong className="text-cyan-400">{selectedMode.replace('_', ' ').toUpperCase()}</strong> • Typing controls your runner's speed
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="w-full max-w-6xl mx-auto flex items-center justify-between text-xs text-slate-400 font-mono border-t border-slate-900 pt-3">
        <span>TYPING RUNNER v1.0 • Adaptive Survival</span>
        <span>
          Best WPM: <strong className="text-amber-400">{profile.bestWpm}</strong> • High Score:{' '}
          <strong className="text-purple-400">{profile.bestScore.toLocaleString()}</strong>
        </span>
      </footer>
    </div>
  );
};

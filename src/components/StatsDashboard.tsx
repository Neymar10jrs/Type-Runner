import React, { useState, useEffect } from 'react';
import type { PlayerProfile, GameMode } from '../types/game';
import { CHASERS } from '../engine/chasers';
import { ApiClient } from '../engine/apiClient';
import {
  X,
  TrendingUp,
  Award,
  Zap,
  Target,
  Compass,
  Clock,
  Flame,
  Shield,
  BarChart2,
  Crosshair,
  BookOpen
} from 'lucide-react';

interface StatsDashboardProps {
  profile: PlayerProfile;
  onClose: () => void;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ profile, onClose }) => {
  const [analyticsData, setAnalyticsData] = useState<any>(null);

  useEffect(() => {
    ApiClient.getAnalytics().then(data => {
      if (data && data.success) {
        setAnalyticsData(data);
      }
    }).catch(console.error);
  }, []);

  // Extract recent runs for the chart (up to 15)
  const recentRuns = [...profile.recentRuns].reverse().slice(-15);

  // Helper to render SVG line graph for WPM
  const renderWpmChart = () => {
    if (recentRuns.length < 2) {
      return (
        <div className="h-44 flex items-center justify-center text-slate-500 text-xs italic font-mono">
          Complete at least 2 runs to render velocity progression curve.
        </div>
      );
    }

    const maxWpm = Math.max(60, ...recentRuns.map(r => r.wpm));
    const width = 500;
    const height = 150;
    const padding = 25;

    const points = recentRuns.map((r, i) => {
      const x = padding + (i / (recentRuns.length - 1)) * (width - padding * 2);
      const y = height - padding - (r.wpm / maxWpm) * (height - padding * 2);
      return { x, y, wpm: r.wpm };
    });

    const pathD = points.reduce((acc, p, i) => {
      return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
    }, '');

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 overflow-visible">
        {/* Horizontal grid lines */}
        <line x1={padding} y1={padding} x2={width - padding} y2={padding} stroke="#334155" strokeDasharray="3 3" />
        <line x1={padding} y1={height / 2} x2={width - padding} y2={height / 2} stroke="#334155" strokeDasharray="3 3" />
        <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="#475569" />

        {/* Line curve */}
        <path d={pathD} fill="none" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />

        {/* Data points */}
        {points.map((p, idx) => (
          <g key={idx}>
            <circle cx={p.x} cy={p.y} r="4" fill="#0284c7" stroke="#38bdf8" strokeWidth="2" />
            <text x={p.x} y={p.y - 8} fill="#94a3b8" fontSize="10" textAnchor="middle" fontFamily="monospace">
              {Math.round(p.wpm)}
            </text>
          </g>
        ))}
      </svg>
    );
  };

  const formatHours = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const h = (mins / 60).toFixed(1);
    return `${h}h`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-2xl text-cyan-400">
              <TrendingUp className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-heading">
                PILOT TELEMETRY & ANALYTICS
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Longitudinal typing performance and chaser survival telemetry
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

        {/* LIFETIME METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 mb-1">
              <Zap className="w-4 h-4 text-amber-400" /> Peak Velocity
            </div>
            <div className="text-3xl font-black font-mono text-amber-300">
              {profile.bestWpm} <span className="text-xs text-slate-500">WPM</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 mb-1">
              <Target className="w-4 h-4 text-emerald-400" /> Best Accuracy
            </div>
            <div className="text-3xl font-black font-mono text-emerald-300">
              {Math.round(profile.bestAccuracy)}<span className="text-xs text-slate-500">%</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 mb-1">
              <Flame className="w-4 h-4 text-orange-400" /> Highest Streak
            </div>
            <div className="text-3xl font-black font-mono text-orange-300">
              {profile.bestStreak} <span className="text-xs text-slate-500">chars</span>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
            <div className="flex items-center gap-2 text-xs uppercase font-bold text-slate-400 mb-1">
              <Compass className="w-4 h-4 text-cyan-400" /> Total Distance
            </div>
            <div className="text-3xl font-black font-mono text-cyan-300">
              {(profile.totalDistanceMeters / 1000).toFixed(1)} <span className="text-xs text-slate-500">km</span>
            </div>
          </div>
        </div>

        {/* WPM PROGRESSION CHART */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" /> WPM Velocity Progression
            </h3>
            <span className="text-xs font-mono text-slate-400">Last 15 Sessions</span>
          </div>
          {renderWpmChart()}
        </div>

        {/* PER-MODE MISSIONS TELEMETRY */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-400" /> Mode Mission Telemetry
            </h3>
            <span className="text-xs font-mono text-emerald-400 font-semibold">Backend Synced</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {[
              { id: 'endless', label: 'Endless Run', icon: <Flame className="w-4 h-4 text-amber-400" /> },
              { id: 'time_attack', label: 'Time Attack', icon: <Clock className="w-4 h-4 text-emerald-400" /> },
              { id: 'creature_hunt', label: 'Creature Hunt', icon: <Crosshair className="w-4 h-4 text-purple-400" /> },
              { id: 'disaster_run', label: 'Disaster Run', icon: <Shield className="w-4 h-4 text-blue-400" /> },
              { id: 'practice', label: 'Practice Mode', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
              { id: 'challenge', label: 'Challenge Gauntlets', icon: <Award className="w-4 h-4 text-amber-400" /> }
            ].map(m => {
              const modeStats = analyticsData?.perMode?.[m.id] || {
                runsCount: profile.recentRuns.filter(r => r.mode === m.id).length,
                avgWpm: 0,
                maxWpm: 0,
                avgAccuracy: 0,
                totalDistance: 0,
                escapesCount: profile.recentRuns.filter(r => r.mode === m.id && r.won).length
              };

              return (
                <div key={m.id} className="p-3.5 rounded-xl border border-slate-800/80 bg-slate-900/80">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-xs text-slate-200 flex items-center gap-1.5">
                      {m.icon} {m.label}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                      {modeStats.runsCount} {modeStats.runsCount === 1 ? 'run' : 'runs'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-400 mt-2">
                    <div>Avg: <strong className="text-amber-300">{modeStats.avgWpm}</strong> WPM</div>
                    <div>Peak: <strong className="text-cyan-300">{modeStats.maxWpm}</strong> WPM</div>
                    <div>Dist: <strong className="text-slate-200">{Math.round(modeStats.totalDistance)}</strong>m</div>
                    <div>Escapes: <strong className="text-emerald-400">{modeStats.escapesCount}</strong></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PURSUERS ENCOUNTERED & ESCAPE LOG */}
        <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-3 flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" /> Encountered Threat Log
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {Object.values(CHASERS).map(chaser => {
              const encountered = profile.chasersEncountered[chaser.id] || 0;
              const escaped = profile.chasersEscaped[chaser.id] || 0;
              const escapeRate = encountered > 0 ? Math.round((escaped / encountered) * 100) : 0;

              return (
                <div
                  key={chaser.id}
                  className={`p-3.5 rounded-xl border transition ${
                    encountered > 0
                      ? 'bg-slate-900 border-slate-800'
                      : 'bg-slate-950/40 border-slate-900 opacity-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-slate-200 truncate">{chaser.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-400">{chaser.category}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono text-slate-400 mt-2">
                    <span>Encounters: <strong className="text-slate-200">{encountered}</strong></span>
                    <span>Escaped: <strong className="text-emerald-400">{escaped}</strong> ({escapeRate}%)</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

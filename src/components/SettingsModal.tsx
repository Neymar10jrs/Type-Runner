import React from 'react';
import type { GameSettings } from '../types/game';
import { StorageManager } from '../engine/storage';
import { ApiClient } from '../engine/apiClient';
import { sound } from '../audio/soundEngine';
import {
  X,
  Volume2,
  Type,
  Sliders,
  Keyboard,
  Check
} from 'lucide-react';

interface SettingsModalProps {
  settings: GameSettings;
  onUpdateSettings: (updated: GameSettings) => void;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  onUpdateSettings,
  onClose
}) => {
  const handleChange = <K extends keyof GameSettings>(key: K, value: GameSettings[K]) => {
    const updated = { ...settings, [key]: value };
    StorageManager.saveSettings(updated);
    ApiClient.saveSettings(updated).catch(console.error);
    onUpdateSettings(updated);

    // Apply audio volumes directly to sound engine
    sound.setVolumes(
      updated.masterVolume,
      updated.sfxVolume,
      updated.musicVolume,
      updated.ambientVolume
    );
    sound.setKeyboardType(updated.keyboardSoundType);
  };

  const keyboardProfiles: { id: GameSettings['keyboardSoundType']; label: string; desc: string }[] = [
    { id: 'mechanical', label: 'Mechanical Clicky', desc: 'Tactile blue switch snap and clack' },
    { id: 'thock', label: 'Deep Thock', desc: 'Creamy lubricated linear acoustics' },
    { id: 'typewriter', label: 'Vintage Typewriter', desc: 'Crisp metallic bell-strike acoustics' },
    { id: 'synth', label: 'Retro 8-Bit', desc: 'Arcade synthesizer square-wave blips' },
    { id: 'silent', label: 'Silent Mode', desc: 'Zero keyboard click sound effects' }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-2xl text-cyan-400">
              <Sliders className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-heading">
                SYSTEM SETTINGS & ACCESSIBILITY
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Acoustics, typography, contrast, and visual feedback
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

        {/* 1. AUDIO & SOUND CONTROLS */}
        <section className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <Volume2 className="w-4 h-4 text-cyan-400" /> Audio Levels
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            {/* Master Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Master Volume</span>
                <span>{Math.round(settings.masterVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.masterVolume}
                onChange={e => handleChange('masterVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Music Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Dynamic Soundtrack</span>
                <span>{Math.round(settings.musicVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.musicVolume}
                onChange={e => handleChange('musicVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* SFX Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Sound Effects (Clicks / Roars)</span>
                <span>{Math.round(settings.sfxVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.sfxVolume}
                onChange={e => handleChange('sfxVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            {/* Ambient Volume */}
            <div>
              <div className="flex justify-between text-xs font-mono text-slate-300 mb-1">
                <span>Environmental Weather</span>
                <span>{Math.round(settings.ambientVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={settings.ambientVolume}
                onChange={e => handleChange('ambientVolume', parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </section>

        {/* 2. KEYBOARD SWITCH ACOUSTICS */}
        <section className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <Keyboard className="w-4 h-4 text-amber-400" /> Keystroke Sound Profile
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {keyboardProfiles.map(p => {
              const isSelected = settings.keyboardSoundType === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => {
                    handleChange('keyboardSoundType', p.id);
                    sound.setKeyboardType(p.id);
                    sound.playKeyClick('a', true, 1);
                  }}
                  className={`p-3 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-amber-950/40 border-amber-400 text-white'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[10px] text-slate-500">{p.desc}</div>
                  </div>
                  {isSelected && <Check className="w-4 h-4 text-amber-400 flex-shrink-0" />}
                </button>
              );
            })}
          </div>
        </section>

        {/* 3. TYPOGRAPHY & ACCESSIBILITY */}
        <section>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2 mb-3">
            <Type className="w-4 h-4 text-emerald-400" /> Typography & Vision
          </h3>

          <div className="space-y-3 bg-slate-950/60 border border-slate-800/80 p-4 rounded-2xl">
            {/* Font size selection */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">Typing Text Scale</span>
              <div className="flex gap-1.5">
                {(['small', 'medium', 'large', 'huge'] as const).map(size => (
                  <button
                    key={size}
                    onClick={() => handleChange('fontSize', size)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition ${
                      settings.fontSize === size
                        ? 'bg-cyan-500 text-white'
                        : 'bg-slate-850 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Dyslexia Font */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">OpenDyslexic Font</div>
                <div className="text-[10px] text-slate-500">Enhanced weighted letterforms for readability</div>
              </div>
              <input
                type="checkbox"
                checked={settings.dyslexiaFont}
                onChange={e => handleChange('dyslexiaFont', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">Reduced Motion</div>
                <div className="text-[10px] text-slate-500">Disables intense camera shake and speed warp lines</div>
              </div>
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={e => handleChange('reducedMotion', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
              />
            </div>

            {/* Screen Shake */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">Impact Screen Shake</div>
                <div className="text-[10px] text-slate-500">Rumbles on mistakes or close chaser footsteps</div>
              </div>
              <input
                type="checkbox"
                id="setting-screenshake"
                checked={settings.screenShake}
                onChange={e => handleChange('screenShake', e.target.checked)}
                className="w-5 h-5 accent-cyan-400 rounded cursor-pointer"
                aria-label="Toggle impact screen shake"
              />
            </div>

            {/* Reduced Flashing */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Reduced Flashing
                  <span className="ml-1.5 text-[9px] uppercase tracking-wide text-amber-400 bg-amber-950/60 px-1.5 py-0.5 rounded-full">WCAG 2.3.1</span>
                </div>
                <div className="text-[10px] text-slate-500">Replaces strobing lightning with slow fades (≤3 flashes/sec)</div>
              </div>
              <input
                type="checkbox"
                id="setting-reducedflashing"
                checked={settings.reducedFlashing ?? false}
                onChange={e => handleChange('reducedFlashing', e.target.checked)}
                className="w-5 h-5 accent-amber-400 rounded cursor-pointer"
                aria-label="Toggle reduced flashing (WCAG 2.3.1)"
              />
            </div>

            {/* Colorblind Mode */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Colorblind-Friendly Mode
                  <span className="ml-1.5 text-[9px] uppercase tracking-wide text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded-full">Deuteranopia / Protanopia</span>
                </div>
                <div className="text-[10px] text-slate-500">
                  Adds underline (correct) and strikethrough + × icon (wrong) so feedback is never color-only
                </div>
              </div>
              <input
                type="checkbox"
                id="setting-colorblind"
                checked={settings.colorblindMode ?? false}
                onChange={e => handleChange('colorblindMode', e.target.checked)}
                className="w-5 h-5 accent-emerald-400 rounded cursor-pointer"
                aria-label="Toggle colorblind-friendly typing cues"
              />
            </div>

            {/* Mute All Audio */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/60">
              <div>
                <div className="text-xs font-semibold text-slate-200">Mute All Audio</div>
                <div className="text-[10px] text-slate-500">Silences music, SFX, and ambience — persists across sessions</div>
              </div>
              <input
                type="checkbox"
                id="setting-mute"
                checked={settings.muteAudio ?? false}
                onChange={e => handleChange('muteAudio', e.target.checked)}
                className="w-5 h-5 accent-red-400 rounded cursor-pointer"
                aria-label="Toggle mute all audio"
              />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

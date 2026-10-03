import React, { useState } from 'react';
import type { PlayerProfile } from '../types/game';
import {
  SKINS_CATALOG,
  TRAILS_CATALOG,
  TITLES_CATALOG,
  StorageManager
} from '../engine/storage';
import { ApiClient } from '../engine/apiClient';
import { X, Shirt, Sparkles, Check, Lock, Award, Flame } from 'lucide-react';

interface CustomizationModalProps {
  profile: PlayerProfile;
  onUpdateProfile: (updated: PlayerProfile) => void;
  onClose: () => void;
}

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  profile,
  onUpdateProfile,
  onClose
}) => {
  const [activeTab, setActiveTab] = useState<'skins' | 'trails' | 'titles'>('skins');

  const handleEquipSkin = (skinId: string) => {
    const updated = { ...profile, equippedSkin: skinId };
    StorageManager.saveProfile(updated);
    ApiClient.saveProfile(updated).catch(console.error);
    onUpdateProfile(updated);
  };

  const handleBuySkin = (skin: typeof SKINS_CATALOG[0]) => {
    if (profile.coins < skin.price) return;
    const updated = {
      ...profile,
      coins: profile.coins - skin.price,
      unlockedSkins: [...profile.unlockedSkins, skin.id],
      equippedSkin: skin.id
    };
    StorageManager.saveProfile(updated);
    ApiClient.saveProfile(updated).catch(console.error);
    onUpdateProfile(updated);
  };

  const handleEquipTrail = (trailId: string) => {
    const updated = { ...profile, equippedTrail: trailId };
    StorageManager.saveProfile(updated);
    ApiClient.saveProfile(updated).catch(console.error);
    onUpdateProfile(updated);
  };

  const handleBuyTrail = (trail: typeof TRAILS_CATALOG[0]) => {
    if (profile.coins < trail.price) return;
    const updated = {
      ...profile,
      coins: profile.coins - trail.price,
      unlockedTrails: [...profile.unlockedTrails, trail.id],
      equippedTrail: trail.id
    };
    StorageManager.saveProfile(updated);
    ApiClient.saveProfile(updated).catch(console.error);
    onUpdateProfile(updated);
  };

  const handleEquipTitle = (titleText: string) => {
    const updated = { ...profile, equippedTitle: titleText };
    StorageManager.saveProfile(updated);
    ApiClient.saveProfile(updated).catch(console.error);
    onUpdateProfile(updated);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md select-none animate-fadeIn">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-cyan-950/80 border border-cyan-800 rounded-2xl text-cyan-400">
              <Shirt className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white font-heading">
                LOCKER & ACCESSORIES
              </h2>
              <p className="text-xs text-slate-400 font-mono">
                Customize your runner chassis, kinetic trails, and callsigns
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-800 px-4 py-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span className="font-mono font-bold text-amber-300 text-lg">{profile.coins}</span>
              <span className="text-xs uppercase text-slate-400 font-bold">Coins</span>
            </div>

            <button
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TAB BUTTONS */}
        <div className="flex gap-2 mb-6 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('skins')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'skins'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Shirt className="w-4 h-4" /> Runner Chassis
          </button>

          <button
            onClick={() => setActiveTab('trails')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'trails'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Flame className="w-4 h-4" /> Kinetic Trails
          </button>

          <button
            onClick={() => setActiveTab('titles')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition flex items-center gap-2 ${
              activeTab === 'titles'
                ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/30'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Award className="w-4 h-4" /> Pilot Titles
          </button>
        </div>

        {/* SKINS TAB */}
        {activeTab === 'skins' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {SKINS_CATALOG.map(skin => {
              const isUnlocked = profile.unlockedSkins.includes(skin.id);
              const isEquipped = profile.equippedSkin === skin.id;

              return (
                <div
                  key={skin.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                    isEquipped
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Visual Color Palette swatch */}
                    <div className="flex items-center gap-1.5 mb-3">
                      <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: skin.colors.suit }} />
                      <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: skin.colors.trim }} />
                      <div className="w-6 h-6 rounded-lg" style={{ backgroundColor: skin.colors.visor }} />
                    </div>

                    <h3 className="text-base font-bold text-slate-100 mb-1">{skin.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{skin.description}</p>
                  </div>

                  {isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> EQUIPPED
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipSkin(skin.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuySkin(skin)}
                      disabled={profile.coins < skin.price}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        profile.coins >= skin.price
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" /> UNLOCK • {skin.price} COINS
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TRAILS TAB */}
        {activeTab === 'trails' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {TRAILS_CATALOG.map(trail => {
              const isUnlocked = profile.unlockedTrails.includes(trail.id);
              const isEquipped = profile.equippedTrail === trail.id;

              return (
                <div
                  key={trail.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                    isEquipped
                      ? 'bg-cyan-950/40 border-cyan-400 shadow-lg shadow-cyan-500/20'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div>
                    {/* Color Dot */}
                    <div
                      className="w-8 h-8 rounded-xl mb-3 shadow-md"
                      style={{
                        backgroundColor: trail.particleColor,
                        boxShadow: `0 0 15px ${trail.glowColor}`
                      }}
                    />
                    <h3 className="text-base font-bold text-slate-100 mb-1">{trail.name}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">{trail.description}</p>
                  </div>

                  {isEquipped ? (
                    <div className="w-full py-2.5 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Check className="w-4 h-4" /> EQUIPPED
                    </div>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipTrail(trail.id)}
                      className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBuyTrail(trail)}
                      disabled={profile.coins < trail.price}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition ${
                        profile.coins >= trail.price
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-3.5 h-3.5" /> UNLOCK • {trail.price} COINS
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* TITLES TAB */}
        {activeTab === 'titles' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TITLES_CATALOG.map(titleDef => {
              const isUnlocked = profile.unlockedTitles.includes(titleDef.id);
              const isEquipped = profile.equippedTitle === titleDef.title;

              return (
                <div
                  key={titleDef.id}
                  className={`p-4 rounded-2xl border flex items-center justify-between ${
                    isEquipped
                      ? 'bg-cyan-950/40 border-cyan-400'
                      : 'bg-slate-950/60 border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="font-bold text-sm text-slate-100">{titleDef.title}</div>
                    <div className="text-xs text-slate-400">{titleDef.requirement}</div>
                  </div>

                  {isEquipped ? (
                    <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                      <Check className="w-4 h-4" /> ACTIVE
                    </span>
                  ) : isUnlocked ? (
                    <button
                      onClick={() => handleEquipTitle(titleDef.title)}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white transition"
                    >
                      EQUIP
                    </button>
                  ) : (
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5" /> LOCKED
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

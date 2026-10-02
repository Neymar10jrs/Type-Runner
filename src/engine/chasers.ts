import type { ChaserConfig, EnvironmentConfig, ChaserId, EnvironmentId, ChaserCategory } from '../types/game';

export const CHASERS: Record<ChaserId, ChaserConfig> = {
  dragon: {
    id: 'dragon',
    name: 'Ignis the Ancient Drake',
    title: 'Draconic Scourge',
    category: 'creature',
    environment: 'volcanic_badlands',
    baseSpeed: 10.5,
    color: '#ef4444',
    secondaryColor: '#f97316',
    lore: 'A primordial crimson wyrm awakened from volcanic slumber, scorching everything in its path.',
    roarText: 'ROOOOOAAAR! The skies ignite with sulfur and flame!',
    threatDescription: 'Spits sweeping fireballs and swoops low with razor talons.'
  },
  kraken: {
    id: 'kraken',
    name: 'Abyssal Leviathan',
    title: 'Terror of the Deeps',
    category: 'creature',
    environment: 'coastal_ruins',
    baseSpeed: 10.2,
    color: '#06b6d4',
    secondaryColor: '#3b82f6',
    lore: 'Colossal tentacles erupt from stormy tides, dragging drowned cities into the abyss.',
    roarText: 'GLUUURRRGH! The ocean surges forward in towering fury!',
    threatDescription: 'Crashing tentacles smash the stone path with tidal force.'
  },
  werewolf: {
    id: 'werewolf',
    name: 'Bloodfang Behemoth',
    title: 'Apex Predator of the Black Forest',
    category: 'creature',
    environment: 'ancient_forest',
    baseSpeed: 11.2,
    color: '#a855f7',
    secondaryColor: '#6366f1',
    lore: 'A towering lycanthrope empowered by the blood moon, relentless and terrifyingly agile.',
    roarText: 'HOWWWWWL! A blood-chilling shriek echoes through the trees!',
    threatDescription: 'Leaps relentlessly forward with razor claws cutting the night wind.'
  },
  serpent: {
    id: 'serpent',
    name: 'Jormungandr Serpent',
    title: 'Earth-Coiler',
    category: 'creature',
    environment: 'haunted_woods',
    baseSpeed: 10.0,
    color: '#10b981',
    secondaryColor: '#059669',
    lore: 'A behemoth emerald viper whose toxic coils pulverize monolithic trees into splinters.',
    roarText: 'SSSSSSSHHHH! Venomous hisses poison the damp air!',
    threatDescription: 'Slithers with massive momentum, lunging with venomous fangs.'
  },
  shadow_monster: {
    id: 'shadow_monster',
    name: 'Umbral Void-Stalker',
    title: 'Nightmare of the Nether',
    category: 'creature',
    environment: 'cyber_highway',
    baseSpeed: 10.8,
    color: '#8b5cf6',
    secondaryColor: '#ec4899',
    lore: 'An extradimensional shadow entity devouring light, warping reality as it advances.',
    roarText: 'SCREEEEECH! Reality ripples as shadows converge!',
    threatDescription: 'Extends tendrils of black void that siphon momentum.'
  },
  ancient_golem: {
    id: 'ancient_golem',
    name: 'Ruinic Colossus',
    title: 'Heart of Granite',
    category: 'creature',
    environment: 'volcanic_badlands',
    baseSpeed: 9.8,
    color: '#d97706',
    secondaryColor: '#78350f',
    lore: 'A walking mountain of obsidian and runic stone, sending tremors across the landscape.',
    roarText: 'THUMBBB! Ground-shattering footsteps shake the earth!',
    threatDescription: 'Throws massive boulders that crater the running trail.'
  },
  fire_elemental: {
    id: 'fire_elemental',
    name: 'Cinderborn Incarnate',
    title: 'Living Supernova',
    category: 'creature',
    environment: 'volcanic_badlands',
    baseSpeed: 11.0,
    color: '#f59e0b',
    secondaryColor: '#ef4444',
    lore: 'A sentient cyclone of pure plasma and molten lava that melts the ground it touches.',
    roarText: 'FSHHHHH! A blast of superheated air engulfs the path!',
    threatDescription: 'Blasts waves of magma that melt track boundaries.'
  },
  tornado: {
    id: 'tornado',
    name: 'F5 Hyper-Twister',
    title: 'Vortex of Ruin',
    category: 'disaster',
    environment: 'stormy_plains',
    baseSpeed: 11.0,
    color: '#64748b',
    secondaryColor: '#94a3b8',
    lore: 'A catastrophic multi-vortex tornado tearing up centuries-old terrain and hurled debris.',
    roarText: 'WHHHHHRRRR! 200 mph gale winds rip the ground apart!',
    threatDescription: 'Sucks up trees and rocks, hurling them forward into your lane.'
  },
  tsunami: {
    id: 'tsunami',
    name: 'The Great Deluge',
    title: 'Megatsunami Wave',
    category: 'disaster',
    environment: 'coastal_ruins',
    baseSpeed: 10.6,
    color: '#0284c7',
    secondaryColor: '#38bdf8',
    lore: 'A hundred-foot wall of roaring black water triggered by an offshore oceanic rift.',
    roarText: 'KRAAA-BOOOM! The ocean smashes over the coastal ridge!',
    threatDescription: 'Surging floodwaters slow down footfalls and carry crushing flotsam.'
  },
  wildfire: {
    id: 'wildfire',
    name: 'Hellfire Inferno',
    title: 'Unstoppable Conflagration',
    category: 'disaster',
    environment: 'ancient_forest',
    baseSpeed: 10.4,
    color: '#ea580c',
    secondaryColor: '#fbbf24',
    lore: 'A sweeping forest fire driven by gale-force winds, consuming ancient redwoods instantly.',
    roarText: 'CRACKLE-ROAR! Towering crowns of fire ignite the canopy!',
    threatDescription: 'Falling burning timbers and thick ash that obscure vision.'
  },
  avalanche: {
    id: 'avalanche',
    name: 'Glacial Cataclysm',
    title: 'White Death Wall',
    category: 'disaster',
    environment: 'frozen_pass',
    baseSpeed: 10.7,
    color: '#e2e8f0',
    secondaryColor: '#38bdf8',
    lore: 'A pulverizing wall of packed snow and ice sheets sweeping down the sheer mountain face.',
    roarText: 'RRRUUUUMBLE! The mountain peak collapses in blinding white!',
    threatDescription: 'Glacial boulders tumbling down slopes with bone-shattering force.'
  },
  volcanic_eruption: {
    id: 'volcanic_eruption',
    name: 'Pyroclastic Surge',
    title: 'Vesuvius Awakening',
    category: 'disaster',
    environment: 'volcanic_badlands',
    baseSpeed: 11.2,
    color: '#dc2626',
    secondaryColor: '#f97316',
    lore: 'A superheated cloud of volcanic gas and molten pumice cascading down the slopes.',
    roarText: 'BAAAAANG! The caldera blows skyward with shockwaves of ash!',
    threatDescription: 'Rain of burning volcanic bombs and incandescent ash.'
  }
};

export const ENVIRONMENTS: Record<EnvironmentId, EnvironmentConfig> = {
  ancient_forest: {
    id: 'ancient_forest',
    name: 'Ancient Whispering Forest',
    skyGradient: ['#06201a', '#022c22'],
    sunColor: '#34d399',
    fogColor: 'rgba(6, 78, 59, 0.45)',
    mountainColor: '#064e3b',
    midgroundColor: '#047857',
    groundColor: '#065f46',
    roadAccent: '#10b981',
    particleType: 'leaves'
  },
  volcanic_badlands: {
    id: 'volcanic_badlands',
    name: 'Obsidian Crater & Lava Rifts',
    skyGradient: ['#1c0404', '#450a0a'],
    sunColor: '#f87171',
    fogColor: 'rgba(127, 29, 29, 0.4)',
    mountainColor: '#7f1d1d',
    midgroundColor: '#991b1b',
    groundColor: '#2b0c0c',
    roadAccent: '#ef4444',
    particleType: 'embers'
  },
  frozen_pass: {
    id: 'frozen_pass',
    name: 'Glacial Frostpeaks',
    skyGradient: ['#082f49', '#0c4a6e'],
    sunColor: '#bae6fd',
    fogColor: 'rgba(12, 74, 110, 0.45)',
    mountainColor: '#075985',
    midgroundColor: '#0284c7',
    groundColor: '#1e3a5f',
    roadAccent: '#38bdf8',
    particleType: 'snow'
  },
  coastal_ruins: {
    id: 'coastal_ruins',
    name: 'Sunken Temple Coast',
    skyGradient: ['#0f172a', '#1e293b'],
    sunColor: '#67e8f9',
    fogColor: 'rgba(15, 23, 42, 0.5)',
    mountainColor: '#1e3a8a',
    midgroundColor: '#1d4ed8',
    groundColor: '#172554',
    roadAccent: '#06b6d4',
    particleType: 'rain'
  },
  stormy_plains: {
    id: 'stormy_plains',
    name: 'Tempest Badlands',
    skyGradient: ['#09090b', '#18181b'],
    sunColor: '#fef08a',
    fogColor: 'rgba(24, 24, 27, 0.5)',
    mountainColor: '#27272a',
    midgroundColor: '#3f3f46',
    groundColor: '#27272a',
    roadAccent: '#eab308',
    particleType: 'lightning'
  },
  cyber_highway: {
    id: 'cyber_highway',
    name: 'Neo-Neon Overpass',
    skyGradient: ['#0f051d', '#240046'],
    sunColor: '#f43f5e',
    fogColor: 'rgba(59, 7, 100, 0.45)',
    mountainColor: '#3c096c',
    midgroundColor: '#5a189a',
    groundColor: '#1e1035',
    roadAccent: '#a855f7',
    particleType: 'dust'
  },
  haunted_woods: {
    id: 'haunted_woods',
    name: 'Umbral Thicket',
    skyGradient: ['#050811', '#0b132b'],
    sunColor: '#c084fc',
    fogColor: 'rgba(11, 19, 43, 0.6)',
    mountainColor: '#1c2541',
    midgroundColor: '#3a506b',
    groundColor: '#0d1b2a',
    roadAccent: '#818cf8',
    particleType: 'leaves'
  },
  ocean_shore: {
    id: 'ocean_shore',
    name: 'Tidefall Cliffs',
    skyGradient: ['#031d44', '#04395e'],
    sunColor: '#70e000',
    fogColor: 'rgba(3, 29, 68, 0.4)',
    mountainColor: '#0a1128',
    midgroundColor: '#001f54',
    groundColor: '#034078',
    roadAccent: '#48cae4',
    particleType: 'bubbles'
  }
};

/**
 * Weighted random chaser selector ensuring that the same chaser is rarely picked twice in a row
 */
export function getRandomChaser(lastChaserId?: ChaserId, categoryPreference?: ChaserCategory): ChaserConfig {
  const allChasers = Object.values(CHASERS);
  const filtered = categoryPreference 
    ? allChasers.filter(c => c.category === categoryPreference)
    : allChasers;

  // Filter out lastChaserId if more than 1 option
  const candidates = filtered.filter(c => c.id !== lastChaserId);
  const pool = candidates.length > 0 ? candidates : filtered;

  const selected = pool[Math.floor(Math.random() * pool.length)];
  return selected;
}

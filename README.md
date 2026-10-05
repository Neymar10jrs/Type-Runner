# 🏃‍♂️💨 TYPING RUNNER — Adaptive Typing Survival Game

> **TYPE FAST. RUN FASTER. SURVIVE.**

**TYPING RUNNER** is a modern, high-intensity browser typing survival game combining rapid typing practice, endless-runner physics, procedural parallax world rendering, an adaptive difficulty engine, and cinematic boss chase sequences.

Your typing speed and precision directly control your character's stride, velocity, and distance from the encroaching apocalypse.

---

## ⚡ Core Concept

* **Typing Speed + Precision = Real-Time Physics**: The faster and more accurately you type, the faster and more smoothly your runner sprints.
* **Forgiving Survival Curve**: Mistakes cause temporary deceleration and momentum loss—never an instant one-strike game over.
* **Adaptive Rolling Window**: The engine continuously tracks rolling WPM and accuracy over a 15-second evaluation window, dynamically scaling vocabulary tiers, obstacle density, and pursuer velocity to match your ability.
* **Combo Multipliers & Overdrive**:
  * **10+ Streak**: $1.2\times$ Multiplier
  * **25+ Streak**: $1.5\times$ Speed boost
  * **50+ Streak**: $2.0\times$ High-intensity combo
  * **100+ Streak**: $3.0\times$ Hyper-Sprint overdrive

---

## 🐉 12 Randomized Pursuers (Chasers)

On every new run, the encounter engine randomly selects from 12 distinct threats with custom canvas graphics, threat mechanics, and paired environments:

### Mythical Alpha Beasts
1. **Ignis the Ancient Drake** — Volcanic badlands; breaths sweeping fan flames and swoops low with razor talons.
2. **Abyssal Leviathan Kraken** — Coastal ruins; colossal writhing tentacles smash the stone path with tidal force.
3. **Bloodfang Behemoth Werewolf** — Ancient whispering forest; relentless leaping predator empowered by the blood moon.
4. **Jormungandr Serpent** — Umbral thicket; behemoth emerald viper with undulating coils and venomous strikes.
5. **Umbral Void-Stalker** — Neo-neon highway; extradimensional shadow entity whipping dark matter tendrils.
6. **Ruinic Colossus Golem** — Ancient crater; obsidian stone titan throwing craters and shockwaves.
7. **Cinderborn Incarnate** — Living plasma storm that superheats the ground.

### Catastrophic Natural Disasters
8. **F5 Hyper-Twister** — Tempest badlands; multi-vortex tornado hurling trees and debris into your running lane.
9. **The Great Deluge Tsunami** — Drowned coast; 100-foot wave wall and torrential flotsam.
10. **Hellfire Inferno Wildfire** — Ancient redwoods; roaring fire wall engulfing the canopy.
11. **Glacial Cataclysm Avalanche** — Glacial peaks; crushing snow wall and tumbling ice boulders.
12. **Pyroclastic Surge Volcanic Eruption** — Vesuvius awakening; incandescent pumice and volcanic bombs.

---

## 🎮 Game Modes

* **Endless Run**: Infinite survival against escalating randomized threats and dynamic obstacle combinations.
* **Creature Hunt**: Choose a specific mythical boss beast to outrun.
* **Disaster Run**: Test your speed escaping a chosen cataclysmic disaster.
* **Time Attack**: 90-second sprint to achieve maximum distance and score.
* **Practice Mode**: Serene ambient run with zero pursuers and peaceful velocity training.
* **Challenge Gauntlets**: Objective-driven missions with coin and XP bounties:
  * *Velocity Trial: 50 WPM*
  * *Flawless Flight (0 Errors Permitted)*
  * *Syntax Crucible (Punctuation-heavy passages)*
  * *Pyroclastic Sprint (800m sprint)*

---

## 📖 How to Play

1. **Choose a Game Mode**: Select from Endless Run, Creature Hunt, Disaster Run, Time Attack, Practice Mode, or Challenge Gauntlets on the main menu.
2. **Type the Target Sentence**: Type the characters displayed in the translucent glass console. Each correct keystroke accelerates your runner and builds your combo streak.
3. **Hurdle Obstacles**: When approaching fallen trees, rock spikes, or fire pits, maintain your streak or hurdle with typing bursts to leap or slide past hazards cleanly.
4. **Outrun the Pursuer**: Maintain distance from alpha predators and cataclysms. Pauses or typos cause momentum loss, allowing the threat to close in.
5. **Keyboard Shortcuts**:
   * `ESC`: Pause / Resume run
   * `M`: Toggle audio mute (persists across sessions)
   * `Enter` / `Space` (Game Over screen): Instant retry

---

## ♿ Accessibility & Mobile

TYPING RUNNER is built from the ground up to be accessible, customizable, and mobile-friendly:

### 📱 Mobile & Virtual Keyboard Handling
* **Visual Viewport Synchronization**: Listens to `window.visualViewport` resize and scroll events so on-screen keyboards never cover the running action or the active sentence box.
* **Mobile-Optimized Input**: Hidden input utilizes `autocapitalize="off"`, `autocorrect="off"`, `autocomplete="off"`, and `spellcheck={false}`. Uses `beforeinput` and `input` events so mobile predictive text cannot corrupt gameplay.
* **Tap-to-Focus**: Tapping anywhere on the typing interface or game canvas automatically opens and focuses the soft keyboard.
* **Responsive Layout**: Fluidly scales across standard mobile screen dimensions (360×640, 390×844, and landscape orientations).

### 👁️ Accessibility Settings (Settings Modal)
* **Re-enabled Zoom**: Replaced restrictive meta tags with `width=device-width, initial-scale=1.0, viewport-fit=cover`. The HTML5 Canvas adapts dynamically to window resize and `devicePixelRatio` zoom changes.
* **Audio Gesture Unlock**: AudioContext starts upon user interaction via an unlock screen or mode click, and automatically resumes after tab switching or backgrounding.
* **Persistent Mute Toggle**: Dedicated mute button in the top-right header and `M` shortcut that saves across browser sessions.
* **Reduced Motion**: Automatically defaults to ON if `prefers-reduced-motion: reduce` is detected in the operating system. Disables camera shake, dampens heavy parallax scrolling by 80%, and reduces weather particle counts.
* **Reduced Flashing (WCAG 2.3.1)**: Replaces lightning flashes and strobe hazards with a gentle, slow ambient fade. Strobe frequency is strictly capped below 3 flashes per second.
* **Colorblind-Friendly Mode**: Typing accuracy feedback never relies on color alone—correct characters receive an underline, while mistakes display a strikethrough and a `×` indicator. High-contrast color palette supports deuteranopia and protanopia.
* **Fair Difficulty & Flawless Flight**:
  * Mistakes trigger a 1.5-second grace period during which subsequent penalties are dampened, preventing compound failure loops.
  * Single typos count only once in the 15-second rolling window.
  * In the **Flawless Flight** challenge, errors are clearly defined as *uncorrected errors*—fixing a typo with backspace leaves the flawless record intact. Live HUD indicator shows remaining uncorrected errors.

---

## 🎵 Procedural Web Audio API Sound Synthesizer

100% self-contained procedural audio with zero external asset downloads:
* **Tactile Mechanical Key Switch Acoustics**: Blue Clicky, Deep Thock, Vintage Typewriter, Retro 8-Bit Synth, or Silent mode.
* **Harmonic Streak Chimes**: Pentatonic scale chords that ascend in pitch as you sustain typing streaks.
* **Stride-Synced Footsteps**: Footstep cadence tempo accelerates and decelerates with your runner's true velocity.
* **Dynamic Synthwave Chase Soundtrack**: Driving procedural kicks, snares, 16th-note basslines, and synth arpeggios that open up their low-pass filters and ramp tempo from 116 BPM up to 156 BPM as danger approaches.

---

## 🎨 Visuals & Canvas Renderer

* **See-Through Glass Console**: Translucent sentence box allows 100% visibility of the running character, obstacles, and pursuer in real time.
* **Skeletal Vector Runner**: Articulated procedural joints, stride cycles tied to velocity, dynamic forward lean, and flowing cloaks.
* **Parallax Environments**: Multi-layer procedural scrolling (sky gradients, celestial bodies, distant mountains, midground ruins, and highway road markers).
* **Atmospheric Weather**: Dynamic particle systems for rain, lightning flashes, snow squalls, volcanic embers, and dust.
* **Customization Locker**: 5 Runner Chassis skins, 5 Kinetic Trails, and Pilot Titles unlocked with earned coins.
* **Telemetry Dashboard**: Longitudinal WPM velocity progression graphs and threat encounter logs.

---

## 🚀 Getting Started

### Prerequisites
* [Node.js](https://nodejs.org/) (v18 or higher recommended)
* `npm` or `pnpm`

### Installation
```bash
# Clone the repository
git clone https://github.com/Neymar10jrs/Type-Runner.git
cd Type-Runner

# Install dependencies
npm install

# Start the Vite development server
npm run dev
```

Visit `http://localhost:5173/` in your browser.

### Building for Production
```bash
npm run build
npm run preview
```

---

## 🛠️ Tech Stack

* **React 19**
* **TypeScript**
* **Vite**
* **Tailwind CSS v4**
* **HTML5 Canvas 2D API**
* **Web Audio API**
* **Lucide Icons**
* **Canvas Confetti**

---

## 📜 License

MIT License — Feel free to use and expand!

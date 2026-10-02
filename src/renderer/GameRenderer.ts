import type {
  ChaserConfig,
  EnvironmentConfig,
  Obstacle,
  PlayerActionState,
  CharacterSkin,
  RunningTrail
} from '../types/game';
import { ENVIRONMENTS } from '../engine/chasers';
import { SKINS_CATALOG, TRAILS_CATALOG } from '../engine/storage';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  vy: number;
  color: string;
  alpha: number;
  scale: number;
}

export class GameRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private width: number = 1200;
  private height: number = 700;
  private dpr: number = 1;

  // Parallax offsets (in world pixels)
  private bgOffsetFar: number = 0;
  private bgOffsetMid: number = 0;
  private groundOffset: number = 0;

  // Particle systems
  private weatherParticles: Particle[] = [];
  private trailParticles: Particle[] = [];
  private effectParticles: Particle[] = [];
  private floatingTexts: FloatingText[] = [];

  // Screen shake & camera
  private shakeIntensity: number = 0;
  private shakeDecay: number = 5.0;
  private cameraZoom: number = 1.0;

  // Lightning flash state
  private lightningTimer: number = 0;
  private lightningActive: boolean = false;

  // Cinematic events
  private cinematicEventTimer: number = 0;
  private activeCinematicEvent: string | null = null;

  // Runner skeletal animation timers
  private runCycleTime: number = 0;
  private chaserAnimTime: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
    this.resize();
    this.initWeather(ENVIRONMENTS.ancient_forest);
  }

  public resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 1200;
    this.height = rect.height || 700;

    this.canvas.width = this.width * this.dpr;
    this.canvas.height = this.height * this.dpr;
    this.ctx.scale(this.dpr, this.dpr);
  }

  public triggerScreenShake(intensity: number = 12) {
    this.shakeIntensity = Math.min(30, this.shakeIntensity + intensity);
  }

  public addFloatingText(text: string, x: number, y: number, color: string = '#38bdf8') {
    this.floatingTexts.push({
      id: Math.random().toString(),
      text,
      x,
      y,
      vy: -1.5,
      color,
      alpha: 1.0,
      scale: 1.2
    });
  }

  public spawnObstacleClearEffect(x: number, y: number) {
    for (let i = 0; i < 24; i++) {
      const angle = (Math.PI * 2 * i) / 24;
      const speed = 2 + Math.random() * 5;
      this.effectParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.5,
        size: 3 + Math.random() * 4,
        color: '#10b981',
        alpha: 1.0,
        life: 0,
        maxLife: 0.6 + Math.random() * 0.3
      });
    }
  }

  public initWeather(env: EnvironmentConfig) {
    this.weatherParticles = [];
    const count = env.particleType === 'rain' ? 120 : env.particleType === 'snow' ? 80 : 50;
    for (let i = 0; i < count; i++) {
      this.weatherParticles.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        vx: env.particleType === 'rain' ? -4 - Math.random() * 3 : -1.5 + Math.random() * 3,
        vy: env.particleType === 'rain' ? 12 + Math.random() * 6 : env.particleType === 'snow' ? 2 + Math.random() * 2 : -1.5 - Math.random() * 2,
        size: env.particleType === 'rain' ? 2 : 2.5 + Math.random() * 3,
        color: env.particleType === 'embers' ? '#f97316' : env.particleType === 'snow' ? '#ffffff' : '#38bdf8',
        alpha: 0.3 + Math.random() * 0.6,
        life: Math.random(),
        maxLife: 1.0
      });
    }
  }

  /**
   * Main Render Frame Loop
   */
  public render(
    dt: number,
    runnerSpeed: number, // m/s
    playerState: PlayerActionState,
    chaser: ChaserConfig,
    env: EnvironmentConfig,
    obstacles: Obstacle[],
    chaserDistanceMeters: number,
    equippedSkinId: string,
    equippedTrailId: string,
    streak: number,
    reducedMotion: boolean = false
  ) {
    const ctx = this.ctx;
    const w = this.width;
    const h = this.height;

    // Ground plane Y coordinates (ground level at 63% of canvas height for full runner visibility)
    const groundY = h * 0.63;

    // Update animation cycles
    this.runCycleTime += dt * (runnerSpeed * 0.85);
    this.chaserAnimTime += dt;

    // Update screen shake
    let shakeX = 0;
    let shakeY = 0;
    if (this.shakeIntensity > 0 && !reducedMotion) {
      shakeX = (Math.random() * 2 - 1) * this.shakeIntensity;
      shakeY = (Math.random() * 2 - 1) * this.shakeIntensity;
      this.shakeIntensity = Math.max(0, this.shakeIntensity - this.shakeDecay * dt * 10);
    }

    // Proximity shake if chaser is closer than 20m
    if (chaserDistanceMeters < 25 && !reducedMotion) {
      const proximityShake = ((25 - chaserDistanceMeters) / 25) * 4;
      shakeX += (Math.random() * 2 - 1) * proximityShake;
      shakeY += (Math.random() * 2 - 1) * proximityShake;
    }

    // Parallax scrolling updates (convert m/s to pixels/s)
    const worldPxSpeed = runnerSpeed * 28;
    this.bgOffsetFar = (this.bgOffsetFar + worldPxSpeed * 0.08 * dt) % w;
    this.bgOffsetMid = (this.bgOffsetMid + worldPxSpeed * 0.3 * dt) % w;
    this.groundOffset = (this.groundOffset + worldPxSpeed * 1.0 * dt) % 80;

    // Save context for camera shake
    ctx.save();
    ctx.translate(shakeX, shakeY);

    // 1. SKY GRADIENT
    const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
    skyGrad.addColorStop(0, env.skyGradient[0]);
    skyGrad.addColorStop(1, env.skyGradient[1]);
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // 2. CELESTIAL / VORTEX CORE
    this.renderCelestial(ctx, env, w, groundY);

    // 3. FAR BACKGROUND (Mountains / Cityscape)
    this.renderFarBackground(ctx, env, w, groundY);

    // 4. MIDGROUND PARALLAX (Trees / Ruins / Pillars)
    this.renderMidground(ctx, env, w, groundY);

    // 5. WEATHER PARTICLES (Back layer)
    this.updateAndRenderWeather(ctx, env, dt, runnerSpeed, w, h);

    // 6. GROUND & ROAD
    this.renderGround(ctx, env, w, h, groundY);

    // 7. OBSTACLES (World coordinates to screen)
    // Runner screen position is fixed at x = 320px
    const runnerScreenX = Math.min(340, w * 0.3);
    this.renderObstacles(ctx, obstacles, runnerScreenX, groundY, w);

    // 8. CHASER MONSTER / DISASTER
    // Chaser is rendered behind the runner based on chaserDistanceMeters
    // 50m distance translates to ~260px behind player
    const chaserScreenX = runnerScreenX - Math.max(70, Math.min(450, chaserDistanceMeters * 6.5));
    this.renderChaser(ctx, chaser, env, chaserScreenX, groundY, chaserDistanceMeters, dt);

    // 9. RUNNING TRAILS & PARTICLES
    const skin = SKINS_CATALOG.find(s => s.id === equippedSkinId) || SKINS_CATALOG[0];
    const trail = TRAILS_CATALOG.find(t => t.id === equippedTrailId) || TRAILS_CATALOG[0];
    this.updateAndRenderTrails(ctx, trail, runnerScreenX, groundY, playerState, runnerSpeed, dt);

    // 10. RUNNER CHARACTER
    this.renderRunner(ctx, skin, playerState, runnerScreenX, groundY, runnerSpeed);

    // 11. EFFECT PARTICLES & FLOATING NUMBERS
    this.updateAndRenderEffects(ctx, dt);

    // 12. SPEED LINES (if high speed / sprint)
    if (runnerSpeed > 14 && !reducedMotion) {
      this.renderSpeedLines(ctx, runnerSpeed, w, h);
    }

    // 13. DANGER VIGNETTE (if chaser < 25m)
    if (chaserDistanceMeters < 30) {
      this.renderDangerVignette(ctx, chaserDistanceMeters, w, h);
    }

    ctx.restore();
  }

  // --- CELESTIAL / SKY FX ---
  private renderCelestial(ctx: CanvasRenderingContext2D, env: EnvironmentConfig, w: number, groundY: number) {
    const sunX = w * 0.75;
    const sunY = groundY * 0.32;
    const radius = 65;

    // Glowing orb
    const grad = ctx.createRadialGradient(sunX, sunY, 10, sunX, sunY, radius * 2.5);
    grad.addColorStop(0, env.sunColor);
    grad.addColorStop(0.3, env.sunColor + '66');
    grad.addColorStop(1, 'transparent');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(sunX, sunY, radius * 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Solid core
    ctx.fillStyle = env.sunColor;
    ctx.beginPath();
    ctx.arc(sunX, sunY, radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- FAR BACKGROUND ---
  private renderFarBackground(ctx: CanvasRenderingContext2D, env: EnvironmentConfig, w: number, groundY: number) {
    ctx.save();
    ctx.fillStyle = env.mountainColor;
    ctx.beginPath();

    const mountainPeakHeight = groundY * 0.55;
    const step = 90;
    const offset = this.bgOffsetFar;

    ctx.moveTo(0, groundY);
    for (let x = -step; x <= w + step * 2; x += step) {
      const drawX = x - (offset % step);
      const isPeak = Math.floor((x + offset) / step) % 2 === 0;
      const y = isPeak ? mountainPeakHeight + Math.sin(x * 0.05) * 45 : groundY * 0.85;
      ctx.lineTo(drawX, y);
    }
    ctx.lineTo(w, groundY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // --- MIDGROUND PARALLAX ---
  private renderMidground(ctx: CanvasRenderingContext2D, env: EnvironmentConfig, w: number, groundY: number) {
    ctx.save();
    ctx.fillStyle = env.midgroundColor;

    const offset = this.bgOffsetMid;
    const step = 140;

    for (let x = -step; x <= w + step * 2; x += step) {
      const drawX = x - (offset % step);
      const seed = Math.sin(Math.floor((x + offset) / step) * 12.3);

      if (seed > 0.2) {
        // Ancient Arch or Tall Tree
        const pillarHeight = 110 + Math.abs(seed) * 60;
        ctx.fillRect(drawX, groundY - pillarHeight, 32, pillarHeight);
        // Arch top or canopy
        ctx.beginPath();
        ctx.arc(drawX + 16, groundY - pillarHeight, 38, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Jagged ruined column
        const colHeight = 60 + Math.abs(seed) * 50;
        ctx.fillRect(drawX, groundY - colHeight, 22, colHeight);
      }
    }
    ctx.restore();
  }

  // --- GROUND & HIGHWAY TRACK ---
  private renderGround(ctx: CanvasRenderingContext2D, env: EnvironmentConfig, w: number, h: number, groundY: number) {
    const ctx_ = this.ctx;

    // Ground base
    const groundGrad = ctx_.createLinearGradient(0, groundY, 0, h);
    groundGrad.addColorStop(0, env.groundColor);
    groundGrad.addColorStop(1, '#09090b');
    ctx_.fillStyle = groundGrad;
    ctx_.fillRect(0, groundY, w, h - groundY);

    // Glowing track surface line
    ctx_.strokeStyle = env.roadAccent;
    ctx_.lineWidth = 4;
    ctx_.beginPath();
    ctx_.moveTo(0, groundY);
    ctx_.lineTo(w, groundY);
    ctx_.stroke();

    // Neon speed telemetry dashes along the road
    ctx_.fillStyle = env.roadAccent;
    const dashSpacing = 80;
    const dashW = 34;
    const dashH = 5;
    for (let x = -dashSpacing; x <= w + dashSpacing; x += dashSpacing) {
      const drawX = x - this.groundOffset;
      ctx_.fillRect(drawX, groundY + 18, dashW, dashH);
    }

    // Lower road edge reflector line
    ctx_.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx_.lineWidth = 2;
    ctx_.beginPath();
    ctx_.moveTo(0, groundY + 45);
    ctx_.lineTo(w, groundY + 45);
    ctx_.stroke();
  }

  // --- WEATHER PARTICLES ---
  private updateAndRenderWeather(
    ctx: CanvasRenderingContext2D,
    env: EnvironmentConfig,
    dt: number,
    runnerSpeed: number,
    w: number,
    h: number
  ) {
    ctx.save();
    for (const p of this.weatherParticles) {
      // Wind speed offset
      p.x += (p.vx - runnerSpeed * 0.4) * dt * 45;
      p.y += p.vy * dt * 45;

      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;
      if (p.y > h) p.y = -20;
      if (p.y < -20) p.y = h;

      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      if (env.particleType === 'rain') {
        ctx.fillRect(p.x, p.y, 2, 14);
      } else {
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // --- RUNNING TRAILS ---
  private updateAndRenderTrails(
    ctx: CanvasRenderingContext2D,
    trail: RunningTrail,
    runnerX: number,
    groundY: number,
    state: PlayerActionState,
    speed: number,
    dt: number
  ) {
    // Spawn new trail particles at runner heels if running/sprinting
    if (state === 'running' || state === 'sprint') {
      const spawnCount = state === 'sprint' ? 3 : 1;
      for (let i = 0; i < spawnCount; i++) {
        this.trailParticles.push({
          x: runnerX - 10 + (Math.random() * 8 - 4),
          y: groundY - 4 + (Math.random() * 4 - 2),
          vx: -speed * 1.5 - Math.random() * 3,
          vy: -Math.random() * 2,
          size: state === 'sprint' ? 5 + Math.random() * 4 : 3 + Math.random() * 3,
          color: trail.particleColor,
          alpha: 0.8,
          life: 0,
          maxLife: state === 'sprint' ? 0.45 : 0.25
        });
      }
    }

    // Render & clean
    ctx.save();
    for (let i = this.trailParticles.length - 1; i >= 0; i--) {
      const p = this.trailParticles[i];
      p.life += dt;
      p.x += p.vx * dt * 30;
      p.y += p.vy * dt * 30;

      const progress = p.life / p.maxLife;
      if (progress >= 1) {
        this.trailParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = (1 - progress) * p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // --- ARTICULATED SKELETAL RUNNER CHARACTER ---
  private renderRunner(
    ctx: CanvasRenderingContext2D,
    skin: CharacterSkin,
    state: PlayerActionState,
    x: number,
    groundY: number,
    speed: number
  ) {
    ctx.save();

    // Determine vertical offset for jumping / sliding / stumbling
    let runnerY = groundY;
    let bodyAngle = 0.12; // Forward lean
    let legCycle = Math.sin(this.runCycleTime);
    let armCycle = Math.cos(this.runCycleTime);

    if (state === 'sprint') {
      bodyAngle = 0.32; // Aggressive forward lean
    } else if (state === 'jumping') {
      runnerY -= 65; // Air elevation
      bodyAngle = -0.05;
      legCycle = 0.5; // Tucked legs
    } else if (state === 'sliding') {
      runnerY += 12; // Low to ground
      bodyAngle = -0.7; // Tilted backwards in slide
      legCycle = 1.0;
    } else if (state === 'stumbling') {
      bodyAngle = -0.3; // Thrown back
      runnerY -= 10;
    } else if (state === 'defeat') {
      bodyAngle = -1.2; // Fallen
      runnerY += 10;
    }

    ctx.translate(x, runnerY);
    ctx.rotate(bodyAngle);

    // 1. Flowing Cloak/Scarf (flutters in the wind behind character)
    const scarfWave = Math.sin(this.runCycleTime * 1.5) * 12;
    const scarfLen = state === 'sprint' ? 52 : 36;
    ctx.fillStyle = skin.colors.cape;
    ctx.beginPath();
    ctx.moveTo(-10, -52);
    ctx.quadraticCurveTo(-scarfLen * 0.6, -55 + scarfWave, -scarfLen, -45 + scarfWave * 1.5);
    ctx.lineTo(-scarfLen * 0.8, -38 + scarfWave);
    ctx.lineTo(-8, -44);
    ctx.closePath();
    ctx.fill();

    // 2. Back Leg
    this.renderLeg(ctx, skin.colors.suit, -legCycle, true);

    // 3. Torso
    ctx.fillStyle = skin.colors.suit;
    ctx.fillRect(-10, -56, 20, 32);

    // Armor Trim / Chest Plate
    ctx.fillStyle = skin.colors.trim;
    ctx.fillRect(-6, -52, 12, 16);

    // 4. Back Arm
    this.renderArm(ctx, skin.colors.suit, skin.colors.trim, -armCycle, true);

    // 5. Head & Visor
    ctx.fillStyle = skin.colors.suit;
    ctx.beginPath();
    ctx.arc(4, -66, 12, 0, Math.PI * 2);
    ctx.fill();

    // Glowing Visor
    ctx.fillStyle = skin.colors.visor;
    ctx.fillRect(8, -69, 8, 5);

    // 6. Front Leg
    this.renderLeg(ctx, skin.colors.suit, legCycle, false);

    // 7. Front Arm
    this.renderArm(ctx, skin.colors.suit, skin.colors.trim, armCycle, false);

    ctx.restore();
  }

  private renderLeg(ctx: CanvasRenderingContext2D, suitColor: string, cycle: number, isBack: boolean) {
    ctx.save();
    ctx.strokeStyle = isBack ? '#1e293b' : suitColor;
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';

    const hipX = 0;
    const hipY = -24;

    const thighAngle = cycle * 0.85;
    const kneeX = hipX + Math.sin(thighAngle) * 18;
    const kneeY = hipY + Math.cos(thighAngle) * 18;

    const calfAngle = thighAngle + Math.max(0, -cycle * 0.8) + 0.2;
    const footX = kneeX + Math.sin(calfAngle) * 18;
    const footY = kneeY + Math.cos(calfAngle) * 18;

    // Draw thigh
    ctx.beginPath();
    ctx.moveTo(hipX, hipY);
    ctx.lineTo(kneeX, kneeY);
    ctx.lineTo(footX, footY);
    ctx.stroke();

    // Foot boot
    ctx.fillStyle = isBack ? '#0f172a' : '#0284c7';
    ctx.fillRect(footX - 2, footY - 2, 9, 5);

    ctx.restore();
  }

  private renderArm(ctx: CanvasRenderingContext2D, suitColor: string, trimColor: string, cycle: number, isBack: boolean) {
    ctx.save();
    ctx.strokeStyle = isBack ? '#1e293b' : suitColor;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    const shoulderX = 0;
    const shoulderY = -50;

    const armAngle = cycle * 0.75;
    const elbowX = shoulderX - Math.sin(armAngle) * 14;
    const elbowY = shoulderY + Math.cos(armAngle) * 14;

    const handX = elbowX + Math.sin(armAngle * 0.5) * 14;
    const handY = elbowY + Math.cos(armAngle * 0.5) * 14;

    ctx.beginPath();
    ctx.moveTo(shoulderX, shoulderY);
    ctx.lineTo(elbowX, elbowY);
    ctx.lineTo(handX, handY);
    ctx.stroke();

    // Glove
    ctx.fillStyle = trimColor;
    ctx.beginPath();
    ctx.arc(handX, handY, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- DYNAMIC CHASER DRAWING ROUTINES ---
  private renderChaser(
    ctx: CanvasRenderingContext2D,
    chaser: ChaserConfig,
    env: EnvironmentConfig,
    screenX: number,
    groundY: number,
    distanceMeters: number,
    dt: number
  ) {
    ctx.save();
    const anim = this.chaserAnimTime;

    // Proximity scale: grows as it gets closer
    const scale = Math.max(0.7, Math.min(1.45, 1.4 - (distanceMeters / 90)));
    ctx.translate(screenX, groundY);
    ctx.scale(scale, scale);

    // If far (>70m), render in looming shadowy silhouette
    const isSilhouetted = distanceMeters > 70;
    if (isSilhouetted) {
      ctx.globalAlpha = 0.45;
    }

    switch (chaser.id) {
      case 'dragon':
        this.drawDragon(ctx, chaser, anim, distanceMeters);
        break;
      case 'tornado':
        this.drawTornado(ctx, chaser, anim);
        break;
      case 'tsunami':
        this.drawTsunami(ctx, chaser, anim);
        break;
      case 'kraken':
        this.drawKraken(ctx, chaser, anim);
        break;
      case 'werewolf':
        this.drawWerewolf(ctx, chaser, anim);
        break;
      case 'serpent':
        this.drawSerpent(ctx, chaser, anim);
        break;
      case 'shadow_monster':
        this.drawShadowMonster(ctx, chaser, anim);
        break;
      case 'ancient_golem':
        this.drawAncientGolem(ctx, chaser, anim);
        break;
      case 'fire_elemental':
      case 'wildfire':
        this.drawWildfireOrElemental(ctx, chaser, anim);
        break;
      case 'avalanche':
        this.drawAvalanche(ctx, chaser, anim);
        break;
      case 'volcanic_eruption':
        this.drawVolcanicSurge(ctx, chaser, anim);
        break;
      default:
        this.drawDragon(ctx, chaser, anim, distanceMeters);
        break;
    }

    ctx.restore();
  }

  // --- CHASER: DRAGON ---
  private drawDragon(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number, distance: number) {
    const wingFlap = Math.sin(anim * 4) * 35;
    const neckWave = Math.cos(anim * 3) * 12;

    // Massive Wing (Back)
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(-40, -100);
    ctx.lineTo(-120, -220 + wingFlap);
    ctx.lineTo(20, -160 + wingFlap * 0.8);
    ctx.closePath();
    ctx.fill();

    // Muscular Dragon Torso & Legs
    ctx.fillStyle = chaser.color;
    ctx.beginPath();
    ctx.ellipse(0, -90, 65, 45, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Serpentine Neck & Head
    ctx.strokeStyle = chaser.color;
    ctx.lineWidth = 32;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(30, -100);
    ctx.quadraticCurveTo(80, -130 + neckWave, 110, -110 + neckWave);
    ctx.stroke();

    // Head & Horns
    ctx.fillStyle = chaser.secondaryColor;
    ctx.beginPath();
    ctx.moveTo(100, -125 + neckWave);
    ctx.lineTo(145, -110 + neckWave);
    ctx.lineTo(105, -95 + neckWave);
    ctx.closePath();
    ctx.fill();

    // Glowing Eye
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(120, -114 + neckWave, 6, 0, Math.PI * 2);
    ctx.fill();

    // Front Wing
    ctx.fillStyle = '#dc2626';
    ctx.beginPath();
    ctx.moveTo(-10, -90);
    ctx.lineTo(-80, -210 - wingFlap);
    ctx.lineTo(40, -140 - wingFlap * 0.7);
    ctx.closePath();
    ctx.fill();

    // Fire breath when closer than 40m!
    if (distance < 45) {
      const fireGrad = ctx.createRadialGradient(145, -105 + neckWave, 10, 240, -95 + neckWave, 90);
      fireGrad.addColorStop(0, '#fef08a');
      fireGrad.addColorStop(0.4, '#f97316');
      fireGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.arc(220, -95 + neckWave, 70, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- CHASER: TORNADO ---
  private drawTornado(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    const funnelHeight = 240;
    const slices = 12;

    for (let i = 0; i < slices; i++) {
      const progress = i / slices;
      const y = -funnelHeight * progress;
      const radius = 25 + progress * 95;
      const sway = Math.sin(anim * 8 + i * 0.5) * (18 * progress);

      ctx.fillStyle = i % 2 === 0 ? 'rgba(100, 116, 139, 0.75)' : 'rgba(148, 163, 184, 0.65)';
      ctx.beginPath();
      ctx.ellipse(sway, y, radius, radius * 0.35, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Swirling debris particles around funnel
    ctx.fillStyle = '#334155';
    for (let j = 0; j < 14; j++) {
      const angle = anim * 6 + j * 0.8;
      const dist = 40 + (j % 4) * 25;
      const debrisY = -20 - (j * 16);
      ctx.fillRect(Math.cos(angle) * dist, debrisY, 8, 8);
    }
  }

  // --- CHASER: TSUNAMI ---
  private drawTsunami(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    const waveHeight = 220;
    const curl = Math.sin(anim * 3) * 15;

    // Colossal Wave Wall
    const grad = ctx.createLinearGradient(0, 0, 80, -waveHeight);
    grad.addColorStop(0, '#0c4a6e');
    grad.addColorStop(0.7, '#0284c7');
    grad.addColorStop(1, '#38bdf8');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-160, 0);
    ctx.quadraticCurveTo(-40, -waveHeight * 0.7, 50, -waveHeight + curl);
    // Crest curling forward
    ctx.quadraticCurveTo(90, -waveHeight + 40, 20, -waveHeight + 70);
    ctx.quadraticCurveTo(-20, -waveHeight * 0.5, -40, 0);
    ctx.closePath();
    ctx.fill();

    // White foam spray
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(60, -waveHeight + curl, 28, 0, Math.PI * 2);
    ctx.arc(85, -waveHeight + curl + 18, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- CHASER: KRAKEN ---
  private drawKraken(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    // Water froth at base
    ctx.fillStyle = 'rgba(6, 182, 212, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 110, 25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Multiple animated writhing tentacles
    for (let i = 0; i < 4; i++) {
      const offset = (i - 1.5) * 35;
      const wave = Math.sin(anim * 4 + i) * 30;

      ctx.strokeStyle = chaser.color;
      ctx.lineWidth = 20 - i * 2;
      ctx.lineCap = 'round';

      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.quadraticCurveTo(offset + wave * 1.5, -90, offset + 40 + wave, -170 + Math.abs(wave));
      ctx.stroke();

      // Suction cups
      ctx.fillStyle = chaser.secondaryColor;
      ctx.beginPath();
      ctx.arc(offset + wave * 0.8, -70, 5, 0, Math.PI * 2);
      ctx.arc(offset + wave * 1.2, -120, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- CHASER: WEREWOLF ---
  private drawWerewolf(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    const leapY = Math.abs(Math.sin(anim * 6)) * 45;

    ctx.save();
    ctx.translate(0, -leapY);

    // Behemoth fur torso
    ctx.fillStyle = chaser.color;
    ctx.beginPath();
    ctx.ellipse(0, -75, 55, 40, -0.3, 0, Math.PI * 2);
    ctx.fill();

    // Slashing Claws
    ctx.strokeStyle = '#f87171';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(35, -70);
    ctx.lineTo(85, -50);
    ctx.moveTo(35, -60);
    ctx.lineTo(88, -40);
    ctx.stroke();

    // Beast Head with glowing red eyes
    ctx.fillStyle = '#4c1d95';
    ctx.beginPath();
    ctx.arc(45, -100, 22, 0, Math.PI * 2);
    ctx.fill();

    // Snout & Fangs
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(60, -96, 12, 10);

    // Glowing Eyes
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(52, -104, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- CHASER: SERPENT ---
  private drawSerpent(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    // Undulating coils
    ctx.strokeStyle = chaser.color;
    ctx.lineWidth = 38;
    ctx.lineCap = 'round';

    ctx.beginPath();
    ctx.moveTo(-160, -10);
    for (let x = -160; x <= 60; x += 30) {
      const y = -40 + Math.sin(anim * 5 + x * 0.04) * 45;
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Snake Head
    const headY = -50 + Math.sin(anim * 5 + 60 * 0.04) * 45;
    ctx.fillStyle = chaser.secondaryColor;
    ctx.beginPath();
    ctx.ellipse(85, headY, 26, 18, 0.2, 0, Math.PI * 2);
    ctx.fill();

    // Slit eye
    ctx.fillStyle = '#fde047';
    ctx.fillRect(86, headY - 8, 4, 10);
  }

  // --- CHASER: SHADOW MONSTER ---
  private drawShadowMonster(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    // Amorphous dark void body
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.beginPath();
    const radius = 70 + Math.sin(anim * 4) * 12;
    ctx.arc(0, -95, radius, 0, Math.PI * 2);
    ctx.fill();

    // Whipping void tendrils
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI * 2 * i) / 6 + anim * 2;
      const reach = 100 + Math.sin(anim * 5 + i) * 35;
      ctx.strokeStyle = chaser.color;
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.moveTo(0, -95);
      ctx.quadraticCurveTo(
        Math.cos(angle) * (reach * 0.5),
        -95 + Math.sin(angle) * (reach * 0.5),
        Math.cos(angle) * reach,
        -95 + Math.sin(angle) * reach
      );
      ctx.stroke();
    }

    // Glowing violet eyes
    ctx.fillStyle = '#c084fc';
    ctx.beginPath();
    ctx.arc(20, -105, 8, 0, Math.PI * 2);
    ctx.arc(42, -98, 7, 0, Math.PI * 2);
    ctx.fill();
  }

  // --- CHASER: ANCIENT GOLEM ---
  private drawAncientGolem(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    const stomp = Math.abs(Math.sin(anim * 3)) * 14;

    ctx.save();
    ctx.translate(0, -stomp);

    // Stone chest
    ctx.fillStyle = '#451a03';
    ctx.fillRect(-45, -140, 90, 80);

    // Glowing runic core
    ctx.fillStyle = chaser.color;
    ctx.beginPath();
    ctx.arc(0, -100, 16, 0, Math.PI * 2);
    ctx.fill();

    // Heavy stone head
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-22, -180, 44, 38);

    // Glowing eye slits
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-12, -165, 8, 6);
    ctx.fillRect(4, -165, 8, 6);

    // Boulder fist
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.arc(55, -80, 32, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // --- CHASER: WILDFIRE / FIRE ELEMENTAL ---
  private drawWildfireOrElemental(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    const flameHeight = 210;
    for (let i = 0; i < 7; i++) {
      const sway = Math.sin(anim * 7 + i) * 24;
      const x = -80 + i * 28;
      const grad = ctx.createLinearGradient(x, 0, x, -flameHeight);
      grad.addColorStop(0, '#f97316');
      grad.addColorStop(0.5, '#ea580c');
      grad.addColorStop(1, '#ef4444');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.moveTo(x - 25, 0);
      ctx.quadraticCurveTo(x + sway, -flameHeight * 0.6, x, -flameHeight + (i % 2) * 30);
      ctx.quadraticCurveTo(x - sway, -flameHeight * 0.4, x + 25, 0);
      ctx.closePath();
      ctx.fill();
    }
  }

  // --- CHASER: AVALANCHE ---
  private drawAvalanche(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    // Crashing wall of white snow
    const grad = ctx.createLinearGradient(0, 0, 0, -200);
    grad.addColorStop(0, '#cbd5e1');
    grad.addColorStop(1, '#ffffff');
    ctx.fillStyle = grad;

    ctx.beginPath();
    ctx.moveTo(-160, 0);
    for (let x = -160; x <= 60; x += 30) {
      const y = -140 + Math.sin(anim * 6 + x * 0.1) * 30;
      ctx.lineTo(x, y);
    }
    ctx.lineTo(60, 0);
    ctx.closePath();
    ctx.fill();

    // Tumbling snow boulders
    ctx.fillStyle = '#e2e8f0';
    for (let k = 0; k < 5; k++) {
      const bx = -20 + k * 18 + Math.sin(anim * 8 + k) * 12;
      const by = -30 - k * 22;
      ctx.beginPath();
      ctx.arc(bx, by, 14 + k * 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- CHASER: VOLCANIC SURGE ---
  private drawVolcanicSurge(ctx: CanvasRenderingContext2D, chaser: ChaserConfig, anim: number) {
    // Rolling black ash cloud
    ctx.fillStyle = 'rgba(28, 25, 23, 0.85)';
    ctx.beginPath();
    ctx.ellipse(-30, -110, 110, 80, 0, 0, Math.PI * 2);
    ctx.fill();

    // Glowing incandescent magma pockets
    ctx.fillStyle = '#f97316';
    for (let i = 0; i < 6; i++) {
      const px = -60 + i * 22;
      const py = -90 + Math.sin(anim * 6 + i) * 30;
      ctx.beginPath();
      ctx.arc(px, py, 14, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // --- OBSTACLE RENDERING & TELEGRAPHING ---
  private renderObstacles(
    ctx: CanvasRenderingContext2D,
    obstacles: Obstacle[],
    runnerScreenX: number,
    groundY: number,
    w: number
  ) {
    for (const obs of obstacles) {
      // Calculate screen position from world position (meters -> pixels)
      // obs.x is in meters relative to runner
      const screenX = runnerScreenX + obs.x * 24;

      // Only draw if within visible viewport
      if (screenX < -100 || screenX > w + 120) continue;

      ctx.save();
      ctx.translate(screenX, groundY);

      // 1. Draw the physical obstacle
      switch (obs.type) {
        case 'fallen_tree':
          ctx.fillStyle = '#78350f';
          ctx.fillRect(-15, -28, 48, 28);
          // Bark ridges
          ctx.fillStyle = '#451a03';
          ctx.fillRect(-10, -22, 38, 6);
          break;

        case 'rock_spike':
          ctx.fillStyle = '#64748b';
          ctx.beginPath();
          ctx.moveTo(-18, 0);
          ctx.lineTo(8, -44);
          ctx.lineTo(34, 0);
          ctx.closePath();
          ctx.fill();
          break;

        case 'fire_pit':
          ctx.fillStyle = '#ea580c';
          ctx.fillRect(-20, -10, 55, 10);
          // Flames
          ctx.fillStyle = '#fef08a';
          ctx.beginPath();
          ctx.arc(0, -14, 12, 0, Math.PI * 2);
          ctx.arc(18, -16, 14, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'broken_bridge':
        case 'ice_chasm':
          ctx.fillStyle = '#0284c7';
          ctx.fillRect(-25, 0, 60, 25);
          break;

        case 'falling_debris':
        case 'rolling_boulder':
          ctx.fillStyle = '#475569';
          ctx.beginPath();
          ctx.arc(10, -32, 24, 0, Math.PI * 2);
          ctx.fill();
          break;

        default:
          ctx.fillStyle = '#f59e0b';
          ctx.fillRect(-15, -30, 40, 30);
          break;
      }

      // 2. Tactical Telegraph Hologram (Action word prompt)
      // Displayed prominently above the obstacle so the player can react
      if (!obs.cleared && !obs.failed) {
        const promptY = -65;
        // Holographic beacon background
        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-42, promptY - 14, 84, 26, 6);
        ctx.fill();
        ctx.stroke();

        // Pulsing action command text (e.g. "TYPE: JUMP")
        ctx.font = 'bold 13px "JetBrains Mono", monospace';
        ctx.fillStyle = '#38bdf8';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(`[${obs.actionWord}]`, 0, promptY);
      } else if (obs.cleared) {
        // Cleared marker
        ctx.font = 'bold 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#10b981';
        ctx.textAlign = 'center';
        ctx.fillText('CLEARED', 0, -55);
      }

      ctx.restore();
    }
  }

  // --- FLOATING TEXT & EFFECT PARTICLES ---
  private updateAndRenderEffects(ctx: CanvasRenderingContext2D, dt: number) {
    ctx.save();

    // Effect particles (obstacle clears, sparks)
    for (let i = this.effectParticles.length - 1; i >= 0; i--) {
      const p = this.effectParticles[i];
      p.life += dt;
      p.x += p.vx * dt * 40;
      p.y += p.vy * dt * 40;

      const progress = p.life / p.maxLife;
      if (progress >= 1) {
        this.effectParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = p.color;
      ctx.globalAlpha = (1 - progress) * p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // Floating score / streak texts
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y += ft.vy;
      ft.alpha -= dt * 1.2;

      if (ft.alpha <= 0) {
        this.floatingTexts.splice(i, 1);
        continue;
      }

      ctx.font = 'bold 16px "Rajdhani", sans-serif';
      ctx.fillStyle = ft.color;
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
    }

    ctx.restore();
  }

  // --- SPEED LINES ---
  private renderSpeedLines(ctx: CanvasRenderingContext2D, speed: number, w: number, h: number) {
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1.5;

    const lineCount = Math.floor((speed - 12) * 3);
    for (let i = 0; i < lineCount; i++) {
      const y = Math.random() * h;
      const x = Math.random() * w;
      const len = 40 + Math.random() * 80;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + len, y);
      ctx.stroke();
    }
    ctx.restore();
  }

  // --- DANGER VIGNETTE ---
  private renderDangerVignette(ctx: CanvasRenderingContext2D, distance: number, w: number, h: number) {
    const intensity = Math.max(0, Math.min(0.65, (30 - distance) / 25));
    ctx.save();
    const grad = ctx.createRadialGradient(w / 2, h / 2, w * 0.35, w / 2, h / 2, w * 0.7);
    grad.addColorStop(0, 'transparent');
    grad.addColorStop(1, `rgba(239, 68, 68, ${intensity})`);

    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.restore();
  }
}

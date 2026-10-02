import type { DifficultyLevel, TypingStats } from '../types/game';

export class DifficultyEngine {
  private currentDifficulty: DifficultyLevel = 'beginner';
  private difficultyScore: number = 1.0; // 1.0 = beginner, 2.0 = improving, 3.0 = advanced, 4.0 = expert

  // Rolling performance tracking
  private recentKeystrokes: { timestamp: number; correct: boolean }[] = [];
  private readonly ROLLING_WINDOW_MS = 15000; // 15-second window

  // Speed physics
  private currentSpeed: number = 8.0; // meters per second
  private targetSpeed: number = 8.0;
  private readonly MIN_SPEED = 4.0;
  private readonly MAX_SPEED = 24.0;
  private lastKeystrokeTime: number = Date.now();

  public reset(startingDifficulty: DifficultyLevel = 'beginner') {
    this.currentDifficulty = startingDifficulty;
    this.difficultyScore = startingDifficulty === 'beginner' ? 1.0 : startingDifficulty === 'improving' ? 2.0 : startingDifficulty === 'advanced' ? 3.0 : 4.0;
    this.recentKeystrokes = [];
    this.currentSpeed = 8.0;
    this.targetSpeed = 8.0;
    this.lastKeystrokeTime = Date.now();
  }

  /**
   * Registers a keystroke and updates rolling metrics
   */
  public registerKeystroke(correct: boolean) {
    const now = Date.now();
    this.lastKeystrokeTime = now;
    this.recentKeystrokes.push({ timestamp: now, correct });

    // Clean up older than window
    const cutoff = now - this.ROLLING_WINDOW_MS;
    this.recentKeystrokes = this.recentKeystrokes.filter(k => k.timestamp >= cutoff);

    // Speed impact
    if (correct) {
      // Small bump in target speed
      this.targetSpeed = Math.min(this.MAX_SPEED, this.targetSpeed + 0.35);
    } else {
      // Mistake penalty: smooth temporary slowdown
      this.targetSpeed = Math.max(this.MIN_SPEED, this.targetSpeed - 1.2);
    }
  }

  /**
   * Called every tick (dt seconds) to smoothly interpolate player speed,
   * handle momentum loss during typing pauses, and adapt difficulty.
   */
  public update(dt: number, stats: TypingStats): { speed: number; difficulty: DifficultyLevel } {
    const now = Date.now();

    // 1. Momentum loss if player pauses typing for > 1.2s
    const idleTime = (now - this.lastKeystrokeTime) / 1000;
    if (idleTime > 1.2) {
      const decayRate = 1.5; // m/s per second of idle
      this.targetSpeed = Math.max(this.MIN_SPEED, this.targetSpeed - decayRate * dt);
    }

    // 2. Combo bonus to target speed
    let comboBonus = 0;
    if (stats.currentStreak >= 100) comboBonus = 4.0;
    else if (stats.currentStreak >= 50) comboBonus = 2.5;
    else if (stats.currentStreak >= 25) comboBonus = 1.5;
    else if (stats.currentStreak >= 10) comboBonus = 0.8;

    // 3. Base target speed derived from sustained WPM
    // E.g., 20 WPM -> ~8 m/s, 40 WPM -> ~13 m/s, 70 WPM -> ~18 m/s, 100 WPM -> 24 m/s
    const wpmBaseSpeed = Math.min(this.MAX_SPEED, Math.max(this.MIN_SPEED, 5 + stats.wpm * 0.18));
    const finalTarget = Math.min(this.MAX_SPEED, Math.max(this.MIN_SPEED, (this.targetSpeed + wpmBaseSpeed) / 2 + comboBonus));

    // 4. Smooth exponential interpolation (avoid jerky speed changes)
    const lerpRate = 2.5;
    this.currentSpeed += (finalTarget - this.currentSpeed) * Math.min(1, lerpRate * dt);

    // 5. Adaptive Difficulty adjustment using rolling window
    this.adaptDifficulty(stats, dt);

    return {
      speed: this.currentSpeed,
      difficulty: this.currentDifficulty
    };
  }

  private adaptDifficulty(stats: TypingStats, dt: number) {
    if (this.recentKeystrokes.length < 8) return;

    // Calculate rolling accuracy
    const correctCount = this.recentKeystrokes.filter(k => k.correct).length;
    const rollingAccuracy = (correctCount / this.recentKeystrokes.length) * 100;

    // Calculate rolling WPM
    const timeSpanSec = Math.max(1, (Date.now() - this.recentKeystrokes[0].timestamp) / 1000);
    const rollingWpm = (correctCount / 5) / (timeSpanSec / 60);

    // Adaptive adjustment criteria
    // High performance: > 45 WPM and > 95% accuracy -> increase difficulty score smoothly
    if (rollingWpm >= 45 && rollingAccuracy >= 94) {
      this.difficultyScore += 0.05 * dt; // gentle rise over 20 seconds
    } else if (rollingWpm < 25 || rollingAccuracy < 85) {
      // Struggling: reduce pressure smoothly
      this.difficultyScore -= 0.08 * dt;
    }

    // Clamp score 1.0 to 4.0
    this.difficultyScore = Math.max(1.0, Math.min(4.0, this.difficultyScore));

    if (this.difficultyScore < 1.7) {
      this.currentDifficulty = 'beginner';
    } else if (this.difficultyScore < 2.7) {
      this.currentDifficulty = 'improving';
    } else if (this.difficultyScore < 3.5) {
      this.currentDifficulty = 'advanced';
    } else {
      this.currentDifficulty = 'expert';
    }
  }

  public getDifficultyScore(): number {
    return this.difficultyScore;
  }

  public getCurrentDifficulty(): DifficultyLevel {
    return this.currentDifficulty;
  }

  public getObstacleSpawnInterval(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'beginner': return 16; // meters between obstacles
      case 'improving': return 26;
      case 'advanced': return 22;
      case 'expert': return 18;
    }
  }
}

export const difficultyEngine = new DifficultyEngine();

import type { DifficultyLevel, TypingStats } from '../types/game';

/**
 * DifficultyEngine — adaptive speed and difficulty system
 *
 * ## Key fairness rules
 * 1. A single wrong keypress is registered ONCE in the rolling window.
 *    Backspace does NOT insert an additional penalty entry — it just removes
 *    the pending "uncorrected" flag on the most recent mistake.
 * 2. After a mistake, a grace period of `GRACE_PERIOD_SEC` seconds dampens
 *    any further speed or difficulty drop so one typo can't cascade into
 *    three simultaneous penalties (speed drop + combo reset + accuracy drop
 *    triggering another difficulty decrease).
 * 3. Speed target is reduced by at most `MAX_SPEED_PENALTY_PER_MISTAKE`
 *    regardless of how many adaptive factors fire simultaneously.
 */
export class DifficultyEngine {
  private currentDifficulty: DifficultyLevel = 'beginner';
  private difficultyScore: number = 1.0; // 1.0=beginner 2.0=improving 3.0=advanced 4.0=expert

  // Rolling performance tracking — each entry is one actual keystroke
  private recentKeystrokes: { timestamp: number; correct: boolean }[] = [];
  private readonly ROLLING_WINDOW_MS = 15_000; // 15-second window

  // Speed physics
  private currentSpeed: number = 8.0; // m/s
  private targetSpeed: number = 8.0;
  private readonly MIN_SPEED = 4.0;
  private readonly MAX_SPEED = 24.0;
  private lastKeystrokeTime: number = Date.now();

  // Grace / recovery period
  private readonly GRACE_PERIOD_SEC = 1.5;
  private graceCooldownRemaining: number = 0; // seconds remaining in grace period
  private readonly MAX_SPEED_PENALTY_PER_MISTAKE = 1.2; // m/s cap

  public reset(startingDifficulty: DifficultyLevel = 'beginner') {
    this.currentDifficulty = startingDifficulty;
    this.difficultyScore =
      startingDifficulty === 'beginner'  ? 1.0
      : startingDifficulty === 'improving' ? 2.0
      : startingDifficulty === 'advanced'  ? 3.0
      : 4.0;
    this.recentKeystrokes = [];
    this.currentSpeed = 8.0;
    this.targetSpeed = 8.0;
    this.lastKeystrokeTime = Date.now();
    this.graceCooldownRemaining = 0;
  }

  /**
   * Registers a keystroke in the rolling window.
   * - `correct = true`  → correct keypress
   * - `correct = false` → wrong keypress (counted ONCE; backspace corrections
   *   are handled via `registerBackspace()` which does NOT add another entry)
   */
  public registerKeystroke(correct: boolean) {
    const now = Date.now();
    this.lastKeystrokeTime = now;
    this.recentKeystrokes.push({ timestamp: now, correct });

    // Trim entries outside the rolling window
    const cutoff = now - this.ROLLING_WINDOW_MS;
    this.recentKeystrokes = this.recentKeystrokes.filter(k => k.timestamp >= cutoff);

    if (correct) {
      // Small bump in target speed
      this.targetSpeed = Math.min(this.MAX_SPEED, this.targetSpeed + 0.35);
    } else {
      // Only apply speed penalty if not inside a grace period
      if (this.graceCooldownRemaining <= 0) {
        this.targetSpeed = Math.max(
          this.MIN_SPEED,
          this.targetSpeed - this.MAX_SPEED_PENALTY_PER_MISTAKE
        );
      } else {
        // Dampened penalty during grace (25% of normal)
        this.targetSpeed = Math.max(
          this.MIN_SPEED,
          this.targetSpeed - this.MAX_SPEED_PENALTY_PER_MISTAKE * 0.25
        );
      }
      // Begin / restart grace period after every mistake
      this.graceCooldownRemaining = this.GRACE_PERIOD_SEC;
    }
  }

  /**
   * Called when the player presses Backspace.
   * Does NOT add a new entry to the rolling window — the original wrong keypress
   * was already counted once and that is sufficient.
   * Returns nothing; the caller (App.tsx) handles uncorrectedErrors separately.
   */
  public registerBackspace() {
    // No rolling-window entry — backspace corrections are intentionally
    // not double-penalized. Grace period is NOT reset by backspace.
  }

  /**
   * Called every frame (dt seconds). Smoothly interpolates speed, handles
   * idle momentum loss, and re-evaluates difficulty tier.
   */
  public update(dt: number, stats: TypingStats): { speed: number; difficulty: DifficultyLevel } {
    const now = Date.now();

    // Tick down the grace period
    if (this.graceCooldownRemaining > 0) {
      this.graceCooldownRemaining = Math.max(0, this.graceCooldownRemaining - dt);
    }

    // 1. Momentum loss if player pauses typing for >1.2 s
    const idleTime = (now - this.lastKeystrokeTime) / 1000;
    if (idleTime > 1.2) {
      const decayRate = 1.5; // m/s per second of idle
      this.targetSpeed = Math.max(this.MIN_SPEED, this.targetSpeed - decayRate * dt);
    }

    // 2. Combo bonus to target speed
    let comboBonus = 0;
    if (stats.currentStreak >= 100)     comboBonus = 4.0;
    else if (stats.currentStreak >= 50) comboBonus = 2.5;
    else if (stats.currentStreak >= 25) comboBonus = 1.5;
    else if (stats.currentStreak >= 10) comboBonus = 0.8;

    // 3. WPM-derived base speed
    const wpmBaseSpeed = Math.min(
      this.MAX_SPEED,
      Math.max(this.MIN_SPEED, 5 + stats.wpm * 0.18)
    );
    const finalTarget = Math.min(
      this.MAX_SPEED,
      Math.max(this.MIN_SPEED, (this.targetSpeed + wpmBaseSpeed) / 2 + comboBonus)
    );

    // 4. Smooth exponential interpolation
    const lerpRate = 2.5;
    this.currentSpeed += (finalTarget - this.currentSpeed) * Math.min(1, lerpRate * dt);

    // 5. Adaptive difficulty adjustment (suppressed during grace period)
    this.adaptDifficulty(stats, dt);

    return { speed: this.currentSpeed, difficulty: this.currentDifficulty };
  }

  private adaptDifficulty(stats: TypingStats, dt: number) {
    if (this.recentKeystrokes.length < 8) return;

    const correctCount = this.recentKeystrokes.filter(k => k.correct).length;
    const rollingAccuracy = (correctCount / this.recentKeystrokes.length) * 100;
    const timeSpanSec = Math.max(
      1,
      (Date.now() - this.recentKeystrokes[0].timestamp) / 1000
    );
    const rollingWpm = (correctCount / 5) / (timeSpanSec / 60);

    if (rollingWpm >= 45 && rollingAccuracy >= 94) {
      // High performance → gradually raise difficulty
      this.difficultyScore += 0.05 * dt;
    } else if (rollingWpm < 25 || rollingAccuracy < 85) {
      // Struggling → reduce pressure, but dampen during grace period
      const reductionRate = this.graceCooldownRemaining > 0 ? 0.02 : 0.08;
      this.difficultyScore -= reductionRate * dt;
    }

    this.difficultyScore = Math.max(1.0, Math.min(4.0, this.difficultyScore));

    if      (this.difficultyScore < 1.7) this.currentDifficulty = 'beginner';
    else if (this.difficultyScore < 2.7) this.currentDifficulty = 'improving';
    else if (this.difficultyScore < 3.5) this.currentDifficulty = 'advanced';
    else                                  this.currentDifficulty = 'expert';
  }

  public getDifficultyScore(): number { return this.difficultyScore; }
  public getCurrentDifficulty(): DifficultyLevel { return this.currentDifficulty; }
  public getGraceCooldownRemaining(): number { return this.graceCooldownRemaining; }

  public getObstacleSpawnInterval(difficulty: DifficultyLevel): number {
    switch (difficulty) {
      case 'beginner':  return 16;
      case 'improving': return 26;
      case 'advanced':  return 22;
      case 'expert':    return 18;
    }
  }
}

export const difficultyEngine = new DifficultyEngine();

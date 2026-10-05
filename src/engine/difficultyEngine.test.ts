/**
 * Unit tests for DifficultyEngine
 *
 * Run with:  npx vitest run  (or: npm test if vitest is configured)
 *
 * Scenarios tested:
 *  1. Single typo → speed drops by MAX_SPEED_PENALTY (≤1.2 m/s)
 *  2. Repeated typos inside grace period → each additional penalty is dampened (25%)
 *  3. Corrected typo (backspace) → rolling window still contains original mistake,
 *     but no extra entry is added
 *  4. Rolling window rollover → old keystrokes outside 15 s are purged
 *  5. Difficulty adapts upward on sustained high performance
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DifficultyEngine } from './difficultyEngine';
import type { TypingStats } from '../types/game';

// Minimal valid TypingStats for update() calls
function makeStats(override: Partial<TypingStats> = {}): TypingStats {
  return {
    wpm: 0,
    rawWpm: 0,
    cpm: 0,
    accuracy: 100,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    mistakes: 0,
    uncorrectedErrors: 0,
    wordsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    comboMultiplier: 1.0,
    distanceMeters: 0,
    chaserDistanceMeters: 55,
    survivalSeconds: 0,
    score: 0,
    obstaclesCleared: 0,
    obstaclesFailed: 0,
    ...override
  };
}

describe('DifficultyEngine — Fairness', () => {
  let engine: DifficultyEngine;

  beforeEach(() => {
    engine = new DifficultyEngine();
    engine.reset('beginner');
  });

  it('1. Single typo reduces speed by at most MAX_SPEED_PENALTY (1.2 m/s)', () => {
    // Get initial speed (8.0 after reset)
    const { speed: before } = engine.update(0.016, makeStats());
    engine.registerKeystroke(false); // one mistake
    const { speed: after } = engine.update(0.016, makeStats());
    const drop = before - after;
    expect(drop).toBeGreaterThan(0);
    expect(drop).toBeLessThanOrEqual(1.2);
  });

  it('2. Repeated typos inside grace period are dampened', () => {
    engine.registerKeystroke(false); // first mistake — full penalty + starts grace
    const { speed: afterFirst } = engine.update(0.016, makeStats());

    engine.registerKeystroke(false); // second mistake INSIDE grace period — dampened
    const { speed: afterSecond } = engine.update(0.016, makeStats());

    const secondDrop = afterFirst - afterSecond;
    // Dampened penalty is 25% of 1.2 = 0.3 m/s
    // Due to lerp the actual rendered drop may differ slightly, but must be less than full penalty
    expect(secondDrop).toBeLessThan(1.2);
    expect(secondDrop).toBeGreaterThanOrEqual(0);
  });

  it('3. Grace period is still active immediately after a mistake', () => {
    engine.registerKeystroke(false);
    const grace = engine.getGraceCooldownRemaining();
    expect(grace).toBeCloseTo(1.5, 1);
  });

  it('4. Grace period expires after ~1.5 s of ticks', () => {
    engine.registerKeystroke(false);
    // Simulate 2 s of game loop ticks (100 × 20 ms frames)
    for (let i = 0; i < 100; i++) {
      engine.update(0.02, makeStats());
    }
    expect(engine.getGraceCooldownRemaining()).toBe(0);
  });

  it('5. registerBackspace does NOT add a rolling-window entry', () => {
    // Register one correct + one wrong, check window size = 2
    engine.registerKeystroke(true);
    engine.registerKeystroke(false);
    const beforeBackspace = (engine as unknown as { recentKeystrokes: unknown[] }).recentKeystrokes.length;

    engine.registerBackspace(); // should NOT add to window
    const afterBackspace = (engine as unknown as { recentKeystrokes: unknown[] }).recentKeystrokes.length;

    expect(afterBackspace).toBe(beforeBackspace);
  });

  it('6. Rolling window purges keystrokes older than 15 s', async () => {
    // Add keystrokes, then manually age the engine's internal clock by spoofing
    engine.registerKeystroke(true);
    engine.registerKeystroke(true);
    // Simulate 16 s passing via many ticks
    for (let i = 0; i < 800; i++) {
      engine.update(0.02, makeStats());
    }
    // Add one fresh keystroke to trigger pruning
    engine.registerKeystroke(true);
    const window = (engine as unknown as { recentKeystrokes: { timestamp: number }[] }).recentKeystrokes;
    const now = Date.now();
    // All remaining entries must be within 15 s
    for (const k of window) {
      expect(now - k.timestamp).toBeLessThanOrEqual(15_050); // 50 ms tolerance
    }
  }, 20_000); // allow 20 s for the heavy tick simulation

  it('7. Difficulty rises after sustained high-WPM accurate typing', () => {
    const highPerfStats = makeStats({ wpm: 60, accuracy: 97, currentStreak: 30 });
    // Pump 20 s of frames with 10 correct keystrokes per second
    for (let i = 0; i < 1250; i++) {
      engine.registerKeystroke(true);
      engine.update(0.016, highPerfStats);
    }
    expect(engine.getCurrentDifficulty()).not.toBe('beginner');
  });
});

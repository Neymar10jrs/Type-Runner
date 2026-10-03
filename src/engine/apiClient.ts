import type { PlayerProfile, GameSettings, RunRecord, GameMode } from '../types/game';
import { StorageManager, DEFAULT_PROFILE, DEFAULT_SETTINGS } from './storage';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '/api';

export interface StandardizedRunPayload {
  mode: GameMode;
  wpm: number;
  accuracy: number;
  distance: number;
  score: number;
  coinsEarned: number;
  xpEarned: number;
  duration: number;
  timestamp: number;
  chaserId?: string;
  chaserName?: string;
  won?: boolean;
  maxCombo?: number;
}

export class ApiClient {
  private static isOnline: boolean = true;
  private static lastError: string | null = null;
  private static listeners: Array<(online: boolean, error: string | null) => void> = [];

  public static subscribe(fn: (online: boolean, error: string | null) => void): () => void {
    this.listeners.push(fn);
    fn(this.isOnline, this.lastError);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private static notify(online: boolean, err: string | null) {
    this.isOnline = online;
    this.lastError = err;
    this.listeners.forEach(fn => fn(online, err));
  }

  public static async checkHealth(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/health`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        this.notify(true, null);
        return true;
      }
      this.notify(false, 'Backend server returned non-200 status');
      return false;
    } catch {
      this.notify(false, 'Unable to connect to backend server. Running in offline fallback mode.');
      return false;
    }
  }

  public static async getProfile(): Promise<PlayerProfile> {
    try {
      const res = await fetch(`${API_BASE}/profile`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.notify(true, null);
          StorageManager.saveProfile(data.profile);
          return data.profile;
        }
      }
    } catch {
      this.notify(false, 'Network error. Loaded profile from local cache.');
    }
    return StorageManager.getProfile();
  }

  public static async saveProfile(profile: Partial<PlayerProfile>): Promise<PlayerProfile> {
    // Always persist to local cache first
    const local = StorageManager.getProfile();
    const updated = { ...local, ...profile };
    StorageManager.saveProfile(updated);

    try {
      const res = await fetch(`${API_BASE}/profile`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.notify(true, null);
          return data.profile;
        }
      }
    } catch {
      this.notify(false, 'Offline: Changes saved locally and will sync once backend is restored.');
    }
    return updated;
  }

  public static async getSettings(): Promise<GameSettings> {
    try {
      const res = await fetch(`${API_BASE}/settings`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.settings) {
          this.notify(true, null);
          StorageManager.saveSettings(data.settings);
          return data.settings;
        }
      }
    } catch {
      this.notify(false, 'Loaded settings from local storage.');
    }
    return StorageManager.getSettings();
  }

  public static async saveSettings(settings: GameSettings): Promise<GameSettings> {
    StorageManager.saveSettings(settings);
    try {
      const res = await fetch(`${API_BASE}/settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        signal: AbortSignal.timeout(4000)
      });
      if (res.ok) {
        this.notify(true, null);
      }
    } catch {
      this.notify(false, 'Saved settings locally.');
    }
    return settings;
  }

  public static async recordRun(record: RunRecord): Promise<{ profile: PlayerProfile; isNewBest: boolean }> {
    // Update local cache first
    const localResult = StorageManager.recordRun(record);

    // Standardized data model: { mode, wpm, accuracy, distance, score, coinsEarned, xpEarned, duration, timestamp }
    const payload: StandardizedRunPayload = {
      mode: record.mode,
      wpm: Math.round(record.wpm),
      accuracy: Math.round(record.accuracy),
      distance: Math.round(record.distanceMeters),
      score: record.score,
      coinsEarned: record.coinsEarned,
      xpEarned: record.xpEarned,
      duration: Math.round(record.survivalSeconds),
      timestamp: record.timestamp || Date.now(),
      chaserId: record.chaserId,
      chaserName: record.chaserName,
      won: record.won,
      maxCombo: record.maxCombo
    };

    try {
      const res = await fetch(`${API_BASE}/runs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          this.notify(true, null);
          StorageManager.saveProfile(data.profile);
          return { profile: data.profile, isNewBest: Boolean(data.isNewBest) };
        }
      }
    } catch {
      this.notify(false, 'Run progress saved to local storage (Backend sync offline).');
    }

    return localResult;
  }

  public static async getRuns(mode?: GameMode): Promise<RunRecord[]> {
    try {
      const url = mode ? `${API_BASE}/runs?mode=${mode}` : `${API_BASE}/runs`;
      const res = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.runs)) {
          this.notify(true, null);
          return data.runs.map((r: StandardizedRunPayload & { id?: string }) => ({
            id: r.id || Math.random().toString(),
            timestamp: r.timestamp,
            mode: r.mode,
            chaserId: (r.chaserId as any) || 'dragon',
            chaserName: r.chaserName || 'Pursuer',
            wpm: r.wpm,
            maxWpm: r.wpm,
            accuracy: r.accuracy,
            score: r.score,
            distanceMeters: r.distance,
            survivalSeconds: r.duration,
            won: Boolean(r.won),
            maxCombo: r.maxCombo || 0,
            coinsEarned: r.coinsEarned,
            xpEarned: r.xpEarned
          }));
        }
      }
    } catch {
      this.notify(false, 'Loaded runs history from local storage.');
    }

    const localRuns = StorageManager.getProfile().recentRuns || [];
    return mode ? localRuns.filter(r => r.mode === mode) : localRuns;
  }

  public static async getAnalytics(): Promise<any> {
    try {
      const res = await fetch(`${API_BASE}/analytics`, { signal: AbortSignal.timeout(3000) });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          this.notify(true, null);
          return data;
        }
      }
    } catch {
      this.notify(false, 'Loaded local stats.');
    }
    return null;
  }
}


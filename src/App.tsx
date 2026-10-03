import React, { useState, useEffect, useRef, useCallback } from 'react';
import type {
  GameMode,
  ChaserConfig,
  EnvironmentConfig,
  DifficultyLevel,
  PlayerActionState,
  Obstacle,
  TypingStats,
  PlayerProfile,
  GameSettings,
  RunRecord,
  ChallengeDef
} from './types/game';
import { CHASERS, ENVIRONMENTS, getRandomChaser } from './engine/chasers';
import { TextGenerator } from './engine/textGenerator';
import { difficultyEngine } from './engine/difficultyEngine';
import { sound } from './audio/soundEngine';
import { StorageManager } from './engine/storage';
import { GameRenderer } from './renderer/GameRenderer';
import { ApiClient } from './engine/apiClient';
import { StartScreen } from './components/StartScreen';
import { GameHUD } from './components/GameHUD';
import { GameOverModal } from './components/GameOverModal';
import { StatsDashboard } from './components/StatsDashboard';
import { CustomizationModal } from './components/CustomizationModal';
import { SettingsModal } from './components/SettingsModal';
import { ChallengesModal } from './components/ChallengesModal';
import { PauseModal } from './components/PauseModal';
import { Zap, AlertTriangle } from 'lucide-react';

type AppScreen = 'start' | 'playing' | 'gameover';

const INITIAL_SENTENCE = 'The ancient forest was silent before the storm arrived.';

export function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<GameRenderer | null>(null);

  // Persistence
  const [profile, setProfile] = useState<PlayerProfile>(() => StorageManager.getProfile());
  const [settings, setSettings] = useState<GameSettings>(() => StorageManager.getSettings());

  // Backend Sync Status
  const [apiOnline, setApiOnline] = useState<boolean>(true);
  const [apiError, setApiError] = useState<string | null>(null);

  // Screen & Modals
  const [screen, setScreen] = useState<AppScreen>('start');
  const [countdown, setCountdown] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [showLocker, setShowLocker] = useState<boolean>(false);
  const [showStats, setShowStats] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showChallenges, setShowChallenges] = useState<boolean>(false);

  // Active Game Configuration
  const [mode, setMode] = useState<GameMode>('endless');
  const [activeChallenge, setActiveChallenge] = useState<ChallengeDef | null>(null);
  const [chaser, setChaser] = useState<ChaserConfig>(CHASERS.dragon);
  const [environment, setEnvironment] = useState<EnvironmentConfig>(ENVIRONMENTS.ancient_forest);

  // Typing state — Sentence initialized immediately so it appears right on the front page
  const [currentText, setCurrentText] = useState<string>(INITIAL_SENTENCE);
  const [typedText, setTypedText] = useState<string>('');
  const [activeObstacle, setActiveObstacle] = useState<Obstacle | null>(null);

  // Real-time Gameplay Stats
  const [stats, setStats] = useState<TypingStats>({
    wpm: 0,
    rawWpm: 0,
    cpm: 0,
    accuracy: 100,
    totalKeystrokes: 0,
    correctKeystrokes: 0,
    mistakes: 0,
    wordsCompleted: 0,
    currentStreak: 0,
    bestStreak: 0,
    comboMultiplier: 1.0,
    distanceMeters: 0,
    chaserDistanceMeters: 55,
    survivalSeconds: 0,
    score: 0,
    obstaclesCleared: 0,
    obstaclesFailed: 0
  });

  const [difficulty, setDifficulty] = useState<DifficultyLevel>('beginner');
  const [lastRunRecord, setLastRunRecord] = useState<RunRecord | null>(null);
  const [isNewPersonalBest, setIsNewPersonalBest] = useState<boolean>(false);

  // Engine refs for high-frequency game loop
  const statsRef = useRef(stats);
  statsRef.current = stats;

  const playerStateRef = useRef<PlayerActionState>('running');
  const playerStateTimerRef = useRef<number>(0);
  const runnerSpeedRef = useRef<number>(8.0);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const footstepTimerRef = useRef<number>(0);
  const chaserRoarTimerRef = useRef<number>(0);
  const currentTextRef = useRef(currentText);
  currentTextRef.current = currentText;
  const typedTextRef = useRef(typedText);
  typedTextRef.current = typedText;
  const countdownRef = useRef(countdown);
  countdownRef.current = countdown;
  const audioStartedRef = useRef<boolean>(false);

  // Initialize Canvas Renderer on mount
  useEffect(() => {
    if (canvasRef.current && !rendererRef.current) {
      rendererRef.current = new GameRenderer(canvasRef.current);
    }

    const handleResize = () => {
      rendererRef.current?.resize();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Sync settings with sound engine on mount
  useEffect(() => {
    sound.setVolumes(
      settings.masterVolume,
      settings.sfxVolume,
      settings.musicVolume,
      settings.ambientVolume
    );
    sound.setKeyboardType(settings.keyboardSoundType);
  }, [settings]);

  // Sync profile and settings with backend server on mount
  useEffect(() => {
    ApiClient.getProfile().then(p => {
      if (p) setProfile(p);
    }).catch(console.error);

    ApiClient.getSettings().then(s => {
      if (s) setSettings(s);
    }).catch(console.error);

    const unsubscribe = ApiClient.subscribe((online, err) => {
      setApiOnline(online);
      setApiError(err);
    });

    return () => unsubscribe();
  }, []);

  // Pre-game countdown tick effect (3 -> 2 -> 1 -> RUN! -> null)
  useEffect(() => {
    if (countdown === null) return;
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(prev => (prev !== null && prev > 1 ? prev - 1 : 0));
        sound.playBlip();
      }, 700);
      return () => clearTimeout(timer);
    } else if (countdown === 0) {
      sound.playJump();
      const timer = setTimeout(() => {
        setCountdown(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  /**
   * Spawns a new dynamic obstacle ahead of the player
   */
  const spawnObstacle = useCallback((minDistanceAhead: number = 48) => {
    const obstacleTypes = [
      'fallen_tree',
      'rock_spike',
      'fire_pit',
      'broken_bridge',
      'falling_debris'
    ] as const;
    const type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
    const actionWord = TextGenerator.getActionCommand();

    const newObs: Obstacle = {
      id: Math.random().toString(),
      type,
      x: minDistanceAhead + Math.random() * 18,
      y: 0,
      width: 40,
      height: 30,
      cleared: false,
      failed: false,
      requiredSpeed: 14.0, // High speed can auto-hurdle
      actionWord,
      label: actionWord
    };

    obstaclesRef.current.push(newObs);
  }, []);

  /**
   * Starts or resets a run
   */
  const startRun = useCallback(
    (chosenMode: GameMode = 'endless', chosenChaserId?: string, challenge?: ChallengeDef) => {
      sound.resume();
      sound.startMusic();
      audioStartedRef.current = true;

      let selectedChaser: ChaserConfig;
      if (challenge) {
        selectedChaser = CHASERS[challenge.chaserId] || CHASERS.dragon;
      } else if (chosenMode === 'creature_hunt') {
        if (chosenChaserId && CHASERS[chosenChaserId as keyof typeof CHASERS]?.category === 'creature') {
          selectedChaser = CHASERS[chosenChaserId as keyof typeof CHASERS];
        } else {
          selectedChaser = getRandomChaser(undefined, 'creature');
        }
      } else if (chosenMode === 'disaster_run') {
        if (chosenChaserId && CHASERS[chosenChaserId as keyof typeof CHASERS]?.category === 'disaster') {
          selectedChaser = CHASERS[chosenChaserId as keyof typeof CHASERS];
        } else {
          selectedChaser = getRandomChaser(undefined, 'disaster');
        }
      } else if (chosenMode === 'practice') {
        selectedChaser = CHASERS.werewolf; // Peaceful forest theme, pursuer hidden
      } else if (chosenMode === 'time_attack') {
        selectedChaser = CHASERS.dragon;
      } else {
        selectedChaser = getRandomChaser();
      }

      const selectedEnv = chosenMode === 'practice'
        ? ENVIRONMENTS.ancient_forest
        : (ENVIRONMENTS[selectedChaser.environment] || ENVIRONMENTS.ancient_forest);

      setChaser(selectedChaser);
      setEnvironment(selectedEnv);
      setMode(chosenMode);
      setActiveChallenge(challenge || null);

      rendererRef.current?.initWeather(selectedEnv);

      // Reset difficulty & metrics
      difficultyEngine.reset('beginner');
      runnerSpeedRef.current = 8.0;
      playerStateRef.current = 'running';
      obstaclesRef.current = [];
      spawnObstacle(40);

      const initialText = challenge
        ? TextGenerator.getChallengeText(challenge.id)[0]
        : TextGenerator.getModeInitialSentence(chosenMode, selectedChaser.id);

      setCurrentText(initialText);
      setTypedText('');
      setActiveObstacle(null);

      const initialStats: TypingStats = {
        wpm: 0,
        rawWpm: 0,
        cpm: 0,
        accuracy: 100,
        totalKeystrokes: 0,
        correctKeystrokes: 0,
        mistakes: 0,
        wordsCompleted: 0,
        currentStreak: 0,
        bestStreak: 0,
        comboMultiplier: 1.0,
        distanceMeters: 0,
        chaserDistanceMeters: chosenMode === 'practice' ? 999 : chosenMode === 'time_attack' ? 70 : 55,
        survivalSeconds: 0,
        score: 0,
        obstaclesCleared: 0,
        obstaclesFailed: 0
      };

      setStats(initialStats);
      setDifficulty('beginner');
      setIsPaused(false);
      setScreen('playing');
      setCountdown(3);
      sound.playBlip();
    },
    [spawnObstacle]
  );

  /**
   * Concludes a run (loss or victory)
   */
  const handleGameOver = useCallback(
    (won: boolean) => {
      sound.stopMusic();
      const currentStats = statsRef.current;

      const baseCoins = Math.floor(currentStats.score / 60) + currentStats.obstaclesCleared * 10;
      const baseXP = Math.floor(currentStats.distanceMeters * 0.4) + (won ? 300 : 80);

      const record: RunRecord = {
        id: Math.random().toString(36).substring(2, 9),
        timestamp: Date.now(),
        mode,
        chaserId: chaser.id,
        chaserName: chaser.name,
        wpm: Math.round(currentStats.wpm),
        maxWpm: Math.round(currentStats.rawWpm),
        accuracy: Math.round(currentStats.accuracy),
        score: currentStats.score,
        distanceMeters: Math.round(currentStats.distanceMeters),
        survivalSeconds: Math.round(currentStats.survivalSeconds),
        won,
        maxCombo: currentStats.bestStreak,
        coinsEarned: baseCoins,
        xpEarned: baseXP
      };

      setLastRunRecord(record);
      setScreen('gameover');

      // Persist run via ApiClient and update profile state
      ApiClient.recordRun(record)
        .then(({ profile: updatedProfile, isNewBest }) => {
          setProfile(updatedProfile);
          setIsNewPersonalBest(isNewBest);
        })
        .catch(err => {
          console.error('ApiClient recordRun error:', err);
          const { profile: updatedProfile, isNewBest } = StorageManager.recordRun(record);
          setProfile(updatedProfile);
          setIsNewPersonalBest(isNewBest);
        });
    },
    [chaser, mode]
  );

  /**
   * Keystroke Input Handler
   */
  const handleKeystroke = useCallback(
    (char: string) => {
      if (screen !== 'playing' || isPaused) return;

      // If in countdown, dismiss countdown immediately so typing flows without delay
      if (countdownRef.current !== null) {
        setCountdown(null);
      }

      // Ensure audio starts on very first key press
      if (!audioStartedRef.current) {
        sound.init();
        sound.resume();
        sound.startMusic();
        audioStartedRef.current = true;
      }

      const targetText = currentTextRef.current;
      const curTyped = typedTextRef.current;
      const nextChar = targetText[curTyped.length];
      const curStats = { ...statsRef.current };

      curStats.totalKeystrokes += 1;

      const activeObs = obstaclesRef.current.find(o => !o.cleared && !o.failed && o.x < 24 && o.x > 0);

      if (char === nextChar) {
        // --- CORRECT KEYSTROKE ---
        curStats.correctKeystrokes += 1;
        curStats.currentStreak += 1;
        if (curStats.currentStreak > curStats.bestStreak) {
          curStats.bestStreak = curStats.currentStreak;
        }

        // Combo multiplier progression
        if (curStats.currentStreak >= 100) {
          curStats.comboMultiplier = 3.0;
        } else if (curStats.currentStreak >= 50) {
          curStats.comboMultiplier = 2.0;
        } else if (curStats.currentStreak >= 25) {
          curStats.comboMultiplier = 1.5;
        } else if (curStats.currentStreak >= 10) {
          curStats.comboMultiplier = 1.2;
        } else {
          curStats.comboMultiplier = 1.0;
        }

        // Keystroke sound with ascending pitch
        sound.playKeyClick(char, true, curStats.currentStreak);
        difficultyEngine.registerKeystroke(true);

        // Milestone notifications
        if (curStats.currentStreak === 10 || curStats.currentStreak === 25 || curStats.currentStreak === 50) {
          sound.playComboMilestone(curStats.comboMultiplier);
          rendererRef.current?.addFloatingText(
            `STREAK ×${curStats.currentStreak}!`,
            400,
            rendererRef.current ? 300 : 250,
            '#f59e0b'
          );
        }

        const newTyped = curTyped + char;
        typedTextRef.current = newTyped;
        setTypedText(newTyped);

        // Word completed check
        if (char === ' ' || newTyped.length === targetText.length) {
          curStats.wordsCompleted += 1;
          curStats.score += Math.round(50 * curStats.comboMultiplier);
        }

        // PASSAGE COMPLETED: Generate next challenge seamlessly
        if (newTyped.length === targetText.length) {
          sound.playSpeedBoost();
          rendererRef.current?.addFloatingText('PERFECT!', 420, 260, '#10b981');

          const nextPassage = activeChallenge
            ? TextGenerator.getChallengeText(activeChallenge.id)[
                curStats.wordsCompleted % TextGenerator.getChallengeText(activeChallenge.id).length
              ]
            : TextGenerator.getNextChallenge(
                difficultyEngine.getCurrentDifficulty(),
                chaser.id,
                curStats.wordsCompleted
              );

          currentTextRef.current = nextPassage;
          typedTextRef.current = '';
          setCurrentText(nextPassage);
          setTypedText('');
        }
      } else {
        // --- MISTAKE ---
        curStats.mistakes += 1;
        curStats.currentStreak = 0;
        curStats.comboMultiplier = 1.0;

        sound.playKeyClick(char, false, 0);
        difficultyEngine.registerKeystroke(false);

        if (settings.screenShake && !settings.reducedMotion) {
          rendererRef.current?.triggerScreenShake(7);
        }
        rendererRef.current?.addFloatingText('MISS', 380, 290, '#ef4444');

        // Immediate failure for Zero-Mistake challenges
        if (activeChallenge?.zeroMistakesAllowed) {
          rendererRef.current?.addFloatingText('FLAWLESS TRIAL FAILED', 400, 200, '#ef4444');
          handleGameOver(false);
          return;
        }
      }

      // If obstacle is active and close, and player is typing successfully:
      if (activeObs && curStats.currentStreak >= 3) {
        activeObs.cleared = true;
        curStats.obstaclesCleared += 1;
        curStats.score += 200;
        playerStateRef.current = activeObs.actionWord === 'SLIDE' ? 'sliding' : 'jumping';
        playerStateTimerRef.current = 0.55;

        if (activeObs.actionWord === 'SLIDE') sound.playSlide();
        else sound.playJump();

        rendererRef.current?.spawnObstacleClearEffect(340, 480);
        rendererRef.current?.addFloatingText(`+200 ${activeObs.actionWord}!`, 380, 240, '#38bdf8');
      }

      setStats(curStats);
    },
    [screen, isPaused, activeChallenge, chaser.id, settings, handleGameOver]
  );

  const handleBackspace = useCallback(() => {
    if (typedTextRef.current.length > 0) {
      const nextTyped = typedTextRef.current.slice(0, -1);
      typedTextRef.current = nextTyped;
      setTypedText(nextTyped);
    }
  }, []);

  /**
   * GLOBAL KEYDOWN LISTENER: Guarantees typing works immediately anywhere on the page
   */
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // If modal is active, allow Esc to close modal
      if (showLocker || showStats || showSettings || showChallenges) {
        if (e.key === 'Escape') {
          setShowLocker(false);
          setShowStats(false);
          setShowSettings(false);
          setShowChallenges(false);
        }
        return;
      }

      if (screen === 'gameover') {
        if (e.key === 'Enter' || e.key === ' ') {
          startRun(mode, chaser.id, activeChallenge || undefined);
        }
        return;
      }

      if (screen === 'start') {
        return;
      }

      if (e.key === 'Escape') {
        e.preventDefault();
        setIsPaused(prev => !prev);
        return;
      }

      if (isPaused) return;

      // Prevent space from scrolling page
      if (e.key === ' ') {
        e.preventDefault();
      }

      if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
        return;
      }

      // Printable single character
      if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        handleKeystroke(e.key);
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    screen,
    isPaused,
    showLocker,
    showStats,
    showSettings,
    showChallenges,
    handleKeystroke,
    handleBackspace,
    startRun,
    mode,
    chaser.id,
    activeChallenge
  ]);

  /**
   * Main High-Performance Game Loop
   */
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.08);
      lastTime = currentTime;

      const isPlaying = screen === 'playing' && !isPaused;
      const curStats = { ...statsRef.current };

      if (isPlaying) {
        if (countdownRef.current !== null) {
          if (rendererRef.current) {
            rendererRef.current.render(
              dt,
              0,
              'idle',
              chaser,
              environment,
              obstaclesRef.current,
              curStats.chaserDistanceMeters,
              profile.equippedSkin,
              profile.equippedTrail,
              curStats.currentStreak,
              settings.reducedMotion,
              mode
            );
          }
          animationFrameId = requestAnimationFrame(loop);
          return;
        }

        curStats.survivalSeconds += dt;

        // Check Time Attack mode timer (90s)
        if (mode === 'time_attack' && curStats.survivalSeconds >= 90) {
          handleGameOver(true);
          return;
        }

        // Check Creature Hunt victory condition (outrun to 95m lead or reach 800m distance)
        if (mode === 'creature_hunt' && (curStats.chaserDistanceMeters >= 95 || curStats.distanceMeters >= 800)) {
          handleGameOver(true);
          return;
        }

        // Check Disaster Run victory condition (evacuation bunker reached at 1,000m or safe distance lead)
        if (mode === 'disaster_run' && (curStats.chaserDistanceMeters >= 95 || curStats.distanceMeters >= 1000)) {
          handleGameOver(true);
          return;
        }

        // Check Challenge target distance
        if (
          activeChallenge?.targetDistanceMeters &&
          curStats.distanceMeters >= activeChallenge.targetDistanceMeters
        ) {
          const metWpm = curStats.wpm >= (activeChallenge.targetWpm || 0);
          const metAcc = curStats.accuracy >= (activeChallenge.targetAccuracy || 0);
          handleGameOver(metWpm && metAcc);
          return;
        }

        // Check Challenge time limit
        if (
          activeChallenge?.timeLimitSeconds &&
          curStats.survivalSeconds >= activeChallenge.timeLimitSeconds
        ) {
          const metWpm = curStats.wpm >= (activeChallenge.targetWpm || 0);
          const metAcc = curStats.accuracy >= (activeChallenge.targetAccuracy || 0);
          handleGameOver(metWpm && metAcc);
          return;
        }

        // 1. Difficulty & Speed Physics
        const { speed, difficulty: currentDiff } = difficultyEngine.update(dt, curStats);
        runnerSpeedRef.current = speed;
        setDifficulty(currentDiff);

        // 2. Compute WPM & Accuracy
        const elapsedMinutes = Math.max(0.05, curStats.survivalSeconds / 60);
        const calcWpm = (curStats.correctKeystrokes / 5) / elapsedMinutes;
        curStats.wpm = calcWpm;
        curStats.rawWpm = Math.max(curStats.rawWpm, calcWpm);
        curStats.cpm = curStats.correctKeystrokes / elapsedMinutes;
        curStats.accuracy =
          curStats.totalKeystrokes > 0
            ? (curStats.correctKeystrokes / curStats.totalKeystrokes) * 100
            : 100;

        // 3. Distance & Score
        curStats.distanceMeters += speed * dt;
        curStats.score += Math.round(speed * 1.6 * curStats.comboMultiplier * dt * 10);

        // 4. Chaser Pursuit Physics
        if (mode !== 'practice') {
          const chaserBase = chaser.baseSpeed;
          const diffFactor = difficultyEngine.getDifficultyScore();
          const effectiveChaserSpeed = chaserBase * (0.95 + (diffFactor - 1) * 0.08);

          const relativeSpeed = speed - effectiveChaserSpeed;
          curStats.chaserDistanceMeters += relativeSpeed * dt;

          if (mode === 'time_attack') {
            // In 90s Time Attack, keep minimum distance at 20m so player completes full sprint test
            curStats.chaserDistanceMeters = Math.max(20, Math.min(100, curStats.chaserDistanceMeters));
          } else {
            curStats.chaserDistanceMeters = Math.max(0, Math.min(100, curStats.chaserDistanceMeters));

            // Caught by chaser?
            if (curStats.chaserDistanceMeters <= 0) {
              playerStateRef.current = 'defeat';
              handleGameOver(false);
              return;
            }
          }

          sound.updateChaseDanger(curStats.chaserDistanceMeters);

          // Random chaser roar every 15s (only in dangerous pursuit modes)
          if (mode !== 'time_attack') {
            chaserRoarTimerRef.current += dt;
            if (chaserRoarTimerRef.current > 15) {
              chaserRoarTimerRef.current = 0;
              sound.playRoar(chaser.category);
            }
          }
        }

        // 5. Footsteps Audio Cadence
        footstepTimerRef.current += dt;
        const footstepInterval = Math.max(0.2, 0.45 / (speed / 8.0));
        if (footstepTimerRef.current >= footstepInterval) {
          footstepTimerRef.current = 0;
          sound.playFootstep(speed / 8.0);
        }

        // 6. Action State Timer (Jump / Slide duration)
        if (playerStateTimerRef.current > 0) {
          playerStateTimerRef.current -= dt;
          if (playerStateTimerRef.current <= 0) {
            playerStateRef.current = speed > 15 ? 'sprint' : 'running';
          }
        } else {
          playerStateRef.current = speed > 15 ? 'sprint' : 'running';
        }

        // 7. Obstacle Lifecycle & Collision
        const currentObstacles = obstaclesRef.current;
        let nearbyObs: Obstacle | null = null;

        for (let i = currentObstacles.length - 1; i >= 0; i--) {
          const obs = currentObstacles[i];
          obs.x -= speed * dt;

          if (obs.x > 0 && obs.x < 25 && !obs.cleared && !obs.failed) {
            nearbyObs = obs;
          }

          if (obs.x <= 0 && !obs.cleared && !obs.failed) {
            if (speed >= obs.requiredSpeed) {
              obs.cleared = true;
              curStats.obstaclesCleared += 1;
              curStats.score += 150;
              sound.playJump();
              rendererRef.current?.spawnObstacleClearEffect(340, 480);
              rendererRef.current?.addFloatingText('HURDLED!', 380, 240, '#10b981');
            } else {
              obs.failed = true;
              curStats.obstaclesFailed += 1;
              playerStateRef.current = 'stumbling';
              playerStateTimerRef.current = 0.5;

              if (mode !== 'practice') {
                curStats.chaserDistanceMeters = Math.max(3, curStats.chaserDistanceMeters - 7.5);
              }
              sound.playErrorSound();

              if (settings.screenShake && !settings.reducedMotion) {
                rendererRef.current?.triggerScreenShake(14);
              }
              rendererRef.current?.addFloatingText('STUMBLE!', 360, 280, '#ef4444');
            }
          }

          if (obs.x < -15) {
            currentObstacles.splice(i, 1);
          }
        }

        setActiveObstacle(nearbyObs);

        const lastObstacle = currentObstacles[currentObstacles.length - 1];
        if (!lastObstacle || lastObstacle.x < 35) {
          spawnObstacle(45);
        }

        setStats(curStats);
      }

      // Render Canvas Frame
      if (rendererRef.current) {
        rendererRef.current.render(
          dt,
          runnerSpeedRef.current,
          playerStateRef.current,
          chaser,
          environment,
          obstaclesRef.current,
          curStats.chaserDistanceMeters,
          profile.equippedSkin,
          profile.equippedTrail,
          curStats.currentStreak,
          settings.reducedMotion,
          mode
        );
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [
    screen,
    isPaused,
    mode,
    activeChallenge,
    chaser,
    environment,
    profile.equippedSkin,
    profile.equippedTrail,
    settings.reducedMotion,
    settings.screenShake,
    spawnObstacle,
    handleGameOver
  ]);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Background HTML5 Canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full block z-0" />

      {/* CRT Scanline & Grain Overlay */}
      <div className="scanline-overlay pointer-events-none" />

      {/* FRONT PAGE: MODE SELECTION & PREVIEW SENTENCE */}
      {screen === 'start' && (
        <StartScreen
          profile={profile}
          settings={settings}
          initialSentence={INITIAL_SENTENCE}
          onStartGame={(chosenMode, chosenChaserId) => {
            startRun(chosenMode, chosenChaserId);
          }}
          onOpenLocker={() => setShowLocker(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChallenges={() => setShowChallenges(true)}
        />
      )}

      {/* ACTIVE PLAYABLE GAMEPLAY HUD */}
      {(screen === 'playing' || screen === 'gameover') && (
        <GameHUD
          stats={stats}
          difficulty={difficulty}
          chaser={chaser}
          mode={mode}
          currentText={currentText}
          typedText={typedText}
          activeObstacle={activeObstacle}
          activeChallenge={activeChallenge}
          settings={settings}
          profile={profile}
          isPaused={isPaused}
          onPauseToggle={() => setIsPaused(prev => !prev)}
          onKeystroke={handleKeystroke}
          onBackspace={handleBackspace}
          onSelectMode={selectedMode => startRun(selectedMode)}
          onOpenLocker={() => setShowLocker(true)}
          onOpenStats={() => setShowStats(true)}
          onOpenSettings={() => setShowSettings(true)}
          onOpenChallenges={() => setShowChallenges(true)}
          onResetRun={() => startRun(mode, chaser.id, activeChallenge || undefined)}
          onOpenModes={() => {
            sound.stopMusic();
            setScreen('start');
          }}
          onFinishPractice={() => handleGameOver(true)}
        />
      )}

      {/* PAUSE MENU MODAL */}
      {isPaused && (
        <PauseModal
          onResume={() => setIsPaused(false)}
          onRestart={() => startRun(mode, chaser.id, activeChallenge || undefined)}
          onReturnHome={() => {
            setIsPaused(false);
            sound.stopMusic();
            setScreen('start');
          }}
        />
      )}

      {/* RUN COMPLETE / GAME OVER MODAL */}
      {screen === 'gameover' && lastRunRecord && (
        <GameOverModal
          record={lastRunRecord}
          chaser={chaser}
          isNewBest={isNewPersonalBest}
          onPlayAgain={() => startRun(mode, chaser.id, activeChallenge || undefined)}
          onPracticeSpeed={() => startRun('practice')}
          onReturnHome={() => {
            sound.stopMusic();
            setScreen('start');
          }}
        />
      )}

      {/* LOCKER / ACCESSORIES MODAL */}
      {showLocker && (
        <CustomizationModal
          profile={profile}
          onUpdateProfile={setProfile}
          onClose={() => setShowLocker(false)}
        />
      )}

      {/* STATISTICS DASHBOARD */}
      {showStats && (
        <StatsDashboard profile={profile} onClose={() => setShowStats(false)} />
      )}

      {/* SETTINGS & ACCESSIBILITY MODAL */}
      {showSettings && (
        <SettingsModal
          settings={settings}
          onUpdateSettings={setSettings}
          onClose={() => setShowSettings(false)}
        />
      )}

      {/* CHALLENGES MODAL */}
      {showChallenges && (
        <ChallengesModal
          onStartChallenge={chal => {
            setShowChallenges(false);
            startRun('challenge', chal.chaserId, chal);
          }}
          onClose={() => setShowChallenges(false)}
        />
      )}

      {/* PRE-GAME 3-2-1 COUNTDOWN OVERLAY */}
      {countdown !== null && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-black/45 backdrop-blur-[2px] select-none pointer-events-none animate-fadeIn">
          <div className="text-center p-8 rounded-3xl bg-slate-950/85 border border-cyan-500/40 shadow-2xl backdrop-blur-md">
            <div className="text-xs uppercase font-mono tracking-widest text-cyan-400 mb-2 font-bold flex items-center justify-center gap-2">
              <Zap className="w-4 h-4 animate-pulse" /> {mode.replace('_', ' ').toUpperCase()} • GET READY
            </div>
            <div className="text-7xl sm:text-9xl font-black font-heading text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-cyan-400 drop-shadow-[0_0_40px_rgba(34,211,238,0.85)] animate-pulse">
              {countdown === 0 ? 'RUN!' : countdown}
            </div>
            <div className="text-xs sm:text-sm font-mono text-slate-300 mt-4 drop-shadow">
              {mode === 'practice'
                ? 'Zen Typing Mode • Zero Pressure • Type freely'
                : `Pursuer: ${chaser.name} (${chaser.baseSpeed} m/s) • Typing powers your speed`}
            </div>
          </div>
        </div>
      )}

      {/* BACKEND OFFLINE / FALLBACK NOTICE */}
      {!apiOnline && (
        <div className="fixed bottom-3 right-3 z-50 bg-amber-950/90 border border-amber-500/60 text-amber-200 text-xs px-3.5 py-2 rounded-xl shadow-xl font-mono flex items-center gap-2 backdrop-blur-md animate-fadeIn">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>Offline Mode: Data saved locally. Syncs once server is active.</span>
        </div>
      )}
    </div>
  );
}

export default App;

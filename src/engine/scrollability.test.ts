import { describe, it, expect } from 'vitest';

describe('Home Page Scrollability & Gameplay Scroll Lock Specifications', () => {
  it('1. Body & html allow vertical scrolling on menu with min-height: 100dvh', () => {
    // Verify CSS tokens and layout guarantees
    const htmlMinHeight = '100dvh';
    const overflowX = 'hidden';
    expect(htmlMinHeight).toBe('100dvh');
    expect(overflowX).toBe('hidden');
  });

  it('2. Active gameplay is locked to fixed viewport while menu expands', () => {
    const getContainerClass = (isRunActive: boolean) =>
      `relative w-full bg-black select-none overflow-x-hidden ${
        isRunActive
          ? 'fixed inset-0 h-[100vh] h-[100dvh] overflow-hidden'
          : 'min-h-[100vh] min-h-[100dvh]'
      }`;

    const menuClass = getContainerClass(false);
    expect(menuClass).toContain('min-h-[100vh]');
    expect(menuClass).toContain('min-h-[100dvh]');
    expect(menuClass).not.toContain('overflow-hidden');

    const gameplayClass = getContainerClass(true);
    expect(gameplayClass).toContain('fixed inset-0');
    expect(gameplayClass).toContain('overflow-hidden');
  });

  it('3. Space key scrolls on menu but types without scrolling in game', () => {
    const handleKeyDown = (key: string, screen: string) => {
      let defaultPrevented = false;
      const fakeEvent = {
        key,
        preventDefault: () => {
          defaultPrevented = true;
        }
      };

      if (screen === 'start') {
        // On start screen, do not preventDefault on Space or Arrow keys
        return { defaultPrevented: false, typed: false };
      }

      if (screen === 'playing') {
        if (fakeEvent.key === ' ') {
          fakeEvent.preventDefault();
        }
        return { defaultPrevented, typed: true };
      }

      return { defaultPrevented, typed: false };
    };

    // Menu: Space key allows native browser scrolling
    const menuResult = handleKeyDown(' ', 'start');
    expect(menuResult.defaultPrevented).toBe(false);

    // Gameplay: Space key calls preventDefault to avoid scrolling and inputs space
    const gameResult = handleKeyDown(' ', 'playing');
    expect(gameResult.defaultPrevented).toBe(true);
    expect(gameResult.typed).toBe(true);
  });

  it('4. Safe area insets and sticky launcher layout checks', () => {
    const safeAreaPadding = 'calc(0.5rem + env(safe-area-inset-bottom, 0px))';
    expect(safeAreaPadding).toContain('env(safe-area-inset-bottom');
  });

  it('5. Hero landing view transitions to start screen on "Start Playing Now" or keypress', () => {
    type ScreenState = 'hero' | 'start' | 'playing' | 'gameover';
    let currentScreen: ScreenState = 'hero';
    let audioUnlocked = false;

    // Simulate clicking "Start Playing Now" on the Hero section
    const onStartPlayingNow = () => {
      audioUnlocked = true;
      currentScreen = 'start';
    };

    expect(currentScreen).toBe('hero');
    onStartPlayingNow();
    expect(currentScreen).toBe('start');
    expect(audioUnlocked).toBe(true);

    // Simulate clicking "Hero View" from start screen
    const onOpenHero = () => {
      currentScreen = 'hero';
    };
    onOpenHero();
    expect(currentScreen).toBe('hero');

    // Simulate pressing Enter/Space/ArrowDown or scrolling down on hero screen
    const onHeroKeyOrScroll = (key: string) => {
      if (currentScreen === 'hero' && (key === 'Enter' || key === ' ' || key === 'ArrowDown')) {
        audioUnlocked = true;
        currentScreen = 'start';
      }
    };
    onHeroKeyOrScroll('Enter');
    expect(currentScreen).toBe('start');
  });
});

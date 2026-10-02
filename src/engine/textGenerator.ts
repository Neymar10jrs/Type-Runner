import type { DifficultyLevel, ChaserId } from '../types/game';

const BEGINNER_SENTENCES = [
  'The ancient forest was silent before the storm arrived.',
  'Run fast along the glowing path to stay safe.',
  'Keep your pace steady as the cold wind rises.',
  'The dark night is lit by sparks of speed.',
  'A swift runner moves forward with pure focus.',
  'Stay alert and hold your rhythm on this road.',
  'Light leads the way through the wild shadows.',
  'Dash toward the dawn and do not look back.',
  'Every single step builds your momentum.',
  'The wild beast prowls in the distance behind you.'
];

const IMPROVING_SENTENCES = [
  'The shadow looms across the misty valley.',
  'Quick strides carry you through the crumbling archway.',
  'Sprint past the burning embers without looking back.',
  'Cold mountain air fills your lungs as speed builds.',
  'A distant rumble shakes the stone foundation beneath you.',
  'Keep your balance on the narrow suspension bridge.',
  'The relentless beast matches your swift acceleration.',
  'Sharp turns test your focus and lightning reflexes.',
  'Footsteps echo loudly against the cavernous rock walls.',
  'Leap over the fallen pine tree and maintain momentum.',
  'Glowing runes light the forgotten highway ahead.',
  'Every keystroke propels you further from impending peril.',
  'The fierce gale whips your cloak as you dash forward.',
  'Never hesitate when the ground begins to tremble.',
  'Your stamina rises with each perfectly typed phrase.'
];

const ADVANCED_SENTENCES = [
  'Swiftly, the runner crossed the trembling bridge, dodging falling stalactites from above!',
  'Escape was never guaranteed; each precise keystroke carved a desperate margin of survival.',
  'At over 80 km/h, the sheer inertia pulverized the ancient monolithic gate behind them.',
  'Thunder struck just 20 meters away, scattering blinding sparks across the wet asphalt.',
  'The colossal entity roared in fury—its obsidian claws carving trenches into the earth.',
  'Accelerate now! The pyroclastic wave has crested the ridge at an astonishing 120 km/h.',
  'Relying on instinct alone, they vaulted across the 15-meter fissure without breaking pace.',
  'Fractured glass and steel rained down as the towering monolith collapsed in a cloud of smoke.',
  'Through wind, grit, and 98% sheer willpower, the gap between prey and predator expanded.',
  'A piercing siren echoed through Sector-7: "Warning, seismic fault collapse imminent!"'
];

const EXPERT_PASSAGES = [
  'Surging forward at terminal velocity, adrenaline synthesized with mechanical precision; no hesitation was permitted.',
  'The cataclysmic atmospheric vortex tore 400-year-old cedar trunks from the granite bedrock like kindling, yet they sprinted onward.',
  'Hyper-synchronized bio-servos calibrated instantly: coordinates 42.8N, 114.6W; maximum overdrive engaged to bypass the encroaching abyss.',
  'Between the crushing jaws of the Abyssal Leviathan and the crumbling promontory, a solitary 3-foot ledge offered salvation.',
  'Chronometer readout: 00:45.92 remaining; velocity 145 kph; trajectory uncompromisingly fixed toward the extraction portal.',
  'Superheated ash enveloped the horizon at 300°C—respiratory filters whined under load as the runner pushed past human physical limits.'
];

const ACTION_COMMANDS = ['JUMP', 'SLIDE', 'DODGE', 'LEAP', 'DUCK', 'VAULT', 'ROLL', 'DASH', 'SPRINT'];

export class TextGenerator {
  /**
   * Generates a suitable text challenge based on current adaptive difficulty and chaser
   */
  public static getNextChallenge(
    difficulty: DifficultyLevel,
    chaserId?: ChaserId,
    wordsTypedCount: number = 0
  ): string {
    if (difficulty === 'beginner') {
      const idx = wordsTypedCount < BEGINNER_SENTENCES.length
        ? wordsTypedCount
        : Math.floor(Math.random() * BEGINNER_SENTENCES.length);
      return BEGINNER_SENTENCES[idx];
    }

    if (difficulty === 'improving') {
      const idx = Math.floor(Math.random() * IMPROVING_SENTENCES.length);
      return IMPROVING_SENTENCES[idx];
    }

    if (difficulty === 'advanced') {
      const idx = Math.floor(Math.random() * ADVANCED_SENTENCES.length);
      return ADVANCED_SENTENCES[idx];
    }

    // Expert
    const idx = Math.floor(Math.random() * EXPERT_PASSAGES.length);
    return EXPERT_PASSAGES[idx];
  }

  /**
   * Generates an action command word for obstacle clearing
   */
  public static getActionCommand(): string {
    return ACTION_COMMANDS[Math.floor(Math.random() * ACTION_COMMANDS.length)];
  }

  /**
   * Challenge-mode specific presets
   */
  public static getChallengeText(challengeId: string): string[] {
    switch (challengeId) {
      case 'speed_gate_50':
        return [
          'Maintain a rapid tempo and drive forward without pause.',
          'Speed is your ultimate armor when facing the titan.',
          'Type every word with unwavering rhythm and momentum.'
        ];
      case 'zero_mistakes':
        return [
          'Precision above all else.',
          'One single error will shatter your concentration.',
          'Breathe calmly and strike each key with absolute certainty.'
        ];
      case 'punctuation_master':
        return [
          'Wait; do you hear that? The serpent is coiling, ready to strike—run!',
          'Coordinates: [34.5° N, 118.2° W]; altitude: 4,200m; escape velocity: nominal!',
          '"Never surrender," the commander shouted, "even as the caldera erupts!"'
        ];
      case 'hyper_sprint':
        return [
          'Overdrive engaged! Accelerate past maximum velocity now!',
          'The shockwave approaches at Mach 2; keep your fingers flying!'
        ];
      default:
        return [
          'Run as fast as you can to survive the endless pursuit.'
        ];
    }
  }
}

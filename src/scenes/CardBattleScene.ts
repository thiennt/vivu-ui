import { BaseScene } from '@/utils/BaseScene';
import { HandZone } from './CardBattle/HandZone';
import { DiscardZone } from './CardBattle/DiscardZone';
import { PlayerCharacterZone } from './CardBattle/PlayerCharacterZone';
import { BattleLogZone } from './CardBattle/BattleLogZone';
import { ButtonZone } from './CardBattle/ButtonZone';
import { LayoutCalculator } from './CardBattleScene/utils/layout';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  // Player 1 zones (bottom)
  private p1HandZone: HandZone;
  private p1DiscardZone: DiscardZone;
  private p1CharacterZone: PlayerCharacterZone;

  // Player 2 zones (top)  
  private p2HandZone: HandZone;
  private p2DiscardZone: DiscardZone;
  private p2CharacterZone: PlayerCharacterZone;

  // Shared zones
  private battleLogZone: BattleLogZone;
  private buttonZone: ButtonZone;

  private battleId: string;
  
  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';

    // Initialize all zones with improved error handling
    this.p1HandZone = new HandZone();
    this.addChild(this.p1HandZone);
    
    this.p1DiscardZone = new DiscardZone();
    this.addChild(this.p1DiscardZone);

    this.p1CharacterZone = new PlayerCharacterZone({ playerNo: 1 });
    this.addChild(this.p1CharacterZone);

    this.p2HandZone = new HandZone();
    this.addChild(this.p2HandZone);
    
    this.p2DiscardZone = new DiscardZone();
    this.addChild(this.p2DiscardZone);

    this.p2CharacterZone = new PlayerCharacterZone({ playerNo: 2 });
    this.addChild(this.p2CharacterZone);

    this.battleLogZone = new BattleLogZone();
    this.addChild(this.battleLogZone);

    this.buttonZone = new ButtonZone();
    this.addChild(this.buttonZone);

    // Setup battle log with initial message
    this.battleLogZone.addLogMessage('Battle started!');

    console.log('CardBattleScene: All 8 zones initialized successfully');
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Calculate layout using the layout utility
    const layout = LayoutCalculator.calculateBattleLayout(width, height);
    
    // Zone dimensions
    const discardZoneSize = 75;
    const handZoneHeight = 100;
    const characterZoneHeight = 100;
    const battleLogHeight = layout.areas.battlefield.height;
    const buttonZoneHeight = 60;
    
    // Position zones according to the specified layout:
    // PLAYER 2 DISCARD ZONE (top)
    this.p2DiscardZone.resize(discardZoneSize, discardZoneSize);
    this.p2DiscardZone.x = (width - discardZoneSize) / 2;
    this.p2DiscardZone.y = layout.paddings.top;
    
    // PLAYER 2 HAND ZONE
    const p2HandY = this.p2DiscardZone.y + discardZoneSize + layout.paddings.between;
    this.p2HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
    this.p2HandZone.x = this.STANDARD_PADDING;
    this.p2HandZone.y = p2HandY;
    
    // PLAYER 2 INFO + 3 CHARACTERS ZONE
    const p2CharacterY = p2HandY + handZoneHeight + layout.paddings.between;
    this.p2CharacterZone.resize(width - 2 * this.STANDARD_PADDING, characterZoneHeight);
    this.p2CharacterZone.x = this.STANDARD_PADDING;
    this.p2CharacterZone.y = p2CharacterY;
    
    // BATTLE LOG ZONE (center)
    const battleLogY = p2CharacterY + characterZoneHeight + layout.paddings.between;
    this.battleLogZone.resize(width - 2 * this.STANDARD_PADDING, battleLogHeight);
    this.battleLogZone.x = this.STANDARD_PADDING;
    this.battleLogZone.y = battleLogY;
    
    // PLAYER 1 INFO + 3 CHARACTERS ZONE
    const p1CharacterY = battleLogY + battleLogHeight + layout.paddings.between;
    this.p1CharacterZone.resize(width - 2 * this.STANDARD_PADDING, characterZoneHeight);
    this.p1CharacterZone.x = this.STANDARD_PADDING;
    this.p1CharacterZone.y = p1CharacterY;
    
    // PLAYER 1 HAND ZONE
    const p1HandY = p1CharacterY + characterZoneHeight + layout.paddings.between;
    this.p1HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
    this.p1HandZone.x = this.STANDARD_PADDING;
    this.p1HandZone.y = p1HandY;
    
    // PLAYER 1 DISCARD ZONE
    const p1DiscardY = p1HandY + handZoneHeight + layout.paddings.between;
    this.p1DiscardZone.resize(discardZoneSize, discardZoneSize);
    this.p1DiscardZone.x = (width - discardZoneSize) / 2;
    this.p1DiscardZone.y = p1DiscardY;
    
    // BUTTONS ZONE (End Turn ...)
    const buttonY = p1DiscardY + discardZoneSize + layout.paddings.between;
    this.buttonZone.resize(width - 2 * this.STANDARD_PADDING, buttonZoneHeight);
    this.buttonZone.x = this.STANDARD_PADDING;
    this.buttonZone.y = buttonY;

    console.log('CardBattleScene: All 8 zones resized and positioned');
  }
}
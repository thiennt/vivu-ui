import { Container } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { HandZone } from './CardBattle/HandZone';
import { DiscardZone } from './CardBattle/DiscardZone';
import { PlayerCharacterZone } from './CardBattle/PlayerCharacterZone';
import { BattleLogZone } from './CardBattle/BattleLogZone';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  private battleId: string;
  
  // Zone components following the layout order:
  // PLAYER 2 DISCARD ZONE
  // PLAYER 2 HAND ZONE (Skill Cards)  
  // PLAYER 2 INFO (P2 + Energy count + Deck count) + 3 CHARACTERS ZONE
  // BATTLE LOG ZONE
  // PLAYER 1 INFO (P1 + Energy count + Deck count) + 3 CHARACTERS ZONE
  // PLAYER 1 HAND ZONE (Skill Cards)
  // PLAYER 1 DISCARD ZONE
  // BUTTONS ZONE
  
  private p2DiscardZone: DiscardZone;
  private p2HandZone: HandZone;
  private p2CharacterZone: PlayerCharacterZone;
  private battleLogZone: BattleLogZone;
  private p1CharacterZone: PlayerCharacterZone;
  private p1HandZone: HandZone;
  private p1DiscardZone: DiscardZone;
  private buttonsContainer: Container;
  
  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';

    // Initialize all zones
    this.p2DiscardZone = new DiscardZone();
    this.addChild(this.p2DiscardZone);
    
    this.p2HandZone = new HandZone();
    this.addChild(this.p2HandZone);
    
    this.p2CharacterZone = new PlayerCharacterZone({ playerNo: 2 });
    this.addChild(this.p2CharacterZone);
    
    this.battleLogZone = new BattleLogZone();
    this.addChild(this.battleLogZone);
    
    this.p1CharacterZone = new PlayerCharacterZone({ playerNo: 1 });
    this.addChild(this.p1CharacterZone);
    
    this.p1HandZone = new HandZone();
    this.addChild(this.p1HandZone);
    
    this.p1DiscardZone = new DiscardZone();
    this.addChild(this.p1DiscardZone);
    
    this.buttonsContainer = new Container();
    this.addChild(this.buttonsContainer);
    
    this.setupButtons();
  }

  private setupButtons(): void {
    // Create End Turn button
    const endTurnButton = this.createButton(
      'End Turn',
      0, 0, 200, 50,
      () => {
        console.log('End Turn clicked');
      }
    );
    this.buttonsContainer.addChild(endTurnButton);
  }
  
  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Calculate layout based on backup structure
    const TOP_PADDING = this.STANDARD_PADDING * 2;
    const BETWEEN_AREAS = this.STANDARD_PADDING * 2;
    const BOTTOM_PADDING = this.STANDARD_PADDING * 2;
    
    // Zone heights (proportional)
    const discardZoneHeight = 75;
    const handZoneHeight = 100;
    const characterZoneHeight = 120;
    const battleLogHeight = 80;
    const buttonsHeight = 60;
    
    // Calculate available height and distribute remaining space
    const fixedHeight = discardZoneHeight * 2 + handZoneHeight * 2 + characterZoneHeight * 2 + battleLogHeight + buttonsHeight;
    const totalPadding = TOP_PADDING + BETWEEN_AREAS * 7 + BOTTOM_PADDING;
    const remainingHeight = height - fixedHeight - totalPadding;
    const extraSpacing = Math.max(0, remainingHeight / 8);
    
    let currentY = TOP_PADDING;
    
    // PLAYER 2 DISCARD ZONE (top)
    this.p2DiscardZone.resize(75, discardZoneHeight);
    this.p2DiscardZone.x = (width - 75) / 2;
    this.p2DiscardZone.y = currentY;
    currentY += discardZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // PLAYER 2 HAND ZONE (Skill Cards)
    this.p2HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
    this.p2HandZone.x = this.STANDARD_PADDING;
    this.p2HandZone.y = currentY;
    currentY += handZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // PLAYER 2 INFO + 3 CHARACTERS ZONE
    this.p2CharacterZone.resize(width - 2 * this.STANDARD_PADDING, characterZoneHeight);
    this.p2CharacterZone.x = this.STANDARD_PADDING;
    this.p2CharacterZone.y = currentY;
    currentY += characterZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // BATTLE LOG ZONE (center)
    this.battleLogZone.resize(width - 2 * this.STANDARD_PADDING, battleLogHeight);
    this.battleLogZone.x = this.STANDARD_PADDING;
    this.battleLogZone.y = currentY;
    currentY += battleLogHeight + BETWEEN_AREAS + extraSpacing;
    
    // PLAYER 1 INFO + 3 CHARACTERS ZONE
    this.p1CharacterZone.resize(width - 2 * this.STANDARD_PADDING, characterZoneHeight);
    this.p1CharacterZone.x = this.STANDARD_PADDING;
    this.p1CharacterZone.y = currentY;
    currentY += characterZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // PLAYER 1 HAND ZONE (Skill Cards)
    this.p1HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
    this.p1HandZone.x = this.STANDARD_PADDING;
    this.p1HandZone.y = currentY;
    currentY += handZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // PLAYER 1 DISCARD ZONE
    this.p1DiscardZone.resize(75, discardZoneHeight);
    this.p1DiscardZone.x = (width - 75) / 2;
    this.p1DiscardZone.y = currentY;
    currentY += discardZoneHeight + BETWEEN_AREAS + extraSpacing;
    
    // BUTTONS ZONE (bottom)
    this.buttonsContainer.x = (width - 200) / 2; // Center the 200px wide button
    this.buttonsContainer.y = currentY;
  }
}
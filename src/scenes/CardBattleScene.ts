import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { HomeScene } from './HomeScene';
import { gsap } from 'gsap';
import { 
  CardBattleState, 
  CardBattlePlayerState, 
  CardBattleCharacter, 
  TurnAction,
  BattlePhaseName,
  Card
} from '@/types';
import { battleApi } from '@/services/api';
import { app } from '../app';
import { HandZone } from './CardBattle/HandZone';
import { DiscardZone } from './CardBattle/DiscardZone';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private p1HandZone: HandZone;
  private p1discardZone: DiscardZone;

  private battleId: string;
  
  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';

    this.p1HandZone = new HandZone();
    this.addChild(this.p1HandZone);
    
    this.p1discardZone = new DiscardZone();
    this.addChild(this.p1discardZone);
  }

  
  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    this.p1discardZone.resize(75, 75);
    this.p1discardZone.x = (width - this.p1discardZone.width) / 2;
    this.p1discardZone.y = height - this.p1discardZone.height - this.STANDARD_PADDING;

    this.p1HandZone.resize(width - 2 * this.STANDARD_PADDING, 100);
    this.p1HandZone.x = this.STANDARD_PADDING;
    this.p1HandZone.y = this.p1discardZone.y - this.p1HandZone.height - this.STANDARD_PADDING;
  }
}
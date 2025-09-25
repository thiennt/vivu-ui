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
  Card,
  CardType
} from '@/types';
import { battleApi } from '@/services/api';
import { app } from '../app';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  
  // Battle state
  private battleState: CardBattleState | null = null;
  private battleId: string;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  
  // UI Containers
  private backgroundContainer!: Container;
  private battlefieldContainer!: Container;
  private player1CharactersContainer!: Container;
  private player2CharactersContainer!: Container;
  private handContainer!: Container;
  private opponentHandContainer!: Container;
  private discardPileContainer!: Container;
  private deckRemainingContainer!: Container;
  private energyContainer!: Container;
  private opponentEnergyContainer!: Container;
  private opponentDiscardPileContainer!: Container;
  private opponentDeckRemainingContainer!: Container;
  private turnIndicatorContainer!: Container;
  private actionLogContainer!: Container;
  
  // Card interaction
  private dragTarget: Container | null = null;
  private dragOffset = { x: 0, y: 0 };
  private handCards: Container[] = [];
  private characterCards: Map<string, Container> = new Map();
  
  // Game flow control
  private mainPhaseResolve?: () => void;
  
  // Layout constants - made more responsive
  private readonly CARD_WIDTH = 70;
  private readonly CARD_HEIGHT = 100;
  private readonly CHARACTER_CARD_WIDTH = 100;
  private readonly CHARACTER_CARD_HEIGHT = 140;
  private readonly HAND_CARD_WIDTH = 50;
  private readonly HAND_CARD_HEIGHT = 70;

  constructor(battleId?: string) {
    super();
    
    this.battleId = battleId || 'mock-battle-001';
    this.container = new Container();
    this.addChild(this.container);

    // Initialize container references
    this.deckRemainingContainer = new Container();
    this.opponentDeckRemainingContainer = new Container();
    this.opponentEnergyContainer = new Container();
    this.opponentDiscardPileContainer = new Container();
    this.battlefieldContainer = new Container();
    
    this.setupLayout();
    this.initializeBattle();
  }

  private setupLayout(): void {
    // Layout based on detailed specifications (360x700 design)
    // Exact Y positions from the specification
    
    // OPPONENT'S SECTION (TOP HALF)
    // 1. Opponent's Resources Bar (y=10)
    this.createOpponentResourcesBar(10, 42);

    // 2. Opponent's Skill Hand (y=52) 
    this.createOpponentSkillHand(52, 56);

    // 3. Opponent's Card Row (y=108)
    this.createOpponentCardRow(108, 74);

    // 4. Opponent Discard Zone (y=182)
    this.createOpponentDiscardZone(182, 38);

    // BATTLE LOG (CENTER SECTION)
    // 5. Battle Log (y=220)
    this.createBattleLog(220, 70);

    // PLAYER'S SECTION (BOTTOM HALF)
    // 6. Player's Card Row (y=290)
    this.createPlayerCardRow(290, 76);

    // 7. Player's Skill Hand (y=366)
    this.createPlayerSkillHand(366, 99);

    // 8. Player Discard Zone (y=465) 
    this.createPlayerDiscardZone(465, 50);

    // 9. Player's Resources Bar (y=515)
    this.createPlayerResourcesBar(515, 55);

    // 10. End Turn Button (y=570)
    this.createEndTurnButton(570, 50);
    
    // Setup stage event handlers for drag and drop
    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onCardDragEnd, this);
    app.stage.on('pointerupoutside', this.onCardDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  // Layout methods following the exact specification structure
  
  // OPPONENT'S SECTION (TOP HALF)
  private createOpponentResourcesBar(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Dark background with white text for contrast
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#2c2c2c' }); // Dark background
    container.addChild(bg);

    // Three indicators: Energy, Deck, Discard
    const indicatorWidth = 70;
    const spacing = 20;
    const totalWidth = (indicatorWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;

    // Energy (⚡ 5)
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    energyBg.x = startX;
    energyBg.y = 4;

    const energyText = new Text({
      text: '⚡ 5',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff', // White text
        align: 'center'
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = startX + indicatorWidth / 2;
    energyText.y = height / 2;

    // Deck (🃏 12)
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    deckBg.x = startX + indicatorWidth + spacing;
    deckBg.y = 4;

    const deckText = new Text({
      text: '🃏 12',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff',
        align: 'center'
      }
    });
    deckText.anchor.set(0.5);
    deckText.x = startX + indicatorWidth + spacing + indicatorWidth / 2;
    deckText.y = height / 2;

    // Discard (🗑️ 3)
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    discardBg.x = startX + (indicatorWidth + spacing) * 2;
    discardBg.y = 4;

    const discardText = new Text({
      text: '🗑️ 3',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff',
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = startX + (indicatorWidth + spacing) * 2 + indicatorWidth / 2;
    discardText.y = height / 2;

    container.addChild(energyBg, energyText, deckBg, deckText, discardBg, discardText);
    
    // Store reference
    this.opponentEnergyContainer = container;
    (container as any).energyText = energyText;
    (container as any).deckText = deckText;
    (container as any).discardText = discardText;
    
    this.container.addChild(container);
  }

  private createOpponentSkillHand(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Light background, outlined with orange/brown borders
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#f5f5dc' }) // Light beige background
      .stroke({ width: 2, color: '#d2691e' }); // Orange/brown border
    container.addChild(bg);

    // Five rectangular skill cards
    const cardWidth = 50;
    const cardHeight = 40;
    const cardSpacing = 10;
    const totalWidth = (cardWidth * 5) + (cardSpacing * 4);
    const startX = (this.gameWidth - totalWidth) / 2;

    for (let i = 0; i < 5; i++) {
      const cardBg = new Graphics();
      // Vary fill: available (white), used or locked (gray)
      const fillColor = i === 2 ? '#cccccc' : '#ffffff'; // Make middle card gray as example
      cardBg.roundRect(0, 0, cardWidth, cardHeight, 4)
        .fill({ color: fillColor })
        .stroke({ width: 1, color: '#d2691e' });
      
      cardBg.x = startX + (i * (cardWidth + cardSpacing));
      cardBg.y = (height - cardHeight) / 2;
      
      container.addChild(cardBg);
    }

    this.opponentHandContainer = container;
    this.container.addChild(container);
  }

  private createOpponentCardRow(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Warm brown background for the row
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#8b4513' }); // Brown background
    container.addChild(bg);

    // Opponent's avatar (left)
    const avatarContainer = new Container();
    
    // Avatar circle (white)
    const avatar = new Graphics();
    avatar.circle(30, height / 2, 20)
      .fill({ color: '#ffffff' })
      .stroke({ width: 2, color: '#654321' });
    
    // "Opponent" label
    const opponentLabel = new Text({
      text: 'Opponent',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: '#ffffff',
        fontWeight: 'bold'
      }
    });
    opponentLabel.x = 60;
    opponentLabel.y = (height - opponentLabel.height) / 2;

    avatarContainer.addChild(avatar, opponentLabel);
    container.addChild(avatarContainer);

    // Three horizontal card slots (lighter shade)
    const cardWidth = 50;
    const cardHeight = 60;
    const cardSpacing = 10;
    const totalCardsWidth = (cardWidth * 3) + (cardSpacing * 2);
    const cardsStartX = this.gameWidth - totalCardsWidth - 20;

    const cardContainer = new Container();
    for (let i = 0; i < 3; i++) {
      const cardSlot = new Graphics();
      cardSlot.roundRect(0, 0, cardWidth, cardHeight, 4)
        .fill({ color: '#deb887' }) // Lighter shade
        .stroke({ width: 1, color: '#654321' });
      
      cardSlot.x = cardsStartX + (i * (cardWidth + cardSpacing));
      cardSlot.y = (height - cardHeight) / 2;
      
      cardContainer.addChild(cardSlot);
    }

    this.player2CharactersContainer = cardContainer;
    container.addChild(cardContainer);
    this.container.addChild(container);
  }

  private createOpponentDiscardZone(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Horizontal rectangle with dashed orange border
    const discardWidth = 200;
    const discardHeight = 30;
    const discardX = (this.gameWidth - discardWidth) / 2;
    
    const discardZone = new Graphics();
    // Create dashed border effect
    discardZone.setStrokeStyle({
      width: 2,
      color: '#ff8c00',
      cap: 'round',
      join: 'round'
    });
    
    // Draw dashed rectangle
    const dashLength = 8;
    const gapLength = 4;
    
    // Top border
    for (let x = 0; x < discardWidth; x += dashLength + gapLength) {
      discardZone.moveTo(Math.min(x, discardWidth), 0);
      discardZone.lineTo(Math.min(x + dashLength, discardWidth), 0);
    }
    // Right border
    for (let y = 0; y < discardHeight; y += dashLength + gapLength) {
      discardZone.moveTo(discardWidth, Math.min(y, discardHeight));
      discardZone.lineTo(discardWidth, Math.min(y + dashLength, discardHeight));
    }
    // Bottom border
    for (let x = discardWidth; x > 0; x -= dashLength + gapLength) {
      discardZone.moveTo(Math.max(x, 0), discardHeight);
      discardZone.lineTo(Math.max(x - dashLength, 0), discardHeight);
    }
    // Left border
    for (let y = discardHeight; y > 0; y -= dashLength + gapLength) {
      discardZone.moveTo(0, Math.max(y, 0));
      discardZone.lineTo(0, Math.max(y - dashLength, 0));
    }
    discardZone.stroke();
    
    // Light fill
    const fill = new Graphics();
    fill.roundRect(0, 0, discardWidth, discardHeight, 4)
      .fill({ color: '#fff8dc', alpha: 0.8 }); // Light fill
    
    discardZone.x = discardX;
    discardZone.y = (height - discardHeight) / 2;
    fill.x = discardX;
    fill.y = (height - discardHeight) / 2;

    const discardText = new Text({
      text: '🗑️ DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: '#ff8c00',
        fontWeight: 'bold',
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = this.gameWidth / 2;
    discardText.y = height / 2;

    container.addChild(fill, discardZone, discardText);
    this.opponentDiscardPileContainer = container;
    this.container.addChild(container);
  }

  // BATTLE LOG (CENTER SECTION)
  private createBattleLog(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Pale background, brown border
    const logWidth = this.gameWidth - 20;
    const bg = new Graphics();
    bg.roundRect(0, 0, logWidth, height, 8)
      .fill({ color: '#fffef7' }) // Pale background
      .stroke({ width: 2, color: '#8b4513' }); // Brown border
    bg.x = 10;
    container.addChild(bg);

    // Three lines for recent actions with icons
    const actions = [
      '🗡️ BTC attacked ETH for 230 dmg!',
      '❤️ ETH healed 100',
      '🛡️ BNB blocked DOGE'
    ];

    actions.forEach((action, index) => {
      const actionText = new Text({
        text: action,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: '#2c2c2c', // Dark readable text
          align: 'left'
        }
      });
      actionText.x = 20;
      actionText.y = 15 + (index * 18);
      container.addChild(actionText);
    });

    this.actionLogContainer = container;
    this.container.addChild(container);
  }

  // PLAYER'S SECTION (BOTTOM HALF)
  private createPlayerCardRow(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Same brown background as opponent (mirrored)
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#deb887' }); // Lighter brown for player
    container.addChild(bg);

    // Player's avatar (left)
    const avatarContainer = new Container();
    
    // Avatar circle (white)
    const avatar = new Graphics();
    avatar.circle(30, height / 2, 20)
      .fill({ color: '#ffffff' })
      .stroke({ width: 2, color: '#654321' });
    
    // "You" label
    const youLabel = new Text({
      text: 'You',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: '#2c2c2c', // Dark text on light background
        fontWeight: 'bold'
      }
    });
    youLabel.x = 60;
    youLabel.y = (height - youLabel.height) / 2;

    avatarContainer.addChild(avatar, youLabel);
    container.addChild(avatarContainer);

    // Three horizontal card slots
    const cardWidth = 50;
    const cardHeight = 60;
    const cardSpacing = 10;
    const totalCardsWidth = (cardWidth * 3) + (cardSpacing * 2);
    const cardsStartX = this.gameWidth - totalCardsWidth - 20;

    const cardContainer = new Container();
    for (let i = 0; i < 3; i++) {
      const cardSlot = new Graphics();
      // Different states: normal, heal effect (purple), locked
      let fillColor = '#ffffff'; // Normal
      if (i === 1) fillColor = '#da70d6'; // Purple for heal effect
      if (i === 2) fillColor = '#cccccc'; // Gray for locked
      
      cardSlot.roundRect(0, 0, cardWidth, cardHeight, 4)
        .fill({ color: fillColor })
        .stroke({ width: 1, color: '#654321' });
      
      cardSlot.x = cardsStartX + (i * (cardWidth + cardSpacing));
      cardSlot.y = (height - cardHeight) / 2;
      
      cardContainer.addChild(cardSlot);
    }

    this.player1CharactersContainer = cardContainer;
    container.addChild(cardContainer);
    this.container.addChild(container);
  }

  private createPlayerSkillHand(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Light background like opponent's skill hand
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#f5f5dc' }) // Light beige background
      .stroke({ width: 2, color: '#d2691e' }); // Orange/brown border
    container.addChild(bg);

    // Five skill/action cards with icons and labels
    const cardWidth = 60;
    const cardHeight = 80;
    const cardSpacing = 8;
    const totalWidth = (cardWidth * 5) + (cardSpacing * 4);
    const startX = (this.gameWidth - totalWidth) / 2;

    const skillCards = [
      { icon: '🔥', name: 'Firestorm', available: true },
      { icon: '✨', name: 'Heal', available: true },
      { icon: '🛡️', name: 'LOCKED', available: false },
      { icon: '💙', name: 'Shield', available: true },
      { icon: '🔄', name: 'Swap', available: true }
    ];

    skillCards.forEach((skill, i) => {
      const cardBg = new Graphics();
      // Available (white) or locked (gray)
      const fillColor = skill.available ? '#ffffff' : '#cccccc';
      cardBg.roundRect(0, 0, cardWidth, cardHeight, 6)
        .fill({ color: fillColor })
        .stroke({ width: 2, color: '#d2691e' });
      
      cardBg.x = startX + (i * (cardWidth + cardSpacing));
      cardBg.y = (height - cardHeight) / 2;
      
      // Skill icon
      const iconText = new Text({
        text: skill.icon,
        style: {
          fontFamily: 'Kalam',
          fontSize: 20,
          align: 'center'
        }
      });
      iconText.anchor.set(0.5);
      iconText.x = startX + (i * (cardWidth + cardSpacing)) + cardWidth / 2;
      iconText.y = (height - cardHeight) / 2 + 20;
      
      // Skill name
      const nameText = new Text({
        text: skill.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: skill.available ? '#2c2c2c' : '#666666',
          align: 'center',
          wordWrap: true,
          wordWrapWidth: cardWidth - 4
        }
      });
      nameText.anchor.set(0.5);
      nameText.x = startX + (i * (cardWidth + cardSpacing)) + cardWidth / 2;
      nameText.y = (height - cardHeight) / 2 + 50;
      
      container.addChild(cardBg, iconText, nameText);
    });

    this.handContainer = container;
    this.container.addChild(container);
  }

  private createPlayerDiscardZone(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Same style as opponent's discard zone
    const discardWidth = 200;
    const discardHeight = 30;
    const discardX = (this.gameWidth - discardWidth) / 2;
    
    const discardZone = new Graphics();
    // Create dashed border effect
    discardZone.setStrokeStyle({
      width: 2,
      color: '#ff8c00',
      cap: 'round',
      join: 'round'
    });
    
    // Draw dashed rectangle
    const dashLength = 8;
    const gapLength = 4;
    
    // Top border
    for (let x = 0; x < discardWidth; x += dashLength + gapLength) {
      discardZone.moveTo(Math.min(x, discardWidth), 0);
      discardZone.lineTo(Math.min(x + dashLength, discardWidth), 0);
    }
    // Right border
    for (let y = 0; y < discardHeight; y += dashLength + gapLength) {
      discardZone.moveTo(discardWidth, Math.min(y, discardHeight));
      discardZone.lineTo(discardWidth, Math.min(y + dashLength, discardHeight));
    }
    // Bottom border
    for (let x = discardWidth; x > 0; x -= dashLength + gapLength) {
      discardZone.moveTo(Math.max(x, 0), discardHeight);
      discardZone.lineTo(Math.max(x - dashLength, 0), discardHeight);
    }
    // Left border
    for (let y = discardHeight; y > 0; y -= dashLength + gapLength) {
      discardZone.moveTo(0, Math.max(y, 0));
      discardZone.lineTo(0, Math.max(y - dashLength, 0));
    }
    discardZone.stroke();
    
    // Light fill
    const fill = new Graphics();
    fill.roundRect(0, 0, discardWidth, discardHeight, 4)
      .fill({ color: '#fff8dc', alpha: 0.8 }); // Light fill
    
    discardZone.x = discardX;
    discardZone.y = (height - discardHeight) / 2;
    fill.x = discardX;
    fill.y = (height - discardHeight) / 2;

    const discardText = new Text({
      text: '🗑️ DISCARD',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: '#ff8c00',
        fontWeight: 'bold',
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = this.gameWidth / 2;
    discardText.y = height / 2;

    container.addChild(fill, discardZone, discardText);
    
    // Make interactive
    discardZone.interactive = true;
    discardZone.cursor = 'pointer';
    
    this.discardPileContainer = container;
    this.container.addChild(container);
  }

  private createPlayerResourcesBar(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Same dark background as opponent's resources
    const bg = new Graphics();
    bg.roundRect(0, 0, this.gameWidth, height, 8)
      .fill({ color: '#2c2c2c' }); // Dark background
    container.addChild(bg);

    // Three indicators: Energy, Deck, Discard (same as opponent)
    const indicatorWidth = 70;
    const spacing = 20;
    const totalWidth = (indicatorWidth * 3) + (spacing * 2);
    const startX = (this.gameWidth - totalWidth) / 2;

    // Energy (⚡ 5)
    const energyBg = new Graphics();
    energyBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    energyBg.x = startX;
    energyBg.y = 4;

    const energyText = new Text({
      text: '⚡ 5',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff',
        align: 'center'
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = startX + indicatorWidth / 2;
    energyText.y = height / 2;

    // Deck (🃏 12)
    const deckBg = new Graphics();
    deckBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    deckBg.x = startX + indicatorWidth + spacing;
    deckBg.y = 4;

    const deckText = new Text({
      text: '🃏 12',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff',
        align: 'center'
      }
    });
    deckText.anchor.set(0.5);
    deckText.x = startX + indicatorWidth + spacing + indicatorWidth / 2;
    deckText.y = height / 2;

    // Discard (🗑️ 3)
    const discardBg = new Graphics();
    discardBg.roundRect(0, 0, indicatorWidth, height - 8, 6)
      .fill({ color: '#4a4a4a' });
    discardBg.x = startX + (indicatorWidth + spacing) * 2;
    discardBg.y = 4;

    const discardText = new Text({
      text: '🗑️ 3',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: '#ffffff',
        align: 'center'
      }
    });
    discardText.anchor.set(0.5);
    discardText.x = startX + (indicatorWidth + spacing) * 2 + indicatorWidth / 2;
    discardText.y = height / 2;

    container.addChild(energyBg, energyText, deckBg, deckText, discardBg, discardText);
    
    // Store reference
    this.energyContainer = container;
    (container as any).energyText = energyText;
    (container as any).deckText = deckText;
    (container as any).discardText = discardText;
    
    this.container.addChild(container);
  }

  private createEndTurnButton(y: number, height: number): void {
    const container = new Container();
    container.y = y;
    
    // Large orange button for easy thumb access
    const buttonWidth = 200;
    const buttonHeight = 40;
    const buttonX = (this.gameWidth - buttonWidth) / 2;
    
    const buttonBg = new Graphics();
    buttonBg.roundRect(0, 0, buttonWidth, buttonHeight, 20)
      .fill({ color: '#ff6347' }) // Orange color
      .stroke({ width: 2, color: '#cc4a1d' });
    buttonBg.x = buttonX;
    buttonBg.y = (height - buttonHeight) / 2;

    const buttonText = new Text({
      text: 'END TURN',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: '#ffffff',
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = this.gameWidth / 2;
    buttonText.y = height / 2;

    // Store reference for later use
    this.turnIndicatorContainer = container;
    (container as any).buttonBg = buttonBg;
    (container as any).buttonText = buttonText;

    container.addChild(buttonBg, buttonText);
    this.container.addChild(container);
  }

  private createBackground(): void {
    this.backgroundContainer = new Container();
    
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.BACKGROUND_DARK);
    
    this.backgroundContainer.addChild(bg);
    this.container.addChild(this.backgroundContainer);
  }


  private async initializeBattle(): Promise<void> {
    try {
      // Match Setup: Load battle state
      await this.setupMatch();
      
      if (this.battleState && this.battleState.players) {
        this.setupCharacters();
        this.updateUI();
        this.startGameLoop();
      } else {
        console.warn('Battle state is invalid, using fallback layout');
        this.createFallbackUI();
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      this.createFallbackUI();
    }
  }

  private async setupMatch(): Promise<void> {
    // Load initial battle state without starting a turn
    const response = await battleApi.getBattleState(this.battleId);
    this.battleState = response.data;
    
    console.log('Match setup complete with battle state:', this.battleState);
  }

  private async startGameLoop(): Promise<void> {
    // Main game loop following the requested flow
    while (this.battleState && this.battleState.status === 'ongoing') {
      // Turn Start (effects)
      await this.processTurnStart();
      
      // Draw Phase
      await this.processDrawPhase();
      
      // Main Phase (actions, discard)
      await this.processMainPhase();
      
      // End Turn (effects)  
      await this.processEndTurn();
      
      // AI Turn (auto) - if next player is AI
      if (this.battleState.current_player === 2) {
        await this.processAITurn();
      }
      
      // Check win/lose
      if (this.checkGameEnd()) {
        break;
      }
    }
  }

  private async processTurnStart(): Promise<void> {
    this.currentPhase = 'start_turn';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log(`Turn Start - Player ${this.battleState?.current_player}`);
    
    try {
      const response = await battleApi.startTurn(this.battleId);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Turn start logs:', logs);
        
        // Update battle state from the logs if available
        if (logs.length > 0 && logs[0].after_state) {
          const afterState = logs[0].after_state;
          if (afterState.characters && this.battleState) {
            this.battleState.players.forEach(player => {
              const teamCharacters = afterState.characters!.filter((c: any) => 
                c.team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }
        
        this.updateUI();
      }
    } catch (error) {
      console.error('Failed to process turn start:', error);
    }
    
    // Show turn start effects animation
    await this.animateTurnStartEffects();
    this.isAnimating = false;
  }

  private async processDrawPhase(): Promise<void> {
    if (!this.battleState) return;
    
    this.currentPhase = 'draw_phase';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log('Draw Phase');
    
    const turnAction: TurnAction = {
      type: 'draw_card',
      player_team: this.battleState.current_player
    };
    
    try {
      const response = await battleApi.drawCards(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Draw phase logs:', logs);
        
        // Update hand cards from drawn_cards if available
        if (logs.length > 0 && logs[0].drawn_cards) {
          const drawnCards = logs[0].drawn_cards;
          console.log('Cards drawn:', drawnCards);
          
          // Add cards to player's hand in battleState
          if (this.battleState) {
            const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
            if (currentPlayer) {
              currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards || [];
              drawnCards.forEach((card: any) => {
                currentPlayer.deck.hand_cards.push({ card: card as Card });
              });
            }
          }
        }
        
        this.updateUI();
        await this.animateCardDraw();
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
    }
    
    this.isAnimating = false;
  }

  private async processMainPhase(): Promise<void> {
    this.currentPhase = 'main_phase';
    this.updateTurnIndicator();
    
    console.log('Main Phase - Player can take actions');
    
    // For player 1: Enable interactions and wait for player input
    if (this.battleState?.current_player === 1) {
      this.createEndTurnButton();
      
      // Return Promise that resolves when player ends turn
      return new Promise((resolve) => {
        this.mainPhaseResolve = resolve;
      });
    } else {
      // For AI: Skip main phase as AI will act in AI turn
      return Promise.resolve();
    }
  }

  private async processEndTurn(): Promise<void> {
    this.currentPhase = 'end_turn';
    this.isAnimating = true;
    this.updateTurnIndicator();
    
    console.log('End Turn - Processing end turn effects');
    
    const turnAction: TurnAction = {
      type: 'end_turn',
      player_team: this.battleState!.current_player
    };
    
    try {
      const response = await battleApi.endTurn(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('End turn logs:', logs);
        
        // Update battle state from the logs if available
        if (logs.length > 0 && logs[0].after_state && this.battleState) {
          const afterState = logs[0].after_state;
          if (afterState.current_player !== undefined) {
            this.battleState.current_player = afterState.current_player;
          }
          if (afterState.turn !== undefined) {
            this.battleState.current_turn = afterState.turn;
          }
          if (afterState.characters) {
            this.battleState.players.forEach(player => {
              const teamCharacters = afterState.characters!.filter((c: any) => 
                c.team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }
        
        this.updateUI();
        await this.animateEndTurnEffects();
      }
    } catch (error) {
      console.error('Failed to process end turn:', error);
    }
    
    this.isAnimating = false;
  }

  private async processAITurn(): Promise<void> {
    console.log('AI Turn - Processing AI actions');
    
    this.isAnimating = true;
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // AI can play cards, discard cards, etc.
    await this.simulateAIActions();
    
    this.isAnimating = false;
  }

  private async simulateAIActions(): Promise<void> {
    if (!this.battleState || !this.battleState.players) return;
    
    // Simulate AI playing 1-2 cards randomly
    const aiPlayer = this.battleState.players.find(p => p.team === 2);
    if (!aiPlayer || !aiPlayer.deck || !aiPlayer.characters) return;
    
    const handCards = aiPlayer.deck.hand_cards;
    const numActions = Math.min(2, handCards.length);
    
    for (let i = 0; i < numActions; i++) {
      const randomCard = handCards[Math.floor(Math.random() * handCards.length)];
      const randomCharacter = aiPlayer.characters[Math.floor(Math.random() * Math.min(3, aiPlayer.characters.length))];
      
      if (randomCard.card && randomCharacter) {
        const turnAction: TurnAction = {
          type: 'play_card',
          player_team: 2,
          card_id: randomCard.card.id,
          character_id: randomCharacter.id
        };
        
        try {
          const response = await battleApi.playCard(this.battleId, turnAction);
          if (response.success && response.data) {
            this.battleState = response.data;
            this.updateUI();
            
            // Animate AI card play
            console.log(`AI played card: ${randomCard.card.name} on character: ${randomCharacter.name}`);
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (error) {
          console.error('AI action failed:', error);
        }
      }
    }
  }

  private checkGameEnd(): boolean {
    if (!this.battleState || !this.battleState.players) return false;
    
    if (this.battleState.status === 'completed') {
      this.showBattleResult();
      return true;
    }
    
    // Check if any team has no characters with HP > 0
    for (const player of this.battleState.players) {
      if (!player.characters) continue;
      
      const aliveCharacters = player.characters.filter(c => c.hp > 0);
      if (aliveCharacters.length === 0) {
        this.battleState.status = 'completed';
        this.battleState.winner_team = player.team === 1 ? 2 : 1;
        this.showBattleResult();
        return true;
      }
    }
    
    return false;
  }

  private async animateTurnStartEffects(): Promise<void> {
    // Show any turn start effects (buffs, debuffs, etc.)
    const currentPlayerCards = this.getCurrentPlayerCharacterCards();
    
    for (const card of currentPlayerCards) {
      // Animate a gentle glow to indicate turn start
      await gsap.to(card, {
        alpha: 0.7,
        duration: 0.3,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  private async animateEndTurnEffects(): Promise<void> {
    // Show any end turn effects (poison, regeneration, etc.)
    const allCharacterCards = Array.from(this.characterCards.values());
    
    for (const card of allCharacterCards) {
      // Animate a subtle pulse to indicate end turn processing
      await gsap.to(card.scale, {
        x: 1.05,
        y: 1.05,
        duration: 0.2,
        yoyo: true,
        repeat: 1,
        ease: 'power2.inOut'
      });
    }
  }

  private getCurrentPlayerCharacterCards(): Container[] {
    if (!this.battleState || !this.battleState.players) return [];
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer || !currentPlayer.characters) return [];
    
    return currentPlayer.characters
      .slice(0, 3)
      .map(char => this.characterCards.get(char.id))
      .filter(card => card !== undefined) as Container[];
  }

  private createFallbackUI(): void {
    // Create a simple fallback UI to show the scene is working
    const fallbackContainer = new Container();
    
    const titleText = new Text({
      text: 'Card Battle Scene',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    titleText.anchor.set(0.5);
    titleText.x = this.gameWidth / 2;
    titleText.y = this.gameHeight / 2 - 50;
    
    const statusText = new Text({
      text: 'Waiting for battle data...\nBattle ID: ' + this.battleId,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    statusText.anchor.set(0.5);
    statusText.x = this.gameWidth / 2;
    statusText.y = this.gameHeight / 2;
    
    // Add back button
    const backButton = new Container();
    const backBg = new Graphics();
    backBg.roundRect(0, 0, 120, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const backText = new Text({
      text: 'BACK TO HOME',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = 60;
    backText.y = 20;
    
    backButton.addChild(backBg, backText);
    backButton.x = this.gameWidth / 2 - 60;
    backButton.y = this.gameHeight / 2 + 50;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', () => {
      navigation.showScreen(HomeScene);
    });
    
    fallbackContainer.addChild(titleText, statusText, backButton);
    this.container.addChild(fallbackContainer);
  }

  private setupCharacters(): void {
    if (!this.battleState) return;
    
    // Clear existing character cards
    this.characterCards.clear();
    this.player1CharactersContainer.removeChildren();
    this.player2CharactersContainer.removeChildren();
    
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);
    
    if (player1) {
      this.createPlayerCharacters(player1, this.player1CharactersContainer, false);
    }
    
    if (player2) {
      this.createPlayerCharacters(player2, this.player2CharactersContainer, true);
    }
  }

  private createPlayerCharacters(player: CardBattlePlayerState, container: Container, isOpponent: boolean): void {
    const maxCharacters = Math.min(player.characters.length, 3); // Only show first 3 characters
    
    // Calculate responsive character card dimensions
    const availableWidth = this.gameWidth - (this.STANDARD_PADDING * 2);
    const minCardWidth = 80;
    const maxCardWidth = 120;
    const spacing = this.STANDARD_SPACING;
    
    // Calculate card width that fits all characters with proper spacing
    let cardWidth = (availableWidth - (spacing * (maxCharacters - 1))) / maxCharacters;
    cardWidth = Math.max(minCardWidth, Math.min(maxCardWidth, cardWidth));
    
    const cardHeight = cardWidth * 1.4; // Maintain aspect ratio
    const totalWidth = (cardWidth * maxCharacters) + (spacing * (maxCharacters - 1));
    const startX = (this.gameWidth - totalWidth) / 2;
    
    player.characters.forEach((character, index) => {
      if (index < maxCharacters) {
        const x = startX + index * (cardWidth + spacing);
        const y = 0;
        
        const characterCard = this.createHeroCard(
          character, 
          x, 
          y, 
          'preview', // Use preview size for better fit
          index,
          cardWidth
        );
        
        container.addChild(characterCard);
        this.characterCards.set(character.id, characterCard);
        
        // Make interactive for targeting
        if (!isOpponent) {
          this.makeCharacterCardInteractive(characterCard, character);
        }
      }
    });
  }

  private makeCharacterCardInteractive(card: Container, character: CardBattleCharacter): void {
    card.interactive = true;
    card.cursor = 'pointer';
    
    // Store character reference for future use
    (card as any).character = character;
    
    // Add glow effect on hover
    card.on('pointerover', () => {
      card.alpha = 0.8;
    });
    
    card.on('pointerout', () => {
      card.alpha = 1.0;
    });
  }

  private updateUI(): void {
    this.updateEnergyIndicator();
    this.updateTurnIndicator();
    this.updateHandCards();
    this.updateOpponentHandCards();
    this.updateDeckRemaining();
    this.updateCharacterStates();
  }

  private updateOpponentHandCards(): void {
    if (!this.battleState || !this.opponentHandContainer) return;
    
    const opponentPlayer = this.battleState.players.find(p => p.team === 2);
    if (!opponentPlayer) return;
    
    // Update opponent hand card count display
    const handCardCount = opponentPlayer.deck.hand_cards.length;
    
    // Find and update the hand count text in the opponent hand container
    const handCountText = this.findTextInContainer(this.opponentHandContainer, (text) => 
      text.text.includes('Hand:') || !!text.text.match(/^\d+$/)
    );
    
    if (handCountText) {
      handCountText.text = `Hand: ${handCardCount}`;
    }
  }

  private updateCharacterStates(): void {
    if (!this.battleState) return;
    
    // Update all character displays with current stats
    this.battleState.players.forEach(player => {
      player.characters.forEach(character => {
        const characterCard = this.characterCards.get(character.id);
        if (characterCard) {
          this.updateCharacterCard(characterCard, character);
        }
      });
    });
  }

  private updateCharacterCard(card: Container, character: CardBattleCharacter): void {
    // Find the HP text element in the character card
    // The character card structure varies, but we need to update HP and status effects
    const hpText = this.findTextInContainer(card, (text) => text.text.includes('HP'));
    if (hpText) {
      hpText.text = `HP: ${character.hp}/${character.max_hp}`;
      
      // Update text color based on HP percentage
      const hpPercent = character.hp / character.max_hp;
      if (hpPercent <= 0.25) {
        hpText.style.fill = 0xff4444; // Red for critical HP
      } else if (hpPercent <= 0.5) {
        hpText.style.fill = 0xffaa44; // Orange for low HP
      } else {
        hpText.style.fill = Colors.TEXT_PRIMARY; // Normal color
      }
    }
  }

  private findTextInContainer(container: Container, predicate: (text: Text) => boolean): Text | null {
    for (const child of container.children) {
      if (child instanceof Text && predicate(child)) {
        return child;
      } else if (child instanceof Container) {
        const found = this.findTextInContainer(child, predicate);
        if (found) return found;
      }
    }
    return null;
  }

  private updateEnergyIndicator(): void {
    if (!this.battleState || !this.energyContainer) return;
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer) return;
    
    // Update energy text in status bar
    const energyText = (this.energyContainer as any).energyText;
    if (energyText && energyText instanceof Text) {
      energyText.text = `⚡ ${currentPlayer.deck.current_energy}`;
    }
  }

  private updateEnergyContainer(container: Container, teamNumber: number): void {
    if (!container || !this.battleState) return;
    
    const player = this.battleState.players.find(p => p.team === teamNumber);
    if (!player) return;
    
    // Find the energy text (second child after background)
    const energyText = container.children[1] as Text;
    if (energyText && energyText instanceof Text) {
      energyText.text = `Energy: ${player.deck.current_energy}`;
    }
  }

  private updateDeckRemaining(): void {
    if (!this.battleState || !this.energyContainer) return;
    
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    if (!currentPlayer) return;
    
    // Calculate remaining cards
    const totalDeckCards = currentPlayer.deck.deck_cards.length;
    const handCards = currentPlayer.deck.hand_cards.length;
    const discardCards = currentPlayer.deck.discard_cards.length;
    const remainingCards = totalDeckCards - handCards - discardCards;
    
    // Update cards text in status bar
    const cardsText = (this.energyContainer as any).cardsText;
    if (cardsText && cardsText instanceof Text) {
      cardsText.text = `🃏 ${handCards}`;
    }
    
    // Update trash text in status bar
    const trashText = (this.energyContainer as any).trashText;
    if (trashText && trashText instanceof Text) {
      trashText.text = `🗑️ ${discardCards}`;
    }
  }

  private updateDeckRemainingContainer(container: Container, teamNumber: number): void {
    if (!container || !this.battleState) return;
    
    const player = this.battleState.players.find(p => p.team === teamNumber);
    if (!player) return;
    
    // Calculate remaining cards (total deck minus hand and discard)
    const totalDeckCards = player.deck.deck_cards.length;
    const handCards = player.deck.hand_cards.length;
    const discardCards = player.deck.discard_cards.length;
    const remainingCards = totalDeckCards - handCards - discardCards;
    
    // Update the count label (it's the third child: bg, label, count)
    const countLabel = container.children[2] as Text;
    if (countLabel && countLabel instanceof Text) {
      countLabel.text = remainingCards.toString();
    }
  }

  private updateTurnIndicator(): void {
    if (!this.battleState) return;
    
    // Update the turn indicator by integrating it into the battle log
    // Since we removed the separate turn indicator container for the mobile layout
    const isPlayerTurn = this.battleState.current_player === 1;
    
    // We can add the turn info to the action log title instead of a separate container
    // This is more space-efficient for mobile
  }

  private updateHandCards(): void {
    // Player skill hand is now static - no need to update dynamically
    // The skills are: Firestorm, Heal, LOCKED, Shield, Swap
    return;
  }



  private makeHandCardDraggable(cardContainer: Container, card: Card): void {
    cardContainer.interactive = true;
    cardContainer.cursor = 'grab';
    
    cardContainer.on('pointerdown', (event: FederatedPointerEvent) => {
      this.onCardDragStart(event, cardContainer, card);
    });
    
    cardContainer.on('pointerover', () => {
      cardContainer.scale.set(1.05);
    });
    
    cardContainer.on('pointerout', () => {
      cardContainer.scale.set(1.0);
    });
  }

  private onCardDragStart(event: FederatedPointerEvent, cardContainer: Container, card: Card): void {
    if (this.isAnimating) return;
    
    this.dragTarget = cardContainer;
    cardContainer.alpha = 0.8;
    cardContainer.cursor = 'grabbing';
    
    // Calculate and store drag offset
    const globalCardPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };
    
    // Move card to top layer (app.stage) for dragging above all
    const globalPos = cardContainer.parent?.toGlobal({ x: cardContainer.x, y: cardContainer.y });
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    app.stage.addChild(cardContainer);
    if (globalPos) {
      cardContainer.position.set(globalPos.x, globalPos.y);
    }
    
    // Attach pointermove to stage
    app.stage.on('pointermove', this.onCardDragMove, this);
    
    event.stopPropagation();
  }

  private onCardDragMove(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    // Use dragOffset to keep the pointer at the same relative position on the card
    const parent = this.dragTarget.parent;
    if (parent) {
      const newPos = parent.toLocal({
        x: event.global.x - this.dragOffset.x,
        y: event.global.y - this.dragOffset.y
      });
      this.dragTarget.position.set(newPos.x, newPos.y);
    }
  }

  private onCardDragEnd(event: FederatedPointerEvent): void {
    if (!this.dragTarget) return;
    
    const card = (this.dragTarget as any).card;
    const dropTarget = this.getDropTarget(event.global.x, event.global.y);
    
    // Remove drag events from stage
    app.stage.off('pointermove', this.onCardDragMove, this);
    
    if (dropTarget) {
      this.handleCardDrop(card, dropTarget);
    } else {
      // Return card to hand
      this.returnCardToHand(this.dragTarget);
    }
    
    this.dragTarget.alpha = 1.0;
    this.dragTarget.cursor = 'grab';
    this.dragTarget = null;
  }

  private getDropTarget(globalX: number, globalY: number): string | null {
    // Check if dropped on character
    for (const [characterId, characterCard] of this.characterCards) {
      const bounds = characterCard.getBounds();
      if (globalX >= bounds.x && globalX <= bounds.x + bounds.width &&
          globalY >= bounds.y && globalY <= bounds.y + bounds.height) {
        return `character:${characterId}`;
      }
    }
    
    // Check if dropped on discard pile
    const discardBounds = this.discardPileContainer.getBounds();
    if (globalX >= discardBounds.x && globalX <= discardBounds.x + discardBounds.width &&
        globalY >= discardBounds.y && globalY <= discardBounds.y + discardBounds.height) {
      return 'discard';
    }
    
    return null;
  }

  private async handleCardDrop(card: Card, dropTarget: string): Promise<void> {
    if (!this.battleState || !this.dragTarget) return;
    
    this.isAnimating = true;
    
    try {
      if (dropTarget === 'discard') {
        // Discard card for energy
        await this.discardCardForEnergy(card);
      } else if (dropTarget.startsWith('character:')) {
        const characterId = dropTarget.replace('character:', '');
        await this.playCardOnCharacter(card, characterId);
      }
    } catch (error) {
      console.error('Error handling card drop:', error);
      this.returnCardToHand(this.dragTarget);
    }
    
    this.isAnimating = false;
  }

  private async discardCardForEnergy(card: Card): Promise<void> {
    if (!this.battleState) return;
    
    const turnAction: TurnAction = {
      type: 'discard_card',
      player_team: this.battleState.current_player,
      card_id: card.id
    };
    
    try {
      const response = await battleApi.discardCard(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Discard card logs:', logs);
        
        // Remove card from player's hand
        if (this.battleState) {
          const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
          if (currentPlayer && currentPlayer.deck.hand_cards) {
            currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: any) => c.card?.id !== card.id);
          }
        }
        
        this.updateUI();
        this.animateCardToDiscard();
      }
    } catch (error) {
      console.error('Failed to discard card:', error);
    }
  }

  private async playCardOnCharacter(card: Card, characterId: string): Promise<void> {
    if (!this.battleState) return;
    
    const turnAction: TurnAction = {
      type: 'play_card',
      player_team: this.battleState.current_player,
      card_id: card.id,
      character_id: characterId
    };
    
    try {
      const response = await battleApi.playCard(this.battleId, turnAction);
      if (response.success && response.data) {
        // response.data is CardBattleLog[], not battleState
        const logs = response.data;
        console.log('Play card logs:', logs);
        
        // Remove card from player's hand
        if (this.battleState) {
          const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
          if (currentPlayer && currentPlayer.deck.hand_cards) {
            currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: any) => c.card?.id !== card.id);
          }
          
          // Update character states from log targets if available
          if (logs.length > 0 && logs[0].targets) {
            logs[0].targets.forEach((target: any) => {
              const player = this.battleState!.players.find(p => p.team === target.team);
              if (player) {
                const character = player.characters.find(c => c.id === target.id);
                if (character) {
                  // Update character with after state
                  Object.assign(character, target.after);
                }
              }
            });
          }
        }
        
        this.updateUI();
        this.animateCardPlay(characterId);
      }
    } catch (error) {
      console.error('Failed to play card:', error);
    }
  }

  private returnCardToHand(cardContainer: Container): void {
    // Remove from current parent (stage or container)
    if (cardContainer.parent) {
      cardContainer.parent.removeChild(cardContainer);
    }
    
    // Add back to hand container
    this.handContainer.addChild(cardContainer);
    
    // Find the card in the handCards array and restore position
    const cardIndex = this.handCards.indexOf(cardContainer);
    if (cardIndex !== -1) {
      // Recalculate hand layout and position with animation
      gsap.to(cardContainer, {
        duration: 0.3,
        ease: 'power2.out',
        onComplete: () => {
          this.updateHandCards(); // Refresh hand display
        }
      });
    } else {
      // Fallback: add to hand cards array and update
      this.handCards.push(cardContainer);
      this.updateHandCards();
    }
  }

  private animateCardToDiscard(): void {
    if (!this.dragTarget) return;
    
    gsap.to(this.dragTarget, {
      x: this.discardPileContainer.x + this.CARD_WIDTH / 2,
      y: this.discardPileContainer.y + this.CARD_HEIGHT / 2,
      scale: 0.8,
      duration: 0.5,
      ease: 'power2.out',
      onComplete: () => {
        this.dragTarget?.destroy();
        this.updateHandCards();
      }
    });
  }

  private animateCardPlay(characterId: string): void {
    if (!this.dragTarget) return;
    
    const characterCard = this.characterCards.get(characterId);
    if (!characterCard) return;
    
    gsap.to(this.dragTarget, {
      x: characterCard.x + this.CHARACTER_CARD_WIDTH / 2,
      y: characterCard.y + this.CHARACTER_CARD_HEIGHT / 2,
      scale: 0,
      rotation: Math.PI,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => {
        this.dragTarget?.destroy();
        this.updateHandCards();
        this.animateCharacterEffect(characterCard);
      }
    });
  }

  private animateCharacterEffect(characterCard: Container): void {
    // Add glow effect to character
    gsap.to(characterCard.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.2,
      yoyo: true,
      repeat: 1,
      ease: 'power2.inOut'
    });
  }

  private async animateCardDraw(): Promise<void> {
    // Animate cards being drawn from deck
    this.handCards.forEach((card, index) => {
      card.alpha = 0;
      card.scale.set(0);
      
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: index * 0.1,
        ease: 'back.out(1.7)'
      });
    });
    
    // Return promise that resolves when animation completes
    return new Promise(resolve => {
      const longestDelay = (this.handCards.length - 1) * 0.1 + 0.4;
      setTimeout(resolve, longestDelay * 1000);
    });
  }

  private createEndTurnButton(): void {
    if (!this.turnIndicatorContainer) return;
    
    // Clear existing content and make visible
    this.turnIndicatorContainer.removeChildren();
    this.turnIndicatorContainer.visible = true;
    
    const buttonBg = (this.turnIndicatorContainer as any).buttonBg;
    const buttonText = (this.turnIndicatorContainer as any).buttonText;
    
    if (buttonBg && buttonText) {
      // Make the existing button interactive
      buttonBg.interactive = true;
      buttonBg.cursor = 'pointer';
      buttonBg.on('pointertap', () => {
        // Remove the button and resolve main phase
        this.turnIndicatorContainer!.visible = false;
        if (this.mainPhaseResolve) {
          this.mainPhaseResolve();
          this.mainPhaseResolve = undefined;
        }
      });
      
      // Add hover effect
      buttonBg.on('pointerover', () => {
        buttonBg.tint = 0xFFAA88;
      });
      buttonBg.on('pointerout', () => {
        buttonBg.tint = 0xFFFFFF;
      });
    }
  }

  private showBattleResult(): void {
    if (!this.battleState) return;
    
    const resultContainer = new Container();
    
    const overlay = new Graphics();
    overlay.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(0x000000, 0.7);
    
    const resultBg = new Graphics();
    resultBg.roundRect(0, 0, 300, 200, 20)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.UI_BORDER });
    resultBg.x = (this.gameWidth - 300) / 2;
    resultBg.y = (this.gameHeight - 200) / 2;
    
    const isVictory = this.battleState.winner_team === 1;
    const resultText = new Text({
      text: isVictory ? 'VICTORY!' : 'DEFEAT!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fill: isVictory ? Colors.SUCCESS : Colors.ERROR,
        align: 'center'
      }
    });
    resultText.anchor.set(0.5);
    resultText.x = this.gameWidth / 2;
    resultText.y = this.gameHeight / 2 - 30;
    
    const backButton = new Container();
    const backBg = new Graphics();
    backBg.roundRect(0, 0, 100, 40, 8)
      .fill(Colors.BUTTON_PRIMARY)
      .stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const backText = new Text({
      text: 'BACK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = 50;
    backText.y = 20;
    
    backButton.addChild(backBg, backText);
    backButton.x = this.gameWidth / 2 - 50;
    backButton.y = this.gameHeight / 2 + 40;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', () => {
      navigation.showScreen(HomeScene);
    });
    
    resultContainer.addChild(overlay, resultBg, resultText, backButton);
    this.container.addChild(resultContainer);
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update layout on resize
    this.setupLayout();
    this.updateUI();
  }

  public update(): void {
    // Update logic can be added here if needed
  }
}
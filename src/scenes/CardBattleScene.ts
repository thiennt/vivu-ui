import { Container, Text, Graphics, Ticker } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { HandZone } from './CardBattle/HandZone';
import { PlayerCharacterZone } from './CardBattle/PlayerCharacterZone';
import { BattleLogZone } from './CardBattle/BattleLogZone';
import { BattleField } from './CardBattle/BattleField';
import {
  CardBattleState,
  TurnAction,
  BattlePhaseName,
  Card,
  CardBattleLog
} from '@/types';
import { battleApi, ApiError } from '@/services/api';
import { gsap } from 'gsap';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { ErrorPopup } from '@/popups/ErrorPopup';
import { CardBattleEffects, CardGroup } from '@/ui/CardBattleEffects';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  private battleId: string;

  // Battle state management
  private battleState: CardBattleState | null = null;
  private currentPhase: BattlePhaseName = 'start_turn';
  private mainPhaseResolve?: () => void;

  // Loading and error state management
  private loadingManager: LoadingStateManager;

  // Battlefield background
  private battlefield: BattleField;

  // Zone components
  public p2HandZone: HandZone;
  public p2CharacterZone: PlayerCharacterZone;
  public battleLogZone: BattleLogZone;
  public p1CharacterZone: PlayerCharacterZone;
  public p1HandZone: HandZone;

  // Visual effects handler
  public readonly vfx: CardBattleEffects;

  constructor(params?: { battleId?: string }) {
    super();

    const player = sessionStorage.getItem('player');
    const _battleId = player ? JSON.parse(player).ongoing_battles[0] : null;

    this.battleId = params?.battleId || _battleId || '';

    // Initialize battlefield background first
    this.battlefield = new BattleField();
    this.addChild(this.battlefield);

    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this, this.gameWidth, this.gameHeight);

    // Initialize all zones
    this.p2HandZone = new HandZone({ playerNo: 2 });
    this.addChild(this.p2HandZone);

    this.p2CharacterZone = new PlayerCharacterZone({ playerNo: 2 });
    this.addChild(this.p2CharacterZone);

    this.battleLogZone = new BattleLogZone();
    this.addChild(this.battleLogZone);

    this.p1CharacterZone = new PlayerCharacterZone({ playerNo: 1 });
    this.addChild(this.p1CharacterZone);

    this.p1HandZone = new HandZone({ playerNo: 1 });
    this.addChild(this.p1HandZone);

    // Initialize visual effects handler
    this.vfx = new CardBattleEffects(this);
    this.addChild(this.vfx);

    this.setupDragDropHandlers();

    // Initialize battle after zones are set up
    this.initializeBattle();
  }

  private setupDragDropHandlers(): void {
    // Set up drag/drop callbacks for player 1 hand (only player 1 can drag cards)
    this.p1HandZone.setCardDropCallback((card: Card, dropTarget: string, cardPosition?: number) => {
      this.handleCardDrop(card, dropTarget, cardPosition);
    });

    // Set up character hover callback for zoom effects
    this.p1HandZone.setCharacterHoverCallback((globalX: number, globalY: number, isDragging: boolean) => {
      this.p1CharacterZone.updateCharacterHover(globalX, globalY, isDragging);
    });

    // Set up end turn callback for P1
    this.p1HandZone.setEndTurnCallback(() => {
      this.endTurn();
    });

    // Set up back button callback for P2
    this.p2HandZone.setBackButtonCallback(() => {
      navigation.showScreen(HomeScene);
    });

    // Override the getDropTarget method for HandZone 
    (this.p1HandZone as any).getDropTarget = (globalX: number, globalY: number): string | null => {
      return this.getDropTarget(globalX, globalY);
    };
  }

  private getDropTarget(globalX: number, globalY: number): string | null {
    // Check if dropped on player 1 character
    const p1CharacterTarget = this.p1CharacterZone.getCharacterDropTarget(globalX, globalY);
    if (p1CharacterTarget) {
      return p1CharacterTarget;
    }

    return null;
  }

  private async handleCardDrop(card: Card, dropTarget: string, cardPosition?: number): Promise<void> {
    if (!this.battleState) return;

    // Prevent actions if not interactable
    if (this.battleState.current_player !== 1) {
      return;
    }

    this.disablePlayerUI();

    try {
      if (dropTarget.startsWith('character:')) {
        // Energy feature disabled - players can play cards without energy cost check
        const characterId = dropTarget.replace('character:', '');
        await this.playCardOnCharacter(card, characterId, cardPosition);
      }
    } catch (error) {
      console.error('Error handling card drop:', error);
    }

    this.enablePlayerUI();
  }

  private async playCardOnCharacter(card: Card, characterId: string, cardPosition?: number): Promise<void> {
    if (!this.battleState) return;

    const turnAction: TurnAction = {
      type: 'play_card',
      player_team: this.battleState.current_player,
      card_id: card.id,
      character_id: characterId,
      card_position: cardPosition
    };

    try {
      const response = await battleApi.playCard(this.battleId, turnAction);
      if (response.success && response.data) {
        const logs = response.data;
        console.log('Play card logs:', logs);

        // Update battle state from after_state if available
        if (logs.length > 0 && logs[0].after_state) {
          this.updateBattleStateFromAfterState(logs[0].after_state);
          // New flow: refresh hand & player info -> animation -> update characters
          this.updateHandAndPlayerInfoZones();
          await this.animateCardPlay(characterId, logs);
          this.updateCharacterZones();
        }

        if (logs[1] && logs[1].after_state) {
          this.updateBattleStateFromAfterState(logs[1].after_state);
          this.checkGameEnd(logs[1]);
        }
      }
    } catch (error) {
      console.error('Failed to play card:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to play card. Please try again.';


      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async animateCardPlay(characterId: string, battleLogs?: CardBattleLog[]): Promise<void> {
    if (!battleLogs || battleLogs.length === 0) {
      // Fallback: simple character glow if no battle log data
      await this.animateSimpleCharacterEffect(characterId);
      return;
    }

    const playCardLog = battleLogs[0];
    if (!playCardLog) return;

    // Determine card group for animation style
    const cardGroup = this.getCardGroup(playCardLog.card);

    // Animate complete skill sequence using vfx
    await this.vfx.animateSkill(
      characterId,
      playCardLog.targets,
      cardGroup
    );
  }

  private getCardGroup(card?: Card): CardGroup {
    if (!card || !card.group) return 'other';

    const group = card.group.toLowerCase();

    // Map card groups to animation types
    if (group.includes('attack') || group.includes('high damage')) {
      return 'damage';
    } else if (group.includes('heal') || group.includes('healing') || group.includes('support')) {
      return 'healing';
    } else if (group.includes('control') || group.includes('debuff')) {
      return 'debuff';
    }

    return 'other';
  }



  // Public method to expose findCharacterCard functionality for CardBattleEffects
  public findCharacterCard(characterId: string): Container | null {
    // Search in player 1 character zone
    const p1Card = this.p1CharacterZone.findCharacterCard(characterId);
    if (p1Card) return p1Card;

    // Search in player 2 character zone
    const p2Card = this.p2CharacterZone.findCharacterCard(characterId);
    if (p2Card) return p2Card;

    return null;
  }

  private async animateSimpleCharacterEffect(characterId: string): Promise<void> {
    const characterCard = this.findCharacterCard(characterId);
    if (!characterCard) return;

    return this.vfx.animateSimpleEffect(characterCard);
  }

  // Helper method to update battle state from after_state in battle logs
  private updateBattleStateFromAfterState(afterState: CardBattleState): void {
    this.battleState = afterState;
  }

  // Battle initialization and game logic
  private async initializeBattle(): Promise<void> {
    this.loadingManager.showLoading();

    try {
      // Load battle state from API
      const response = await battleApi.getBattleState(this.battleId);
      this.battleState = response.data;

      console.log('Battle initialized with state:', this.battleState);

      if (this.battleState && this.battleState.players) {
        this.updateAllZones();
        this.loadingManager.hideLoading();

        if (this.battleState.status === 'ongoing') {
          this.startGameLoop();
        } else {
          throw new Error('Invalid battle state received');
        }
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to load battle. Please try again.';
      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async startGameLoop(): Promise<void> {
    if (this.battleState?.current_player === 1) {
      await this.processPlayerTurn();
    } else {
      // AI Turn (auto) - if next player is AI
      await this.processAITurn();
    }
  }

  private async processPlayerTurn(): Promise<void> {
    // Player 1 turn
    // Turn Start
    if (this.battleState?.phase == 'start_turn') {
      await this.processTurnStart();
      // Draw Phase  
      await this.processDrawPhase();
    }

    // Main Phase
    await this.processMainPhase();
  }

  private async processTurnStart(): Promise<void> {
    this.currentPhase = 'start_turn';
    console.log(`Turn Start - Player ${this.battleState?.current_player}`);

    // Show turn start notification
    if (this.battleState) {
      const playerName = this.battleState.current_player === 1 ? 'Your' : 'AI';
      this.battleLogZone.showNotification(`${playerName} Turn!`, Colors.TEXT_PRIMARY, 1500);
    }

    try {
      const response = await battleApi.startTurn(this.battleId);
      if (response.success && response.data) {
        console.log('Turn start logs:', response.data);

        const logs = response.data;

        // Process each log sequentially with animations
        for (const log of logs) {
          if (log.action_type === 'effect_trigger') {
            // Handle effect_trigger animation
            console.log('Effect triggered at turn start:', log);

            // Update battle state from after_state if available
            if (log.after_state) {
              this.updateBattleStateFromAfterState(log.after_state);
            }

            // Update UI before animation
            this.updateAllZones();

            // Animate the effect trigger - using actor's character_id if available
            const actorCharacterId = log.actor?.character_id;
            if (actorCharacterId) {
              await this.animateCardPlay(actorCharacterId, [log]);
            }

            // Add delay between effects for better visual clarity
            await new Promise(resolve => setTimeout(resolve, 300));
          } else {
            // For other action types, just update state
            if (log.after_state) {
              this.updateBattleStateFromAfterState(log.after_state);
            }
          }
        }

        this.updateAllZones();
      }
    } catch (error) {
      console.error('Failed to process turn start:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to start turn. Please try again.';
      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async processDrawPhase(): Promise<void> {
    if (!this.battleState) return;

    this.currentPhase = 'draw_phase';
    console.log('Draw Phase');

    const turnAction: TurnAction = {
      type: 'draw_card',
      player_team: this.battleState.current_player
    };

    try {
      const response = await battleApi.drawCards(this.battleId, turnAction);
      if (response.success && response.data) {
        const logs = response.data;
        console.log('Draw phase logs:', logs);

        // Show notification for player
        if (logs.length > 0 && logs[0].drawn_cards) {
          const drawnCards = logs[0].drawn_cards;
          if (this.battleState.current_player === 1) {
            this.battleLogZone.showNotification(`Drew ${drawnCards.length} card${drawnCards.length !== 1 ? 's' : ''}`, Colors.EFFECT_DRAW_GREEN);
          }
        }

        // Update battle state from after_state if available
        if (logs.length > 0 && logs[0].after_state) {
          this.updateBattleStateFromAfterState(logs[0].after_state);
        }

        this.updateAllZones();
        await this.p1HandZone.animateCardDraw();
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to draw cards. Please try again.';
      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async processMainPhase(): Promise<void> {
    this.currentPhase = 'main_phase';
    console.log('Main Phase - Player can take actions');

    // For player 1: Enable interactions and wait for player input
    if (this.battleState?.current_player === 1) {
      // Return Promise that resolves when player ends turn
      return new Promise((resolve) => {
        this.mainPhaseResolve = resolve;
      });
    } else {
      // For AI: Skip main phase (could add AI logic here)
      return Promise.resolve();
    }
  }

  private async processEndTurn(): Promise<void> {
    this.currentPhase = 'end_turn';
    console.log('End Turn - Processing end turn effects');

    const turnAction: TurnAction = {
      type: 'end_turn',
      player_team: this.battleState!.current_player
    };

    try {
      const response = await battleApi.endTurn(this.battleId, turnAction);
      if (response.success && response.data) {
        const logs = response.data;
        console.log('End turn logs:', logs);

        // Update battle state from after_state if available
        if (logs.length > 0 && logs[0].after_state) {
          this.updateBattleStateFromAfterState(logs[0].after_state);
          this.updateAllZones();
        }

        // Check if battle ended during end turn (e.g., from end-of-turn effects)
        if (!this.checkGameEnd(logs[logs.length - 1])) {
          this.processAITurn();
        }
      }
    } catch (error) {
      console.error('Failed to process end turn:', error);
      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to end turn. Please try again.';
      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async processAITurn(): Promise<void> {
    this.currentPhase = 'ai_turn';
    console.log('AI Turn - Processing AI actions');

    this.disablePlayerUI();

    try {
      const response = await battleApi.aiTurn(this.battleId);
      if (response.success && response.data) {
        const logs = response.data;
        console.log('AI turn logs:', logs);

        // Process each log sequentially with animations
        let gameEnded = false;
        for (const log of logs) {
          gameEnded = await this.processAIActionLog(log);

          // Stop processing if game has ended
          if (gameEnded) {
            break;
          }

          // Add delay between AI actions for better visual clarity
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        this.enablePlayerUI();

        // Only continue to player turn if game hasn't ended
        if (!gameEnded) {
          this.processPlayerTurn();
        }
      }
    } catch (error) {
      console.error('Failed to process AI turn:', error);
      this.enablePlayerUI();

      const errorMessage = error instanceof ApiError
        ? error.message
        : 'Failed to process AI turn. Please try again.';
      navigation.presentPopup(ErrorPopup, {
        message: errorMessage
      });
      this.updateAllZones();
    }
  }

  private async processAIActionLog(log: CardBattleLog): Promise<boolean> {
    if (log.action_type === 'draw_card') {
      // Handle draw card animation for AI
      const cardCount = log.drawn_cards?.length || 0;
      console.log('AI drew cards:', cardCount);

      // Show notification
      this.battleLogZone.showNotification(`Enemy drew ${cardCount} card${cardCount !== 1 ? 's' : ''}`, Colors.EFFECT_DRAW_BLUE);

      // Update battle state from after_state if available
      if (log.after_state) {
        this.updateBattleStateFromAfterState(log.after_state);
      }

      this.updateAllZones();
      await this.p2HandZone.animateCardDraw();

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return false; // Game hasn't ended
    } else if (log.action_type === 'play_card' && log.card && log.targets) {
      // Handle play card animation for AI
      console.log(`AI played card: ${log.card.name}`);

      // Show notification
      this.battleLogZone.showNotification(`Enemy played: ${log.card.name}`, Colors.EFFECT_PLAY_ORANGE);

      // Update battle state from after_state if available
      if (log.after_state) {
        this.updateBattleStateFromAfterState(log.after_state);
      }

      // Update UI before animation
      this.updateAllZones();

      // Animate the card play - using actor's character_id if available
      const actorCharacterId = log.actor.character_id;
      if (actorCharacterId) {
        await this.animateCardPlay(actorCharacterId, [log]);
      }
    } else if (log.action_type === 'effect_trigger') {
      // Handle effect_trigger animation for AI
      console.log('AI effect triggered:', log);

      // Show notification if card/effect name is available
      const effectName = log.card?.name || 'Effect';
      this.battleLogZone.showNotification(`${effectName} triggered!`, Colors.EFFECT_PLAY_ORANGE);

      // Update battle state from after_state if available
      if (log.after_state) {
        this.updateBattleStateFromAfterState(log.after_state);
      }

      // Update UI before animation
      this.updateAllZones();

      // Animate the effect trigger - using actor's character_id if available
      const effectActorId = log.actor?.character_id;
      if (effectActorId) {
        await this.animateCardPlay(effectActorId, [log]);
      }

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 300));
      return false; // Game hasn't ended
    } else if (log.action_type === 'end_turn') {
      // Handle end turn for AI
      console.log('AI ended its turn');

      // Show notification
      this.battleLogZone.showNotification('Enemy ended its turn', Colors.TEXT_PRIMARY, 1500);

      // Update battle state from after_state if available
      if (log.after_state) {
        this.updateBattleStateFromAfterState(log.after_state);
      }

      this.updateAllZones();

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 500));
      return false; // Game hasn't ended
    }

    // Check for game end after AI plays a card (similar to player turn)
    return this.checkGameEnd(log);
  }

  private checkGameEnd(log: CardBattleLog): boolean {
    if (log.action_type === 'battle_end') {
      this.showBattleResult();
      return true;
    }

    return false;
  }

   private showBattleResult(): void {
    if (!this.battleState) return;

    const resultContainer = new Container();

    // Dark fantasy overlay
    const overlay = new Graphics();
    overlay.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BLACK, alpha: 0.9 });

    // Victory/Defeat banner dimensions
    const bannerWidth = Math.min(400, this.gameWidth - 60);
    const bannerHeight = 280;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = (this.gameHeight - bannerHeight) / 2;

    // Fantasy parchment result panel
    const resultBg = new Graphics();
    
    // Shadow
    resultBg.roundRect(bannerX + 5, bannerY + 5, bannerWidth, bannerHeight, 15)
      .fill({ color: Colors.BLACK, alpha: 0.7 });
    
    const isVictory = this.battleState.winner_team === 1;
    
    // Main panel with victory/defeat colors
    const panelColor = isVictory ? Colors.ROBOT_CYAN : Colors.ROBOT_ELEMENT;
    resultBg.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 15)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 4, color: panelColor });
    
    // Inner layer
    resultBg.roundRect(bannerX + 5, bannerY + 5, bannerWidth - 10, bannerHeight - 10, 12)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.6 });
    
    // Golden/brown highlight
    resultBg.roundRect(bannerX + 8, bannerY + 8, bannerWidth - 16, bannerHeight - 16, 10)
      .stroke({ width: 2, color: panelColor, alpha: 0.8 });
    
    // Decorative corners
    this.drawResultCorners(resultBg, bannerX, bannerY, bannerWidth, bannerHeight, panelColor);

    // Victory/Defeat icon
    const iconText = new Text({
      text: isVictory ? '🏆' : '💀',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 64,
        fill: Colors.WHITE
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = this.gameWidth / 2;
    iconText.y = bannerY + 70;

    // Result text
    const resultText = new Text({
      text: isVictory ? 'VICTORY!' : 'DEFEAT!',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 42,
        fontWeight: 'bold',
        fill: isVictory ? Colors.GREEN_DARK : Colors.RED_DARKEST,
        stroke: { color: isVictory ? Colors.ROBOT_CYAN : Colors.ROBOT_CYAN, width: 3 },
        dropShadow: {
          color: isVictory ? Colors.ROBOT_CYAN : Colors.BLACK,
          blur: 5,
          angle: Math.PI / 4,
          distance: 3,
          alpha: 0.8
        },
        align: 'center'
      }
    });
    resultText.anchor.set(0.5);
    resultText.x = this.gameWidth / 2;
    resultText.y = bannerY + 140;

    // Subtitle
    const subtitleText = new Text({
      text: isVictory ? 'Well fought, hero!' : 'Try again, brave warrior!',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fill: Colors.ROBOT_ELEMENT,
        align: 'center'
      }
    });
    subtitleText.anchor.set(0.5);
    subtitleText.x = this.gameWidth / 2;
    subtitleText.y = bannerY + 185;

    // Back button with fantasy style
    const backButton = new Container();
    const buttonWidth = 140;
    const buttonHeight = 45;
    
    const backBg = new Graphics();
    backBg.roundRect(2, 2, buttonWidth, buttonHeight, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    backBg.roundRect(0, 0, buttonWidth, buttonHeight, 8)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    backBg.roundRect(2, 2, buttonWidth - 4, buttonHeight - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });

    const backText = new Text({
      text: '← Back Home',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 },
        align: 'center'
      }
    });
    backText.anchor.set(0.5);
    backText.x = buttonWidth / 2;
    backText.y = buttonHeight / 2;

    backButton.addChild(backBg, backText);
    backButton.x = this.gameWidth / 2 - buttonWidth / 2;
    backButton.y = bannerY + 215;

    backButton.interactive = true;
    backButton.cursor = 'pointer';
    
    backButton.on('pointerover', () => {
      backBg.clear();
      backBg.roundRect(2, 2, buttonWidth, buttonHeight, 8)
        .fill({ color: Colors.BLACK, alpha: 0.4 });
      backBg.roundRect(0, 0, buttonWidth, buttonHeight, 8)
        .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN });
      backBg.roundRect(2, 2, buttonWidth - 4, buttonHeight - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.9 });
      backButton.scale.set(1.03);
    });
    
    backButton.on('pointerout', () => {
      backBg.clear();
      backBg.roundRect(2, 2, buttonWidth, buttonHeight, 8)
        .fill({ color: Colors.BLACK, alpha: 0.4 });
      backBg.roundRect(0, 0, buttonWidth, buttonHeight, 8)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN });
      backBg.roundRect(2, 2, buttonWidth - 4, buttonHeight - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });
      backButton.scale.set(1.0);
    });
    
    backButton.on('pointertap', () => {
      navigation.showScreen(HomeScene);
    });

    resultContainer.addChild(overlay, resultBg, iconText, resultText, subtitleText, backButton);
    this.addChild(resultContainer);
  }

  private drawResultCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 15;
    
    // Top-left
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 3, color: color, alpha: 0.9 });
    graphics.circle(x + 5, y + 5, 3).fill({ color: color, alpha: 1 });
    
    // Top-right
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 3, color: color, alpha: 0.9 });
    graphics.circle(x + width - 5, y + 5, 3).fill({ color: color, alpha: 1 });
    
    // Bottom-left
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 3, color: color, alpha: 0.9 });
    graphics.circle(x + 5, y + height - 5, 3).fill({ color: color, alpha: 1 });
    
    // Bottom-right
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 3, color: color, alpha: 0.9 });
    graphics.circle(x + width - 5, y + height - 5, 3).fill({ color: color, alpha: 1 });
  }

  private endTurn(): void {
    this.processEndTurn();
  }

  private updateAllZones(): void {
    if (!this.battleState) return;

    // Update player zones with battle state
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);

    if (player1) {
      this.p1CharacterZone.updateBattleState(player1);
      this.p1HandZone.updateBattleState(player1);
    }

    if (player2) {
      this.p2CharacterZone.updateBattleState(player2);
      this.p2HandZone.updateBattleState(player2);
    }

    // Update battle log with turn number
    this.battleLogZone.updatePhase(this.currentPhase, this.battleState.current_player, this.battleState.current_turn);

    // Enable/disable UI based on current player
    this.updateUIState();
  }

  private updateHandAndPlayerInfoZones(): void {
    if (!this.battleState) return;

    // Update player zones with battle state - only hand and player info
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);

    if (player1) {
      this.p1HandZone.updateBattleState(player1);
    }

    if (player2) {
      this.p2HandZone.updateBattleState(player2);
    }

    // Update battle log with turn number
    this.battleLogZone.updatePhase(this.currentPhase, this.battleState.current_player, this.battleState.current_turn);
  }

  private updateCharacterZones(): void {
    if (!this.battleState) return;

    // Update player zones with battle state - only character zones
    const player1 = this.battleState.players.find(p => p.team === 1);
    const player2 = this.battleState.players.find(p => p.team === 2);

    if (player1) {
      this.p1CharacterZone.updateBattleState(player1);
    }

    if (player2) {
      this.p2CharacterZone.updateBattleState(player2);
    }
  }

  private updateUIState(): void {
    // Disable UI if it's not player 1's turn
    if (this.battleState?.current_player !== 1) {
      this.disablePlayerUI();
    } else {
      this.enablePlayerUI();
    }
  }

  private disablePlayerUI(): void {
    this.p1HandZone.setInteractable(false);
  }

  private enablePlayerUI(): void {
    this.p1HandZone.setInteractable(true);
  }

  /**
  * Update method called every frame
  */
  public update(ticker: Ticker): void {
    // Update battlefield animations
    this.battlefield.update(ticker);

    // You can add other per-frame updates here
    // e.g., VFX updates, character animations, etc.
  }

  /** Resize handler - Exactly 700px optimized */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    // Resize battlefield background
    this.battlefield.resize(width, height);

    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Layout constants for exactly 700px
    const PADDING = this.STANDARD_PADDING; // 8px
    const SPACING = this.STANDARD_PADDING; // 8px between zones

    // Fixed heights for zones
    const CHARACTER_ZONE_HEIGHT = 120; // Character zones
    const BATTLE_LOG_HEIGHT = 90; // Battle log

    const handZoneHeight = Math.floor((height - CHARACTER_ZONE_HEIGHT * 2 - BATTLE_LOG_HEIGHT - PADDING * 2 - SPACING * 4) / 2);

    // Start layout from top
    let currentY = PADDING;

    // PLAYER 2 HAND ZONE (includes BACK button space at top)
    this.p2HandZone.x = PADDING;
    this.p2HandZone.y = currentY;
    this.p2HandZone.resize(width - 2 * PADDING, handZoneHeight);
    currentY += handZoneHeight + SPACING;

    // PLAYER 2 CHARACTER ZONE
    this.p2CharacterZone.x = PADDING;
    this.p2CharacterZone.y = currentY;
    this.p2CharacterZone.resize(width - 2 * PADDING, CHARACTER_ZONE_HEIGHT);
    currentY += CHARACTER_ZONE_HEIGHT + SPACING;

    // BATTLE LOG ZONE (center)
    this.battleLogZone.x = PADDING;
    this.battleLogZone.y = currentY;
    this.battleLogZone.resize(width - 2 * PADDING, BATTLE_LOG_HEIGHT);
    currentY += BATTLE_LOG_HEIGHT + SPACING;

    // PLAYER 1 CHARACTER ZONE
    this.p1CharacterZone.x = PADDING;
    this.p1CharacterZone.y = currentY;
    this.p1CharacterZone.resize(width - 2 * PADDING, CHARACTER_ZONE_HEIGHT);
    currentY += CHARACTER_ZONE_HEIGHT + SPACING;

    // PLAYER 1 HAND ZONE (includes END TURN button space at bottom)
    this.p1HandZone.x = PADDING;
    this.p1HandZone.y = currentY;
    this.p1HandZone.resize(width - 2 * PADDING, handZoneHeight);
    currentY += handZoneHeight + PADDING;
  }
}
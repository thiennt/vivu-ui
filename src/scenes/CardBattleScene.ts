import { Container, Text, Graphics } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { HandZone } from './CardBattle/HandZone';
import { PlayerCharacterZone } from './CardBattle/PlayerCharacterZone';
import { BattleLogZone } from './CardBattle/BattleLogZone';
import {
  CardBattleState,
  TurnAction,
  BattlePhaseName,
  Card,
  CardBattleLog,
  CardBattleLogTarget,
  LogImpact
} from '@/types';
import { battleApi, ApiError } from '@/services/api';
import { gsap } from 'gsap';
import { Colors } from '@/utils/colors';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  private battleId: string;

  // Battle state management
  private battleState: CardBattleState | null = null;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  private mainPhaseResolve?: () => void;

  // Loading and error state management
  private loadingManager: LoadingStateManager;

  // Zone components following the layout order:
  // PLAYER 2 HAND ZONE (Skill Cards)  
  // PLAYER 2 INFO (P2 + Energy count + Deck count + DISCARD ZONE) + 3 CHARACTERS ZONE
  // BATTLE LOG ZONE
  // PLAYER 1 INFO (P1 + Energy count + Deck count + DISCARD ZONE) + 3 CHARACTERS ZONE
  // PLAYER 1 HAND ZONE (Skill Cards)
  // BUTTONS ZONE

  private p2HandZone: HandZone;
  private p2CharacterZone: PlayerCharacterZone;
  private battleLogZone: BattleLogZone;
  private p1CharacterZone: PlayerCharacterZone;
  private p1HandZone: HandZone;

  constructor(params?: { battleId?: string }) {
    super();

    this.battleId = params?.battleId || 'b205a2bd-4e64-4336-85c5-c950c70d0ca3';

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

    this.setupDragDropHandlers();

    // Initialize battle after zones are set up
    this.initializeBattle();
  }

  private setupDragDropHandlers(): void {
    // Set up drag/drop callbacks for player 1 hand (only player 1 can drag cards)
    this.p1HandZone.setCardDropCallback((card: Card, dropTarget: string) => {
      this.handleCardDrop(card, dropTarget);
    });

    // Set up discard highlighting callbacks
    this.p1HandZone.setDiscardHighlightCallbacks(
      () => this.p1CharacterZone.updateDiscardHighlight(true),
      () => this.p1CharacterZone.updateDiscardHighlight(false)
    );

    // Set up character hover callback for zoom effects
    this.p1HandZone.setCharacterHoverCallback((globalX: number, globalY: number, isDragging: boolean) => {
      this.p1CharacterZone.updateCharacterHover(globalX, globalY, isDragging);
    });

    // Set up end turn callback
    this.p1HandZone.setEndTurnCallback(() => {
      this.endTurn();
    });

    // Override the getDropTarget method for HandZone 
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    // Check if dropped on player 1 info zone (now acts as discard)
    if (this.p1CharacterZone.isPointInPlayerInfo(globalX, globalY)) {
      return 'discard';
    }

    return null;
  }

  private async handleCardDrop(card: Card, dropTarget: string): Promise<void> {
    if (!this.battleState) return;
    
    // Prevent actions if not interactable
    if (this.isAnimating || this.battleState.current_player !== 1) {
      return;
    }

    this.isAnimating = true;
    this.disablePlayerUI();

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
    }

    this.isAnimating = false;
    this.enablePlayerUI();
  }

  private async discardCardForEnergy(card: Card): Promise<void> {
    if (!this.battleState) return;

    // Store previous energy count for animation
    const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
    const previousEnergy = currentPlayer?.deck.current_energy || 0;

    const turnAction: TurnAction = {
      type: 'discard_card',
      player_team: this.battleState.current_player,
      card_id: card.id
    };

    try {
      const response = await battleApi.discardCard(this.battleId, turnAction);
      if (response.success && response.data) {
        console.log('Discard card logs:', response.data);

        // Remove card from player's hand
        if (currentPlayer && currentPlayer.deck.hand_cards) {
          currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: { card?: Card }) => c.card?.id !== card.id);
        }

        // Get the card container from hand zone before updating zones
        const cardContainer = this.p1HandZone.getDragTarget();
        
        // Animate card to discard zone before updating UI
        if (cardContainer) {
          const discardTarget = this.p1CharacterZone.toGlobal({ x: 0, y: 0 });
          await this.animateCardToDiscard(cardContainer, discardTarget);
        }

        // Update energy from impacts if available
        if (response.data.length > 0 && response.data[0].impacts && currentPlayer) {
          const energyImpact = response.data[0].impacts.find((impact: LogImpact) => impact.type === 'energy');
          if (energyImpact && typeof energyImpact.value === 'number') {
            currentPlayer.deck.current_energy = energyImpact.value;
          }
        }

        this.updateAllZones();

        // Animate energy count increase after updating zones
        const newEnergy = currentPlayer?.deck.current_energy || 0;
        if (newEnergy > previousEnergy) {
          await this.animateEnergyIncrease(1, previousEnergy, newEnergy);
        }
      }
    } catch (error) {
      console.error('Failed to discard card:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to discard card. Please try again.';
      this.battleLogZone.showNotification(errorMessage, Colors.ERROR, 3000);
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
        console.log('Play card logs:', response.data);

        // Remove card from player's hand
        const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
        if (currentPlayer && currentPlayer.deck.hand_cards) {
          currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: { card?: Card }) => c.card?.id !== card.id);
        }

        // Update character states from log targets if available
        if (response.data.length > 0 && response.data[0].targets) {
          response.data[0].targets.forEach((target: CardBattleLogTarget) => {
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

        this.updateAllZones();
        await this.animateCardPlay(characterId, response.data);
      }
    } catch (error) {
      console.error('Failed to play card:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to play card. Please try again.';
      this.battleLogZone.showNotification(errorMessage, Colors.ERROR, 3000);
    }
  }

  private async animateCardToDiscard(cardContainer: Container, discardTarget: { x: number; y: number }): Promise<void> {
    // Animate card flying to discard zone (player info area)
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: () => {
          // Destroy the card after animation
          cardContainer.destroy();
          resolve();
        }
      })
      .to(cardContainer, {
        x: discardTarget.x + 40, // Center of player info zone
        y: discardTarget.y + 60,
        duration: 0.5,
        ease: 'power2.inOut'
      }, 0)
      .to(cardContainer, {
        scale: 0.3,
        rotation: Math.PI * 2, // Full rotation
        alpha: 0,
        duration: 0.5,
        ease: 'power2.in'
      }, 0);
    });
  }

  private async animateEnergyIncrease(playerTeam: number, _previousEnergy: number, _newEnergy: number): Promise<void> {
    // Get the appropriate character zone based on player team
    const characterZone = playerTeam === 1 ? this.p1CharacterZone : this.p2CharacterZone;
    const energyText = characterZone.getEnergyText();
    
    if (!energyText) return;

    // Animate the energy text with a bounce and glow effect
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: resolve
      })
      // Bounce effect
      .to(energyText, {
        scale: 1.4,
        duration: 0.2,
        ease: 'back.out(2)'
      })
      // Glow effect by changing tint
      .to(energyText, {
        tint: 0xFFFF00, // Yellow glow
        duration: 0.2,
        ease: 'power2.out'
      }, 0)
      // Return to normal scale
      .to(energyText, {
        scale: 1.0,
        duration: 0.3,
        ease: 'elastic.out(1, 0.5)'
      })
      // Return to normal color
      .to(energyText, {
        tint: 0xFFFFFF,
        duration: 0.3,
        ease: 'power2.inOut'
      }, '-=0.3');
    });
  }

  private async animateCardPlay(characterId: string, battleLogs?: CardBattleLog[]): Promise<void> {
    if (!battleLogs || battleLogs.length === 0) {
      // Fallback: simple character glow if no battle log data
      await this.animateSimpleCharacterEffect(characterId);
      return;
    }

    const playCardLog = battleLogs[0];
    if (!playCardLog) return;

    // 1. Animate character performing skill
    await this.animateCharacterPerformSkill(characterId);

    // 2. Animate effects on targets
    if (playCardLog.targets && playCardLog.targets.length > 0) {
      // Process all targets simultaneously for visual impact
      const targetAnimations = playCardLog.targets.map(target => 
        this.animateTargetEffects(target)
      );
      await Promise.all(targetAnimations);
    }

    // 3. Final update to refresh UI after all animations
    this.updateAllZones();
  }

  private async animateCharacterPerformSkill(characterId: string): Promise<void> {
    const characterCard = this.findCharacterCard(characterId);
    if (!characterCard) return;

    // Skill performance animation: glow + scale + brief movement
    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      // Add skill glow effect
      timeline.to(characterCard, {
        duration: 0.2,
        scale: 1.15,
        ease: 'power2.out'
      })
      // Brief skill cast movement/shake
      .to(characterCard, {
        duration: 0.1,
        x: characterCard.x + 5,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.1,
        x: characterCard.x - 5,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.1,
        x: characterCard.x,
        ease: 'power2.inOut'
      })
      // Return to normal scale
      .to(characterCard, {
        duration: 0.3,
        scale: 1.0,
        ease: 'power2.inOut'
      });
    });
  }

  private async animateTargetEffects(target: CardBattleLogTarget): Promise<void> {
    const targetCard = this.findCharacterCard(target.id);
    if (!targetCard) return;

    // Extract damage from impacts
    const damageImpact = target.impacts?.find(impact => impact.type === 'damage');
    const damage = typeof damageImpact?.value === 'number' ? damageImpact.value : 0;
    const isCritical = (damageImpact?.meta as { isCritical?: boolean })?.isCritical || false;

    return new Promise((resolve) => {
      const timeline = gsap.timeline({
        onComplete: resolve
      });

      if (damage > 0) {
        // Damage animation: flash red + shake + scale
        timeline.to(targetCard, {
          duration: 0.1,
          tint: 0xFF6666, // Red tint for damage
          ease: 'power2.out'
        })
        // Critical hit gets more dramatic effect
        .to(targetCard, {
          duration: isCritical ? 0.2 : 0.15,
          scale: isCritical ? 0.85 : 0.9,
          rotation: isCritical ? 0.1 : 0.05,
          ease: 'power2.inOut'
        })
        // Shake effect for impact
        .to(targetCard, {
          duration: 0.05,
          x: targetCard.x + (isCritical ? 8 : 4),
          ease: 'power2.inOut'
        })
        .to(targetCard, {
          duration: 0.05,
          x: targetCard.x - (isCritical ? 8 : 4),
          ease: 'power2.inOut'
        })
        .to(targetCard, {
          duration: 0.05,
          x: targetCard.x,
          ease: 'power2.inOut'
        })
        // Return to normal
        .to(targetCard, {
          duration: 0.3,
          tint: 0xFFFFFF, // Back to normal color
          scale: 1.0,
          rotation: 0,
          ease: 'power2.out'
        });

        // Show damage number if significant damage
        if (damage > 0) {
          this.showDamageNumber(targetCard, damage, isCritical);
        }
      } else {
        // Non-damage effect (heal, buff, etc.) - gentle glow
        timeline.to(targetCard, {
          duration: 0.2,
          tint: 0x66FF66, // Green tint for positive effects
          scale: 1.1,
          ease: 'power2.out'
        })
        .to(targetCard, {
          duration: 0.4,
          tint: 0xFFFFFF,
          scale: 1.0,
          ease: 'power2.inOut'
        });
      }
    });
  }

  private showDamageNumber(targetCard: Container, damage: number, isCritical: boolean): void {
    // Create floating damage text
    const damageText = new Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Arial',
        fontSize: isCritical ? 20 : 16,
        fill: isCritical ? 0xFF3333 : 0xFF6666,
        fontWeight: isCritical ? 'bold' : 'normal',
        stroke: { color: 0x000000, width: 2 }
      }
    });

    // Position above the target card
    damageText.x = targetCard.x;
    damageText.y = targetCard.y - 30;
    damageText.anchor.set(0.5);
    damageText.alpha = 0;

    this.addChild(damageText);

    // Animate damage number
    gsap.timeline()
      .to(damageText, {
        duration: 0.2,
        alpha: 1,
        y: damageText.y - 20,
        scale: isCritical ? 1.2 : 1.0,
        ease: 'power2.out'
      })
      .to(damageText, {
        duration: 0.8,
        alpha: 0,
        y: damageText.y - 40,
        ease: 'power2.in',
        onComplete: () => {
          damageText.destroy();
        }
      });
  }

  private findCharacterCard(characterId: string): Container | null {
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

    // Simple glow effect fallback
    return new Promise((resolve) => {
      gsap.timeline({
        onComplete: resolve
      })
      .to(characterCard, {
        duration: 0.2,
        scale: 1.1,
        ease: 'power2.inOut'
      })
      .to(characterCard, {
        duration: 0.2,
        scale: 1.0,
        ease: 'power2.inOut'
      });
    });
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
        this.startGameLoop();
      } else {
        throw new Error('Invalid battle state received');
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load battle. Please try again.';
      this.loadingManager.showError(errorMessage, () => {
        this.loadingManager.hideError();
        this.initializeBattle();
      });
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
    await this.processTurnStart();

    // Draw Phase  
    await this.processDrawPhase();

    // Main Phase
    await this.processMainPhase();

    this.checkGameEnd();
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
        this.updateAllZones();
      }
    } catch (error) {
      console.error('Failed to process turn start:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to start turn. Please try again.';
      this.loadingManager.showError(errorMessage, () => {
        this.loadingManager.hideError();
        this.processTurnStart();
      });
      throw error; // Re-throw to stop turn processing
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

        // Update hand cards from drawn_cards if available
        if (logs.length > 0 && logs[0].drawn_cards) {
          const drawnCards = logs[0].drawn_cards;
          console.log('Cards drawn:', drawnCards);

          // Show notification for player
          if (this.battleState.current_player === 1) {
            this.battleLogZone.showNotification(`Drew ${drawnCards.length} card${drawnCards.length !== 1 ? 's' : ''}`, 0x66FF66);
          }

          // Add cards to player's hand in battleState
          if (this.battleState) {
            const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
            if (currentPlayer) {
              currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards || [];
              drawnCards.forEach((card: unknown) => {
                currentPlayer.deck.hand_cards.push({ card: card as Card });
              });
            }
          }
        }

        this.updateAllZones();
        await this.p1HandZone.animateCardDraw();
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to draw cards. Please try again.';
      this.loadingManager.showError(errorMessage, () => {
        this.loadingManager.hideError();
        this.processDrawPhase();
      });
      throw error; // Re-throw to stop turn processing
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
              const teamCharacters = afterState.characters!.filter((c: unknown) => 
                (c as { team: number }).team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }

        this.updateAllZones();

        // Check if battle is completed before processing next turn
        if (!this.checkGameEnd()) {
          this.processAITurn();
        }
      }
    } catch (error) {
      console.error('Failed to process end turn:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to end turn. Please try again.';
      this.loadingManager.showError(errorMessage, () => {
        this.loadingManager.hideError();
        this.processEndTurn();
      });
    }
  }

  private async processAITurn(): Promise<void> {
    this.currentPhase = 'ai_turn';
    console.log('AI Turn - Processing AI actions');

    this.isAnimating = true;
    this.disablePlayerUI();

    try {
      const response = await battleApi.aiTurn(this.battleId);
      if (response.success && response.data) {
        const logs = response.data;
        console.log('AI turn logs:', logs);

        // Process each log sequentially with animations
        for (const log of logs) {
          await this.processAIActionLog(log);
          
          // Add delay between AI actions for better visual clarity
          await new Promise(resolve => setTimeout(resolve, 500));
        }

        // Update battle state from the last log's after_state if available
        if (logs.length > 0 && logs[logs.length - 1].after_state && this.battleState) {
          const afterState = logs[logs.length - 1].after_state;
          if (afterState.current_player !== undefined) {
            this.battleState.current_player = afterState.current_player;
          }
          if (afterState.turn !== undefined) {
            this.battleState.current_turn = afterState.turn;
          }
          if (afterState.characters) {
            this.battleState.players.forEach(player => {
              const teamCharacters = afterState.characters!.filter((c: unknown) => 
                (c as { team: number }).team === player.team
              );
              if (teamCharacters.length > 0) {
                player.characters = teamCharacters;
              }
            });
          }
        }

        this.updateAllZones();
        this.isAnimating = false;
        this.enablePlayerUI();

        // Check if battle is completed before processing next turn
        if (!this.checkGameEnd()) {
          this.processPlayerTurn();
        }
      }
    } catch (error) {
      console.error('Failed to process AI turn:', error);
      this.isAnimating = false;
      this.enablePlayerUI();
      
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to process AI turn. Please try again.';
      this.loadingManager.showError(errorMessage, () => {
        this.loadingManager.hideError();
        this.processAITurn();
      });
    }
  }

  private async processAIActionLog(log: CardBattleLog): Promise<void> {
    if (log.action_type === 'draw_card') {
      // Handle draw card animation for AI
      const cardCount = log.drawn_cards?.length || 0;
      console.log('AI drew cards:', cardCount);
      
      // Show notification
      this.battleLogZone.showNotification(`AI drew ${cardCount} card${cardCount !== 1 ? 's' : ''}`, 0x6699FF);

      const drawnCards = log.drawn_cards || [];
      // Add cards to AI's hand
      if (this.battleState) {
        const aiPlayer = this.battleState.players.find(p => p.team === 2);
        if (aiPlayer) {
          aiPlayer.deck.hand_cards = aiPlayer.deck.hand_cards || [];
          drawnCards.forEach((card: unknown) => {
            aiPlayer.deck.hand_cards.push({ card: card as Card });
          });
        }
      }

      this.updateAllZones();
      await this.p2HandZone.animateCardDraw();

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } else if (log.action_type === 'discard_card') {
      // Handle discard card animation for AI
      console.log('AI discarded a card');
      
      // Store previous energy count for animation
      const aiPlayer = this.battleState?.players.find(p => p.team === 2);
      const previousEnergy = aiPlayer?.deck.current_energy || 0;
      
      // Show notification
      this.battleLogZone.showNotification('AI discarded a card', 0xFF6666);

      // Update AI's hand - remove one card
      if (aiPlayer && aiPlayer.deck.hand_cards && aiPlayer.deck.hand_cards.length > 0) {
        // Animate the last card in AI's hand (or random)
        const cardToAnimate = this.p2HandZone.getRandomHandCard();
        
        // Remove one card from hand
        aiPlayer.deck.hand_cards.pop();
        
        // Animate card to AI's discard zone before updating zones
        if (cardToAnimate) {
          const discardTarget = this.p2CharacterZone.toGlobal({ x: 0, y: 0 });
          await this.animateCardToDiscard(cardToAnimate, discardTarget);
        }
      }

      // Update energy from impacts if available
      if (log.impacts && aiPlayer) {
        const energyImpact = log.impacts.find((impact: LogImpact) => impact.type === 'energy');
        if (energyImpact && typeof energyImpact.value === 'number') {
          aiPlayer.deck.current_energy = energyImpact.value;
        }
      }

      this.updateAllZones();

      // Animate energy count increase after updating zones
      const newEnergy = aiPlayer?.deck.current_energy || 0;
      if (newEnergy > previousEnergy) {
        await this.animateEnergyIncrease(2, previousEnergy, newEnergy);
      }

      // Brief delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } else if (log.action_type === 'play_card' && log.card && log.targets) {
      // Handle play card animation for AI
      console.log(`AI played card: ${log.card.name}`);
      
      // Show notification
      this.battleLogZone.showNotification(`AI played: ${log.card.name}`, 0xFF9966);
      
      // Update character states from log targets
      if (this.battleState) {
        log.targets.forEach((target: CardBattleLogTarget) => {
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

      // Update UI before animation
      this.updateAllZones();

      // Animate the card play - using actor's character_id if available
      const actorCharacterId = log.actor.character_id;
      if (actorCharacterId) {
        await this.animateCardPlay(actorCharacterId, [log]);
      }
    }
  }

  private checkGameEnd(): boolean {
    if (!this.battleState || !this.battleState.players) return false;

    if (this.battleState.status === 'completed') {
      console.log(`Game ended. Winner: Team ${this.battleState.winner_team}`);
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
        console.log(`Game ended. Winner: Team ${this.battleState.winner_team}`);
        this.showBattleResult();
        return true;
      }
    }

    return false;
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
    this.addChild(resultContainer);
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
    
    // Enable/disable UI based on current player and animation state
    this.updateUIState();
  }

  private updateUIState(): void {
    // Disable UI during animations or if it's not player 1's turn
    if (this.isAnimating || !this.battleState || this.battleState.current_player !== 1 || this.currentPhase === 'ai_turn') {
      this.disablePlayerUI();
    } else {
      this.enablePlayerUI();
    }
  }

  private disablePlayerUI(): void {
    // Disable hand zone interactions
    this.p1HandZone.setInteractable(false);
  }

  private enablePlayerUI(): void {
    // Enable hand zone interactions only if it's player 1's turn
    if (this.battleState && this.battleState.current_player === 1 && !this.isAnimating) {
      this.p1HandZone.setInteractable(true);
    }
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Calculate layout based on backup structure
    const TOP_PADDING = this.STANDARD_PADDING * 2;
    const BETWEEN_AREAS = this.STANDARD_PADDING * 2;
    const BOTTOM_PADDING = this.STANDARD_PADDING * 2;

    const characterZoneHeight = 120;
    const battleLogHeight = 120;
    const handZoneHeight = (height - characterZoneHeight * 2 - battleLogHeight - TOP_PADDING - BOTTOM_PADDING - BETWEEN_AREAS * 5) / 2;

    // Calculate available height and distribute remaining space
    const fixedHeight = handZoneHeight * 2 + characterZoneHeight * 2 + battleLogHeight;
    const totalPadding = TOP_PADDING + BETWEEN_AREAS * 5 + BOTTOM_PADDING; // Reduced from 7 to 5 areas
    const remainingHeight = height - fixedHeight - totalPadding;
    const extraSpacing = Math.max(0, remainingHeight / 6); // Reduced from 8 to 6 sections

    let currentY = TOP_PADDING;

    // PLAYER 2 HAND ZONE (Skill Cards)
    this.p2HandZone.x = this.STANDARD_PADDING;
    this.p2HandZone.y = currentY;
    this.p2HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
    currentY += handZoneHeight + BETWEEN_AREAS + extraSpacing;

    // PLAYER 2 INFO + 3 CHARACTERS ZONE (now includes DiscardZone)
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

    // PLAYER 1 HAND ZONE anchored to bottom
    this.p1HandZone.x = this.STANDARD_PADDING;
    this.p1HandZone.y = currentY;
    this.p1HandZone.resize(width - 2 * this.STANDARD_PADDING, handZoneHeight);
  }
}
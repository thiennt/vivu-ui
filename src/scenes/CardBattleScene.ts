import { Container, Text } from 'pixi.js';
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
  CardBattleLogTarget
} from '@/types';
import { battleApi } from '@/services/api';
import { gsap } from 'gsap';

export class CardBattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  private battleId: string;

  // Battle state management
  private battleState: CardBattleState | null = null;
  private currentPhase: BattlePhaseName = 'start_turn';
  private isAnimating: boolean = false;
  private mainPhaseResolve?: () => void;

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

    // Initialize all zones
    this.p2HandZone = new HandZone({ playerNo: 2 });
    this.addChild(this.p2HandZone);

    this.p2CharacterZone = new PlayerCharacterZone({ playerNo: 2 });
    this.addChild(this.p2CharacterZone);

    this.battleLogZone = new BattleLogZone();
    this.addChild(this.battleLogZone);

    this.p1CharacterZone = new PlayerCharacterZone({ playerNo: 1 });
    this.addChild(this.p1CharacterZone);

    this.p1HandZone = new HandZone(  { playerNo: 1 });
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
        console.log('Discard card logs:', response.data);

        // Remove card from player's hand
        const currentPlayer = this.battleState.players.find(p => p.team === this.battleState!.current_player);
        if (currentPlayer && currentPlayer.deck.hand_cards) {
          currentPlayer.deck.hand_cards = currentPlayer.deck.hand_cards.filter((c: { card?: Card }) => c.card?.id !== card.id);
        }

        this.updateAllZones();
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
    }
  }

  private animateCardToDiscard(): void {
    // Animation will be handled by the drag/drop system
    // Card is already destroyed when this is called
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
    try {
      // Load battle state from API
      const response = await battleApi.getBattleState(this.battleId);
      this.battleState = response.data;

      console.log('Battle initialized with state:', this.battleState);

      if (this.battleState && this.battleState.players) {
        this.updateAllZones();
        this.startGameLoop();
      }
    } catch (error) {
      console.error('Failed to initialize battle:', error);
    }
  }

  private async startGameLoop(): Promise<void> {
    //while (this.battleState && this.battleState.status === 'ongoing') {
      
      if (this.battleState?.current_player === 1) {
        await this.processPlayerTurn();
      } else {
        // AI Turn (auto) - if next player is AI
        await this.processAITurn();
      }

      // Check win condition
      if (this.checkGameEnd()) {
        //break;
      }
    //}
  }

  private async processPlayerTurn(): Promise<void> {
    // Player 1 turn
    // Turn Start
    await this.processTurnStart();

    // Draw Phase  
    await this.processDrawPhase();

    // Main Phase
    await this.processMainPhase();
  }

  private async processTurnStart(): Promise<void> {
    this.currentPhase = 'start_turn';
    console.log(`Turn Start - Player ${this.battleState?.current_player}`);

    try {
      const response = await battleApi.startTurn(this.battleId);
      if (response.success && response.data) {
        console.log('Turn start logs:', response.data);
        this.updateAllZones();
      }
    } catch (error) {
      console.error('Failed to process turn start:', error);
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

        // Add draw card animation for current player
        if (this.battleState.current_player === 1) {
          await this.p1HandZone.animateCardDraw();
        }
      }
    } catch (error) {
      console.error('Failed to draw cards:', error);
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
        }

        this.updateAllZones();
        this.processAITurn();
      }
    } catch (error) {
      console.error('Failed to process end turn:', error);
    }
  }

  private async processAITurn(): Promise<void> {
    this.currentPhase = 'ai_turn';
    console.log('AI Turn - Processing AI actions');

    this.isAnimating = true;

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
        this.processPlayerTurn();
      }
    } catch (error) {
      console.error('Failed to process AI turn:', error);
      this.isAnimating = false;
    }
  }

  private async processAIActionLog(log: CardBattleLog): Promise<void> {
    if (log.action_type === 'draw_card') {
      // Handle draw card animation for AI
      console.log('AI drew cards:', log.drawn_cards?.length || 0);
      // AI hand is hidden, so we just add a brief delay
      await new Promise(resolve => setTimeout(resolve, 300));
    } else if (log.action_type === 'play_card' && log.card && log.targets) {
      // Handle play card animation for AI
      console.log(`AI played card: ${log.card.name}`);
      
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
      return true;
    }

    return false;
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

    // Update battle log
    this.battleLogZone.updatePhase(this.currentPhase, this.battleState.current_player);
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

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
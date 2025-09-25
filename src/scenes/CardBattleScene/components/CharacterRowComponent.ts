import { Container, Text } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { LayoutCalculator } from '../utils/layout';
import { CardBattlePlayerState, CardBattleCharacter } from '@/types';

export interface CharacterRowConfig {
  gameWidth: number;
  gameHeight: number;
  position: { y: number };
  dimensions: { height: number };
  isOpponent: boolean;
  maxCharacters: number;
}

/**
 * Component for managing character row display in battle
 */
export class CharacterRowComponent {
  private container: Container;
  private baseScene: BaseScene;
  private config: CharacterRowConfig;
  private characterCards: Map<string, Container> = new Map();

  // Layout constants
  private readonly CHARACTER_CARD_WIDTH = 100;
  private readonly CHARACTER_CARD_HEIGHT = 140;

  constructor(baseScene: BaseScene, config: CharacterRowConfig) {
    this.baseScene = baseScene;
    this.config = config;
    this.container = new Container();
    this.container.y = config.position.y;
  }

  /**
   * Get the container for this component
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Get all character cards as a map
   */
  getCharacterCards(): Map<string, Container> {
    return this.characterCards;
  }

  /**
   * Setup characters for a player
   */
  setupCharacters(player: CardBattlePlayerState): void {
    // Clear existing character cards
    this.characterCards.clear();
    this.container.removeChildren();
    
    const maxCharacters = Math.min(player.characters.length, this.config.maxCharacters);
    
    if (maxCharacters === 0) return;

    const layout = LayoutCalculator.calculateCharacterLayout(
      this.config.gameWidth,
      maxCharacters,
      10, // standard padding
      10  // standard spacing
    );

    player.characters.forEach((character, index) => {
      if (index < maxCharacters) {
        const x = layout.startX + index * (layout.cardWidth + layout.spacing);
        const y = 0;
        
        const characterCard = this.baseScene.createHeroCard(
          character, 
          x, 
          y, 
          'preview', // Use preview size for better fit
          index,
          layout.cardWidth
        );
        
        this.container.addChild(characterCard);
        this.characterCards.set(character.id, characterCard);
        
        // Make interactive for targeting if not opponent
        if (!this.config.isOpponent) {
          this.makeCharacterCardInteractive(characterCard, character);
        }
      }
    });
  }

  /**
   * Make character card interactive
   */
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

  /**
   * Update character states
   */
  updateCharacterStates(player: CardBattlePlayerState): void {
    for (const character of player.characters) {
      const characterCard = this.characterCards.get(character.id);
      if (characterCard) {
        this.updateCharacterCard(characterCard, character);
      }
    }
  }

  /**
   * Update individual character card display
   */
  private updateCharacterCard(card: Container, character: CardBattleCharacter): void {
    // Update HP display
    const hpText = this.findTextInContainer(card, (text) => 
      text.text.includes('HP:') || text.text.includes('❤️')
    );
    
    if (hpText) {
      hpText.text = `❤️ ${character.hp}`;
      // Change color based on HP percentage
      const hpPercentage = character.hp / (character.max_hp || character.hp);
      if (hpPercentage < 0.3) {
        hpText.style.fill = '#ff4444'; // Red for low HP
      } else if (hpPercentage < 0.6) {
        hpText.style.fill = '#ffaa44'; // Orange for medium HP
      } else {
        hpText.style.fill = '#44ff44'; // Green for high HP
      }
    }

    // Update other stats if needed
    const atkText = this.findTextInContainer(card, (text) => 
      text.text.includes('ATK:') || text.text.includes('⚔️')
    );
    
    if (atkText) {
      atkText.text = `⚔️ ${character.atk}`;
    }

    const defText = this.findTextInContainer(card, (text) => 
      text.text.includes('DEF:') || text.text.includes('🛡️')
    );
    
    if (defText) {
      defText.text = `🛡️ ${character.def}`;
    }

    // Update status effects if any
    this.updateStatusEffects(card, character);
  }

  /**
   * Update status effects display on character card
   */
  private updateStatusEffects(card: Container, character: CardBattleCharacter): void {
    // Remove existing status effect displays
    const existingStatusEffects = card.children.filter(child => 
      (child as any).isStatusEffect
    );
    existingStatusEffects.forEach(effect => card.removeChild(effect));

    // Add new status effects (this would depend on your data structure)
    // For now, just show if character is stunned, poisoned, etc.
    if (character.hp <= 0) {
      card.alpha = 0.5; // Dim defeated characters
    } else {
      card.alpha = 1.0;
    }
  }

  /**
   * Find text in container with predicate
   */
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

  /**
   * Get character cards as containers array for animations
   */
  getCharacterCardsArray(): Container[] {
    return Array.from(this.characterCards.values());
  }

  /**
   * Get drop targets for drag and drop
   */
  getDropTargets(): Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }> {
    const targets: Array<{ id: string; bounds: { x: number; y: number; width: number; height: number } }> = [];
    
    for (const [characterId, characterCard] of this.characterCards) {
      const bounds = characterCard.getBounds();
      targets.push({
        id: characterId,
        bounds: {
          x: bounds.x,
          y: bounds.y,
          width: bounds.width,
          height: bounds.height
        }
      });
    }
    
    return targets;
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    
    // Recalculate layout for existing characters
    if (this.characterCards.size > 0) {
      const layout = LayoutCalculator.calculateCharacterLayout(
        this.config.gameWidth,
        this.characterCards.size,
        10,
        10
      );

      let index = 0;
      for (const characterCard of this.characterCards.values()) {
        const x = layout.startX + index * (layout.cardWidth + layout.spacing);
        characterCard.x = x;
        index++;
      }
    }
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.characterCards.clear();
    this.container.destroy();
  }
}
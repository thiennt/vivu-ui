import { Container, Text } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { CardRenderer } from '../utils/cardRendering';
import { LayoutCalculator } from '../utils/layout';
import { CardBattlePlayerState } from '@/types';

export interface EnergyDeckDiscardConfig {
  gameWidth: number;
  gameHeight: number;
  position: { x: number; y: number };
  dimensions: { height: number };
  isPlayer: boolean;
}

/**
 * Component for managing energy, deck, and discard pile displays
 */
export class EnergyDeckDiscardComponent {
  private baseScene: BaseScene;
  private cardRenderer: CardRenderer;
  private config: EnergyDeckDiscardConfig;
  
  private energyContainer: Container;
  private deckContainer: Container;
  private discardContainer: Container;

  constructor(baseScene: BaseScene, config: EnergyDeckDiscardConfig) {
    this.baseScene = baseScene;
    this.config = config;
    this.cardRenderer = new CardRenderer(config.gameWidth, config.gameHeight);
    
    this.energyContainer = new Container();
    this.deckContainer = new Container();
    this.discardContainer = new Container();
    
    this.setupLayout();
  }

  /**
   * Get containers for energy, deck, and discard
   */
  getContainers(): {
    energy: Container;
    deck: Container;
    discard: Container;
  } {
    return {
      energy: this.energyContainer,
      deck: this.deckContainer,
      discard: this.discardContainer
    };
  }

  /**
   * Setup the layout for energy, deck, and discard elements
   */
  private setupLayout(): void {
    const layout = LayoutCalculator.calculateEnergyDeckDiscardLayout(
      this.config.gameWidth,
      10 // standard spacing
    );

    this.cardRenderer.createEnergyDeckDiscardUI(
      this.config.position,
      {
        energy: this.energyContainer,
        deck: this.deckContainer,
        discard: this.discardContainer
      },
      {
        elementWidth: layout.elementWidth,
        elementHeight: this.config.dimensions.height,
        spacing: layout.spacing,
        isPlayerDiscard: this.config.isPlayer
      }
    );
  }

  /**
   * Update energy display
   */
  updateEnergy(player: CardBattlePlayerState): void {
    const energyText = this.findTextInContainer(this.energyContainer, (text) => 
      text.text.includes('Energy:')
    );
    
    if (energyText && player.deck) {
      energyText.text = `Energy: ${player.deck.current_energy}`;
    }
  }

  /**
   * Update deck remaining count
   */
  updateDeckRemaining(player: CardBattlePlayerState): void {
    const deckCountText = this.findTextInContainer(this.deckContainer, (text) => 
      !!text.text.match(/^\d+$/)
    );
    
    if (deckCountText && player.deck && player.deck.deck_cards) {
      deckCountText.text = `${player.deck.deck_cards.length}`;
    }
  }

  /**
   * Update discard pile count
   */
  updateDiscardPile(player: CardBattlePlayerState): void {
    const discardCountText = this.findTextInContainer(this.discardContainer, (text) => 
      !!text.text.match(/^\d+$/)
    );
    
    if (discardCountText && player.deck && player.deck.discard_cards) {
      discardCountText.text = `${player.deck.discard_cards.length}`;
    }
  }

  /**
   * Update all indicators for a player
   */
  updateAll(player: CardBattlePlayerState): void {
    this.updateEnergy(player);
    this.updateDeckRemaining(player);
    this.updateDiscardPile(player);
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
   * Get discard container bounds for drag and drop
   */
  getDiscardBounds(): { x: number; y: number; width: number; height: number } {
    const bounds = this.discardContainer.getBounds();
    return {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height
    };
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    this.cardRenderer.updateDimensions(width, height);
    
    // Update position based on new dimensions
    const layout = LayoutCalculator.calculateEnergyDeckDiscardLayout(
      this.config.gameWidth,
      10
    );
    
    this.config.position.x = layout.startX;
    
    // Clear and recreate layout
    this.energyContainer.removeChildren();
    this.deckContainer.removeChildren();
    this.discardContainer.removeChildren();
    
    this.setupLayout();
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.energyContainer.destroy();
    this.deckContainer.destroy();
    this.discardContainer.destroy();
  }
}
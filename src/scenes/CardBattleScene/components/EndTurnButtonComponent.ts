import { Container } from 'pixi.js';
import { CardRenderer } from '../utils/cardRendering';
import { LayoutCalculator } from '../utils/layout';

export interface EndTurnButtonConfig {
  gameWidth: number;
  gameHeight: number;
  onEndTurn: () => void;
}

/**
 * Component for managing end turn button
 */
export class EndTurnButtonComponent {
  private container: Container | null = null;
  private cardRenderer: CardRenderer;
  private config: EndTurnButtonConfig;
  private isVisible: boolean = false;

  constructor(config: EndTurnButtonConfig) {
    this.config = config;
    this.cardRenderer = new CardRenderer(config.gameWidth, config.gameHeight);
  }

  /**
   * Get the container for this component (may be null if not shown)
   */
  getContainer(): Container | null {
    return this.container;
  }

  /**
   * Show the end turn button
   */
  showEndTurnButton(): Container {
    if (this.container) {
      this.container.destroy();
    }

    const layout = LayoutCalculator.calculateButtonLayout(
      this.config.gameWidth,
      this.config.gameHeight,
      200, // default width
      44,  // default height
      10   // padding
    );

    this.container = this.cardRenderer.createEndTurnButton(
      layout.x,
      layout.y,
      layout.width,
      layout.height,
      () => {
        this.hideEndTurnButton();
        this.config.onEndTurn();
      }
    );

    this.isVisible = true;
    return this.container;
  }

  /**
   * Hide the end turn button
   */
  hideEndTurnButton(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
  }

  /**
   * Check if button is visible
   */
  isButtonVisible(): boolean {
    return this.isVisible;
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    this.cardRenderer.updateDimensions(width, height);

    // If button is visible, recreate it with new dimensions
    if (this.isVisible) {
      this.showEndTurnButton();
    }
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
    this.isVisible = false;
  }
}
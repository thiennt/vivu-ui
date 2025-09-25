import { Container } from 'pixi.js';
import { CardRenderer } from '../utils/cardRendering';

export interface BattleLogConfig {
  gameWidth: number;
  gameHeight: number;
  position: { y: number };
  dimensions: { height: number };
}

/**
 * Component for managing battle action log display
 */
export class BattleLogComponent {
  private container: Container;
  private cardRenderer: CardRenderer;
  private config: BattleLogConfig;

  constructor(config: BattleLogConfig) {
    this.config = config;
    this.cardRenderer = new CardRenderer(config.gameWidth, config.gameHeight);
    this.container = this.cardRenderer.createActionLogInCenter(
      config.position.y,
      config.dimensions.height
    );
  }

  /**
   * Get the container for this component
   */
  getContainer(): Container {
    return this.container;
  }

  /**
   * Add a log entry to the battle log
   */
  addLogEntry(message: string): void {
    // TODO: Implement log entry display
    console.log('Battle log:', message);
  }

  /**
   * Clear all log entries
   */
  clearLog(): void {
    // Remove all children except background and title
    if (this.container.children.length > 2) {
      const childrenToRemove = this.container.children.slice(2);
      childrenToRemove.forEach(child => this.container.removeChild(child));
    }
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    this.cardRenderer.updateDimensions(width, height);
    
    // Recreate the log container
    this.container.destroy();
    this.container = this.cardRenderer.createActionLogInCenter(
      this.config.position.y,
      this.config.dimensions.height
    );
  }

  /**
   * Destroy the component
   */
  destroy(): void {
    this.container.destroy();
  }
}
import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { CardRenderer } from '../utils/cardRendering';

export interface BattleOverlayConfig {
  gameWidth: number;
  gameHeight: number;
  onBackClick: () => void;
}

/**
 * Component for managing battle overlays (results, fallback UI)
 */
export class BattleOverlayComponent {
  private container: Container | null = null;
  private cardRenderer: CardRenderer;
  private config: BattleOverlayConfig;

  constructor(config: BattleOverlayConfig) {
    this.config = config;
    this.cardRenderer = new CardRenderer(config.gameWidth, config.gameHeight);
  }

  /**
   * Get the container for this component (may be null if no overlay is shown)
   */
  getContainer(): Container | null {
    return this.container;
  }

  /**
   * Show battle result overlay
   */
  showBattleResult(isVictory: boolean): Container {
    if (this.container) {
      this.container.destroy();
    }

    this.container = this.createBattleResultOverlay(isVictory);
    return this.container;
  }

  /**
   * Show fallback UI when battle data is not available
   */
  showFallbackUI(battleId: string): Container {
    if (this.container) {
      this.container.destroy();
    }

    this.container = this.cardRenderer.createFallbackUI(
      this.config.gameWidth,
      this.config.gameHeight,
      battleId,
      this.config.onBackClick
    );

    return this.container;
  }

  /**
   * Hide any current overlay
   */
  hideOverlay(): void {
    if (this.container) {
      this.container.destroy();
      this.container = null;
    }
  }

  /**
   * Create battle result overlay
   */
  private createBattleResultOverlay(isVictory: boolean): Container {
    const resultContainer = new Container();
    
    const overlay = new Graphics();
    overlay.rect(0, 0, this.config.gameWidth, this.config.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const resultBg = new Graphics();
    resultBg.roundRect(0, 0, 300, 200, 20)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 3, color: Colors.UI_BORDER });
    resultBg.x = (this.config.gameWidth - 300) / 2;
    resultBg.y = (this.config.gameHeight - 200) / 2;
    
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
    resultText.x = this.config.gameWidth / 2;
    resultText.y = this.config.gameHeight / 2 - 30;
    
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
    backButton.x = this.config.gameWidth / 2 - 50;
    backButton.y = this.config.gameHeight / 2 + 40;
    
    backButton.interactive = true;
    backButton.cursor = 'pointer';
    backButton.on('pointertap', this.config.onBackClick);
    
    resultContainer.addChild(overlay, resultBg, resultText, backButton);
    return resultContainer;
  }

  /**
   * Resize handler
   */
  resize(width: number, height: number): void {
    this.config.gameWidth = width;
    this.config.gameHeight = height;
    this.cardRenderer.updateDimensions(width, height);

    // If overlay is visible, recreate it with new dimensions
    // Note: This is a simplified approach. In a real implementation,
    // you might want to preserve the current overlay state
    if (this.container) {
      // For now, just hide the overlay on resize
      this.hideOverlay();
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
  }
}
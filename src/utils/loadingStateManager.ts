/**
 * Loading State Manager
 * Provides utilities for managing loading states and error handling in PixiJS scenes
 */

import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';

export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export class LoadingStateManager {
  private loadingContainer: Container;
  private errorContainer: Container;
  private parentContainer: Container;
  private gameWidth: number;
  private gameHeight: number;

  constructor(parentContainer: Container, gameWidth: number, gameHeight: number) {
    this.parentContainer = parentContainer;
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    
    this.loadingContainer = new Container();
    this.errorContainer = new Container();
    
    this.createLoadingUI();
    this.createErrorUI();
  }

  private createLoadingUI(): void {
    // Semi-transparent background
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    this.loadingContainer.addChild(bg);

    // Loading spinner background
    const spinnerBg = new Graphics();
    spinnerBg.circle(0, 0, 40);
    spinnerBg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 });
    spinnerBg.stroke({ width: 2, color: Colors.BUTTON_PRIMARY });
    spinnerBg.x = this.gameWidth / 2;
    spinnerBg.y = this.gameHeight / 2 - 20;
    this.loadingContainer.addChild(spinnerBg);

    // Loading text
    const loadingText = new Text({
      text: 'Loading...',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.x = this.gameWidth / 2;
    loadingText.y = this.gameHeight / 2 + 40;
    this.loadingContainer.addChild(loadingText);

    // Initially hidden
    this.loadingContainer.visible = false;
  }

  private createErrorUI(): void {
    // Semi-transparent background
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight);
    bg.fill({ color: 0x000000, alpha: 0.7 });
    this.errorContainer.addChild(bg);

    // Error panel
    const panel = new Graphics();
    const panelWidth = Math.min(400, this.gameWidth - 40);
    const panelHeight = 200;
    panel.roundRect(0, 0, panelWidth, panelHeight, 10);
    panel.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 });
    panel.stroke({ width: 3, color: 0xff4444 });
    panel.x = (this.gameWidth - panelWidth) / 2;
    panel.y = (this.gameHeight - panelHeight) / 2;
    this.errorContainer.addChild(panel);

    // Error title
    const errorTitle = new Text({
      text: 'Error',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xff4444,
        align: 'center'
      }
    });
    errorTitle.anchor.set(0.5);
    errorTitle.x = this.gameWidth / 2;
    errorTitle.y = (this.gameHeight - panelHeight) / 2 + 40;
    this.errorContainer.addChild(errorTitle);

    // Error message (will be updated dynamically)
    const errorMessage = new Text({
      text: 'An error occurred',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: panelWidth - 40
      }
    });
    errorMessage.anchor.set(0.5);
    errorMessage.x = this.gameWidth / 2;
    errorMessage.y = (this.gameHeight - panelHeight) / 2 + 80;
    this.errorContainer.addChild(errorMessage);

    // Retry button
    const retryButton = this.createRetryButton(panelWidth);
    retryButton.x = (this.gameWidth - panelWidth) / 2 + 20;
    retryButton.y = (this.gameHeight - panelHeight) / 2 + panelHeight - 60;
    this.errorContainer.addChild(retryButton);

    // Initially hidden
    this.errorContainer.visible = false;
  }

  private createRetryButton(panelWidth: number): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, panelWidth - 40, 40, 5);
    bg.fill({ color: Colors.BUTTON_PRIMARY });
    bg.stroke({ width: 2, color: Colors.BUTTON_BORDER });
    button.addChild(bg);

    const text = new Text({
      text: 'Retry',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    text.anchor.set(0.5);
    text.x = (panelWidth - 40) / 2;
    text.y = 20;
    button.addChild(text);

    // Make button interactive
    button.eventMode = 'static';
    button.cursor = 'pointer';

    return button;
  }

  public showLoading(): void {
    this.hideError();
    this.loadingContainer.visible = true;
    this.parentContainer.addChild(this.loadingContainer);
  }

  public hideLoading(): void {
    this.loadingContainer.visible = false;
    if (this.loadingContainer.parent) {
      this.parentContainer.removeChild(this.loadingContainer);
    }
  }

  public showError(message: string, onRetry?: () => void): void {
    this.hideLoading();
    
    // Update error message
    const errorMessage = this.errorContainer.children.find(child => 
      child instanceof Text && child.text !== 'Error' && child.text !== 'Retry'
    ) as Text;
    if (errorMessage) {
      errorMessage.text = message;
    }

    // Set up retry button handler
    const retryButton = this.errorContainer.children.find(child => 
      child instanceof Container && child.children.some(grandchild => 
        grandchild instanceof Text && grandchild.text === 'Retry'
      )
    ) as Container;
    
    if (retryButton && onRetry) {
      retryButton.removeAllListeners();
      retryButton.on('pointerdown', onRetry);
    }

    this.errorContainer.visible = true;
    this.parentContainer.addChild(this.errorContainer);
  }

  public hideError(): void {
    this.errorContainer.visible = false;
    if (this.errorContainer.parent) {
      this.parentContainer.removeChild(this.errorContainer);
    }
  }

  public updateDimensions(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Recreate UI with new dimensions
    this.loadingContainer.removeChildren();
    this.errorContainer.removeChildren();
    this.createLoadingUI();
    this.createErrorUI();
  }

  public destroy(): void {
    this.hideLoading();
    this.hideError();
    this.loadingContainer.destroy();
    this.errorContainer.destroy();
  }
}
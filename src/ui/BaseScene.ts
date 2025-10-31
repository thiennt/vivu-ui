import { Assets, Color, Container, Graphics, Sprite, Text } from 'pixi.js';
import { app } from '@/app';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { BottomNavigationMenu } from './BottomNavigationMenu';
import { Card, CardType } from '@/types';
import { DropShadowFilter, GlowFilter } from 'pixi-filters';
import { Button } from './Button';
import { FaceDownCard } from './FaceDownCard';
import { DeckCard } from './DeckCard';
import { CharacterCard } from './CharacterCard';
import { HeroCard } from './HeroCard';

export abstract class BaseScene extends Container {
  /** Assets bundles required by this screen */
  public static assetBundles = [];

  protected gameWidth: number = navigation.width;
  protected gameHeight: number = navigation.height;
  
  // Standard layout constants - optimized for 400x700
  public readonly STANDARD_PADDING = 8;
  public readonly STANDARD_SPACING = 8;

  // Bottom navigation
  protected bottomNavigation: BottomNavigationMenu | null = null;

  constructor() {
    super();
    // Don't create bottom navigation in constructor yet - wait for proper dimensions
  }

  protected createBottomNavigation(): void {
    if (!this.bottomNavigation && this.gameWidth > 0 && this.gameHeight > 0) {
      this.bottomNavigation = new BottomNavigationMenu(this.gameWidth, this.gameHeight);
      this.addChild(this.bottomNavigation);
      // Ensure it's on top
      this.bottomNavigation.zIndex = 9999;
      this.sortChildren();
    }
  }

  protected updateBottomNavigation(): void {
    if (this.bottomNavigation) {
      this.bottomNavigation.updateDimensions(this.gameWidth, this.gameHeight);
    } else if (this.gameWidth > 0 && this.gameHeight > 0) {
      // Create it if it doesn't exist and we have proper dimensions
      this.createBottomNavigation();
    }
  }

  protected getContentHeight(): number {
    // Return available height excluding bottom navigation
    return this.gameHeight - (this.bottomNavigation?.getMenuHeight() || 0);
  }

  protected setupBackground() {
    // Only create background if dimensions are properly set
    if (this.gameWidth && this.gameHeight) {
      const bg = new Graphics();
      const backgroundGradient = Colors.BACKGROUND_PRIMARY;
      bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(backgroundGradient);
      this.addChild(bg);
    }
  }

  protected initializeDimensions() {
    this.gameWidth = Math.max(400, app.screen?.width || 800);
    this.gameHeight = Math.max(700, app.screen?.height || 700);
  }

  /**
   * Creates a centered container with standard padding
   */
  protected createCenteredContainer(
    width?: number, 
    height?: number, 
    padding: number = this.STANDARD_PADDING
  ): Container {
    const container = new Container();
    const containerWidth = width || (this.gameWidth - 2 * padding);
    const containerHeight = height || (this.gameHeight - 2 * padding);
    
    container.x = (this.gameWidth - containerWidth) / 2;
    container.y = padding;
    
    return container;
  }

  /**
   * Calculates responsive grid layout with consistent spacing
   */
  protected calculateGridLayout(
    availableWidth: number,
    minItemWidth: number,
    maxItemWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    let itemsPerRow = Math.floor((availableWidth + spacing) / (minItemWidth + spacing));
    itemsPerRow = Math.max(1, itemsPerRow);
    
    const totalSpacing = (itemsPerRow - 1) * spacing;
    let itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    itemWidth = Math.max(minItemWidth, Math.min(itemWidth, maxItemWidth));
    
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates grid layout with exactly 3 cards per row
   */
  protected calculateThreeCardsLayout(
    availableWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    const itemsPerRow = 3;
    const totalSpacing = (itemsPerRow - 1) * spacing;
    const itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates grid layout with exactly 4 cards per row
   */
  protected calculateFourCardsLayout(
    availableWidth: number,
    spacing: number = this.STANDARD_SPACING
  ): { itemsPerRow: number; itemWidth: number; totalWidth: number } {
    const itemsPerRow = 4;
    const totalSpacing = (itemsPerRow - 1) * spacing;
    const itemWidth = (availableWidth - totalSpacing) / itemsPerRow;
    const totalWidth = itemsPerRow * itemWidth + (itemsPerRow - 1) * spacing;
    
    return { itemsPerRow, itemWidth, totalWidth };
  }

  /**
   * Calculates responsive font size based on card dimensions and screen size
   */
  protected calculateResponsiveFontSize(
    baseSize: number,
    cardWidth: number,
    screenWidth: number,
    minSize: number = 8,
    maxSize: number = 24
  ): number {
    // Scale font size based on card width relative to a base card width (120px)
    const baseCardWidth = 120;
    const cardScale = cardWidth / baseCardWidth;
    
    // Scale font size based on screen width relative to base screen width (800px)
    const baseScreenWidth = 800;
    const screenScale = Math.min(screenWidth / baseScreenWidth, 1.2); // Cap at 120% scaling
    
    // Combine both scaling factors
    const scaledSize = baseSize * cardScale * screenScale;
    
    // Ensure font size stays within bounds
    return Math.max(minSize, Math.min(maxSize, scaledSize));
  }

  public createButton(
    text: string, 
    x: number, 
    y: number, 
    width: number = 200, 
    height: number = 50,
    onClick?: () => void,
    baseFontSize: number = 18
  ): Button {
    const button = new Button({
      text,
      width,
      height,
      onClick,
      baseFontSize,
      gameWidth: this.gameWidth,
      gameHeight: this.gameHeight,
      standardPadding: this.STANDARD_PADDING
    });
    button.x = x;
    button.y = y;
    return button;
  }

  protected createTitle(text: string, x: number, y: number): Text {
    const title = new Text({
      text: text,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 28, // Reduced from 36 for 400x700
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        stroke: {
          color: Colors.BACKGROUND_SECONDARY,
          width: 2, // Reduced from 3
        },
        dropShadow: {
          color: Colors.SHADOW_COLOR,
          blur: 3, // Reduced from 4
          angle: Math.PI / 6,
          distance: 4, // Reduced from 6
          alpha: 0.5,
        },
      }
    });
    title.anchor.set(0.5);
    title.x = x;
    title.y = y;
    return title;
  }

  public createFaceDownCard(width: number, height: number): FaceDownCard {
    return new FaceDownCard({ width, height });
  }

  public createDeckCard(
    card: Card, 
    width: number, 
    height: number, 
    options: {
      fontScale?: number;
      showDescription?: boolean;
      maxDescriptionLength?: number;
      onClick?: (card: Card) => void;
      enableHover?: boolean;
    } = {}
  ): DeckCard {
    return new DeckCard(card, {
      width,
      height,
      ...options
    });
  }

  public createCharacterCard(character: any, x: number, y: number, width: number, height: number): CharacterCard {
    const card = new CharacterCard(character, { width, height });
    card.x = x;
    card.y = y;
    return card;
  }

  public createHeroCard(
    character: any,
    x: number,
    y: number,
    cardType: 'preview' | 'detailed' | 'lineup' | 'pool' = 'detailed',
    positionIndex?: number,
    customWidth?: number
  ): HeroCard {
    const card = new HeroCard(character, {
      cardType,
      customWidth,
      gameWidth: this.gameWidth
    });
    card.x = x;
    card.y = y;
    return card;
  }

}
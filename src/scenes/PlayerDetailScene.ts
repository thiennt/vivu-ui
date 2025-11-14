import { Graphics, Container, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/ui/BaseScene';
import { navigation } from '@/utils/navigation';
import { CharactersScene } from './CharactersScene';
import { CharacterDetailScene } from './CharacterDetailScene';
import { HomeScene } from './HomeScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { ScrollBox } from '@pixi/ui';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class PlayerDetailScene extends BaseScene {
  // UI containers
  public container: Container;
  private mainScrollBox: ScrollBox | null = null;
  private scrollContent: Container;
  private backgroundContainer: Container;
  private statsContainer: Container;
  private collectionContainer: Container;
  private buttonContainer: Container;
  private pointDistributionContainer: Container;

  // Data state
  private player: any = null;
  private characters: any[] = [];
  private loadingManager: LoadingStateManager;

  // Stat level state (no longer using point distribution)
  // Stats now use level/exp system like character equipment

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.scrollContent = new Container();
    this.backgroundContainer = new Container();
    this.statsContainer = new Container();
    this.collectionContainer = new Container();
    this.buttonContainer = new Container();
    this.pointDistributionContainer = new Container();
    
    this.addChild(this.container);
    
    // Add background directly to main container (not scrolled)
    this.container.addChild(this.backgroundContainer);
    
    // Add scrollable content
    this.scrollContent.addChild(
      this.statsContainer,
      this.pointDistributionContainer,
      this.collectionContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
  }
  
  private async loadPlayerData(): Promise<void> {
    this.loadingManager.showLoading();

    this.player = sessionStorage.getItem('player') ? JSON.parse(sessionStorage.getItem('player') as string) : null;
    this.characters = this.player?.characters || [];

    this.loadingManager.hideLoading();
    
    this.initializeUI();
  }

  private initializeUI(): void {
    if (!this.player) return;
    
    this.createBackground();
    this.createPlayerStats();
    this.createStatLevelingPanel();
    //this.createCharacterCollection();
    this.createBackButton();
  }

  prepare(): void {
    this.loadPlayerData();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Only update layout if we have loaded data
    if (this.player) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.pointDistributionContainer.removeChildren();
    this.collectionContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Remove existing scroll box if any
    if (this.mainScrollBox) {
      this.container.removeChild(this.mainScrollBox);
      this.mainScrollBox = null;
    }
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createPlayerStats();
    this.createStatLevelingPanel();
    //this.createCharacterCollection();
    this.createBackButton();
    
    // Calculate content height for scrolling
    const contentHeight = this.calculateTotalContentHeight();
    
    // Create vertical ScrollBox for entire scene content
    if (contentHeight > this.gameHeight) {
      this.mainScrollBox = new ScrollBox({
        width: this.gameWidth,
        height: this.gameHeight,
      });
      this.mainScrollBox.addItem(this.scrollContent);
      this.container.addChild(this.mainScrollBox);
    } else {
      // If content fits, just add directly without scrolling
      this.container.addChild(this.scrollContent);
    }
  }
  
  private calculateTotalContentHeight(): number {
    let maxY = 0;
    
    this.scrollContent.children.forEach(child => {
      child.children.forEach(grandchild => {
        const bounds = grandchild.getBounds();
        const bottomY = bounds.y + bounds.height;
        if (bottomY > maxY) {
          maxY = bottomY;
        }
      });
    });
    
    return maxY + this.STANDARD_PADDING;
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Robot theme dark background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Subtle overlay
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });
    
    this.backgroundContainer.addChild(bg);
  }

  private createPlayerStats(): void {
    if (!this.player) return;
    
    const startY = this.STANDARD_PADDING;
    const padding = this.STANDARD_PADDING;
    const availableWidth = this.gameWidth - 2 * padding;
    const panelWidth = Math.min(580, availableWidth);
    const panelX = (this.gameWidth - panelWidth) / 2;
    
    // Player info panel with avatar
    const goldAmount = this.player.gold ?? 100;
    const playerInfoPanel = this.createPlayerInfoPanel(
      panelWidth,
      [
        { label: '👤 Username:', value: this.player.username },
        { label: '⭐ Level:', value: this.player.level.toString() },
        { label: '✨ Experience:', value: this.player.exp.toString() },
        { label: '🪙 Gold:', value: goldAmount.toString() },
        { label: '🎭 Characters:', value: this.characters.length.toString() },
        { label: '🍀 Luck:', value: this.player.luck.toString() }
      ]
    );
    
    playerInfoPanel.x = panelX;
    playerInfoPanel.y = startY;
    
    this.statsContainer.addChild(playerInfoPanel);
  }

  private createPlayerInfoPanel(
    width: number,
    playerInfo: Array<{label: string, value: string}>
  ): Container {
    const panel = new Container();
    const height = 167;
    
    // Robot theme panel with glow
    const bg = new Graphics();
    
    // Outer glow
    bg.roundRect(3, 3, width, height, 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.25 });
    
    // Main panel background
    bg.roundRect(0, 0, width, height, 14)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.7 })
      .stroke({ width: 1, color: Colors.ROBOT_CYAN });
    
    // Inner shadow
    bg.roundRect(3, 3, width - 6, height - 6, 12)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.5 });
    
    panel.addChild(bg);
    
    // Title with robot theme
    const title = new Text({
      text: '📜 Player Info',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        letterSpacing: 2,
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
          angle: 0,
          distance: 0,
          alpha: 0.5
        }
      }
    });
    title.x = 12;
    title.y = 12;
    panel.addChild(title);
    
    // Avatar circle on the left
    const avatarSize = 80;
    const avatarX = 20;
    const avatarY = 50;
    
    const avatarBg = new Graphics();
    // Outer glow
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 3)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });
    // Main circle
    avatarBg.circle(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.95 })
      .stroke({ width: 1, color: Colors.ROBOT_CYAN });
    
    const avatarEmoji = new Text({
      text: '👤',
      style: {
        fontSize: 48,
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
          angle: 0,
          distance: 0,
          alpha: 0.5
        }
      }
    });
    avatarEmoji.anchor.set(0.5);
    avatarEmoji.x = avatarX + avatarSize / 2;
    avatarEmoji.y = avatarY + avatarSize / 2;
    
    panel.addChild(avatarBg, avatarEmoji);
    
    // Player info on the right with robot theme
    const infoStartX = avatarX + avatarSize + 20;
    playerInfo.forEach((item, index) => {
      const statText = new Text({
        text: `${item.label} ${item.value}`,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 16,
          fill: Colors.ROBOT_CYAN_LIGHT
        }
      });
      statText.x = infoStartX;
      statText.y = 45 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createStatLevelingPanel(): void {
    if (!this.player) return;

    const padding = this.STANDARD_PADDING;
    
    // Position below player info (167) + gap
    const startY = this.STANDARD_PADDING + 167 + 15;
    
    const panelWidth = Math.min(580, this.gameWidth - 2 * padding);
    const panelX = (this.gameWidth - panelWidth) / 2;

    const statSlots = [
      {
        name: 'Attack',
        icon: '⚔️',
        type: 'atk',
        level: this.player?.atk_level || 1,
        exp: this.player?.atk_exp || 0,
        value: this.player?.atk_value || 0,
        color: Colors.STAT_ATK
      },
      {
        name: 'Defense',
        icon: '🛡️',
        type: 'def',
        level: this.player?.def_level || 1,
        exp: this.player?.def_exp || 0,
        value: this.player?.def_value || 0,
        color: Colors.STAT_DEF
      },
      {
        name: 'HP',
        icon: '❤️',
        type: 'hp',
        level: this.player?.hp_level || 1,
        exp: this.player?.hp_exp || 0,
        value: this.player?.hp_value || 0,
        color: Colors.STAT_HP
      }
    ];

    let currentY = startY;

    statSlots.forEach((slot) => {
      const card = this.createStatCard(slot, panelWidth);
      card.x = panelX;
      card.y = currentY;
      this.pointDistributionContainer.addChild(card);
      currentY += 120;
    });
  }

 private createStatCard(slot: any, width: number): Container {
    const card = new Container();
    const height = 110;

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: slot.color, alpha: 0.8 });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: slot.color, alpha: 0.4 });

    card.addChild(bg);

    // Stat icon - left side
    const iconSize = 70;
    const iconBg = new Graphics();
    iconBg.roundRect(15, 20, iconSize, iconSize, 10)
      .fill({ color: slot.color, alpha: 0.2 })
      .stroke({ width: 2.5, color: slot.color, alpha: 0.8 });

    const iconText = new Text({
      text: slot.icon,
      style: {
        fontSize: 36,
        fill: slot.color
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = 15 + iconSize / 2;
    iconText.y = 20 + iconSize / 2;

    // Level display in bottom right of icon
    const iconLevelText = new Text({
      text: `${slot.level}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 }
      }
    });
    iconLevelText.anchor.set(1, 1);
    iconLevelText.x = 15 + iconSize - 5;
    iconLevelText.y = 20 + iconSize - 5;

    card.addChild(iconBg, iconText, iconLevelText);

    // Content area - right of icon
    const contentStartX = 100;

    // Stat name badge - top
    const badgeWidth = 100;
    const badge = new Graphics();
    badge.roundRect(contentStartX, 28, badgeWidth, 26, 13)
      .fill({ color: slot.color, alpha: 0.3 })
      .stroke({ width: 1.5, color: slot.color });

    const badgeText = new Text({
      text: slot.name.toUpperCase(),
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.WHITE
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = contentStartX + badgeWidth / 2;
    badgeText.y = 40;

    card.addChild(badge, badgeText);

    // Stat bonus value - middle right
    const statBonusText = new Text({
      text: `${slot.value}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: slot.color,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 }
      }
    });
    statBonusText.x = contentStartX;
    statBonusText.y = 62;
    card.addChild(statBonusText);

    // Level up button - bottom right
    const buttonWidth = 100;
    const buttonHeight = 32;
    const levelUpButton = this.createLevelUpButton(
      width - buttonWidth - 15,
      (height - buttonHeight) / 2,
      buttonWidth,
      buttonHeight,
      () => this.levelUpStat(slot.type)
    );
    card.addChild(levelUpButton);

    return card;
  }

  private createLevelUpButton(
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 7)
      .fill({ color: Colors.GREEN_MINT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.WHITE });

    bg.roundRect(2, 2, width - 4, height - 4, 5)
      .stroke({ width: 1, color: Colors.WHITE, alpha: 0.6 });

    const buttonText = new Text({
      text: '🪙1000\nLevel Up',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.ROBOT_BG_DARK,
        stroke: { color: Colors.WHITE, width: 1 },
        align: 'center'
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;

    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    button.interactive = true;
    button.cursor = 'pointer';

    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: Colors.GREEN_MINT, alpha: 1 })
        .stroke({ width: 2, color: Colors.WHITE });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.WHITE, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: Colors.GREEN_MINT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.WHITE });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.WHITE, alpha: 0.6 });
      button.scale.set(1.0);
    });

    button.on('pointerdown', (e) => {
      e.stopPropagation();
      onClick();
    });

    return button;
  }

  private async levelUpStat(statType: string): Promise<void> {
    console.log(`Leveling up ${statType}`);

    // Update player stat level locally
    const levelKey = `${statType}_level` as keyof typeof this.player;
    const expKey = `${statType}_exp` as keyof typeof this.player;
    const valueKey = `${statType}_value` as keyof typeof this.player;

    const currentLevel = (this.player[levelKey] as number) || 1;
    const currentExp = (this.player[expKey] as number) || 0;
    const currentValue = (this.player[valueKey] as number) || 0;

    // Increase level and stats
    (this.player as any)[levelKey] = currentLevel + 1;
    (this.player as any)[expKey] = 0; // Reset exp
    (this.player as any)[valueKey] = currentValue + 5 + currentLevel; // Increase value

    // Refresh displays
    this.statsContainer.removeChildren();
    this.pointDistributionContainer.removeChildren();
    this.createPlayerStats();
    this.createStatLevelingPanel();
  }

  private createCharacterCollection(): void {
    if (!this.player) return;
    
    // Position after stat leveling panel
    // Player info: 85 + 167 = 252
    // Statistics: 252 + 15 + (3 * 120) = 627
    const baseY = 85 + 167 + 15 + (3 * 120) + 15;
    
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const gap = 10;
    const cardCount = 3;
    
    const cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
    const cardHeight = cardWidth * (160 / 120); // Match CardBattleScene default ratio

    // Title with robot theme
    const collectionTitle = new Text({ 
      text: '🎭 Character Collection', 
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        letterSpacing: 2,
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 6,
          angle: 0,
          distance: 0,
          alpha: 0.6
        }
      }
    });
    collectionTitle.anchor.set(0.5, 0);
    collectionTitle.x = this.gameWidth / 2;
    collectionTitle.y = baseY;

    const gridContent = new Container();

    this.characters.forEach((character, index) => {
      const row = Math.floor(index / cardCount);
      const col = index % cardCount;

      const x = col * (cardWidth + gap);
      const y = row * (cardHeight + gap);

      const card = this.createCharacterPreviewCard(character, x, y, cardWidth);
      gridContent.addChild(card);
    });

    const totalRows = Math.ceil(this.characters.length / cardCount);
    const contentHeight = totalRows * (cardHeight + gap);
    const maxScrollHeight = 160;

    const scrollBox = new ScrollBox({
      width: availableWidth,
      height: Math.min(maxScrollHeight, contentHeight),
    });

    scrollBox.addItem(gridContent);
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = baseY + 35;

    // View all button
    const buttonWidth = 180;
    const buttonHeight = 40;
    const viewAllButton = this.createButton(
      'View All',
      (this.gameWidth - buttonWidth) / 2,
      scrollBox.y + Math.min(maxScrollHeight, contentHeight) + 12,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(CharactersScene)
    );

    this.collectionContainer.addChild(collectionTitle, scrollBox, viewAllButton);
  }

  private createCharacterPreviewCard(character: any, x: number, y: number, customWidth?: number): Container {
    const cardWidth = customWidth || 120;
    const cardHeight = cardWidth * (160 / 120); // Match CardBattleScene default ratio
    const card = this.createCharacterCard(character, x, y, cardWidth, cardHeight);
    
    card.on('pointerdown', () => {
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    });
    
    return card;
  }

  private createBackButton(): void {
    const buttonWidth = 80;
    const buttonHeight = 40;
    
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  update(_time: Ticker): void {
    // No animations needed
  }
}
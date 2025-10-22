import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/ui/BaseScene';
import { Colors, hexToPixi } from '@/utils/colors';
import { CardBattleScene } from './CardBattleScene';
import { BattleStageResponse, Card, Character } from '@/types';
import { battleApi } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { TowerScene } from './TowerScene';
import { ScrollBox } from '@pixi/ui';
import { CardDetailPopup } from '@/popups/CardDetailPopup';

export class PrepareScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private stage: any;
  private battleData: any;
  private battleStage: BattleStageResponse | null = null;
  private deckContainer!: Container;
  private uiContainer!: Container;
  private loadingManager: LoadingStateManager;
  private player: any = null;
  private lineupContainerHeight: number = 0;
  
  constructor(params?: { stage: any }) {
    super();
    
    this.container = new Container();
    this.addChild(this.container);
    
    this.stage = params?.stage;
    this.battleData = [];
    
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
  }

  async prepare(): Promise<void> {
    this.loadingManager.showLoading();

    this.player = JSON.parse(sessionStorage.getItem('player') || '{}');

    const response = await battleApi.createBattleStage(this.stage.id);
    if (response.success && response.data) {
      this.battleStage = response.data;
      console.log(`✅ Battle stage created successfully: ${response.message}`);
    } else {
      console.error(`❌ Failed to create battle stage: ${response.message}`);
      if (response.errors) {
        response.errors.forEach((error: any) => console.error(`   Error: ${error}`));
      }
      this.battleStage = null;
    }

    this.loadingManager.hideLoading();
    
    this.initializeUI();
  }

  private initializeUI(): void {
    if (!this.battleStage) {
      return;
    }

    this.container.removeChildren();
    this.createBackground();
    this.createHeader();
    this.createPlayerLineup();
    this.createDeckPreview();
    this.createActionButtons();
  }

  private createBackground(): void {
    const background = new Graphics();
    
    // Dark fantasy battlefield background
    background.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: hexToPixi(Colors.BROWN_DARKEST), alpha: 1.0 });
    
    // Battle texture overlay
    background.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: hexToPixi(Colors.BROWN_DARK), alpha: 0.3 });
    
    this.container.addChild(background);
  }

  private createHeader(): void {
    // Fantasy battle banner
    const bannerWidth = Math.min(360, this.gameWidth - 40);
    const bannerHeight = 52;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 18;
    
    const banner = new Graphics();
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2.5, color: hexToPixi(Colors.GOLD) });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });

    const title = new Text({
      text: `⚔️ ${this.stage.name} ⚔️`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 },
        dropShadow: {
          color: hexToPixi(Colors.GOLD_BRIGHT),
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.container.addChild(banner, title);
  }

  private createPlayerLineup(): void {
    const lineupContainer = new Container();

    const lineup_power = (this.player.lineup || []).reduce(
      (sum: number, c: any) => sum + (c.atk || 0) + (c.def || 0) + (c.hp || 0),
      0
    );

    // Calculate card dimensions FIRST
    const chars = this.player.lineup || [];
    const maxPerRow = Math.min(chars.length, 3) || 1;
    const cardSpacing = 8; // Spacing between cards
    const panelPadding = 12; // Padding inside panel
    
    // Calculate available width for cards (panel width - padding on both sides)
    const panelWidth = this.gameWidth - 40;
    const availableCardWidth = panelWidth - (panelPadding * 2);
    
    // Calculate card width based on available space and spacing
    const cardWidth = (availableCardWidth - (cardSpacing * (maxPerRow - 1))) / maxPerRow;
    const cardHeight = cardWidth * 1.25;
    
    // Calculate panel height based on actual card height
    const titleHeight = 40;
    const panelHeight = titleHeight + cardHeight + panelPadding;
    
    // Parchment panel for lineup
    const panel = new Graphics();
    
    panel.roundRect(3, 3, panelWidth, panelHeight, 10)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
    
    panel.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: hexToPixi(Colors.PARCHMENT_LIGHT), alpha: 0.98 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    
    panel.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.6 });
    
    panel.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.5 });
    
    lineupContainer.addChild(panel);

    const lineupTitle = new Text({
      text: `🧑‍🤝‍🧑 Your Lineup ⚡${lineup_power}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.BROWN_DARK),
        stroke: { color: hexToPixi(Colors.GOLD_BRIGHT), width: 0.5 }
      }
    });
    lineupTitle.x = panelPadding;
    lineupTitle.y = 12;
    lineupContainer.addChild(lineupTitle);

    // Position cards inside the panel with proper spacing
    chars.forEach((char: Character, index: number) => {
      const col = index;
      const x = panelPadding + col * (cardWidth + cardSpacing);
      const y = titleHeight;
      const charCard = this.createCharacterCard(char, x, y, cardWidth, cardHeight);

      lineupContainer.addChild(charCard);
    });

    lineupContainer.x = 20;
    lineupContainer.y = 85;

    this.lineupContainerHeight = panelHeight;

    this.container.addChild(lineupContainer);
  }

  private createDeckPreview(): void {
    this.deckContainer = new Container();

    // Title with icon
    const deckTitle = new Text({
      text: `🃏 Battle Deck (${this.battleStage?.cards.length || 0} cards)`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 },
        dropShadow: {
          color: hexToPixi(Colors.GOLD_BRIGHT),
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    deckTitle.x = 20;
    deckTitle.y = 0;

    this.deckContainer.addChild(deckTitle);

    // Responsive card grid
    const cardsPerRow = 3;
    const spacing = 8;
    const scrollBoxWidth = this.gameWidth - 40;
    const cardWidth = (scrollBoxWidth - (cardsPerRow - 1) * spacing) / cardsPerRow;
    const cardHeight = 160;
    const gridContainer = new Container();

    this.battleStage?.cards.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const cardContainer = this.createDeckCard(card, cardWidth, cardHeight, {
        onClick: (clickedCard) => this.showCardDetails(clickedCard)
      });
      cardContainer.x = col * (cardWidth + spacing);
      cardContainer.y = 35 + row * (cardHeight + spacing);

      gridContainer.addChild(cardContainer);
    });

    // Calculate grid size
    const totalRows = Math.ceil(((this.battleStage?.cards?.length ?? 0) / cardsPerRow));
    const cardGridTop = 35;
    const headerHeight = 85 + 12;
    const lineupHeight = this.lineupContainerHeight || 150;
    const buttonHeight = 50 + 40;

    const gridHeight = this.gameHeight - headerHeight - lineupHeight - buttonHeight - cardGridTop;

    const scrollBoxHeight = Math.min(
      cardGridTop + totalRows * (cardHeight + spacing),
      gridHeight
    );

    // Create ScrollBox
    const scrollBox = new ScrollBox({
      width: scrollBoxWidth,
      height: scrollBoxHeight
    });
    scrollBox.x = 20;
    scrollBox.y = 0;
    scrollBox.addItem(gridContainer);

    this.deckContainer.addChild(scrollBox);

    this.deckContainer.x = 0;
    this.deckContainer.y = 85 + lineupHeight + 25;

    this.container.addChild(this.deckContainer);
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();

    const buttonCount = 2;
    const spacing = 20;
    const totalSpacing = spacing * (buttonCount - 1);
    const buttonWidth = (this.gameWidth - 2 * 40 - totalSpacing) / buttonCount;
    const buttonHeight = 50;

    // Back button with fantasy style
    const backButton = this.createFantasyButton(
      '← Back',
      0,
      0,
      buttonWidth,
      buttonHeight,
      () => {
        navigation.showScreen(TowerScene);
      }
    );

    // Start Battle button with special styling
    const startButton = this.createFantasyButton(
      '⚔️ Start Battle',
      this.gameWidth - buttonWidth - 40,
      0,
      buttonWidth,
      buttonHeight,
      async () => {
        await this.startBattle();
      }
    );
    
    // Make start button more prominent
    const startBg = startButton.children[0] as Graphics;
    startBg.clear();
    startBg.roundRect(2, 2, buttonWidth, buttonHeight, 8)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
    startBg.roundRect(0, 0, buttonWidth, buttonHeight, 8)
      .fill({ color: hexToPixi(Colors.RED_DARK), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
    startBg.roundRect(2, 2, buttonWidth - 4, buttonHeight - 4, 6)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.8 });

    buttonContainer.addChild(backButton, startButton);

    buttonContainer.x = 20;
    buttonContainer.y = this.gameHeight - buttonHeight - 40;

    this.container.addChild(buttonContainer);
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 }
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
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.BROWN_LIGHT), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private async startBattle(): Promise<void> {
    const response = await battleApi.startBattle(this.battleStage?.battle_id || '');
    if (response.success) {
      console.log(`✅ Battle started successfully: ${response.message}`);
      navigation.showScreen(CardBattleScene, {
        battleId: this.battleStage?.battle_id,
      });
    } else {
      console.error(`❌ Failed to start battle: ${response.message}`);
      if (response.errors) {
        response.errors.forEach((error: any) => console.error(`   Error: ${error}`));
      }
    }
  }

  private showCardDetails(card: Card): void {
    navigation.presentPopup(CardDetailPopup, { card: card });
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }
}
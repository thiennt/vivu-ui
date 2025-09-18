import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { CardBattleScene } from './CardBattleScene';
import { StageScene } from './StageScene';
import { BattleCard, Character } from '@/types';
import { createRandomDeck } from '@/utils/cardData';
import { battleApi } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { TowerScene } from './TowerScene';

export class PrepareScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private stage: any;
  private battleData: any;
  private generatedDeck: BattleCard[] = [];
  private deckContainer!: Container;
  private uiContainer!: Container;
  private loadingManager: LoadingStateManager;
  private player: any = null;
  
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

    // Generate deck for preview
    this.generatedDeck = createRandomDeck(50);

    this.loadingManager.hideLoading();
    
    this.createUI();
  }

  private createUI(): void {
    this.container.removeChildren();
    this.createBackground();
    this.createHeader();
    this.createPlayerLineup();
    this.createDeckPreview();
    this.createActionButtons();
  }

  private createBackground(): void {
    const background = new Graphics()
      .rect(0, 0, this.gameWidth, this.gameHeight)
      .fill(Gradients.createBackgroundGradient(this.gameWidth, this.gameHeight));
    
    this.container.addChild(background);
  }

  private createHeader(): void {
    const title = new Text({
      text: this.stage.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        stroke: {
          color: Colors.BACKGROUND_SECONDARY,
          width: 2,
        },
        dropShadow: {
          color: Colors.SHADOW_COLOR,
          blur: 4,
          angle: Math.PI / 6,
          distance: 4,
          alpha: 0.5,
        },
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = 40;
    
    this.container.addChild(title);
  }

  private createPlayerLineup(): void {
    const lineupContainer = new Container();

    const lineup_power = (this.player.lineup || []).reduce(
      (sum: number, c: any) => sum + (c.atk || 0) + (c.def || 0) + (c.hp || 0),
      0
    );

    const lineupTitle = new Text({
      text: `🧑‍🤝‍🧑 Your Lineup ⚡${lineup_power}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    lineupTitle.x = 20;
    lineupTitle.y = 0;
    lineupContainer.addChild(lineupTitle);

    const cardWidth = 80;
    const cardHeight = 100;
    const spacing = 10;
    const maxWidth = this.gameWidth - 40;
    const maxEnemiesPerRow = 3; // Force 3 cards per row
    
    const chars = this.player.lineup || [];

    chars.forEach((char: Character, index: number) => {
      const row = Math.floor(index / maxEnemiesPerRow);
      const col = index % maxEnemiesPerRow;

      const x = col * (cardWidth + spacing);
      const y = row * (cardHeight + spacing);

      const enemyCard = this.createHeroCard(char, x, y, 'lineup');
      // Center the lineup in the available width
      const totalRowWidth = chars.length * cardWidth + (chars.length - 1) * spacing;
      const offsetX = Math.max(0, (maxWidth - totalRowWidth) / 2);

      enemyCard.x = offsetX + col * (cardWidth + spacing);
      enemyCard.y = row * (cardHeight + spacing);

      lineupContainer.addChild(enemyCard);
    });

    lineupContainer.x = 0;
    lineupContainer.y = 90; // Just below the header

    this.container.addChild(lineupContainer);
  }

  private createDeckPreview(): void {
    this.deckContainer = new Container();
    
    const deckTitle = new Text({
      text: `Your Battle Deck (${this.generatedDeck.length} cards)`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    deckTitle.x = 20;
    deckTitle.y = 0;
    
    this.deckContainer.addChild(deckTitle);
    
    // Create card grid
    const cardWidth = 120;
    const cardHeight = 160;
    const cardsPerRow = 3; // Force 3 cards per row
    const startX = (this.gameWidth - (cardsPerRow * (cardWidth + 10) - 10)) / 2;
    
    this.generatedDeck.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;
      
      const cardContainer = this.createDeckCard(card, cardWidth, cardHeight);
      cardContainer.x = startX + col * (cardWidth + 10);
      cardContainer.y = 40 + row * (cardHeight + 10);
      
      this.deckContainer.addChild(cardContainer);
    });
    
    this.deckContainer.x = 0;
    this.deckContainer.y = 180;
    
    this.container.addChild(this.deckContainer);
  }

  private createDeckCard(card: BattleCard, width: number, height: number): Container {
    const cardContainer = new Container();
    
    // Card background with rarity color
    const rarityColors = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    const bg = new Graphics()
      .roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ width: 2, color: rarityColors[card.rarity] || Colors.CARD_BORDER });
    
    // Card name
    const cardName = new Text({
      text: card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    cardName.x = 5;
    cardName.y = 5;
    
    // Energy cost
    const energyCost = new Graphics()
      .circle(15, 15, 12)
      .fill({ color: Colors.BUTTON_PRIMARY })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER });
    
    const energyText = new Text({
      text: card.energyCost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 15;
    energyText.y = 15;
    
    // Card description
    const description = new Text({
      text: card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    description.x = 5;
    description.y = height - 60;
    
    // Card type
    const typeText = new Text({
      text: card.cardType.toUpperCase(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_TERTIARY
      }
    });
    typeText.x = 5;
    typeText.y = height - 15;
    
    cardContainer.addChild(bg, cardName, energyCost, energyText, description, typeText);
    
    // Make card interactive for hover effects
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';
    
    cardContainer.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });
    
    cardContainer.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return cardContainer;
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();
    
    const buttonWidth = 180;
    const buttonHeight = 50;
    const spacing = 20;
    
    // Back button
    const backButton = this.createButton(
      '← Back to Stages',
      0,
      0,
      buttonWidth,
      buttonHeight,
      () => {
        navigation.showScreen(TowerScene);
      }
    );
    
    // Start Battle button
    const startButton = this.createButton(
      'Start Battle',
      buttonWidth + spacing,
      0,
      buttonWidth,
      buttonHeight,
      async () => {
        await this.startBattle();
      }
    );
    
    // Style the start button differently
    const startBg = startButton.children[0] as Graphics;
    startBg.clear()
      .roundRect(0, 0, buttonWidth, buttonHeight, 8)
      .fill(Gradients.createButtonGradient(buttonWidth, buttonHeight))
      .stroke({ width: 2, color: Colors.RARITY_LEGENDARY });
    
    buttonContainer.addChild(backButton, startButton);
    
    // Center the buttons
    buttonContainer.x = (this.gameWidth - (buttonWidth * 2 + spacing)) / 2;
    buttonContainer.y = this.gameHeight - buttonHeight - 40;
    
    this.container.addChild(buttonContainer);
  }

  private async startBattle(): Promise<void> {
    try {
      // Create battle with backend (or use mock data)
      const battleData = {
        stageId: this.stage?.id,
        playerDeck: this.generatedDeck.map(card => card.id),
        ...this.battleData
      };
      
      console.log('Creating battle with data:', battleData);
      const battleResponse = await battleApi.createBattle(battleData);
      
      // Navigate to card battle scene with battle data
      navigation.showScreen(CardBattleScene, {
        battleId: battleResponse.battleId,
        stage: this.stage,
        playerDeck: this.generatedDeck,
        battleData: battleResponse
      });
    } catch (error) {
      console.error('Failed to create battle:', error);
      // For now, proceed with mock data
      navigation.showScreen(CardBattleScene, {
        stage: this.stage,
        playerDeck: this.generatedDeck
      });
    }
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.createUI();
  }
}
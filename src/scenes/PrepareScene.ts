import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { CardBattleScene } from './CardBattleScene';
import { StageScene } from './StageScene';
import { BattleCard } from '@/types';
import { createRandomDeck } from '@/utils/cardData';
import { battleApi } from '@/services/api';

interface PrepareSceneParams {
  stage: any;
  battleData?: any;
}

export class PrepareScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private stage: any;
  private battleData: any;
  private generatedDeck: BattleCard[] = [];
  private deckContainer!: Container;
  private uiContainer!: Container;
  
  constructor(params?: PrepareSceneParams) {
    super();
    
    this.container = new Container();
    this.addChild(this.container);
    
    this.stage = params?.stage;
    this.battleData = params?.battleData;
    
    // Generate deck for preview
    this.generatedDeck = createRandomDeck(20); // Smaller deck for battle
  }

  /** Prepare the screen before showing */
  prepare(): void {
    this.createUI();
  }

  private createUI(): void {
    this.container.removeChildren();
    this.createBackground();
    this.createHeader();
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
    const headerContainer = new Container();
    
    // Stage info panel
    const panelWidth = Math.min(this.gameWidth - 40, 600);
    const panelHeight = 120;
    
    const panel = new Graphics()
      .roundRect(0, 0, panelWidth, panelHeight, 15)
      .fill(Gradients.createPanelGradient(panelWidth, panelHeight))
      .stroke({ width: 3, color: Colors.BUTTON_BORDER });
    
    const stageName = new Text({
      text: `Prepare for Battle: ${this.stage?.name || 'Unknown Stage'}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    stageName.x = 20;
    stageName.y = 20;
    
    const description = new Text({
      text: 'Review your generated deck cards before starting the battle.\nYou cannot modify the deck once the battle begins.',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: panelWidth - 40
      }
    });
    description.x = 20;
    description.y = 55;
    
    headerContainer.addChild(panel, stageName, description);
    headerContainer.x = (this.gameWidth - panelWidth) / 2;
    headerContainer.y = 20;
    
    this.container.addChild(headerContainer);
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
    const cardsPerRow = Math.floor((this.gameWidth - 40) / (cardWidth + 10));
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
      '← Back to Stage',
      0,
      0,
      buttonWidth,
      buttonHeight,
      () => {
        navigation.showScreen(StageScene);
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

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.container.alpha = 0;
    const tween = { alpha: 0 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha += 0.05;
        this.container.alpha = tween.alpha;
        
        if (tween.alpha >= 1) {
          this.container.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    const tween = { alpha: 1 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha -= 0.1;
        this.container.alpha = tween.alpha;
        
        if (tween.alpha <= 0) {
          this.container.alpha = 0;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
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
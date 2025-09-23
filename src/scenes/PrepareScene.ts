import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { Colors, Gradients } from '@/utils/colors';
import { CardBattleScene } from './CardBattleScene';
import { BattleCard, BattleStageResponse, Card, CardType, CardRarity, Character } from '@/types';
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
        response.errors.forEach(error => console.error(`   Error: ${error}`));
      }
      this.battleStage = null; // Use null as fallback
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

    const chars = this.player.lineup || [];
    const maxPerRow = Math.min(chars.length, 3) || 1; // up to 3 per row, at least 1
    const spacing = 10;
    const availableWidth = this.gameWidth - 40 - (maxPerRow - 1) * spacing;
    const cardWidth = availableWidth / maxPerRow;
    const cardHeight = cardWidth * 1.2;

    chars.forEach((char: Character, index: number) => {
      const row = 0; // single row for lineup
      const col = index;

      const charCard = this.createHeroCard(char, 0, 0, 'preview');
      charCard.width = cardWidth;
      charCard.height = cardHeight;

      charCard.x = 20 + col * (cardWidth + spacing);
      charCard.y = lineupTitle.height + 10 + row * (cardHeight + spacing);

      lineupContainer.addChild(charCard);
    });

    lineupContainer.x = 0;
    lineupContainer.y = 90; // Just below the header

    // Store the height for use in deck preview positioning
    this.lineupContainerHeight = lineupTitle.height + 10 + cardHeight + (chars.length > 0 ? 0 : 0);

    this.container.addChild(lineupContainer);
  }

  private createDeckPreview(): void {
    this.deckContainer = new Container();

    const deckTitle = new Text({
      text: `Your Battle Deck (${this.battleStage?.cards.length || 0} cards)`,
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

    // Responsive card grid
    const cardsPerRow = 3;
    const spacing = 10;
    const scrollBoxWidth = this.gameWidth - 40;
    const cardWidth = (scrollBoxWidth - (cardsPerRow - 1) * spacing) / cardsPerRow;
    const cardHeight = 160;
    const gridContainer = new Container();

    this.battleStage?.cards.forEach((card, index) => {
      const row = Math.floor(index / cardsPerRow);
      const col = index % cardsPerRow;

      const cardContainer = this.createDeckCard(card, cardWidth, cardHeight);
      cardContainer.x = col * (cardWidth + spacing);
      cardContainer.y = 40 + row * (cardHeight + spacing);

      gridContainer.addChild(cardContainer);
    });

    // Calculate grid size
    const totalRows = Math.ceil(((this.battleStage?.cards?.length ?? 0) / cardsPerRow));
    const cardGridTop = 40; // space below deckTitle
    const headerHeight = 40 + 32 + 20; // 40 (title y) + 32 (title font) + 20 (margin)
    const lineupHeight = this.lineupContainerHeight || 150;
    const buttonHeight = 50 + 40; // button height + bottom margin

    // Set gridHeight so that scrollbox fits between header+lineup and buttons
    const gridHeight = this.gameHeight - headerHeight - lineupHeight - buttonHeight - cardGridTop;

    // Create ScrollBox
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
    this.deckContainer.y = 90 + lineupHeight + 20;

    this.container.addChild(this.deckContainer);
  }

  private createDeckCard(card: Card, width: number, height: number): Container {
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
      .stroke({ width: 2, color: Colors.CARD_BORDER });

    // Group icon at top right
    let groupIcon = '';
    switch (card.group) {
      case CardType.ATTACK:
        groupIcon = '⚔️';
        break;
      case CardType.HEAL:
        groupIcon = '✨';
        break;
      case CardType.DEBUFF:
        groupIcon = '🌀';
        break;
      case CardType.BUFF:
        groupIcon = '🔼';
        break;
      default:
        groupIcon = '⭐';
    }
    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        align: 'center',
        fill: Colors.TEXT_PRIMARY
      }
    });
    groupIconText.anchor.set(1, 0);
    groupIconText.x = width - 8;
    groupIconText.y = 6;

    // Card name at top, below icon
    const cardName = new Text({
      text: card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        wordWrap: true,
        wordWrapWidth: width - 16
      }
    });
    cardName.anchor.set(0.5, 0);
    cardName.x = width / 2;
    cardName.y = groupIconText.y + groupIconText.height + 5;

    // Energy cost (top left)
    const energyCost = new Graphics()
      .circle(18, 18, 14)
      .fill({ color: Colors.BUTTON_PRIMARY })
      .stroke({ width: 1, color: Colors.BUTTON_BORDER });
    const energyText = new Text({
      text: card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = 18;
    energyText.y = 18;

    // Card description, trimmed if too long
    const maxDescLength = 50;
    let descText = card.description;
    if (descText.length > maxDescLength) {
      descText = descText.slice(0, maxDescLength - 3) + '...';
    }
    const description = new Text({
      text: descText,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: width - 24,
        align: 'center'
      }
    });
    description.anchor.set(0.5, 0.5);
    description.x = width / 2;
    description.y = height / 2 + 20;

    cardContainer.addChild(bg, groupIconText, cardName, energyCost, energyText, description);

    // Make card interactive for hover effects and click
    cardContainer.interactive = true;
    cardContainer.cursor = 'pointer';

    cardContainer.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });

    cardContainer.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    // Add click event to show card details
    cardContainer.on('pointertap', () => {
      this.showCardDetails(card);
    });

    // Ensure card fits the given width and height
    cardContainer.width = width;
    cardContainer.height = height;

    return cardContainer;
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();

    // Responsive: 2 buttons, spacing, fit to screen width
    const buttonCount = 2;
    const spacing = 20;
    const totalSpacing = spacing * (buttonCount - 1);
    const buttonWidth = (this.gameWidth - 2 * 40 - totalSpacing) / buttonCount; // 40px side margin
    const buttonHeight = 50;

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
      this.gameWidth - buttonWidth - 40,
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

    // Center the buttons with side margin
    buttonContainer.x = 20;
    buttonContainer.y = this.gameHeight - buttonHeight - 40;

    this.container.addChild(buttonContainer);
  }

  private async startBattle(): Promise<void> {
    const response = await battleApi.startBattle(this.battleStage?.battle_id || '');
    if (response.success) {
      console.log(`✅ Battle started successfully: ${response.message}`);
      // Navigate to card battle scene with battle data
      navigation.showScreen(CardBattleScene, {
        battle_id: this.battleStage?.battle_id,
      });
    } else {
      console.error(`❌ Failed to start battle: ${response.message}`);
      if (response.errors) {
        response.errors.forEach(error => console.error(`   Error: ${error}`));
      }
      // Could show an error message to the user here
    }
  }

  private showCardDetails(card: Card): void {
    const battleCard = this.convertCardToBattleCard(card);
    navigation.presentPopup(class extends CardDetailPopup {
      constructor() {
        super({ card: battleCard });
      }
    });
  }

  private convertCardToBattleCard(card: Card): BattleCard {
    // Convert Card to BattleCard format
    return {
      id: card.id,
      name: card.name,
      description: card.description,
      energyCost: card.energy_cost,
      group: this.mapCardGroup(card.group),
      rarity: this.mapCardRarity(card.rarity || 'common'),
      effects: [] // Empty effects array since we don't have card effects in the Card interface
    };
  }

  private mapCardGroup(group: string): CardType {
    switch (group.toLowerCase()) {
      case 'attack':
      case 'high damage':
        return CardType.ATTACK;
      case 'heal':
      case 'healing & support':
        return CardType.HEAL;
      case 'buff':
      case 'buffs & enhancements':
        return CardType.BUFF;
      case 'debuff':
      case 'control & debuff':
        return CardType.DEBUFF;
      case 'special':
        return CardType.SPECIAL;
      default:
        return CardType.SPECIAL;
    }
  }

  private mapCardRarity(rarity: string): CardRarity {
    switch (rarity.toLowerCase()) {
      case 'common':
        return CardRarity.COMMON;
      case 'uncommon':
        return CardRarity.UNCOMMON;
      case 'rare':
        return CardRarity.RARE;
      case 'epic':
        return CardRarity.EPIC;
      case 'legendary':
        return CardRarity.LEGENDARY;
      default:
        return CardRarity.COMMON;
    }
  }

  /** Resize handler */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
  }
}
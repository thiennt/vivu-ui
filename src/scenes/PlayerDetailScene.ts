import { Graphics, Container, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { mockPlayer, mockCharacters } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { CharactersScene } from './CharactersScene';
import { CharacterDetailScene } from './CharacterDetailScene';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { ScrollBox } from '@pixi/ui';

export class PlayerDetailScene extends BaseScene {
  constructor() {
    super();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createCharacterCollection();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Player Profile', this.gameWidth / 2, 60);
    this.addChild(title);
  }

  private createPlayerStats(): void {
    const statsContainer = new Container();
    
    // Calculate responsive panel sizes with standard padding
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const panelWidth = Math.min(280, (availableWidth - this.STANDARD_SPACING) / 2);
    const totalWidth = (panelWidth * 2) + this.STANDARD_SPACING;
    const startX = (this.gameWidth - totalWidth) / 2;
    
    // Main info panel
    const mainPanel = this.createStatsPanel(
      'Player Information',
      [
        `Username: ${mockPlayer.username}`,
        `Level: ${mockPlayer.level}`,
        `Experience: ${mockPlayer.exp}`,
        `Characters: ${mockPlayer.characters.length}`
      ],
      panelWidth, 160
    );
    
    // Stats panel
    const statsPanel = this.createStatsPanel(
      'Statistics',
      [
        `Stamina: ${mockPlayer.stats.stamina}`,
        `Strength: ${mockPlayer.stats.strength}`,
        `Agility: ${mockPlayer.stats.agility}`,
        `Luck: ${mockPlayer.stats.luck}`,
        `Intelligence: ${mockPlayer.stats.intelligence}`,
        `Vitality: ${mockPlayer.stats.vitality}`
      ],
      panelWidth, 200
    );
    
    // Center both panels horizontally
    mainPanel.x = startX;
    mainPanel.y = 120;
    
    statsPanel.x = startX + panelWidth + this.STANDARD_SPACING;
    statsPanel.y = 120;
    
    statsContainer.addChild(mainPanel, statsPanel);
    this.addChild(statsContainer);
  }

  private createStatsPanel(title: string, stats: string[], width: number, height: number): Container {
    const panel = new Container();
    
    // Background
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, width, height, 12);
    
    // Title
    const titleText = new Text({text: title, style: {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY
    }});
    titleText.x = 15;
    titleText.y = 15;
    
    panel.addChild(bg, titleText);
    
    // Stats
    stats.forEach((stat, index) => {
      const statText = new Text({text: stat, style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY
      }});
      statText.x = 15;
      statText.y = 50 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createCharacterCollection(): void {
    const collectionContainer = new Container();

    // Card layout with standard spacing
    const cardWidth = 120;
    const cardHeight = 140;
    const totalCards = mockPlayer.characters.length;

    // Title - centered
    const collectionTitle = new Text({ text: 'Character Collection', style: {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY
    }});
    collectionTitle.anchor.set(0.5, 0);
    collectionTitle.x = this.gameWidth / 2;
    collectionTitle.y = 360;

    // ScrollBox setup (no padding/overflow/verticalScroll/horizontalScroll options)
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const visibleCards = Math.min(Math.floor(availableWidth / (cardWidth + this.STANDARD_SPACING)), totalCards);
    const scrollBoxWidth = (cardWidth * visibleCards) + (this.STANDARD_SPACING * (visibleCards - 1));
    const scrollBoxHeight = cardHeight;
    const scrollBox = new ScrollBox({
      width: scrollBoxWidth,
      height: scrollBoxHeight,
    });

    // Add cards to ScrollBox viewport, always from left (no marginLeft)
    mockPlayer.characters.forEach((characterId, index) => {
      const character = mockCharacters.find(c => c.id === characterId);
      if (character) {
        const card = this.createCharacterPreviewCard(character, this.STANDARD_PADDING + index * (cardWidth + this.STANDARD_SPACING), 0);
        // Position cards horizontally with spacing, always from left
        card.x = index * (cardWidth + this.STANDARD_SPACING);
        card.y = 0;
        scrollBox.addItem(card);
      }
    });

    // Set viewport width for scrolling (include padding)
    scrollBox.width = this.STANDARD_PADDING + totalCards * cardWidth + (totalCards - 1) * this.STANDARD_SPACING + this.STANDARD_PADDING;

    // Position ScrollBox centered horizontally
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = 400;

    // View all button - responsive width
    const buttonWidth = Math.min(250, this.gameWidth - 2 * this.STANDARD_PADDING);
    const viewAllButton = this.createButton(
      'View All Characters',
      (this.gameWidth - buttonWidth) / 2,
      scrollBox.y + cardHeight + this.STANDARD_SPACING * 2,
      buttonWidth,
      50,
      () => navigation.showScreen(CharactersScene)
    );

    collectionContainer.addChild(collectionTitle, scrollBox, viewAllButton);
    this.addChild(collectionContainer);
  }

  private createCharacterPreviewCard(character: any, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'preview');
    
    // Click handler
    card.on('pointerdown', () => {
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    });
    
    return card;
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.addChild(backButton);
  }

  update(time: Ticker): void {
    // No animations needed for this scene
  }
}
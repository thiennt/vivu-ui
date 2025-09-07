import * as PIXI from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { mockPlayer } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { CharactersScene } from './CharactersScene';
import { CharacterDetailScene } from './CharacterDetailScene';
import { HomeScene } from './HomeScene';

export class PlayerDetailScene extends BaseScene {
  constructor() {
    super();
  }

  init(): void {
    this.createBackground();
    this.createHeader();
    this.createPlayerStats();
    this.createCharacterCollection();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new PIXI.Graphics();
    bg.fill(0x2c1810).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Player Profile', this.gameWidth / 2, 60);
    this.addChild(title);
  }

  private createPlayerStats(): void {
    const statsContainer = new PIXI.Container();
    
    // Main info panel
    const mainPanel = this.createStatsPanel(
      'Player Information',
      [
        `Username: ${mockPlayer.username}`,
        `Level: ${mockPlayer.level}`,
        `Experience: ${mockPlayer.experience}`,
        `Characters: ${mockPlayer.characters.length}`
      ],
      300, 160
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
      280, 200
    );
    
    mainPanel.x = 50;
    mainPanel.y = 120;
    
    statsPanel.x = this.gameWidth - 330;
    statsPanel.y = 120;
    
    statsContainer.addChild(mainPanel, statsPanel);
    this.addChild(statsContainer);
  }

  private createStatsPanel(title: string, stats: string[], width: number, height: number): PIXI.Container {
    const panel = new PIXI.Container();
    
    // Background
    const bg = new PIXI.Graphics();
    bg.fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 })
      .roundRect(0, 0, width, height, 12);
    
    // Title
    const titleText = new PIXI.Text(title, {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    titleText.x = 15;
    titleText.y = 15;
    
    panel.addChild(bg, titleText);
    
    // Stats
    stats.forEach((stat, index) => {
      const statText = new PIXI.Text(stat, {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xd7ccc8
      });
      statText.x = 15;
      statText.y = 50 + (index * 22);
      panel.addChild(statText);
    });
    
    return panel;
  }

  private createCharacterCollection(): void {
    const collectionContainer = new PIXI.Container();
    
    // Title
    const collectionTitle = new PIXI.Text('Character Collection', {
      fontFamily: 'Kalam',
      fontSize: 24,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    collectionTitle.x = 50;
    collectionTitle.y = 360;
    
    // Character preview cards
    const cardContainer = new PIXI.Container();
    
    mockPlayer.characters.slice(0, 5).forEach((character, index) => {
      const card = this.createCharacterPreviewCard(character, index * 130, 0);
      cardContainer.addChild(card);
    });
    
    cardContainer.x = 50;
    cardContainer.y = 400;
    
    // View all button
    const viewAllButton = this.createButton(
      'View All Characters',
      this.gameWidth - 250,
      420,
      200,
      50,
      () => navigation.showScreen(CharactersScene)
    );
    
    collectionContainer.addChild(collectionTitle, cardContainer, viewAllButton);
    this.addChild(collectionContainer);
  }

  private createCharacterPreviewCard(character: any, x: number, y: number): PIXI.Container {
    const card = this.createCard(x, y, 120, 120, character.rarity);
    
    // Character name
    const nameText = new PIXI.Text(character.tokenSymbol, {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center'
    });
    nameText.anchor.set(0.5);
    nameText.x = 60;
    nameText.y = 20;
    
    // Level
    const levelText = new PIXI.Text(`Lv.${character.level}`, {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: 0xd7ccc8,
      align: 'center'
    });
    levelText.anchor.set(0.5);
    levelText.x = 60;
    levelText.y = 40;
    
    // Stats preview
    const hpText = new PIXI.Text(`HP: ${character.stats.health}`, {
      fontFamily: 'Kalam',
      fontSize: 10,
      fill: 0xd7ccc8
    });
    hpText.x = 10;
    hpText.y = 70;
    
    const atkText = new PIXI.Text(`ATK: ${character.stats.attack}`, {
      fontFamily: 'Kalam',
      fontSize: 10,
      fill: 0xd7ccc8
    });
    atkText.x = 10;
    atkText.y = 85;
    
    card.addChild(nameText, levelText, hpText, atkText);
    
    // Click handler
    card.on('pointerdown', () => {
      // Store selected character for detail view
      navigation.showScreen(CharacterDetailScene, { selectedCharacter: character });
    });
    
    return card;
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      50,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.addChild(backButton);
  }

  update(time: PIXI.Ticker): void {
    // No animations needed for this scene
  }

  destroy(): void {
    this.removeChildren();
  }
}
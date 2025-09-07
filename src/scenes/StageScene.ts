import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Dungeon } from '@/types';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { DungeonScene } from './DungeonScene';

export class StageScene extends BaseScene {
  private dungeon: Dungeon | null = null;
  private selectedChapter: number = 0;

  constructor(params?: { selectedDungeon: Dungeon }) {
    super();
    this.dungeon = params?.selectedDungeon || null;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    if (!this.dungeon) {
      navigation.showScreen(HomeScene);
      return;
    }

    this.createBackground();
    this.createHeader();
    this.createChapterSelector();
    this.createStageList();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(0x1a0e0a).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle(this.dungeon!.name, this.gameWidth / 2, 60);
    
    const subtitle = new Text({
      text: 'Choose your stage',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 100;
    
    this.addChild(title, subtitle);
  }

  private createChapterSelector(): void {
    const selectorContainer = new Container();
    
    // Calculate responsive sizing
    const selectorWidth = Math.min(this.gameWidth - 100, 800);
    const buttonWidth = Math.min(160, (selectorWidth - 140) / this.dungeon!.chapters.length);
    
    const selectorBg = new Graphics();
    selectorBg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, selectorWidth, 60, 10);
    
    const chapterTitle = new Text({
      text: 'Chapters:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    chapterTitle.x = 20;
    chapterTitle.y = 20;
    
    selectorContainer.addChild(selectorBg, chapterTitle);
    
    // Chapter buttons - responsive positioning
    let currentX = 120;
    this.dungeon!.chapters.forEach((chapter, index) => {
      const chapterButton = this.createChapterButton(
        chapter.name,
        currentX,
        10,
        buttonWidth,
        40,
        index
      );
      selectorContainer.addChild(chapterButton);
      currentX += buttonWidth + 10;
    });
    
    // Center the selector horizontally
    selectorContainer.x = (this.gameWidth - selectorWidth) / 2;
    selectorContainer.y = 140;
    
    this.addChild(selectorContainer);
  }

  private createChapterButton(text: string, x: number, y: number, width: number, height: number, chapterIndex: number): Container {
    const button = new Container();
    
    const isSelected = chapterIndex === this.selectedChapter;
    const bgColor = isSelected ? Colors.BUTTON_PRIMARY : Colors.BUTTON_BORDER;
    const textColor = isSelected ? Colors.TEXT_PRIMARY : Colors.TEXT_SECONDARY;
    
    const bg = new Graphics();
    bg.fill(bgColor)
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, width, height, 8);

    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: textColor,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 10
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
    
    button.on('pointerdown', () => {
      this.selectedChapter = chapterIndex;
      this.refreshStageList();
      this.refreshChapterSelector();
    });
    
    return button;
  }

  private createStageList(): void {
    const stageContainer = new Container();
    stageContainer.label = 'stageContainer';
    
    const chapter = this.dungeon!.chapters[this.selectedChapter];
    if (chapter) {
      // Calculate responsive grid layout
      const cardWidth = 180;
      const cardHeight = 130;
      const cardSpacing = 20;
      const maxColumns = Math.floor((this.gameWidth - 100) / (cardWidth + cardSpacing));
      const columns = Math.min(3, maxColumns);
      const gridWidth = (cardWidth * columns) + (cardSpacing * (columns - 1));
      
      chapter.stages.forEach((stage, index) => {
        const stageCard = this.createStageCard(stage, index);
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        stageCard.x = col * (cardWidth + cardSpacing);
        stageCard.y = row * (cardHeight + cardSpacing);
        stageContainer.addChild(stageCard);
      });
      
      // Center the stage grid
      stageContainer.x = (this.gameWidth - gridWidth) / 2;
    } else {
      stageContainer.x = (this.gameWidth - 600) / 2;
    }
    
    stageContainer.y = 240;
    this.addChild(stageContainer);
  }

  private createStageCard(stage: any, index: number): Container {
    const card = new Container();
    
    // Background
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY })
      .roundRect(0, 0, 180, 130, 10);
    
    // Stage number
    const stageNumber = new Text({
      text: `Stage ${stage.stageNumber}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    stageNumber.x = 10;
    stageNumber.y = 10;
    
    // Stage name
    const stageName = new Text({
      text: stage.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: 160
      }
    });
    stageName.x = 10;
    stageName.y = 35;
    
    // Difficulty
    const difficultyColors: { [key: string]: number } = {
      easy: Colors.ELEMENT_EARTH,
      normal: Colors.RARITY_LEGENDARY,
      hard: Colors.ELEMENT_FIRE,
      nightmare: Colors.ELEMENT_DARK
    };

    const difficulty = new Text({
      text: stage.difficulty.toUpperCase(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: difficultyColors[stage.difficulty] || Colors.TEXT_WHITE
      }
    });
    difficulty.x = 10;
    difficulty.y = 65;
    
    // Rewards preview
    const rewardText = new Text({
      text: `Rewards: ${stage.rewards.length} items`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_TERTIARY
      }
    });
    rewardText.x = 10;
    rewardText.y = 85;
    
    // Enter button
    const enterButton = this.createButton(
      'Enter',
      100,
      100,
      70,
      25,
      () => {
        // In a real game, this would start the battle
        alert(`Starting battle in ${stage.name}!`);
      }
    );
    
    card.addChild(bg, stageNumber, stageName, difficulty, rewardText, enterButton);
    
    // Hover effects
    card.interactive = true;
    card.on('pointerover', () => {
      bg.tint = 0xe8e8e8;
    });
    card.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return card;
  }

  private refreshStageList(): void {
    const existingContainer = this.getChildByLabel('stageContainer');
    if (existingContainer) {
      this.removeChild(existingContainer);
    }
    this.createStageList();
  }

  private refreshChapterSelector(): void {
    // This is a simplified refresh - in a real app you'd update the existing buttons
    this.removeChildren();
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Dungeons',
      50,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(DungeonScene)
    );
    this.addChild(backButton);
  }
}
import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Dungeon } from '@/types';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';

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
        fill: 0xd7ccc8,
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
    
    const selectorBg = new Graphics();
    selectorBg.fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 2, color: 0x8d6e63 })
      .roundRect(0, 0, this.gameWidth - 100, 60, 10);
    
    const chapterTitle = new Text({
      text: 'Chapters:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    chapterTitle.x = 20;
    chapterTitle.y = 20;
    
    selectorContainer.addChild(selectorBg, chapterTitle);
    
    // Chapter buttons
    this.dungeon!.chapters.forEach((chapter, index) => {
      const chapterButton = this.createChapterButton(
        chapter.name,
        120 + (index * 180),
        10,
        160,
        40,
        index
      );
      selectorContainer.addChild(chapterButton);
    });
    
    selectorContainer.x = 50;
    selectorContainer.y = 140;
    
    this.addChild(selectorContainer);
  }

  private createChapterButton(text: string, x: number, y: number, width: number, height: number, chapterIndex: number): Container {
    const button = new Container();
    
    const isSelected = chapterIndex === this.selectedChapter;
    const bgColor = isSelected ? 0x8d6e63 : 0x5d4037;
    const textColor = isSelected ? 0xffecb3 : 0xd7ccc8;
    
    const bg = new Graphics();
    bg.fill(bgColor)
      .stroke({ width: 2, color: 0x8d6e63 })
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
      chapter.stages.forEach((stage, index) => {
        const stageCard = this.createStageCard(stage, index);
        stageCard.x = (index % 3) * 200;
        stageCard.y = Math.floor(index / 3) * 150;
        stageContainer.addChild(stageCard);
      });
    }
    
    stageContainer.x = (this.gameWidth - 600) / 2;
    stageContainer.y = 240;
    
    this.addChild(stageContainer);
  }

  private createStageCard(stage: any, index: number): Container {
    const card = new Container();
    
    // Background
    const bg = new Graphics();
    bg.fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 })
      .roundRect(0, 0, 180, 130, 10);
    
    // Stage number
    const stageNumber = new Text({
      text: `Stage ${stage.stageNumber}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffecb3
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
        fill: 0xd7ccc8,
        wordWrap: true,
        wordWrapWidth: 160
      }
    });
    stageName.x = 10;
    stageName.y = 35;
    
    // Difficulty
    const difficultyColors: { [key: string]: number } = {
      easy: 0x4caf50,
      normal: 0xff9800,
      hard: 0xf44336,
      nightmare: 0x9c27b0
    };

    const difficulty = new Text({
      text: stage.difficulty.toUpperCase(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: difficultyColors[stage.difficulty] || 0xffffff
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
        fill: 0xa1887f
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
      () => navigation.showScreen(HomeScene)
    );
    this.addChild(backButton);
  }
}
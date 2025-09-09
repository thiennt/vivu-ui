import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Dungeon } from '@/types';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { DungeonScene } from './DungeonScene';

export class StageScene extends BaseScene {
  private dungeon: Dungeon | null = null;
  private selectedStage: number = 0;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private stageContainer: Container;
  private buttonContainer: Container;

  constructor(params?: { selectedDungeon: Dungeon }) {
    super();
    this.dungeon = params?.selectedDungeon || null;
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.stageContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.stageContainer,
      this.buttonContainer
    );
    
    // Create UI once
    this.initializeUI();
  }
  
  private initializeUI(): void {
    if (!this.dungeon) {
      navigation.showScreen(HomeScene);
      return;
    }
    
    this.createBackground();
    this.createHeader();
    this.createStageList();
    this.createBackButton();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    if (!this.dungeon) {
      navigation.showScreen(HomeScene);
      return;
    }

    // Update UI layout without recreating
    this.updateLayout();
  }
  
  private updateLayout(): void {
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.stageContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createStageList();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(0x1a0e0a);
    this.backgroundContainer.addChild(bg);
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
    
    this.headerContainer.addChild(title, subtitle);
  }

  private createStageSelector(): void {
    const selectorContainer = new Container();
    
    // Calculate responsive sizing
    const selectorWidth = Math.min(this.gameWidth - 100, 800);
    const buttonWidth = Math.min(160, (selectorWidth - 140) / this.dungeon!.stages.length);
    
    const selectorBg = new Graphics();
    selectorBg.roundRect(0, 0, selectorWidth, 60, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });
    
    const stageTitle = new Text({
      text: 'Stages:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    stageTitle.x = 20;
    stageTitle.y = 20;
    
    selectorContainer.addChild(selectorBg, stageTitle);
    
    // Stage buttons - responsive positioning
    let currentX = 120;
    this.dungeon!.stages.forEach((stage, index) => {
      const stageButton = this.createStageButton(
        stage.name,
        currentX,
        10,
        buttonWidth,
        40,
        index
      );
      selectorContainer.addChild(stageButton);
      currentX += buttonWidth + 10;
    });
    
    // Center the selector horizontally
    selectorContainer.x = (this.gameWidth - selectorWidth) / 2;
    selectorContainer.y = 140;
    
    this.stageContainer.addChild(selectorContainer);
  }

  private createStageButton(text: string, x: number, y: number, width: number, height: number, stageIndex: number): Container {
    const button = new Container();

    const isSelected = stageIndex === this.selectedStage;
    const bgColor = isSelected ? Colors.BUTTON_PRIMARY : Colors.BUTTON_BORDER;
    const textColor = isSelected ? Colors.TEXT_PRIMARY : Colors.TEXT_SECONDARY;
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill(bgColor)
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });

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
      this.selectedStage = stageIndex;
      this.refreshStageList();
      this.refreshStageSelector();
    });
    
    return button;
  }

  private createStageList(): void {
    this.stageContainer.label = 'stageContainer';
    
    const stages = this.dungeon!.stages;
    if (stages.length > 0) {
      // Calculate responsive grid layout
      const cardWidth = 180;
      const cardHeight = 130;
      const cardSpacing = 20;
      const maxColumns = Math.floor((this.gameWidth - 100) / (cardWidth + cardSpacing));
      const columns = Math.min(3, maxColumns);
      const gridWidth = (cardWidth * columns) + (cardSpacing * (columns - 1));
      
      stages.forEach((stage, index) => {
        const stageCard = this.createStageCard(stage, index);
        const col = index % columns;
        const row = Math.floor(index / columns);
        
        stageCard.x = col * (cardWidth + cardSpacing);
        stageCard.y = row * (cardHeight + cardSpacing);
        this.stageContainer.addChild(stageCard);
      });
      
      // Center the stage grid
      this.stageContainer.x = (this.gameWidth - gridWidth) / 2;
    } else {
      this.stageContainer.x = (this.gameWidth - 600) / 2;
    }

    this.stageContainer.y = 120;
    this.addChild(this.stageContainer);
  }

  private createStageCard(stage: any, index: number): Container {
    const card = new Container();
    
    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, 180, 130, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });
    
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
    const difficultyColors: { [key: number]: number } = {
      1: Colors.ELEMENT_EARTH,
      2: Colors.RARITY_LEGENDARY,
      3: Colors.ELEMENT_FIRE,
      4: Colors.ELEMENT_DARK
    };

    const difficulty = new Text({
      text: stage.difficulty.toString(),
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

  private refreshStageSelector(): void {
    // This is a simplified refresh - in a real app you'd update the existing buttons
    this.removeChildren();
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Dungeons',
      5,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(DungeonScene)
    );
    this.buttonContainer.addChild(backButton);
  }
}
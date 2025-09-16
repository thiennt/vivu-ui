import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { mockDungeons } from '@/utils/mockData';
import { DungeonScene } from './DungeonScene';
import { CardBattleScene } from './CardBattleScene';
import { PrepareScene } from './PrepareScene';
import { HomeScene } from './HomeScene';
import { Colors, Gradients } from '@/utils/colors';
import { battleApi } from '@/services/api';
import { Dungeon, Stage } from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { waitFor } from '@/utils/asyncUtils';

export class TowerScene extends BaseScene {
  private dungeon: Dungeon | null = null;
  private selectedFloor: number = 0;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private towerContainer: Container;
  private buttonContainer: Container;

  private loadingManager: LoadingStateManager;

  constructor(params?: { selectedDungeon: Dungeon }) {
    super();
    this.dungeon = params?.selectedDungeon || null;

    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.towerContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.towerContainer,
      this.buttonContainer
    );

    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Create UI once
    this.initializeUI();
  }
  
  private async initializeUI(): Promise<void> {
    try {
      this.loadingManager.showLoading();
      
      if (!this.dungeon) {
        // Use the first dungeon as default for tower mode
        this.dungeon = mockDungeons[0];
      }
      
      this.createBackground();
      this.createHeader();
      this.createTowerList();
      this.createBackButton();
      
      this.loadingManager.hideLoading();
    } catch (error) {
      console.error('Failed to initialize Tower UI:', error);
      this.loadingManager.hideLoading();
    }
  }

  async resize(width: number, height: number): Promise<void> {
    this.gameWidth = width;
    this.gameHeight = height;

    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);

    // Only update layout if we have loaded data
    if (this.dungeon) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.towerContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createTowerList();
    this.createBackButton();
  }

  private createBackground(): void {
    // Create a mystical tower-themed background
    const bgContainer = new Container();
    
    const availableHeight = this.getContentHeight();
    
    // Dark tower background with purple/blue gradient
    const bg = new Graphics();
    const towerGradient = Gradients.createBackgroundGradient(this.gameWidth, availableHeight);
    bg.fill(towerGradient).rect(0, 0, this.gameWidth, availableHeight);
    bgContainer.addChild(bg);
    
    // Add tower-themed decorative elements
    for (let i = 0; i < 20; i++) {
      const star = new Graphics();
      star.fill({ color: Colors.DECORATION_MAGIC, alpha: 0.2 + Math.random() * 0.4 })
        .circle(0, 0, 1 + Math.random() * 3);
      star.x = Math.random() * this.gameWidth;
      star.y = Math.random() * availableHeight;
      bgContainer.addChild(star);
    }
    
    this.backgroundContainer.addChild(bgContainer);
  }

  private createHeader(): void {
    const title = new Text({
      text: '🗼 Battle Tower',
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
    
    const subtitle = new Text({
      text: 'Climb the tower floor by floor in epic card battles!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontStyle: 'italic',
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.gameWidth - 40
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 80;
    
    this.headerContainer.addChild(title, subtitle);
  }

  private createTowerList(): void {
    this.towerContainer.label = 'towerContainer';
    
    const stages = this.dungeon!.stages;
    if (stages.length > 0) {
      // Calculate responsive tower layout
      const cardWidth = Math.min(250, this.gameWidth - 60); // Wider cards for tower
      const cardHeight = 140;
      const floorSpacing = 50; // Space between tower floors
      
      // Calculate total tower height and starting position
      const totalHeight = stages.length * cardHeight + (stages.length - 1) * floorSpacing;
      const availableHeight = this.gameHeight - 220; // Leave space for header and back button
      const startY = Math.max(20, (availableHeight - totalHeight) / 2);
      
      stages.forEach((stage, index) => {
        const floorCard = this.createFloorCard(stage, index);
        
        // Position cards vertically - bottom to top (like climbing a tower)
        // Reverse the order so first stage (floor 1) is at the bottom
        const reverseIndex = stages.length - 1 - index;
        floorCard.x = 0; // Centered horizontally
        floorCard.y = startY + reverseIndex * (cardHeight + floorSpacing);
        
        // Add tower floor connecting line (except for the top floor)
        if (index < stages.length - 1) {
          const connectionLine = this.createTowerConnection(cardWidth, cardHeight);
          connectionLine.x = cardWidth / 2 - 2; // Center the line
          connectionLine.y = floorCard.y + cardHeight;
          this.towerContainer.addChild(connectionLine);
        }
        
        this.towerContainer.addChild(floorCard);
      });
      
      // Center the tower horizontally
      this.towerContainer.x = (this.gameWidth - cardWidth) / 2;
    } else {
      this.towerContainer.x = (this.gameWidth - 250) / 2;
    }

    this.towerContainer.y = 120;
    this.addChild(this.towerContainer);
  }

  private createTowerConnection(cardWidth: number, cardHeight: number): Container {
    const connection = new Container();
    
    // Vertical connecting line with tower theme
    const line = new Graphics();
    line.moveTo(0, 0)
        .lineTo(0, 50) // Height of the floor spacing
        .stroke({ width: 6, color: Colors.BUTTON_PRIMARY, alpha: 0.7 });
    
    // Decorative tower nodes at top and bottom
    const topNode = new Graphics();
    topNode.circle(0, 0, 4)
           .fill({ color: Colors.BUTTON_PRIMARY, alpha: 0.9 });
    
    const bottomNode = new Graphics();
    bottomNode.circle(0, 50, 4)
              .fill({ color: Colors.BUTTON_PRIMARY, alpha: 0.9 });
    
    // Add mystical energy effect
    const energy = new Graphics();
    energy.circle(0, 25, 6)
          .fill({ color: Colors.DECORATION_MAGIC, alpha: 0.3 });
    
    connection.addChild(line, topNode, bottomNode, energy);
    return connection;
  }

  private createFloorCard(stage: Stage, index: number): Container {
    const card = new Container();
    
    // Updated dimensions for tower layout
    const cardWidth = Math.min(250, this.gameWidth - 60);
    const cardHeight = 140;
    
    // Background with tower floor styling
    const bg = new Graphics();
    bg.roundRect(0, 0, cardWidth, cardHeight, 12)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 4, color: Colors.BUTTON_PRIMARY });
    
    // Floor number (shows progression up the tower)
    const floorNumber = new Text({
      text: `🏗️ Floor ${stage.stageNumber || index + 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    floorNumber.x = 15;
    floorNumber.y = 12;
    
    // Stage name
    const stageName = new Text({
      text: stage.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_SECONDARY,
        wordWrap: true,
        wordWrapWidth: cardWidth - 30
      }
    });
    stageName.x = 15;
    stageName.y = 40;
    
    // Difficulty indicator with tower-appropriate styling
    const difficultyColors: { [key: number]: number } = {
      1: 0x4caf50, // Green for easy
      2: 0xff9800, // Orange for normal
      3: 0xff4500, // Red for hard
      4: 0x9c27b0  // Purple for nightmare
    };

    const difficulty = new Text({
      text: `⚔️ Difficulty: ${stage.difficulty}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: difficultyColors[stage.difficulty] || Colors.TEXT_WHITE
      }
    });
    difficulty.x = 15;
    difficulty.y = 70;
    
    // Energy cost (important for card games)
    const energyCost = new Text({
      text: `⚡ Energy: ${stage.energy_cost}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fill: Colors.TEXT_TERTIARY
      }
    });
    energyCost.x = 15;
    energyCost.y = 95;
    
    // Battle button with updated positioning for wider card
    const buttonWidth = Math.max(80, Math.min(100, cardWidth * 0.3));
    const buttonHeight = Math.max(30, Math.min(35, cardHeight * 0.2));
    
    const battleButton = this.createButton(
      '⚔️ Battle',
      cardWidth - buttonWidth - 15,
      cardHeight - buttonHeight - 15,
      buttonWidth,
      buttonHeight,
      async () => {
        await this.enterTowerFloor(stage);
      },
      13 // Base font size for responsive scaling
    );
    
    card.addChild(bg, floorNumber, stageName, difficulty, energyCost, battleButton);
    
    // Hover effects with tower theme
    card.interactive = true;
    card.on('pointerover', () => {
      bg.tint = 0xe0e0ff; // Slight blue tint for tower theme
    });
    card.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return card;
  }

  private createBackButton(): void {
    // Responsive button sizing
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = Math.max(40, Math.min(50, this.gameHeight * 0.07));
    
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene),
      14
    );
    this.buttonContainer.addChild(backButton);
  }

  private async enterTowerFloor(stage: Stage): Promise<void> {
    try {
      console.log('Entering tower floor:', stage.name);
      
      // Navigate to PrepareScene to review deck before tower battle
      navigation.showScreen(PrepareScene, {
        stage: stage,
        mode: 'tower' // Indicate this is tower mode
      });
    } catch (error) {
      console.error('Failed to enter tower floor:', error);
      // Fallback to direct battle navigation
      alert(`Error entering tower floor: ${error}. Starting battle anyway...`);
      navigation.showScreen(CardBattleScene, { stage, mode: 'tower' });
    }
  }

  update(time: Ticker): void {
    // Tower-specific animations could go here
    // For example, subtle floating animations for the magical energy effects
  }
}
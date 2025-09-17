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
import { TowerFloorPopup } from '@/popups/TowerFloorPopup';

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
        // Use the first dungeon as default for tower mode, cast to Dungeon type
        const mockDungeon = mockDungeons[0];
        this.dungeon = {
          id: mockDungeon.id,
          name: mockDungeon.name,
          description: mockDungeon.description,
          requiredLevel: 1,
          rewards: [],
          stages: mockDungeon.stages.map((stage, index) => ({
            ...stage,
            enemies: [], // Add missing enemies array
            rewards: [], // Convert rewards to proper array
            stageNumber: index + 1, // Add missing stage number
            is_boss_stage: false as false // Type assertion for literal false
          }))
        };
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
      // Calculate responsive tower layout with updated card dimensions
      const cardWidth = Math.min(200, this.gameWidth - 60); // Updated to match new card width
      const cardHeight = 120;
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
      this.towerContainer.x = (this.gameWidth - 200) / 2;
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
    
    // Simplified dimensions for tower layout - smaller cards with just floor number and icon
    const cardWidth = Math.min(200, this.gameWidth - 60);
    const cardHeight = 120;
    
    // Background with tower floor styling
    const bg = new Graphics();
    bg.roundRect(0, 0, cardWidth, cardHeight, 12)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.95 })
      .stroke({ width: 4, color: Colors.BUTTON_PRIMARY });
    
    // Floor number at the top
    const floorNumber = new Text({
      text: `Floor ${stage.stageNumber || index + 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    floorNumber.anchor.set(0.5, 0);
    floorNumber.x = cardWidth / 2;
    floorNumber.y = 15;
    
    // Big tower icon in center
    const towerIcon = new Text({
      text: '🗼',
      style: {
        fontFamily: 'Kalam',
        fontSize: 48,
        fill: Colors.BUTTON_PRIMARY
      }
    });
    towerIcon.anchor.set(0.5);
    towerIcon.x = cardWidth / 2;
    towerIcon.y = cardHeight / 2 + 5;
    
    card.addChild(bg, floorNumber, towerIcon);
    
    // Make entire card clickable to show popup
    card.interactive = true;
    card.cursor = 'pointer';
    
    // Hover effects with tower theme
    card.on('pointerover', () => {
      bg.tint = 0xe0e0ff; // Slight blue tint for tower theme
      towerIcon.scale.set(1.1); // Slightly enlarge icon on hover
    });
    card.on('pointerout', () => {
      bg.tint = 0xffffff;
      towerIcon.scale.set(1.0);
    });
    
    // Click to show floor popup
    card.on('pointerdown', () => {
      this.showFloorPopup(stage);
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

  private showFloorPopup(stage: Stage): void {
    // Create and show the tower floor popup
    const popup = new TowerFloorPopup({ stage });
    this.container.addChild(popup);
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
import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { battleApi, isLikelyUsingMockData } from '@/services/api';
import { Dungeon, Stage } from '@/types';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { TowerFloorPopup } from '@/popups/TowerFloorPopup';
import { ScrollBox } from '@pixi/ui';

export class TowerScene extends BaseScene {
  private dungeon: Dungeon | null = null;
  private selectedFloor: number = 0;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private towerContainer: Container;
  private buttonContainer: Container;

  private stages: any[] = [];
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
  }

  async prepare(): Promise<void> {
    this.loadingManager.showLoading();
    
    const response = await battleApi.getAvailableStages();
    if (response.success && response.data) {
      this.stages = response.data;
      console.log(`✅ Stages loaded successfully: ${response.message}`);
    } else {
      console.error(`❌ Failed to load stages: ${response.message}`);
      if (response.errors) {
        response.errors.forEach((error: any) => console.error(`   Error: ${error}`));
      }
      this.stages = []; // Use empty array as fallback
    }
    
    this.loadingManager.hideLoading();

    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private async initializeUI(): Promise<void> {
    if (!this.stages.length) return;

    this.createBackground();
    this.createHeader();
    this.createTowerList();
    this.createBackButton();
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
    const towerGradient = Colors.BACKGROUND_PRIMARY;
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
    
    this.headerContainer.addChild(title);
  }

  private createTowerList(): void {
    this.towerContainer.label = 'towerContainer';
    
    const stages = this.stages;
    // Calculate responsive tower layout with updated card dimensions
    const cardWidth = Math.min(200, this.gameWidth - 60); // Updated to match new card width
    const cardHeight = 120;
    const floorSpacing = 50; // Space between tower floors
    
    let firstFloorY = 0; // To track the Y position of the first floor for scrolling
    
    if (stages.length > 0) {  
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
        
        // Set firstFloorY to the first (bottom-most) not completed stage only once
        if (stage.is_current) {
          firstFloorY = floorCard.y;
        }

        // Add tower floor connecting line
        if (index < stages.length) {
          const connectionLine = this.createTowerConnection(cardWidth, cardHeight);
          connectionLine.x = cardWidth / 2 - 2; // Center the line
          connectionLine.y = floorCard.y + cardHeight;
          this.towerContainer.addChild(connectionLine);
        }
        
        this.towerContainer.addChild(floorCard);
      });
    }

    const scrollBoxWidth = cardWidth + 40; // Add some padding
    const scrollBoxHeight = this.gameHeight - 180;

    this.towerContainer.width = scrollBoxWidth;

    // Create ScrollBox for vertical scrolling
    const scrollBox = new ScrollBox({
      width: scrollBoxWidth,
      height: scrollBoxHeight
    });
    scrollBox.x = (this.gameWidth - scrollBoxWidth) / 2;
    scrollBox.y = 60;

    const maxScrollY = Math.max(this.towerContainer.height - scrollBoxHeight, 0);
    const targetY = Math.min(Math.max(firstFloorY - (scrollBoxHeight - cardHeight), 0), maxScrollY);

    // scroll to the first uncompleted floor, ensuring we don't exceed scroll bounds
    scrollBox.scrollToPosition({ x: 0, y: targetY });
    scrollBox.addItem(this.towerContainer);

    this.addChild(scrollBox);
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

    // Choose color based on completion
    const bgColor = stage.is_completed ? Colors.ELEMENT_DEFAULT : Colors.BACKGROUND_SECONDARY;

    // Background with tower floor styling
    const bg = new Graphics();
    bg.roundRect(0, 0, cardWidth, cardHeight, 12)
      .fill({ color: bgColor, alpha: 0.95 })
      .stroke({ width: 4, color: Colors.BUTTON_PRIMARY });
    
    // Floor number at the top
    const floorNumber = new Text({
      text: stage.name,
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
    
    // Tower icon: locked if not completed and not current
    let towerIcon: Text;
    if (!stage.is_completed && !stage.is_current) {
      towerIcon = new Text({
        text: '🔒',
        style: {
          fontFamily: 'Kalam',
          fontSize: 48,
          fill: Colors.BUTTON_PRIMARY
        }
      });
    } else {
      towerIcon = new Text({
        text: '🗼',
        style: {
          fontFamily: 'Kalam',
          fontSize: 48,
          fill: Colors.BUTTON_PRIMARY
        }
      });
    }
    towerIcon.anchor.set(0.5);
    towerIcon.x = cardWidth / 2;
    towerIcon.y = cardHeight / 2 + 5;
    
    card.addChild(bg, floorNumber, towerIcon);
    
    // Only allow click/hover for completed or current stage
    const isClickable = stage.is_completed || stage.is_current;
    card.interactive = isClickable;
    card.cursor = isClickable ? 'pointer' : 'not-allowed';

    if (isClickable) {
      card.on('pointerover', () => {
        bg.tint = 0xe0e0ff;
        towerIcon.scale.set(1.1);
      });
      card.on('pointerout', () => {
        bg.tint = 0xffffff;
        towerIcon.scale.set(1.0);
      });
      card.on('pointerdown', () => {
        this.showFloorPopup(stage);
      });
    }
    
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
    navigation.presentPopup(TowerFloorPopup, { stage });
  }

  update(time: Ticker): void {
    // Tower-specific animations could go here
    // For example, subtle floating animations for the magical energy effects
  }
}
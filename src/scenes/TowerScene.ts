import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { BaseScene } from '@/ui/BaseScene';
import { HomeScene } from './HomeScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { battleApi } from '@/services/api';
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
      this.stages = [];
    }
    
    this.loadingManager.hideLoading();
    
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
    const bgContainer = new Container();
    const availableHeight = this.getContentHeight();
    
    // Dark tower background
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: Colors.BLUE_NAVY_DARKEST, alpha: 1.0 });
    
    // Purple mystical overlay
    bg.rect(0, 0, this.gameWidth, availableHeight)
      .fill({ color: Colors.PURPLE_DARKEST, alpha: 0.4 });
    
    bgContainer.addChild(bg);
    
    // Mystical floating particles
    for (let i = 0; i < 25; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2;
      particle.circle(0, 0, size)
        .fill({ color: Colors.PURPLE, alpha: 0.3 + Math.random() * 0.4 });
      particle.x = Math.random() * this.gameWidth;
      particle.y = Math.random() * availableHeight;
      bgContainer.addChild(particle);
    }
    
    this.backgroundContainer.addChild(bgContainer);
  }

  private createHeader(): void {
    // Fantasy banner
    const bannerWidth = Math.min(320, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 15;
    
    const banner = new Graphics();
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: Colors.PURPLE_DARKER, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.PURPLE });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.PURPLE_VIVID, alpha: 0.6 });
    
    const title = new Text({
      text: '🗼 Battle Tower 🗼',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 26,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.PURPLE_DARKEST, width: 2 },
        dropShadow: {
          color: Colors.PURPLE,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.7
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.headerContainer.addChild(banner, title);
  }

  private createTowerList(): void {
    this.towerContainer.label = 'towerContainer';
    
    const stages = this.stages;
    const cardWidth = Math.min(200, this.gameWidth - 60);
    const cardHeight = 120;
    const floorSpacing = 50;
    
    let firstFloorY = 0;
    
    if (stages.length > 0) {  
      const totalHeight = stages.length * cardHeight + (stages.length - 1) * floorSpacing;
      const availableHeight = this.gameHeight - 220;
      const startY = Math.max(20, (availableHeight - totalHeight) / 2);

      stages.forEach((stage, index) => {
        const floorCard = this.createFloorCard(stage, index);
        
        const reverseIndex = stages.length - 1 - index;
        floorCard.x = 0;
        floorCard.y = startY + reverseIndex * (cardHeight + floorSpacing);
        
        if (stage.is_current) {
          firstFloorY = floorCard.y;
        }

        // Tower connection line
        if (index < stages.length) {
          const connectionLine = this.createTowerConnection(cardWidth, cardHeight);
          connectionLine.x = cardWidth / 2 - 2;
          connectionLine.y = floorCard.y + cardHeight;
          this.towerContainer.addChild(connectionLine);
        }
        
        this.towerContainer.addChild(floorCard);
      });
    }

    const scrollBoxWidth = cardWidth + 40;
    const scrollBoxHeight = this.gameHeight - 180;

    this.towerContainer.width = scrollBoxWidth;

    const scrollBox = new ScrollBox({
      width: scrollBoxWidth,
      height: scrollBoxHeight
    });
    scrollBox.x = (this.gameWidth - scrollBoxWidth) / 2;
    scrollBox.y = 80;

    const maxScrollY = Math.max(this.towerContainer.height - scrollBoxHeight, 0);
    const targetY = Math.min(Math.max(firstFloorY - (scrollBoxHeight - cardHeight), 0), maxScrollY);

    scrollBox.scrollToPosition({ x: 0, y: targetY });
    scrollBox.addItem(this.towerContainer);

    this.addChild(scrollBox);
  }

  private createTowerConnection(cardWidth: number, cardHeight: number): Container {
    const connection = new Container();
    
    // Mystical purple connection line
    const line = new Graphics();
    line.moveTo(0, 0)
        .lineTo(0, 50)
        .stroke({ width: 6, color: Colors.PURPLE, alpha: 0.7 });
    
    // Glowing nodes
    const topNode = new Graphics();
    topNode.circle(0, 0, 5)
           .fill({ color: Colors.PURPLE_VIVID, alpha: 0.95 });
    
    const bottomNode = new Graphics();
    bottomNode.circle(0, 50, 5)
              .fill({ color: Colors.PURPLE_VIVID, alpha: 0.95 });
    
    // Energy pulse effect
    const energy = new Graphics();
    energy.circle(0, 25, 8)
          .fill({ color: Colors.PURPLE, alpha: 0.4 });
    
    connection.addChild(line, topNode, bottomNode, energy);
    return connection;
  }

  private createFloorCard(stage: Stage, index: number): Container {
    const card = new Container();
    
    const cardWidth = Math.min(200, this.gameWidth - 60);
    const cardHeight = 120;

    const isAccessible = stage.is_completed || stage.is_current;
    
    // Fantasy floor card styling
    const bg = new Graphics();
    
    // Shadow
    bg.roundRect(3, 3, cardWidth, cardHeight, 10)
      .fill({ color: Colors.BLACK, alpha: 0.5 });
    
    if (isAccessible) {
      // Accessible floor - mystical purple parchment
      bg.roundRect(0, 0, cardWidth, cardHeight, 10)
        .fill({ color: Colors.LAVENDER_LIGHT, alpha: 0.98 })
        .stroke({ width: 3, color: Colors.PURPLE });
      
      bg.roundRect(3, 3, cardWidth - 6, cardHeight - 6, 8)
        .fill({ color: Colors.LAVENDER, alpha: 0.6 });
      
      bg.roundRect(5, 5, cardWidth - 10, cardHeight - 10, 7)
        .stroke({ width: 1, color: Colors.PURPLE_VIVID, alpha: 0.5 });
    } else {
      // Locked floor - dark stone
      bg.roundRect(0, 0, cardWidth, cardHeight, 10)
        .fill({ color: Colors.GRAY_DARKER, alpha: 0.95 })
        .stroke({ width: 3, color: Colors.GRAY_DARK });
      
      bg.roundRect(3, 3, cardWidth - 6, cardHeight - 6, 8)
        .fill({ color: Colors.GRAY_DARKEST, alpha: 0.8 });
    }
    
    // Decorative corners
    this.drawFloorCorners(bg, 0, 0, cardWidth, cardHeight, isAccessible ? Colors.PURPLE_VIVID : Colors.GRAY);
    
    // Floor number
    const floorNumber = new Text({
      text: stage.name,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: isAccessible ? Colors.PURPLE_DARKER : Colors.GRAY,
        align: 'center',
        stroke: isAccessible ? { color: Colors.PURPLE_VIVID, width: 0.5 } : undefined
      }
    });
    floorNumber.anchor.set(0.5, 0);
    floorNumber.x = cardWidth / 2;
    floorNumber.y = 15;
    
    // Icon
    let towerIcon: Text;
    if (!isAccessible) {
      towerIcon = new Text({
        text: '🔒',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 48,
          fill: Colors.GRAY
        }
      });
    } else if (stage.is_completed) {
      towerIcon = new Text({
        text: '✓',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 48,
          fill: Colors.GREEN_BRIGHT,
          stroke: { color: Colors.GREEN_FOREST_DARK, width: 2 }
        }
      });
    } else {
      towerIcon = new Text({
        text: '🗼',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 48,
          fill: Colors.PURPLE
        }
      });
    }
    towerIcon.anchor.set(0.5);
    towerIcon.x = cardWidth / 2;
    towerIcon.y = cardHeight / 2 + 5;
    
    card.addChild(bg, floorNumber, towerIcon);
    
    card.interactive = isAccessible;
    card.cursor = isAccessible ? 'pointer' : 'not-allowed';

    if (isAccessible) {
      card.on('pointerover', () => {
        bg.clear();
        bg.roundRect(3, 3, cardWidth, cardHeight, 10)
          .fill({ color: Colors.BLACK, alpha: 0.5 });
        bg.roundRect(0, 0, cardWidth, cardHeight, 10)
          .fill({ color: Colors.LAVENDER_LIGHT, alpha: 1.0 })
          .stroke({ width: 3, color: Colors.PURPLE_VIVID });
        bg.roundRect(3, 3, cardWidth - 6, cardHeight - 6, 8)
          .fill({ color: Colors.LAVENDER, alpha: 0.8 });
        bg.roundRect(5, 5, cardWidth - 10, cardHeight - 10, 7)
          .stroke({ width: 1, color: Colors.PURPLE_VIVID, alpha: 0.8 });
        this.drawFloorCorners(bg, 0, 0, cardWidth, cardHeight, Colors.PURPLE_VIVID);
        towerIcon.scale.set(1.1);
      });
      
      card.on('pointerout', () => {
        bg.clear();
        bg.roundRect(3, 3, cardWidth, cardHeight, 10)
          .fill({ color: Colors.BLACK, alpha: 0.5 });
        bg.roundRect(0, 0, cardWidth, cardHeight, 10)
          .fill({ color: Colors.LAVENDER_LIGHT, alpha: 0.98 })
          .stroke({ width: 3, color: Colors.PURPLE });
        bg.roundRect(3, 3, cardWidth - 6, cardHeight - 6, 8)
          .fill({ color: Colors.LAVENDER, alpha: 0.6 });
        bg.roundRect(5, 5, cardWidth - 10, cardHeight - 10, 7)
          .stroke({ width: 1, color: Colors.PURPLE_VIVID, alpha: 0.5 });
        this.drawFloorCorners(bg, 0, 0, cardWidth, cardHeight, Colors.PURPLE_VIVID);
        towerIcon.scale.set(1.0);
      });
      
      card.on('pointerdown', () => {
        this.showFloorPopup(stage);
      });
    }
    
    return card;
  }

  private drawFloorCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 10;
    
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
  }

  private createBackButton(): void {
    const buttonWidth = 80;
    const buttonHeight = 42;
    
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  private showFloorPopup(stage: Stage): void {
    navigation.presentPopup(TowerFloorPopup, { stage });
  }

  update(time: Ticker): void {
    // Tower animations
  }
}
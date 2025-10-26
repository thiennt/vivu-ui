import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { Colors } from '@/utils/colors';
import { ScrollBox } from '@pixi/ui';
import { skillsApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

export class CraftSkillScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  private skills: any[] = [];
  private selectedItems: any[] = [];
  private loadingManager: LoadingStateManager;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private gridContainer: Container;
  private craftingContainer: Container;
  private buttonContainer: Container;

  constructor() {
    super();
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.gridContainer = new Container();
    this.craftingContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.gridContainer,
      this.craftingContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load data and create UI
    this.loadSkillsData();
  }
  
  private async loadSkillsData(): Promise<void> {
    this.loadingManager.showLoading();
    
    // Get all skills (this would typically filter by player ownership)
    this.skills = await skillsApi.getAllSkills();
    
    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private initializeUI(): void {
    if (!this.skills.length) return;
    
    this.createBackground();
    this.createHeader();
    this.createSkillGrid();
    this.createCraftingArea();
    this.createButtons();
  }

  /** Resize the screen */
  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);
    
    // Only update layout if we have loaded data
    if (this.skills.length > 0) {
      this.updateLayout();
    }
  }
  
  private updateLayout(): void {
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.gridContainer.removeChildren();
    this.craftingContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createSkillGrid();
    this.createCraftingArea();
    this.createButtons();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.alpha = 0;
    const tween = { alpha: 0 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha += 0.05;
        this.alpha = tween.alpha;
        
        if (tween.alpha >= 1) {
          this.alpha = 1;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    const tween = { alpha: 1 };
    
    return new Promise((resolve) => {
      const animate = () => {
        tween.alpha -= 0.1;
        this.alpha = tween.alpha;
        
        if (tween.alpha <= 0) {
          this.alpha = 0;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };
      animate();
    });
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
    this.selectedItems = [];
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Dark fantasy background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARKEST, alpha: 1.0 });
    
    // Subtle brown texture
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.3 });
    
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    // Fantasy banner for title
    const bannerWidth = Math.min(340, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 20;
    
    const banner = new Graphics();
    // Ribbon banner
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.GOLD });
    
    // Inner highlight
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const title = new Text({
      text: '✨ Craft Skills ✨',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 },
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;

    const subtitle = new Text({
      text: 'Merge 2 same level skills to upgrade',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.GOLD,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 12;
    
    this.headerContainer.addChild(banner, title, subtitle);
  }

  private createSkillGrid(): void {
    // Calculate area for grid
    const gridTop = 95;
    const craftingAreaHeight = 120;
    const backButtonHeight = 45;
    const backButtonMargin = 20;
    const gridHeight = this.gameHeight - gridTop - craftingAreaHeight - backButtonHeight - backButtonMargin - this.STANDARD_PADDING;

    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const gap = this.STANDARD_SPACING;
    const cardCount = 3;
    
    const cardWidth = (availableWidth - (gap * (cardCount - 1))) / cardCount;
    const cardHeight = cardWidth * 0.8;

    const layout = {
      itemsPerRow: cardCount,
      itemWidth: cardWidth,
      totalWidth: availableWidth
    };

    // Create grid container
    const gridContent = new Container();

    for (let index = 0; index < this.skills.length; index++) {
      const skill = this.skills[index];
      const row = Math.floor(index / layout.itemsPerRow);
      const col = index % layout.itemsPerRow;

      const x = col * (layout.itemWidth + gap);
      const y = row * (cardHeight + gap);

      const skillCard = this.createSkillCard(skill, x, y, layout.itemWidth, cardHeight);

      skillCard.interactive = true;
      skillCard.cursor = 'pointer';

      skillCard.on('pointerdown', () => {
        this.selectSkill(skill, skillCard);
      });

      gridContent.addChild(skillCard);
    }

    // Calculate content height
    const totalRows = Math.ceil(this.skills.length / layout.itemsPerRow);
    const contentHeight = totalRows * (cardHeight + gap);

    // Create ScrollBox
    const scrollBox = new ScrollBox({
      width: availableWidth,
      height: gridHeight,
    });
    scrollBox.x = this.STANDARD_PADDING;
    scrollBox.y = gridTop;
    scrollBox.addItem(gridContent);

    gridContent.height = contentHeight;

    this.gridContainer.addChild(scrollBox);
  }

  private createSkillCard(skill: any, x: number, y: number, width: number, height: number): Container {
    const card = new Container();
    card.x = x;
    card.y = y;

    // Background with purple/magic theme
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x4A148C, alpha: 0.95 })
      .stroke({ width: 2, color: 0x7B1FA2 });
    
    card.addChild(bg);

    // Skill name
    const nameText = new Text({
      text: skill.name || 'Skill',
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 10;
    card.addChild(nameText);

    // Level indicator
    const levelText = new Text({
      text: `Lv.${skill.level || 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.GOLD_BRIGHT,
        stroke: { color: Colors.BLACK, width: 2 }
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = width / 2;
    levelText.y = height - 20;
    card.addChild(levelText);

    // Store skill reference
    (card as any).skillData = skill;

    return card;
  }

  private selectSkill(skill: any, card: Container): void {
    // Check if already selected
    const existingIndex = this.selectedItems.findIndex(s => s.id === skill.id);
    
    if (existingIndex >= 0) {
      // Deselect
      this.selectedItems.splice(existingIndex, 1);
      // Remove selection visual
      const bg = card.children[0] as Graphics;
      bg.clear();
      bg.roundRect(0, 0, card.width, card.height, 8)
        .fill({ color: 0x4A148C, alpha: 0.95 })
        .stroke({ width: 2, color: 0x7B1FA2 });
    } else if (this.selectedItems.length < 2) {
      // Select (max 2 items)
      this.selectedItems.push(skill);
      // Add selection visual
      const bg = card.children[0] as Graphics;
      bg.clear();
      bg.roundRect(0, 0, card.width, card.height, 8)
        .fill({ color: 0x4A148C, alpha: 0.95 })
        .stroke({ width: 3, color: Colors.GOLD_BRIGHT });
    }
    
    this.updateCraftingArea();
  }

  private createCraftingArea(): void {
    const areaHeight = 120;
    const areaY = this.gameHeight - areaHeight - 65; // Space for back button
    
    const bg = new Graphics();
    bg.rect(0, areaY, this.gameWidth, areaHeight)
      .fill({ color: Colors.BROWN_DARKER, alpha: 0.95 });
    
    this.craftingContainer.addChild(bg);
    
    const title = new Text({
      text: 'Selected Skills',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BLACK, width: 2 }
      }
    });
    title.anchor.set(0.5, 0);
    title.x = this.gameWidth / 2;
    title.y = areaY + 10;
    this.craftingContainer.addChild(title);
  }

  private updateCraftingArea(): void {
    // Clear crafting area except background and title
    while (this.craftingContainer.children.length > 2) {
      this.craftingContainer.removeChildAt(2);
    }
    
    const areaHeight = 120;
    const areaY = this.gameHeight - areaHeight - 65;
    
    // Display selected skills
    if (this.selectedItems.length === 0) {
      const emptyText = new Text({
        text: 'Select 2 skills of same level to craft',
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.GOLD,
          align: 'center'
        }
      });
      emptyText.anchor.set(0.5);
      emptyText.x = this.gameWidth / 2;
      emptyText.y = areaY + 60;
      this.craftingContainer.addChild(emptyText);
    } else {
      const itemWidth = 100;
      const spacing = 20;
      const startX = (this.gameWidth - (itemWidth * 2 + spacing)) / 2;
      
      this.selectedItems.forEach((skill, index) => {
        const x = startX + index * (itemWidth + spacing);
        const y = areaY + 35;
        
        const skillCard = new Graphics();
        skillCard.roundRect(x, y, itemWidth, 60, 6)
          .fill({ color: 0x4A148C, alpha: 0.9 })
          .stroke({ width: 2, color: Colors.GOLD });
        
        const nameText = new Text({
          text: skill.name,
          style: {
            fontFamily: 'Kalam',
            fontSize: 11,
            fill: Colors.WHITE,
            align: 'center',
            wordWrap: true,
            wordWrapWidth: itemWidth - 10
          }
        });
        nameText.anchor.set(0.5, 0);
        nameText.x = x + itemWidth / 2;
        nameText.y = y + 8;
        
        const levelText = new Text({
          text: `Lv.${skill.level || 1}`,
          style: {
            fontFamily: 'Kalam',
            fontSize: 14,
            fontWeight: 'bold',
            fill: Colors.GOLD_BRIGHT
          }
        });
        levelText.anchor.set(0.5);
        levelText.x = x + itemWidth / 2;
        levelText.y = y + 45;
        
        this.craftingContainer.addChild(skillCard, nameText, levelText);
      });
      
      // Check if can craft
      if (this.selectedItems.length === 2) {
        const level1 = this.selectedItems[0].level || 1;
        const level2 = this.selectedItems[1].level || 1;
        
        if (level1 === level2) {
          const resultText = new Text({
            text: `→ Lv.${level1 + 1} Skill`,
            style: {
              fontFamily: 'Kalam',
              fontSize: 13,
              fontWeight: 'bold',
              fill: Colors.GREEN_BRIGHT,
              stroke: { color: Colors.BLACK, width: 2 }
            }
          });
          resultText.anchor.set(0, 0.5);
          resultText.x = startX + itemWidth * 2 + spacing + 20;
          resultText.y = areaY + 65;
          this.craftingContainer.addChild(resultText);
        } else {
          const errorText = new Text({
            text: '⚠ Skills must be same level',
            style: {
              fontFamily: 'Kalam',
              fontSize: 12,
              fill: Colors.RED,
              align: 'center'
            }
          });
          errorText.anchor.set(0.5);
          errorText.x = this.gameWidth / 2;
          errorText.y = areaY + 100;
          this.craftingContainer.addChild(errorText);
        }
      }
    }
  }

  private createButtons(): void {
    const buttonWidth = Math.min(120, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 40;
    const buttonY = this.gameHeight - buttonHeight - this.STANDARD_PADDING;
    
    // Back button
    const backButton = this.createFantasyButton(
      '← Back',
      this.STANDARD_PADDING,
      buttonY,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );
    this.buttonContainer.addChild(backButton);
    
    // Craft button
    const craftButton = this.createFantasyButton(
      '✨ Craft',
      this.gameWidth - buttonWidth - this.STANDARD_PADDING,
      buttonY,
      buttonWidth,
      buttonHeight,
      () => this.craftSkills()
    );
    this.buttonContainer.addChild(craftButton);
  }

  private craftSkills(): void {
    if (this.selectedItems.length !== 2) return;
    
    const level1 = this.selectedItems[0].level || 1;
    const level2 = this.selectedItems[1].level || 1;
    
    if (level1 !== level2) return;
    
    // TODO: Call API to craft skills
    console.log('Crafting skills:', this.selectedItems);
    
    // For now, just show success message
    const successText = new Text({
      text: '✓ Crafted Successfully!',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.GREEN_BRIGHT,
        stroke: { color: Colors.BLACK, width: 3 }
      }
    });
    successText.anchor.set(0.5);
    successText.x = this.gameWidth / 2;
    successText.y = this.gameHeight / 2;
    this.container.addChild(successText);
    
    setTimeout(() => {
      successText.destroy();
      this.selectedItems = [];
      this.updateCraftingArea();
    }, 2000);
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });
    
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 }
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: Colors.BLACK, alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.BROWN_LIGHT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD_BRIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: Colors.BLACK, alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.BROWN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.GOLD });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  update(): void {
    // No specific animations needed
  }
}

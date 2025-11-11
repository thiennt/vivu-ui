import { Graphics, Text, Container } from 'pixi.js';
import { ScrollBox } from '@pixi/ui';
import { BaseScene } from '@/ui/BaseScene';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { app } from '../app';
import { playerApi } from '@/services/api';
import { MessagePopup } from '@/popups/MessagePopup';

export class LineupScene extends BaseScene {
  private player : any = null;
  private lineupPositions: (any | null)[] = [];
  private availableCharacters: any[] = [];

  // Drag state
  private dragOffset = { x: 0, y: 0 };
  private dragTarget: Container | null = null;
  private isDragging: boolean = false;
  
  private lineupSlotHitBoxes: {index: number, x: number, y: number, size: number}[] = [];
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private lineupContainer: Container;
  private poolContainer: Container;
  private buttonContainer: Container;

  constructor() {
    super();
    this.player = sessionStorage.getItem('player') ? JSON.parse(sessionStorage.getItem('player') as string) : null;
    this.lineupPositions = this.player.lineup || [];
    const lineUpIds = this.lineupPositions.map((char: any) => char ? char.id : null);
    console.log('Initial lineup:', this.lineupPositions);
    this.availableCharacters = this.player?.characters || [];
    this.availableCharacters = this.availableCharacters.filter(char => !lineUpIds.includes(char.id));

    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.lineupContainer = new Container();
    this.poolContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.lineupContainer,
      this.poolContainer,
      this.buttonContainer
    );
    
    // Create UI once
    this.initializeUI();
  }

  private cleanUpFloatingCards() {
    if (this.dragTarget && this.dragTarget.parent) {
      this.dragTarget.parent.removeChild(this.dragTarget);
      this.dragTarget.destroy({ children: true });
      this.dragTarget = null;
    }
    this.children
      .filter(child =>
        child &&
        (child as any).label === undefined &&
        typeof (child as any).destroy === "function"
      )
      .forEach(child => {
        this.removeChild(child);
        (child as any).destroy({ children: true });
      });
  }

  private initializeUI(): void {
    this.createBackground();
    this.createHeader();
    this.createLineupGrid();
    this.createCharacterPool();
    this.createActionButtons();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    this.updateLayout();
  }
  
  private updateLayout(): void {
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.lineupContainer.removeChildren();
    this.poolContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    this.createBackground();
    this.createHeader();
    this.createLineupGrid();
    this.createCharacterPool();
    this.createActionButtons();
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Dark fantasy battlefield background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Battle texture overlay
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });

    // Tactical grid with golden lines
    const gridSpacing = 40;
    const grid = new Graphics();
    grid.stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.15 });

    for (let x = 0; x <= this.gameWidth; x += gridSpacing) {
      grid.moveTo(x, 0);
      grid.lineTo(x, this.gameHeight);
    }
    for (let y = 0; y <= this.gameHeight; y += gridSpacing) {
      grid.moveTo(0, y);
      grid.lineTo(this.gameWidth, y);
    }

    this.backgroundContainer.addChild(bg, grid);
  }

  private createHeader(): void {
    // Fantasy banner
    const bannerWidth = Math.min(340, this.gameWidth - 40);
    const bannerHeight = 48;
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.ROBOT_CYAN });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });

    const title = new Text({
      text: '⚔️ Battle Lineup ⚔️',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
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
      text: 'Drag to swap • Click to move',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 12;

    this.headerContainer.addChild(banner, title, subtitle);
  }

  private createLineupGrid(): void {
    this.lineupContainer.label = 'lineupContainer';

    const cols = 3;
    const gap = this.STANDARD_PADDING;
    const slotWidth = 94;
    const slotHeight = 114;
    const gridWidth = cols * slotWidth + (cols - 1) * gap;
    const startX = (this.gameWidth - gridWidth) / 2;
    const startY = 95;

    this.lineupSlotHitBoxes = [];
    for (let col = 0; col < cols; col++) {
      const positionIndex = col;
      const x = col * (slotWidth + gap);
      const y = 0;

      this.lineupSlotHitBoxes.push({index: positionIndex, x: startX + x, y: startY + y, size: slotWidth});

      const slot = this.createLineupSlot(x, y, slotWidth, slotHeight, positionIndex);
      this.lineupContainer.addChild(slot);

      const character = this.lineupPositions[positionIndex];
      if (character) {
        const characterCard = this.createLineupCharacterCard(character, x, y, slotWidth, slotHeight, positionIndex);
        this.lineupContainer.addChild(characterCard);
      }
    }

    this.lineupContainer.x = startX;
    this.lineupContainer.y = startY;

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  private createLineupSlot(x: number, y: number, width: number, height: number, positionIndex: number): Container {
    const slot = new Container();
    
    // Fantasy slot with parchment style
    const bg = new Graphics();
    
    // Shadow
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    // Main slot - parchment
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.5 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    // Inner layer
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });

    const positionText = new Text({
      text: `${positionIndex + 1}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 28,
        fontWeight: 'bold',
        fill: Colors.ROBOT_ELEMENT,
        stroke: { color: Colors.ROBOT_CYAN, width: 1 }
      }
    });
    positionText.anchor.set(0.5);
    positionText.x = width / 2;
    positionText.y = height / 2;

    slot.addChild(bg, positionText);
    slot.x = x;
    slot.y = y;
    slot.interactive = true;
    slot.zIndex = 0;
    slot.eventMode = 'static';
    return slot;
  }

  private createLineupCharacterCard(character: any, x: number, y: number, width: number, height: number, positionIndex: number): Container {
    const card = this.createCharacterCard(character, x, y, width, height);
    this.makeLineupCardInteractive(card, character, positionIndex);
    card.zIndex = 1;
    return card;
  }

  private createCharacterPool(): void {
    this.poolContainer.label = 'characterPool';

    const gap = this.STANDARD_PADDING;
    const slotHeight = 114;
    const poolTop = 150 + slotHeight + 2 * this.STANDARD_SPACING;
    const actionButtonY = this.gameHeight - 80;
    const poolBottom = actionButtonY - this.STANDARD_SPACING * 2;
    const poolHeight = poolBottom - poolTop;
    const poolWidth = this.gameWidth - 2 * this.STANDARD_PADDING;

    const spacing = gap;
    const padding = this.STANDARD_PADDING;
    const marginTop = 45;

    const cardWidth = 94;
    const cardHeight = 114;
    const cardsPerRow = 3;

    // Fantasy pool panel
    const poolBg = new Graphics();
    
    // Shadow
    poolBg.roundRect(3, 3, poolWidth, poolHeight, 12)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    
    // Main parchment panel
    poolBg.roundRect(0, 0, poolWidth, poolHeight, 12)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    // Inner layer
    poolBg.roundRect(3, 3, poolWidth - 6, poolHeight - 6, 10)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.6 });
    
    // Golden highlight
    poolBg.roundRect(5, 5, poolWidth - 10, poolHeight - 10, 9)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });

    // Title
    const poolTitle = new Text({
      text: '🎭 Available Heroes',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        stroke: { color: Colors.ROBOT_CYAN, width: 0.5 }
      }
    });
    poolTitle.x = padding + 5;
    poolTitle.y = 15;

    // ScrollBox
    const scrollBox = new ScrollBox({
      width: poolWidth,
      height: poolHeight - marginTop,
    });
    scrollBox.x = 0;
    scrollBox.y = marginTop;

    const availableWidth = poolWidth - 2 * padding;
    const content = new Container();

    this.availableCharacters.forEach((character, index) => {
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);

      const x = col * availableWidth / cardsPerRow + (availableWidth / cardsPerRow - cardWidth) / 2;
      const y = row * (cardHeight + spacing);

      const characterCard = this.createPoolCharacterCard(character, x, y, cardWidth, cardHeight);
      content.addChild(characterCard);
      scrollBox.addItem(content);
    });

    const totalRows = Math.ceil(this.availableCharacters.length / cardsPerRow);
    content.height = totalRows * (cardHeight + spacing);

    this.poolContainer.addChild(poolBg, poolTitle, scrollBox);

    this.poolContainer.x = this.STANDARD_PADDING;
    this.poolContainer.y = poolTop;
  }

  private createPoolCharacterCard(character: any, x: number, y: number, width: number, height: number): Container {
    const card = this.createCharacterCard(character, x, y, width, height);
    card.interactive = true;
    card.cursor = 'pointer';
    card.on('pointertap', () => {
      this.cleanUpFloatingCards();
      const emptyIndex = this.lineupPositions.findIndex(pos => pos === null);
      if (emptyIndex !== -1) {
        this.lineupPositions[emptyIndex] = character;
        this.availableCharacters = this.availableCharacters.filter(c => c !== character);
        this.refreshLineup();
      } else {
        navigation.presentPopup(MessagePopup, { message: 'No available slot in lineup!', type: 'error' });
      }
    });
    return card;
  }

  private makeLineupCardInteractive(card: Container, character: any, currentPosition: number): void {
    card.interactive = true;
    card.cursor = 'pointer';

    card.on('pointerdown', (event) => this.onDragStart(event, card, character, currentPosition));
  }

  private onDragStart(event: any, card: Container, character: any, currentPosition: number) {
    card.alpha = 0.5;
    this.dragTarget = card;

    const globalCardPos = card.parent?.toGlobal({ x: card.x, y: card.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

    const globalPos = card.parent?.toGlobal({ x: card.x, y: card.y });
    if (card.parent) {
      card.parent.removeChild(card);
    }
    app.stage.addChild(card);
    if (globalPos) {
      card.position.set(globalPos.x, globalPos.y);
    }

    app.stage.on('pointermove', this.onDragMove, this);
  }

  private onDragMove(event: any) {
    if (this.dragTarget) {
      const parent = this.dragTarget.parent;
      if (parent) {
        const newPos = parent.toLocal({
          x: event.global.x - this.dragOffset.x,
          y: event.global.y - this.dragOffset.y
        });
        this.dragTarget.position.set(newPos.x, newPos.y);
        this.isDragging = true;
      }
    }
  }

  private onDragEnd(event?: any) {
    if (!this.dragTarget) return;

    this.dragTarget.alpha = 1;

    const pointer = event?.global ?? app.renderer.events.pointer.global;

    let targetSlotIndex: number | null = null;
    for (const slot of this.lineupSlotHitBoxes) {
      if (
        pointer.x >= slot.x && pointer.x <= slot.x + slot.size &&
        pointer.y >= slot.y && pointer.y <= slot.y + slot.size
      ) {
        targetSlotIndex = slot.index;
        break;
      }
    }

    let originalSlotIndex: number | null = null;
    for (let i = 0; i < this.lineupPositions.length; i++) {
      const slotChar = this.lineupPositions[i];
      if (
        slotChar &&
        this.dragTarget &&
        slotChar.id === ((this.dragTarget as any).character?.id)
      ) {
        originalSlotIndex = i;
        break;
      }
    }

    if (this.isDragging) {
      if (
        targetSlotIndex !== null &&
        originalSlotIndex !== null &&
        targetSlotIndex !== originalSlotIndex
      ) {
        const temp = this.lineupPositions[originalSlotIndex];
        this.lineupPositions[originalSlotIndex] = this.lineupPositions[targetSlotIndex];
        this.lineupPositions[targetSlotIndex] = temp;
        this.refreshLineup();
      } else {
        if (this.dragTarget.parent) {
          this.refreshLineup();
        }
      }
    } else if (originalSlotIndex !== null) {
      this.lineupPositions[originalSlotIndex] = null;
      if (!this.availableCharacters.find(c => c.id === (this.dragTarget as any).character?.id)) {
        this.availableCharacters.push((this.dragTarget as any).character);
      }
      this.refreshLineup();
    }

    this.isDragging = false;
    app.stage.off('pointermove', this.onDragMove, this);
    this.dragTarget = null;
  }

  private refreshLineup(): void {
    this.cleanUpFloatingCards();
    this.lineupContainer.removeChildren();
    this.poolContainer.removeChildren();
    this.createLineupGrid();
    this.createCharacterPool();
  }

  private async saveLineup(): Promise<void> {
    try {
      const lineupIds = this.lineupPositions.map(char => char ? char.id : null);
      
      await playerApi.updateLineup(lineupIds);
      navigation.presentPopup(MessagePopup, { message: 'Lineup saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Failed to save lineup:', error);
      navigation.presentPopup(MessagePopup, { message: 'Failed to save lineup. Please try again.', type: 'error' });
    }
  }

  private createActionButtons(): void {
    const backButtonWidth = 80;
    const buttonWidth = Math.min(115, (this.gameWidth - 4 * this.STANDARD_PADDING) / 3);
    const buttonHeight = 40;
    const buttonCount = 3;

    const totalWidth = buttonWidth * buttonCount + this.STANDARD_PADDING * (buttonCount - 1);
    const startX = (this.gameWidth - totalWidth) / 2;
    const y = this.gameHeight - buttonHeight - this.STANDARD_PADDING;

    // Fantasy buttons
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      y,
      backButtonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    const saveButton = this.createButton(
      '💾 Save',
      startX + buttonWidth + this.STANDARD_SPACING,
      y,
      buttonWidth,
      buttonHeight,
      () => this.saveLineup()
    );

    const autoButton = this.createButton(
      '⚡ Auto',
      startX + (buttonWidth + this.STANDARD_SPACING) * 2,
      y,
      buttonWidth,
      buttonHeight,
      () => {
        const available = [...this.availableCharacters];
        this.lineupPositions = this.lineupPositions.map(pos => {
          if (pos) return pos;
          return available.shift() || null;
        });
        
        // Remove any characters now in lineup from availableCharacters
        const lineupIds = this.lineupPositions.filter(c => c).map(c => c.id);
        this.availableCharacters = this.availableCharacters.filter(c => !lineupIds.includes(c.id));
        this.refreshLineup();
      }
    );

    this.buttonContainer.addChild(backButton, saveButton, autoButton);
  }
}
import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { ScrollBox } from '@pixi/ui';
import { BaseScene } from '@/utils/BaseScene';
import { Character } from '@/types';
import { mockPlayer, mockCharacters } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { app } from '../app';

export class LineupScene extends BaseScene {
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
    
    // Convert string IDs to Character objects
    this.lineupPositions = mockPlayer.lineup.positions.map(id => 
      id ? mockCharacters.find(c => c.id === id) || null : null
    );

    // Get available characters (all characters not in lineup)
    const lineupCharacterIds = mockPlayer.lineup.positions.filter(id => id !== null);
    this.availableCharacters = mockCharacters.filter(
      char => !lineupCharacterIds.includes(char.id)
    );
    
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

  // Utility: Clean up any floating/dragged card and any card that is a direct child of the scene
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
    
    // Update UI layout without recreating
    this.updateLayout();
  }
  
  private updateLayout(): void {
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.lineupContainer.removeChildren();
    this.poolContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createLineupGrid();
    this.createCharacterPool();
    this.createActionButtons();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.rect(0, 0, this.gameWidth, this.gameHeight).fill(Colors.BACKGROUND_PRIMARY);

    // Battle field grid lines
    const gridSpacing = 40;
    const grid = new Graphics();
    grid.stroke({ width: 1, color: Colors.BACKGROUND_SECONDARY, alpha: 0.3 });

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
    const title = this.createTitle('Battle Lineup', this.gameWidth / 2, 60);
    title.anchor.set(0.5, 0.5);
    title.x = this.gameWidth / 2;
    title.y = 60;

    const subtitle = new Text({
      text: 'Drag to swap positions in lineup. Click to move between lineup and pool.',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.gameWidth - 40
      }
    });
    subtitle.anchor.set(0.5, 0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = 100;

    this.headerContainer.addChild(title, subtitle);
  }

  private createLineupGrid(): void {
    this.lineupContainer.label = 'lineupContainer';

    // Lineup positions (single row of 4) with standard spacing
    const cols = 4;
    const rows = 1;
    const availableWidth = this.gameWidth - 2 * this.STANDARD_PADDING;
    const layout = this.calculateFourCardsLayout(availableWidth, this.STANDARD_SPACING);
    const slotSize = Math.min(layout.itemWidth, 120); // Cap at 120px to maintain reasonable size
    const gridWidth = cols * slotSize + (cols - 1) * this.STANDARD_SPACING;
    const startX = (this.gameWidth - gridWidth) / 2;
    const startY = 150;

    this.lineupSlotHitBoxes = [];
    for (let col = 0; col < cols; col++) {
      const positionIndex = col;
      const x = col * (slotSize + this.STANDARD_SPACING);
      const y = 0;

      this.lineupSlotHitBoxes.push({index: positionIndex, x: startX + x, y: startY + y, size: slotSize});

      const slot = this.createLineupSlot(x, y, slotSize, positionIndex);
      this.lineupContainer.addChild(slot);

      // Add character if present
      const character = this.lineupPositions[positionIndex];
      if (character) {
        const characterCard = this.createLineupCharacterCard(character, x, y, slotSize, positionIndex);
        this.lineupContainer.addChild(characterCard);
      }
    }

    // Center the grid container horizontally
    this.lineupContainer.x = startX;
    this.lineupContainer.y = startY;

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  private createLineupSlot(x: number, y: number, size: number, positionIndex: number): Container {
    const slot = new Container();
    const bg = new Graphics();
    bg.roundRect(0, 0, size, size, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.5 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY, alpha: 0.8 });

    const positionText = new Text({
      text: `${positionIndex + 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.BUTTON_PRIMARY,
        align: 'center'
      }
    });
    positionText.anchor.set(0.5);
    positionText.x = size / 2;
    positionText.y = size / 2;

    slot.addChild(bg, positionText);
    slot.x = x;
    slot.y = y;
    slot.interactive = true;
    slot.zIndex = 0;
    slot.eventMode = 'static';
    return slot;
  }

  private createLineupCharacterCard(character: any, x: number, y: number, size: number, positionIndex: number): Container {
    const card = this.createHeroCard(character, x, y, 'lineup', positionIndex);
    this.makeLineupCardInteractive(card, character, positionIndex);
    card.zIndex = 1;
    return card;
  }

  private createCharacterPool(): void {
    this.poolContainer.label = 'characterPool';

    // Calculate available area - lineup is now single row instead of 2x2
    const poolTop = 150 + 120 + 2 * this.STANDARD_SPACING; // lineup grid bottom (single row height)
    const actionButtonHeight = 50;
    const actionButtonY = this.gameHeight - 80;
    const poolBottom = actionButtonY - this.STANDARD_SPACING * 2;
    const poolHeight = poolBottom - poolTop;
    const poolWidth = this.gameWidth - 2 * this.STANDARD_PADDING;

    const cardHeight = 80;
    const spacing = this.STANDARD_SPACING;
    const padding = this.STANDARD_PADDING; // Use for left/right padding
    const marginTop = 45;

    // Calculate cards per row - force 4 cards per row for character pool
    const layout = this.calculateFourCardsLayout(poolWidth - 2 * padding, spacing);
    const cardWidth = layout.itemWidth;
    const cardsPerRow = layout.itemsPerRow;

    // Background
    const poolBg = new Graphics();
    poolBg.roundRect(0, 0, poolWidth, poolHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });

    // Title
    const poolTitle = new Text({
      text: 'Available Characters',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    poolTitle.x = padding;
    poolTitle.y = 15;

    // ScrollBox for vertical scrolling
    const scrollBox = new ScrollBox({
      width: poolWidth,
      height: poolHeight - marginTop,
    });
    scrollBox.x = 0;
    scrollBox.y = marginTop;

    // Content container for cards
    const content = new Container();

    this.availableCharacters.forEach((character, index) => {
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);

      // Start from left padding
      const x = padding + col * (cardWidth + spacing);
      const y = row * (cardHeight + spacing);

      const characterCard = this.createPoolCharacterCard(character, x, y);
      characterCard.width = cardWidth;
      characterCard.height = cardHeight;
      content.addChild(characterCard);
    });

    // Set content height for scrolling
    const totalRows = Math.ceil(this.availableCharacters.length / cardsPerRow);
    content.height = totalRows * (cardHeight + spacing);

    scrollBox.addItem(content);

    this.poolContainer.addChild(poolBg, poolTitle, scrollBox);

    // Align pool to fit screen
    this.poolContainer.x = this.STANDARD_PADDING;
    this.poolContainer.y = poolTop;
  }

  private createPoolCharacterCard(character: any, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'pool');
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
        alert('No available slot in lineup!');
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

    // Calculate and store drag offset
    const globalCardPos = card.parent?.toGlobal({ x: card.x, y: card.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

    // Move card to top layer (app.stage) for dragging above all
    const globalPos = card.parent?.toGlobal({ x: card.x, y: card.y });
    if (card.parent) {
      card.parent.removeChild(card);
    }
    app.stage.addChild(card);
    if (globalPos) {
      card.position.set(globalPos.x, globalPos.y);
    }

    // Attach pointermove to stage
    app.stage.on('pointermove', this.onDragMove, this);
  }

  private onDragMove(event: any) {
    if (this.dragTarget) {
      // Use dragOffset to keep the pointer at the same relative position on the card
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

    // Restore card appearance
    this.dragTarget.alpha = 1;

    // Get pointer position
    const pointer = event?.global ?? app.renderer.events.pointer.global;

    // Find which slot (if any) the pointer is over
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

    // Find the original slot index of the dragged card
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
      // If dropped on a different slot, swap
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
        // Snap back to original position if not swapped
        if (this.dragTarget.parent) {
          this.refreshLineup();
        }
      }
    } else if (originalSlotIndex !== null) {
      // Not a drag: treat as click, move to Character pool
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
    // Clear and recreate only lineup and pool containers
    this.lineupContainer.removeChildren();
    this.poolContainer.removeChildren();
    this.createLineupGrid();
    this.createCharacterPool();
  }

  private createActionButtons(): void {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonCount = 3;

    // Calculate total width for all buttons with standard spacing
    const totalWidth = buttonWidth * buttonCount + this.STANDARD_SPACING * (buttonCount - 1);
    const startX = (this.gameWidth - totalWidth) / 2;
    const y = this.gameHeight - 80;

    // Back button - positioned separately at left with standard padding
    const backButton = this.createButton(
      '← Back to Home',
      this.STANDARD_PADDING,
      y,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    // Save button - centered
    const saveButton = this.createButton(
      'Save Lineup',
      startX + buttonWidth + this.STANDARD_SPACING,
      y,
      buttonWidth,
      buttonHeight,
      () => {
        // Convert Character objects back to string IDs for saving
        mockPlayer.lineup.positions = this.lineupPositions.map(char => char ? char.id : null);
        alert('Lineup saved successfully!');
      }
    );

    // Auto button - centered
    const autoButton = this.createButton(
      'Auto',
      startX + (buttonWidth + this.STANDARD_SPACING) * 2,
      y,
      buttonWidth,
      buttonHeight,
      () => {
        // Fill empty slots in lineup with available characters
        const available = [...this.availableCharacters];
        this.lineupPositions = this.lineupPositions.map(pos => {
          if (pos) return pos;
          return available.shift() || null;
        });
        // Remove filled characters from pool
        this.availableCharacters = mockCharacters.filter(
          char => !this.lineupPositions.some(pos => pos && pos.id === char.id)
        );
        this.refreshLineup();
      }
    );

    this.buttonContainer.addChild(backButton, saveButton, autoButton);
  }
}
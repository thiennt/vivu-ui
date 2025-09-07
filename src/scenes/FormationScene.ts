import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Character } from '@/types';
import { mockPlayer } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { app } from '../app';

export class FormationScene extends BaseScene {
  private formationPositions: (Character | null)[] = [];
  private availableCharacters: Character[] = [];

  // Drag state
  private dragOffset = { x: 0, y: 0 };
  private dragTarget: Container | null = null;
  private isDragging: boolean = false;
  
  private slotHitBoxes: {index: number, x: number, y: number, size: number}[] = [];

  // Pool scroll
  private poolScrollContainer: Container | null = null;
  private poolScrollOffset: number = 0;
  private poolScrollBar: Graphics | null = null;
  private poolMaxScroll: number = 0;
  private poolScrolling: boolean = false;
  private poolScrollStartY: number = 0;
  private poolScrollStartOffset: number = 0;


  constructor() {
    super();
    this.formationPositions = [...mockPlayer.formation.positions];
    this.availableCharacters = mockPlayer.characters.filter(
      char => !this.formationPositions.includes(char)
    );
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

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.createBackground();
    this.createHeader();
    this.createFormationGrid();
    this.createCharacterPool();
    this.createActionButtons();
  }

  private createBackground(): void {
    const bgContainer = new Container();
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);

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

    bgContainer.addChild(bg, grid);
    this.addChildAt(bgContainer, 0);
  }

  private createHeader(): void {
    const title = this.createTitle('Battle Formation', this.gameWidth / 2, 60);
    title.anchor.set(0.5, 0.5);
    title.x = this.gameWidth / 2;
    title.y = 60;

    const subtitle = new Text({
      text: 'Drag to swap positions in formation. Click to move between formation and pool.',
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

    this.addChild(title, subtitle);
  }

  private createFormationGrid(): void {
    const formationContainer = new Container();
    formationContainer.label = 'formationContainer';

    // Formation positions (2x2 grid)
    const rows = 2;
    const cols = 2;
    const slotSize = 100;
    const spacing = 20;
    const gridWidth = cols * slotSize + (cols - 1) * spacing;
    const startX = (this.gameWidth - gridWidth) / 2;
    const startY = 150;

    this.slotHitBoxes = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const positionIndex = row * cols + col;
        const x = col * (slotSize + spacing);
        const y = row * (slotSize + spacing);

        this.slotHitBoxes.push({index: positionIndex, x: startX + x, y: startY + y, size: slotSize});

        const slot = this.createFormationSlot(x, y, slotSize, positionIndex);
        formationContainer.addChild(slot);

        // Add character if present
        const character = this.formationPositions[positionIndex];
        if (character) {
          const characterCard = this.createFormationCharacterCard(character, x, y, slotSize, positionIndex);
          formationContainer.addChild(characterCard);
        }
      }
    }

    // Row labels
    const frontLabel = new Text({
      text: 'FRONT',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.FORMATION_FRONT
      }
    });
    frontLabel.anchor.set(0.5);
    frontLabel.x = -50;
    frontLabel.y = slotSize / 2;

    const backLabel = new Text({
      text: 'BACK',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.FORMATION_BACK
      }
    });
    backLabel.anchor.set(0.5);
    backLabel.x = -50;
    backLabel.y = slotSize + spacing + slotSize / 2;

    formationContainer.addChild(frontLabel, backLabel);

    // Center the grid container horizontally
    formationContainer.x = startX;
    formationContainer.y = startY;

    this.addChild(formationContainer);

    app.stage.eventMode = 'static';
    app.stage.on('pointerup', this.onDragEnd, this);
    app.stage.on('pointerupoutside', this.onDragEnd, this);
    app.stage.hitArea = app.screen;
  }

  private createFormationSlot(x: number, y: number, size: number, positionIndex: number): Container {
    const slot = new Container();
    const bg = new Graphics();
    bg.fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.5 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY, alpha: 0.8 })
      .roundRect(0, 0, size, size, 8);

    const positionText = new Text({
      text: `${positionIndex + 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: 0x8d6e63,
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

  private createFormationCharacterCard(character: Character, x: number, y: number, size: number, positionIndex: number): Container {
    const card = this.createHeroCard(character, x, y, 'formation', positionIndex);
    (card as any).character = character;
    this.makeFormationCardInteractive(card, character, positionIndex);
    card.zIndex = 1;
    return card;
  }

  private createCharacterPool(): void {
    const poolContainer = new Container();
    poolContainer.label = 'characterPool';

    // --- Fixed size for pool area ---
    const poolWidth = Math.min(this.gameWidth * 0.9, 400);
    const poolHeight = 180;

    const poolBg = new Graphics();
    poolBg.fill({ color: 0x3e2723, alpha: 0.8 })
      .stroke({ width: 2, color: 0x8d6e63 })
      .roundRect(0, 0, poolWidth, poolHeight, 12);

    const poolTitle = new Text({
      text: 'Available Characters',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    poolTitle.x = 20;
    poolTitle.y = 15;

    const cardWidth = 90;
    const cardHeight = 80;
    const colCount = 4;
    const spacing = 20; // Always fixed
    const marginTop = 45;
    const lineHeight = cardHeight + 10;
    const cardsPerRow = colCount;
    const totalRowWidth = cardsPerRow * cardWidth + (cardsPerRow - 1) * spacing;
    let marginLeft = (poolWidth - totalRowWidth) / 2;

    if (this.poolScrollContainer) {
      this.poolScrollContainer.destroy({children: true});
    }
    const scrollContainer = new Container();
    this.poolScrollContainer = scrollContainer;

    this.availableCharacters.forEach((character, index) => {
      const col = index % cardsPerRow;
      const row = Math.floor(index / cardsPerRow);

      const x = marginLeft + col * (cardWidth + spacing);
      const y = marginTop + row * lineHeight;
      const characterCard = this.createPoolCharacterCard(character, x, y);
      scrollContainer.addChild(characterCard);
    });

    // Mask for scroll area
    const mask = new Graphics();
    mask.rect(0, 0, poolWidth, poolHeight).fill(0xffffff);

    poolContainer.addChild(mask, scrollContainer);
    scrollContainer.mask = mask;

    poolContainer.addChild(poolBg, poolTitle, scrollContainer);

    // --- Center horizontally at the bottom ---
    poolContainer.x = (this.gameWidth - poolWidth) / 2;
    // Place below formation grid as before
    const startY = 150;
    const slotSize = 100;
    const poolSpacing = 20;
    const backRowY = startY + slotSize + poolSpacing;
    const backRowBottom = backRowY + slotSize;
    poolContainer.y = backRowBottom + 20;

    this.addChild(poolContainer);
  }

  private updatePoolScrollBar() {
    if (!this.poolScrollBar || this.poolMaxScroll === 0) {
      if (this.poolScrollBar) this.poolScrollBar.visible = false;
      return;
    }
    this.poolScrollBar.visible = true;
    const visibleHeight = 140;
    const contentHeight = this.poolScrollContainer
      ? this.poolScrollContainer.height
      : visibleHeight;
    const scrollBarAreaHeight = visibleHeight - 20;
    const barHeight = Math.max(30, scrollBarAreaHeight * (visibleHeight / contentHeight));
    const barY = 10 + Math.abs(this.poolScrollOffset) * (scrollBarAreaHeight - barHeight) / (this.poolMaxScroll || 1);

    this.poolScrollBar.clear();
    this.poolScrollBar.fill({ color: 0xffffff, alpha: 0.5 })
      .roundRect(0, barY, 6, barHeight, 3);
    this.poolScrollBar.stroke({ width: 1, color: 0x8d6e63 });
  }

  private onPoolBarPointerMove = (event: any) => {
    if (!this.poolScrolling || !this.poolScrollBar) return;
    const visibleHeight = 140;
    const contentHeight = this.poolScrollContainer
      ? this.poolScrollContainer.height
      : visibleHeight;
    const scrollBarAreaHeight = visibleHeight - 20;
    const barHeight = Math.max(30, scrollBarAreaHeight * (visibleHeight / contentHeight));
    const deltaY = event.global.y - this.poolScrollStartY;
    const scrollRange = scrollBarAreaHeight - barHeight;
    let scrollRatio = 0;
    if (scrollRange > 0) {
      scrollRatio = deltaY / scrollRange;
    }
    let newOffset = this.poolScrollStartOffset - scrollRatio * this.poolMaxScroll;
    newOffset = Math.max(Math.min(newOffset, 0), -this.poolMaxScroll);
    this.poolScrollOffset = newOffset;
    if (this.poolScrollContainer) {
      this.poolScrollContainer.y = this.poolScrollOffset;
    }
    this.updatePoolScrollBar();
  };

  private onPoolBarPointerUp = () => {
    this.poolScrolling = false;
    this.off('pointermove', this.onPoolBarPointerMove);
    this.off('pointerup', this.onPoolBarPointerUp);
    this.off('pointerupoutside', this.onPoolBarPointerUp);
  };

  private createPoolCharacterCard(character: Character, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'pool');
    card.interactive = true;
    card.cursor = 'pointer';
    card.on('pointertap', () => {
      this.cleanUpFloatingCards();
      const emptyIndex = this.formationPositions.findIndex(pos => pos === null);
      if (emptyIndex !== -1) {
        this.formationPositions[emptyIndex] = character;
        this.availableCharacters = this.availableCharacters.filter(c => c !== character);
        this.refreshFormation();
      } else {
        alert('No available slot in formation!');
      }
    });
    return card;
  }

  private makeFormationCardInteractive(card: Container, character: Character, currentPosition: number): void {
    card.interactive = true;
    card.cursor = 'pointer';

    card.on('pointerdown', (event) => this.onDragStart(event, card, character, currentPosition));
  }

  private onDragStart(event: any, card: Container, character: Character, currentPosition: number) {
    card.alpha = 0.5;
    this.dragTarget = card;

    // Calculate and store drag offset
    const globalCardPos = card.parent?.toGlobal({ x: card.x, y: card.y });
    this.dragOffset = {
      x: event.global.x - (globalCardPos?.x || 0),
      y: event.global.y - (globalCardPos?.y || 0)
    };

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
    for (const slot of this.slotHitBoxes) {
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
    for (let i = 0; i < this.formationPositions.length; i++) {
      const slotChar = this.formationPositions[i];
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
        const temp = this.formationPositions[originalSlotIndex];
        this.formationPositions[originalSlotIndex] = this.formationPositions[targetSlotIndex];
        this.formationPositions[targetSlotIndex] = temp;
        this.refreshFormation();
      } else {
        // Snap back to original position if not swapped
        if (this.dragTarget.parent) {
          this.refreshFormation();
        }
      }
    } else if (originalSlotIndex !== null) {
      // Not a drag: treat as click, move to Character pool
      this.formationPositions[originalSlotIndex] = null;
      if (!this.availableCharacters.find(c => c.id === (this.dragTarget as any).character?.id)) {
        this.availableCharacters.push((this.dragTarget as any).character);
      }
      this.refreshFormation();
    }

    this.isDragging = false;
    app.stage.off('pointermove', this.onDragMove, this);
    this.dragTarget = null;
  }

  private refreshFormation(): void {
    this.cleanUpFloatingCards();
    const formationContainer = this.getChildByLabel('formationContainer');
    const poolContainer = this.getChildByLabel('characterPool');
    if (formationContainer) this.removeChild(formationContainer);
    if (poolContainer) this.removeChild(poolContainer);
    this.createFormationGrid();
    this.createCharacterPool();
  }

  private createActionButtons(): void {
    const buttonWidth = 150;
    const buttonHeight = 50;
    const buttonSpacing = 30;
    const buttonCount = 3;

    // Calculate total width for all buttons and spacing
    const totalWidth = buttonWidth * buttonCount + buttonSpacing * (buttonCount - 1);
    const startX = (this.gameWidth - totalWidth) / 2;
    const y = this.gameHeight - 80;

    // Back button
    const backButton = this.createButton(
      '← Back to Home',
      5,
      y,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    // Save button
    const saveButton = this.createButton(
      'Save Formation',
      startX + buttonWidth + buttonSpacing,
      y,
      buttonWidth,
      buttonHeight,
      () => {
        mockPlayer.formation.positions = [...this.formationPositions];
        alert('Formation saved successfully!');
      }
    );

    // Auto button: fill formation with available characters
    const autoButton = this.createButton(
      'Auto',
      startX + (buttonWidth + buttonSpacing) * 2,
      y,
      buttonWidth,
      buttonHeight,
      () => {
        // Fill empty slots in formation with available characters
        let available = [...this.availableCharacters];
        this.formationPositions = this.formationPositions.map(pos => {
          if (pos) return pos;
          return available.shift() || null;
        });
        // Remove filled characters from pool
        this.availableCharacters = mockPlayer.characters.filter(
          char => !this.formationPositions.includes(char)
        );
        this.refreshFormation();
      }
    );

    this.addChild(backButton, saveButton, autoButton);
  }
}
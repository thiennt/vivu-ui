import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Character } from '@/types';
import { mockPlayer } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';

// --- Smoother Drag Handling: Use global pointermove, avoid per-card pointermove, detach card to root during drag ---

export class FormationScene extends BaseScene {
  private formationPositions: (Character | null)[] = [];
  private availableCharacters: Character[] = [];
  private selectedCharacter: Character | null = null;
  private selectedPosition: number = -1;

  // Drag state
  private isDragging = false;
  private dragOffset = { x: 0, y: 0 };
  private dragTarget: Container | null = null;
  private dragPointerGlobal: { x: number, y: number } | null = null;
  private dragOriginalX = 0;
  private dragOriginalY = 0;
  private dragOriginalPosition = -1;
  private slotHitBoxes: {index: number, x: number, y: number, size: number}[] = [];

  // For detaching/reattaching card during drag
  private dragOriginalParent: Container | null = null;

  constructor() {
    super();
    this.formationPositions = [...mockPlayer.formation.positions];
    this.availableCharacters = mockPlayer.characters.filter(
      char => !this.formationPositions.includes(char)
    );
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    this.createBackground();
    this.createHeader();
    this.createFormationGrid();
    this.createCharacterPool();
    this.createActionButtons();
    this.createBackButton();
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

    const subtitle = new Text({
      text: 'Drag characters to formation positions',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
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
    const startX = (this.gameWidth - (cols * slotSize + (cols - 1) * spacing)) / 2;
    const startY = 150;

    this.slotHitBoxes = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const positionIndex = row * cols + col;
        const x = startX + col * (slotSize + spacing);
        const y = startY + row * (slotSize + spacing);

        // Save slot hitboxes for drop detection
        this.slotHitBoxes.push({index: positionIndex, x, y, size: slotSize});

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
    frontLabel.x = startX - 50;
    frontLabel.y = startY + slotSize / 2;

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
    backLabel.x = startX - 50;
    backLabel.y = startY + slotSize + spacing + slotSize / 2;

    formationContainer.addChild(frontLabel, backLabel);
    this.addChild(formationContainer);
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

    // Drop zone: handled by drag release hit testing instead
    return slot;
  }

  private createFormationCharacterCard(character: Character, x: number, y: number, size: number, positionIndex: number): Container {
    const card = this.createHeroCard(character, x, y, 'formation', positionIndex);

    // Make draggable
    this.makeCharacterDraggable(card, character, positionIndex, true);

    return card;
  }

  private createCharacterPool(): void {
    const poolContainer = new Container();
    poolContainer.label = 'characterPool';

    // Pool background
    const poolBg = new Graphics();
    poolBg.fill({ color: 0x3e2723, alpha: 0.8 })
      .stroke({ width: 2, color: 0x8d6e63 })
      .roundRect(0, 0, this.gameWidth - 100, 140, 12);

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

    poolContainer.addChild(poolBg, poolTitle);

    // Available characters
    this.availableCharacters.forEach((character, index) => {
      const characterCard = this.createPoolCharacterCard(character, 20 + (index * 110), 45);
      poolContainer.addChild(characterCard);
    });

    poolContainer.x = 50;

    // --- Place pool just below the "BACK" row ---
    const startY = 150;
    const slotSize = 100;
    const spacing = 20;
    const backRowY = startY + slotSize + spacing;
    const backRowBottom = backRowY + slotSize;
    poolContainer.y = backRowBottom + 20; // 20px below the back row

    this.addChild(poolContainer);
  }

  private createPoolCharacterCard(character: Character, x: number, y: number): Container {
    const card = this.createHeroCard(character, x, y, 'pool');
    this.makeCharacterDraggable(card, character, -1, false);
    return card;
  }

  // --- Drag handling: use global pointermove, detach card to root ---
  private onScenePointerMove = (event: any) => {
  if (this.isDragging && this.dragTarget) {
    const globalPos = event.global;
    this.dragPointerGlobal = { x: globalPos.x, y: globalPos.y };
    // Update card position immediately for smooth dragging
    this.dragTarget.x = globalPos.x - this.dragOffset.x;
    this.dragTarget.y = globalPos.y - this.dragOffset.y;
  }
};

  private enableGlobalDragEvents() {
    this.interactive = true;
    // Add pointermove to scene (not card)
    this.on('pointermove', this.onScenePointerMove);
  }

  private disableGlobalDragEvents() {
    this.off('pointermove', this.onScenePointerMove);
    this.interactive = false;
  }

  private makeCharacterDraggable(card: Container, character: Character, currentPosition: number, isInFormation: boolean): void {
    card.interactive = true;
    card.cursor = 'pointer';

    if (!isInFormation) {
      // Tap to add from pool to formation (only if slot available)
      card.on('pointertap', () => {
        const filledSlots = this.formationPositions.filter(pos => pos !== null).length;
        if (filledSlots < 4) {
          const emptyIndex = this.formationPositions.findIndex(pos => pos === null);
          if (emptyIndex !== -1) {
            this.formationPositions[emptyIndex] = character;
            this.availableCharacters = this.availableCharacters.filter(c => c !== character);
            this.refreshFormation();
          }
        } else {
          alert('Formation is full!');
        }
      });
      return;
    }

    // Tap to remove from formation to pool (use only this, not direct array manipulation)
    card.on('pointertap', () => {
      this.removeCharacterFromFormation(currentPosition);
    });

    // Drag logic (only for formation cards)
    let dragStarted = false;
    let pointerDownPos = { x: 0, y: 0 };

    card.on('pointerdown', (event) => {
      dragStarted = false;
      const globalPos = event.global;
      pointerDownPos = { x: globalPos.x, y: globalPos.y };

      this.isDragging = true;
      this.dragTarget = card;
      this.selectedCharacter = character;
      this.selectedPosition = currentPosition;

      // Save original position and parent
      this.dragOriginalX = card.x;
      this.dragOriginalY = card.y;
      this.dragOriginalPosition = currentPosition;
      this.dragOriginalParent = card.parent as Container;

      // Detach card to scene root and convert position immediately
      const parent = card.parent as Container;
      const globalCardPos = parent.toGlobal({ x: card.x, y: card.y });
      if (parent && parent !== this) {
        parent.removeChild(card);
        this.addChild(card);
        const localToScene = this.toLocal(globalCardPos);
        card.x = localToScene.x;
        card.y = localToScene.y;
      }

      this.dragOffset.x = globalPos.x - card.x;
      this.dragOffset.y = globalPos.y - card.y;
      this.dragPointerGlobal = { x: globalPos.x, y: globalPos.y };

      card.alpha = 0.8;
      card.scale.set(1.1);
      card.zIndex = 9999;

      this.enableGlobalDragEvents();
    });

    card.on('pointermove', (event) => {
      if (this.isDragging && this.dragTarget === card) {
        const globalPos = event.global;
        if (
          Math.abs(globalPos.x - pointerDownPos.x) > 10 ||
          Math.abs(globalPos.y - pointerDownPos.y) > 10
        ) {
          dragStarted = true;
        }
      }
    });

    card.on('pointerup', (event) => {
      if (this.isDragging && this.dragTarget === card) {
        this.isDragging = false;
        card.alpha = 1;
        card.scale.set(1);
        card.zIndex = 0;

        const pointer = event.global;
        let placed = false;

        // If it was a drag, check for drop in slot
        if (dragStarted) {
          for (const slot of this.slotHitBoxes) {
            if (
              pointer.x >= slot.x && pointer.x <= slot.x + slot.size &&
              pointer.y >= slot.y && pointer.y <= slot.y + slot.size
            ) {
              if (slot.index !== this.dragOriginalPosition) {
                // Swap or move character in formation
                const movingChar = this.formationPositions[this.dragOriginalPosition];
                const targetChar = this.formationPositions[slot.index];
                this.formationPositions[this.dragOriginalPosition] = targetChar || null;
                this.formationPositions[slot.index] = movingChar;
                this.refreshFormation();
              }
              placed = true;
              break;
            }
          }
          if (!placed) {
            // Not dropped in slot: return card to original parent and position
            this.removeChild(card);
            if (this.dragOriginalParent) {
              this.dragOriginalParent.addChild(card);
            }
            card.x = this.dragOriginalX;
            card.y = this.dragOriginalY;
          }
        }

        this.dragTarget = null;
        this.dragPointerGlobal = null;
        this.selectedCharacter = null;
        this.selectedPosition = -1;
        this.disableGlobalDragEvents();
      }
    });
  }

  private placeCharacterInFormation(character: Character, positionIndex: number): void {
    // Remove dragged card from scene to avoid duplicate
    if (this.dragTarget && this.dragTarget.parent) {
      this.dragTarget.parent.removeChild(this.dragTarget);
      this.dragTarget = null;
    }
    // Remove character from current position if it's in formation
    if (this.selectedPosition >= 0) {
      this.formationPositions[this.selectedPosition] = null;
    } else {
      // Remove from available characters
      const index = this.availableCharacters.indexOf(character);
      if (index > -1) {
        this.availableCharacters.splice(index, 1);
      }
    }

    // If target position is occupied, swap characters
    const existingCharacter = this.formationPositions[positionIndex];
    if (existingCharacter) {
      if (this.selectedPosition >= 0) {
        this.formationPositions[this.selectedPosition] = existingCharacter;
      } else {
        this.availableCharacters.push(existingCharacter);
      }
    }

    // Place character in new position
    this.formationPositions[positionIndex] = character;

    this.refreshFormation();
  }

  private removeCharacterFromFormation(positionIndex: number): void {
    // Remove dragged card from scene to avoid duplicate
    if (this.dragTarget && this.dragTarget.parent) {
      this.dragTarget.parent.removeChild(this.dragTarget);
      this.dragTarget = null;
    }
    const character = this.formationPositions[positionIndex];
    if (character) {
      this.formationPositions[positionIndex] = null;
      this.availableCharacters.push(character);
      this.refreshFormation();
    }
  }

  private refreshFormation(): void {
    // Remove existing formation and pool containers
    const formationContainer = this.getChildByLabel('formationContainer');
    const poolContainer = this.getChildByLabel('characterPool');

    if (formationContainer) this.removeChild(formationContainer);
    if (poolContainer) this.removeChild(poolContainer);

    // Recreate them
    this.createFormationGrid();
    this.createCharacterPool();
  }

  private createActionButtons(): void {
    const saveButton = this.createButton(
      'Save Formation',
      this.gameWidth - 200,
      this.gameHeight - 140,
      150,
      50,
      () => {
        // Save formation to player data
        mockPlayer.formation.positions = [...this.formationPositions];
        alert('Formation saved successfully!');
      }
    );

    const resetButton = this.createButton(
      'Reset',
      this.gameWidth - 370,
      this.gameHeight - 140,
      150,
      50,
      () => {
        // Reset to original formation
        this.formationPositions = [...mockPlayer.formation.positions];
        this.availableCharacters = mockPlayer.characters.filter(
          char => !this.formationPositions.includes(char)
        );
        this.refreshFormation();
      }
    );

    this.addChild(saveButton, resetButton);
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Home',
      50,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(HomeScene)
    );
    this.addChild(backButton);
  }
}
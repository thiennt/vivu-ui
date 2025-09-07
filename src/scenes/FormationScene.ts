import { Graphics, Text, Container, Ticker } from 'pixi.js';
import { BaseScene } from '@/utils/BaseScene';
import { Character } from '@/types';
import { mockPlayer } from '@/utils/mockData';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';

export class FormationScene extends BaseScene {
  private formationPositions: (Character | null)[] = [];
  private availableCharacters: Character[] = [];
  private selectedCharacter: Character | null = null;
  private selectedPosition: number = -1;
  private draggedCharacter: Container | null = null;

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
    
    // Formation positions (3x2 grid)
    const rows = 2;
    const cols = 2;
    const slotSize = 100;
    const spacing = 20;
    const startX = (this.gameWidth - (cols * slotSize + (cols - 1) * spacing)) / 2;
    const startY = 150;
    
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const positionIndex = row * cols + col;
        const x = startX + col * (slotSize + spacing);
        const y = startY + row * (slotSize + spacing);
        
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
    
    // Drop zone
    slot.on('pointerup', () => {
      if (this.selectedCharacter) {
        this.placeCharacterInFormation(this.selectedCharacter, positionIndex);
      }
    });
    
    return slot;
  }

  private createFormationCharacterCard(character: Character, x: number, y: number, size: number, positionIndex: number): Container {
    const card = this.createCard(x, y, size, size, character.rarity);
    
    const symbolText = new Text({
      text: character.tokenSymbol,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = size / 2;
    symbolText.y = size / 2 - 10;
    
    const levelText = new Text({
      text: `Lv.${character.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = size / 2;
    levelText.y = size / 2 + 15;
    
    card.addChild(symbolText, levelText);
    
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
    poolContainer.y = this.gameHeight - 200;
    
    this.addChild(poolContainer);
  }

  private createPoolCharacterCard(character: Character, x: number, y: number): Container {
    const card = this.createCard(x, y, 90, 80, character.rarity);
    
    const symbolText = new Text({
      text: character.tokenSymbol,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = 45;
    symbolText.y = 25;
    
    const levelText = new Text({
      text: `Lv.${character.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = 45;
    levelText.y = 50;
    
    card.addChild(symbolText, levelText);
    
    // Make draggable
    this.makeCharacterDraggable(card, character, -1, false);
    
    return card;
  }

  private makeCharacterDraggable(card: Container, character: Character, currentPosition: number, isInFormation: boolean): void {
    card.interactive = true;
    card.cursor = 'pointer';
    
    let isDragging = false;
    let dragOffset = { x: 0, y: 0 };
    
    card.on('pointerdown', (event) => {
      isDragging = true;
      this.selectedCharacter = character;
      this.selectedPosition = currentPosition;
      
      const globalPos = event.data.global;
      dragOffset.x = globalPos.x - card.x;
      dragOffset.y = globalPos.y - card.y;
      
      card.alpha = 0.8;
      card.scale.set(1.1);
    });
    
    card.on('pointermove', (event) => {
      if (isDragging) {
        const globalPos = event.data.global;
        card.x = globalPos.x - dragOffset.x;
        card.y = globalPos.y - dragOffset.y;
      }
    });
    
    card.on('pointerup', () => {
      if (isDragging) {
        isDragging = false;
        card.alpha = 1;
        card.scale.set(1);
        
        // Reset character selection
        this.selectedCharacter = null;
        this.selectedPosition = -1;
        
        // Refresh the display
        this.refreshFormation();
      }
    });
    
    // Right-click to remove from formation
    if (isInFormation) {
      card.on('rightdown', () => {
        this.removeCharacterFromFormation(currentPosition);
      });
    }
  }

  private placeCharacterInFormation(character: Character, positionIndex: number): void {
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

  update(time: Ticker): void {
    // No specific animations needed
  }
}
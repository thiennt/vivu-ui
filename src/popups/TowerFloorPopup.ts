import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Stage, Enemy } from '@/types';
import { CardBattleScene } from '@/scenes/CardBattleScene';

export class TowerFloorPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private stage: Stage;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { stage: Stage }) {
    super();
    this.stage = params.stage;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = Math.min(600, this.gameHeight - 40);
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Dialog title
    const dialogTitle = new Text({
      text: `🗼 Floor ${this.stage.stageNumber || 1}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Stage name
    const stageName = new Text({
      text: this.stage.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    stageName.anchor.set(0.5, 0);
    stageName.x = this.gameWidth / 2;
    stageName.y = dialogY + 60;

    // Enemy lineup section
    const enemyTitle = new Text({
      text: '⚔️ Enemy Lineup',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    enemyTitle.x = dialogX + 20;
    enemyTitle.y = dialogY + 110;

    // Create enemy display container
    const enemyContainer = new Container();
    enemyContainer.x = dialogX + 20;
    enemyContainer.y = dialogY + 150;
    
    this.createEnemyLineup(enemyContainer, dialogWidth - 40);

    // Rewards section
    const rewardTitle = new Text({
      text: '🏆 Rewards',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    rewardTitle.x = dialogX + 20;
    rewardTitle.y = dialogY + 300;

    // Locked treasure chest
    const treasureChest = new Text({
      text: '🔒📦',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fill: Colors.RARITY_LEGENDARY
      }
    });
    treasureChest.x = dialogX + 20;
    treasureChest.y = dialogY + 340;

    const chestText = new Text({
      text: 'Locked Treasure Chest\n(Find the key to unlock rewards!)',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 120
      }
    });
    chestText.x = dialogX + 80;
    chestText.y = dialogY + 350;

    // Challenge button
    const challengeButton = this.createButton(
      '⚔️ Challenge',
      dialogX + (dialogWidth - 200) / 2,
      dialogY + dialogHeight - 100,
      200,
      50,
      () => this.startChallenge()
    );

    // Close button
    const closeButton = this.createButton(
      '✕ Close',
      dialogX + dialogWidth - 80,
      dialogY + 10,
      60,
      40,
      () => this.closeDialog()
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.cursor = 'pointer';
    this.dialogBg.on('pointerdown', () => this.closeDialog());

    this.addChild(
      this.dialogBg,
      this.dialogPanel,
      dialogTitle,
      stageName,
      enemyTitle,
      enemyContainer,
      rewardTitle,
      treasureChest,
      chestText,
      challengeButton,
      closeButton
    );
  }

  private createEnemyLineup(container: Container, maxWidth: number): void {
    const enemies = this.stage.enemies || [];
    
    if (enemies.length === 0) {
      // Show placeholder enemies if none defined
      const placeholderText = new Text({
        text: '👹 Mysterious Enemies Await...',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontStyle: 'italic',
          fill: Colors.TEXT_TERTIARY
        }
      });
      container.addChild(placeholderText);
      return;
    }

    const enemyWidth = 80;
    const enemyHeight = 100;
    const spacing = 10;
    const maxEnemiesPerRow = Math.floor((maxWidth - spacing) / (enemyWidth + spacing));
    
    enemies.forEach((enemy: Enemy, index: number) => {
      const row = Math.floor(index / maxEnemiesPerRow);
      const col = index % maxEnemiesPerRow;
      
      const enemyCard = this.createEnemyCard(enemy, enemyWidth, enemyHeight);
      enemyCard.x = col * (enemyWidth + spacing);
      enemyCard.y = row * (enemyHeight + spacing);
      
      container.addChild(enemyCard);
    });
  }

  private createEnemyCard(enemy: Enemy, width: number, height: number): Container {
    const card = new Container();
    
    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.ELEMENT_FIRE });
    
    // Enemy icon (simplified)
    const enemyIcon = new Text({
      text: '👹',
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fill: Colors.ELEMENT_FIRE
      }
    });
    enemyIcon.anchor.set(0.5);
    enemyIcon.x = width / 2;
    enemyIcon.y = 25;
    
    // Enemy name
    const nameText = new Text({
      text: enemy.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: width - 10
      }
    });
    nameText.anchor.set(0.5, 0);
    nameText.x = width / 2;
    nameText.y = 45;
    
    // Enemy level
    const levelText = new Text({
      text: `Lv.${enemy.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = width / 2;
    levelText.y = height - 15;
    
    card.addChild(bg, enemyIcon, nameText, levelText);
    return card;
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8);
    bg.fill({ color: Colors.BUTTON_PRIMARY });
    bg.stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON
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
    button.on('pointerdown', onClick);
    
    // Add hover effect
    button.on('pointerover', () => {
      bg.tint = 0xcccccc;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });
    
    return button;
  }

  private startChallenge(): void {
    // Close popup and navigate to battle
    this.closeDialog();
    navigation.showScreen(CardBattleScene, { 
      stage: this.stage, 
      mode: 'tower' 
    });
  }

  private closeDialog(): void {
    // Remove this popup from parent
    if (this.parent) {
      this.parent.removeChild(this);
    }
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
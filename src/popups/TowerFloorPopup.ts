import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Stage, Character } from '@/types';
import { CardBattleScene } from '@/scenes/CardBattleScene';
import { PrepareScene } from '@/scenes/PrepareScene';

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
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
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
      text: `🗼 ${this.stage.name}`,
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

    const lineup_power = (this.stage.characters || []).reduce(
      (sum, c) => sum + (c.atk || 0) + (c.def || 0) + (c.hp || 0),
      0
    );

    // Enemy lineup section
    const enemyTitle = new Text({
      text: `⚔️ Enemy Lineup ⚡${lineup_power}`,
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
      text: this.stage.is_completed ? '🎟️ x1' : '🎟️ x10',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fill: Colors.RARITY_LEGENDARY
      }
    });
    treasureChest.x = dialogX + 20;
    treasureChest.y = dialogY + 340;

    const chestText = new Text({
      text: 'Crystal Ball',
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
      enemyTitle,
      enemyContainer,
      rewardTitle,
      treasureChest,
      challengeButton,
      closeButton
    );
  }

  private createEnemyLineup(container: Container, maxWidth: number): void {
    const enemies = this.stage.characters || [];
    
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
    const maxEnemiesPerRow = 3; // Force 3 cards per row
    
    enemies.forEach((enemy: Character, index: number) => {
      const row = Math.floor(index / maxEnemiesPerRow);
      const col = index % maxEnemiesPerRow;
      
      const enemyCard = this.createEnemyCard(enemy, enemyWidth, enemyHeight);
      // Center the lineup in the available width
      const totalRowWidth = enemies.length * enemyWidth + (enemies.length - 1) * spacing;
      const offsetX = Math.max(0, (maxWidth - totalRowWidth) / 2);

      enemyCard.x = offsetX + col * (enemyWidth + spacing);
      enemyCard.y = row * (enemyHeight + spacing);
      
      container.addChild(enemyCard);
    });
  }

  private createEnemyCard(enemy: Character, width: number, height: number): Container {
    const card = new Container();
    // Background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.ELEMENT_FIRE });
    card.addChild(bg);

    (async () => {
      if (enemy.avatar_url && typeof enemy.avatar_url === 'string') {
        // create async here to load image from URL
        const texture = await Assets.load(enemy.avatar_url as string);
        const sprite = new Sprite(texture);
        sprite.width = 40;
        sprite.height = 40;
        sprite.anchor.set(0.5);
        sprite.x = width / 2;
        sprite.y = 25;
        card.addChild(sprite);
      } else {
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
        card.addChild(enemyIcon);
      }
      
      // Enemy name
      const nameText = new Text({
        text: enemy.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
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
      
      // Stats: hp, atk, def
      const statsText = new Text({
        text: `❤️ ${enemy.hp}\n⚔️ ${enemy.atk}\n🛡️ ${enemy.def}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 13,
          fill: Colors.TEXT_SECONDARY,
          align: 'center'
        }
      });
      statsText.anchor.set(0.5);
      statsText.x = width / 2;
      statsText.y = height - 38;

      card.addChild(nameText);
    })();
    
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
      bg.tint = Colors.HOVER_TINT;
    });
    button.on('pointerout', () => {
      bg.tint = Colors.ACTIVE_WHITE;
    });
    
    return button;
  }

  private async startChallenge(): Promise<void> {
    try {
      // Close popup and navigate to battle
      this.closeDialog();
      console.log('Entering tower floor:', this.stage.name);
      
      // Navigate to PrepareScene to review deck before tower battle
      navigation.showScreen(PrepareScene, {
        stage: this.stage,
        mode: 'tower' // Indicate this is tower mode
      });
    } catch (error) {
      console.error('Failed to enter tower floor:', error);
      // Fallback to direct battle navigation
      alert(`Error entering tower floor: ${error}. Starting battle anyway...`);
      navigation.showScreen(CardBattleScene, { stage: this.stage, mode: 'tower' });
    }
  }

  private closeDialog(): void {
    navigation.dismissPopup();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
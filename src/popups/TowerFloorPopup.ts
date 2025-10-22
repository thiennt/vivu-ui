import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, hexToPixi } from '@/utils/colors';
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
    // Create semi-transparent dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.85 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = Math.min(600, this.gameHeight - 40);
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Fantasy parchment dialog panel
    this.dialogPanel = new Graphics();
    
    // Shadow
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth, dialogHeight, 12)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.6 });
    
    // Main parchment panel
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: hexToPixi(Colors.PARCHMENT_LIGHT), alpha: 0.98 })
      .stroke({ width: 3, color: hexToPixi(Colors.GOLD) });
    
    // Inner layer
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth - 8, dialogHeight - 8, 10)
      .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.6 });
    
    // Golden highlight
    this.dialogPanel.roundRect(dialogX + 6, dialogY + 6, dialogWidth - 12, dialogHeight - 12, 9)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(this.dialogPanel, dialogX, dialogY, dialogWidth, dialogHeight, hexToPixi(Colors.GOLD_BRIGHT));

    // Dialog title banner
    const bannerWidth = dialogWidth - 80;
    const bannerHeight = 44;
    const bannerX = dialogX + 40;
    const bannerY = dialogY + 20;
    
    const titleBanner = new Graphics();
    titleBanner.moveTo(bannerX + 10, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 10, bannerY)
      .lineTo(bannerX + 10, bannerY)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    
    titleBanner.moveTo(bannerX + 12, bannerY + 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY + 2)
      .lineTo(bannerX + bannerWidth - 3, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight - 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight - 2)
      .lineTo(bannerX + 3, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + 2)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });

    const dialogTitle = new Text({
      text: `🗼 ${this.stage.name}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 22,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 },
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = bannerY + bannerHeight / 2;

    const lineup_power = (this.stage.characters || []).reduce(
      (sum, c) => sum + (c.atk || 0) + (c.def || 0) + (c.hp || 0),
      0
    );

    // Enemy lineup section with parchment panel
    const enemySectionY = dialogY + 85;
    const enemySectionHeight = 190;
    
    const enemyPanel = new Graphics();
    enemyPanel.roundRect(dialogX + 15, enemySectionY, dialogWidth - 30, enemySectionHeight, 8)
      .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.5 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD), alpha: 0.7 });

    const enemyTitle = new Text({
      text: `⚔️ Enemy Lineup ⚡${lineup_power}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.BROWN_DARK),
        stroke: { color: hexToPixi(Colors.GOLD_BRIGHT), width: 0.5 }
      }
    });
    enemyTitle.x = dialogX + 25;
    enemyTitle.y = enemySectionY + 10;

    // Create enemy display container
    const enemyContainer = new Container();
    enemyContainer.x = dialogX + 25;
    enemyContainer.y = enemySectionY + 40;
    
    this.createEnemyLineup(enemyContainer, dialogWidth - 50);

    // Rewards section with treasure panel
    const rewardSectionY = dialogY + 290;
    const rewardSectionHeight = 120;
    
    const rewardPanel = new Graphics();
    
    // Golden treasure panel
    rewardPanel.roundRect(dialogX + 15 + 2, rewardSectionY + 2, dialogWidth - 30, rewardSectionHeight, 8)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.3 });
    
    rewardPanel.roundRect(dialogX + 15, rewardSectionY, dialogWidth - 30, rewardSectionHeight, 8)
      .fill({ color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.25 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    
    rewardPanel.roundRect(dialogX + 17, rewardSectionY + 2, dialogWidth - 34, rewardSectionHeight - 4, 7)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.8 });

    const rewardTitle = new Text({
      text: '🏆 Battle Rewards',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.BROWN_DARK),
        stroke: { color: hexToPixi(Colors.GOLD_BRIGHT), width: 0.5 }
      }
    });
    rewardTitle.x = dialogX + 25;
    rewardTitle.y = rewardSectionY + 10;

    // Treasure chest icon
    const treasureChest = new Text({
      text: this.stage.is_completed ? '🎟️ x1' : '🎟️ x10',
      style: {
        fontFamily: 'Kalam',
        fontSize: 28,
        fill: hexToPixi(Colors.BROWN_DARK)
      }
    });
    treasureChest.x = dialogX + 30;
    treasureChest.y = rewardSectionY + 50;

    const chestText = new Text({
      text: 'Crystal Ball',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.BROWN_DARK),
        align: 'left',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 140
      }
    });
    chestText.x = dialogX + 95;
    chestText.y = rewardSectionY + 60;

    // Challenge button
    const challengeButton = this.createFantasyButton(
      '⚔️ Challenge',
      dialogX + (dialogWidth - 200) / 2,
      dialogY + dialogHeight - 80,
      200,
      50,
      () => this.startChallenge()
    );

    // Close button (X in corner)
    const closeButton = this.createCloseButton(
      dialogX + dialogWidth - 45,
      dialogY + 15,
      30,
      30,
      () => this.closeDialog()
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.cursor = 'pointer';
    this.dialogBg.on('pointerdown', () => this.closeDialog());

    this.addChild(
      this.dialogBg,
      this.dialogPanel,
      titleBanner,
      dialogTitle,
      enemyPanel,
      enemyTitle,
      enemyContainer,
      rewardPanel,
      rewardTitle,
      treasureChest,
      challengeButton,
      closeButton
    );
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: number): void {
    const cornerSize = 12;
    
    // Top-left
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    // Top-right
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    // Bottom-left
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
    
    // Bottom-right
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
  }

  private createEnemyLineup(container: Container, maxWidth: number): void {
    const enemies = this.stage.characters || [];
    
    if (enemies.length === 0) {
      const placeholderText = new Text({
        text: '👹 Mysterious Enemies Await...',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontStyle: 'italic',
          fill: hexToPixi(Colors.BROWN)
        }
      });
      container.addChild(placeholderText);
      return;
    }

    const enemyWidth = 80;
    const enemyHeight = 100;
    const spacing = 10;
    const maxEnemiesPerRow = 3;
    
    enemies.forEach((enemy: Character, index: number) => {
      const row = Math.floor(index / maxEnemiesPerRow);
      const col = index % maxEnemiesPerRow;
      
      const enemyCard = this.createEnemyCard(enemy, enemyWidth, enemyHeight);
      const totalRowWidth = Math.min(enemies.length, maxEnemiesPerRow) * enemyWidth + (Math.min(enemies.length, maxEnemiesPerRow) - 1) * spacing;
      const offsetX = Math.max(0, (maxWidth - totalRowWidth) / 2);

      enemyCard.x = offsetX + col * (enemyWidth + spacing);
      enemyCard.y = row * (enemyHeight + spacing);
      
      container.addChild(enemyCard);
    });
  }

  private createEnemyCard(enemy: Character, width: number, height: number): Container {
    const card = new Container();
    
    // Dark enemy card
    const bg = new Graphics();
    
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
    
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: hexToPixi(Colors.BROWN_DARK), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.RED_DARK) });
    
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: hexToPixi(Colors.RED), alpha: 0.5 });
    
    card.addChild(bg);

    (async () => {
      if (enemy.avatar_url && typeof enemy.avatar_url === 'string') {
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
            fill: hexToPixi(Colors.RED)
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
          fontSize: 11,
          fontWeight: 'bold',
          fill: hexToPixi(Colors.WHITE),
          align: 'center',
          wordWrap: true,
          wordWrapWidth: width - 10
        }
      });
      nameText.anchor.set(0.5, 0);
      nameText.x = width / 2;
      nameText.y = 48;
      
      // Stats
      const statsText = new Text({
        text: `❤️${enemy.hp} ⚔️${enemy.atk} 🛡️${enemy.def}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: hexToPixi(Colors.PARCHMENT),
          align: 'center'
        }
      });
      statsText.anchor.set(0.5);
      statsText.x = width / 2;
      statsText.y = height - 15;

      card.addChild(nameText, statsText);
    })();
    
    return card;
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
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.5 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: hexToPixi(Colors.RED_DARK), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.8 });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 }
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.RED), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 1 });
      button.scale.set(1.03);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.RED_DARK), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.8 });
      button.scale.set(1.0);
    });
    
    return button;
  }

  private createCloseButton(
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.circle(width / 2, height / 2, width / 2)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    
    const buttonText = new Text({
      text: '✕',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE)
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
    
    button.on('pointerover', () => {
      bg.tint = hexToPixi(Colors.GRAY_LIGHTEST);
      button.scale.set(1.1);
    });
    
    button.on('pointerout', () => {
      bg.tint = hexToPixi(Colors.WHITE);
      button.scale.set(1.0);
    });
    
    return button;
  }

  private async startChallenge(): Promise<void> {
    try {
      this.closeDialog();
      console.log('Entering tower floor:', this.stage.name);
      
      navigation.showScreen(PrepareScene, {
        stage: this.stage,
        mode: 'tower'
      });
    } catch (error) {
      console.error('Failed to enter tower floor:', error);
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
    this.removeChildren();
    this.createDialog();
  }
}
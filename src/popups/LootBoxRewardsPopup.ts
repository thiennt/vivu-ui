import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { gsap } from 'gsap';

interface LootBoxReward {
  label: string;
  emoji: string;
  color: string;
  reward: {
    type: string;
    amount: number;
  };
}

export class LootBoxRewardsPopup extends Container {
  private dialogPanel!: Container;
  private dialogBg?: Graphics;
  private rewards: LootBoxReward[];

  constructor(params: { rewards: LootBoxReward[] }) {
    super();
    this.rewards = params.rewards;
    this.createDialog();
  }

  private createDialog(): void {
    this.createOverlay();
    this.createRewardsDisplay();
    this.positionAtCenter(navigation.width, navigation.height);
  }

  private createOverlay(): void {
    // Create semi-transparent dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, navigation.width, navigation.height)
      .fill({ color: Colors.BLACK, alpha: 0.85 });
    
    // Make overlay clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.cursor = 'pointer';
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });

    this.addChild(this.dialogBg);
  }

  private createRewardsDisplay(): void {
    const maxWidth = Math.min(navigation.width - 40, 400);
    const padding = 20;
    
    this.dialogPanel = new Container();

    // Calculate grid layout
    const cols = this.rewards.length <= 3 ? this.rewards.length : this.rewards.length <= 6 ? 3 : 4;
    const rows = Math.ceil(this.rewards.length / cols);
    const cardSize = Math.min(90, (maxWidth - padding * 2 - (cols - 1) * 10) / cols);
    const gridWidth = cols * cardSize + (cols - 1) * 10;
    const gridHeight = rows * cardSize + (rows - 1) * 10;
    
    // Panel dimensions
    const panelWidth = gridWidth + padding * 2;
    const panelHeight = gridHeight + padding * 2 + 80; // Extra space for title and summary

    // Panel background
    const bg = new Graphics();
    bg.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    // Inner glow
    bg.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 10)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });
    
    this.dialogPanel.addChild(bg);

    // Title
    const title = new Text({
      text: '🎁 Rewards',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 }
      }
    });
    title.anchor.set(0.5);
    title.x = panelWidth / 2;
    title.y = 25;
    this.dialogPanel.addChild(title);

    // Rewards grid
    const startX = padding + cardSize / 2;
    const startY = 60;

    this.rewards.forEach((reward, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardSize + 10);
      const y = startY + row * (cardSize + 10);
      
      // Create reward card
      const card = new Container();
      card.x = x;
      card.y = y;
      card.alpha = 0;
      card.scale.set(0.3);
      this.dialogPanel.addChild(card);
      
      // Card background
      const cardBg = new Graphics();
      cardBg.roundRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 8)
        .fill({ color: Colors.ROBOT_BG_DARK, alpha: 0.9 })
        .stroke({ width: 2, color: reward.color });
      
      // Emoji
      const rewardEmoji = new Text({
        text: reward.emoji,
        style: { fontSize: cardSize * 0.45 }
      });
      rewardEmoji.anchor.set(0.5);
      rewardEmoji.y = -cardSize * 0.15;
      
      // Amount
      const amount = new Text({
        text: `+${reward.reward.amount}`,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: cardSize * 0.24,
          fontWeight: 'bold',
          fill: reward.color,
          stroke: { color: Colors.ROBOT_BG_DARK, width: 1 }
        }
      });
      amount.anchor.set(0.5);
      amount.y = cardSize * 0.22;
      
      card.addChild(cardBg, rewardEmoji, amount);
      
      // Animate card appearance
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: i * 0.08,
        ease: 'back.out(2)'
      });
    });

    // Summary at bottom
    const aggregated: { [key: string]: { emoji: string; amount: number; label: string } } = {};
    this.rewards.forEach(reward => {
      const key = reward.reward.type;
      if (!aggregated[key]) {
        aggregated[key] = { emoji: reward.emoji, amount: 0, label: reward.label };
      }
      aggregated[key].amount += reward.reward.amount;
    });
    
    let summaryText = '🎉 Total: ';
    const parts = Object.values(aggregated).map(r => `${r.emoji}${r.amount}`);
    summaryText += parts.join(' · ');
    
    const summary = new Text({
      text: summaryText,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 },
        align: 'center',
        wordWrap: true,
        wordWrapWidth: panelWidth - 40
      }
    });
    summary.anchor.set(0.5);
    summary.x = panelWidth / 2;
    summary.y = panelHeight - 30;
    this.dialogPanel.addChild(summary);

    // Close button
    this.createCloseButton(panelWidth, panelHeight);

    this.addChild(this.dialogPanel);
  }

  private createCloseButton(panelWidth: number, panelHeight: number): void {
    const buttonSize = 32;
    const button = new Container();
    
    const bg = new Graphics();
    bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    const buttonText = new Text({
      text: '✕',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BLACK, width: 1 }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonSize / 2;
    buttonText.y = buttonSize / 2;
    
    button.addChild(bg, buttonText);
    button.x = panelWidth - buttonSize - 8;
    button.y = 8;
    
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    button.on('pointerover', () => {
      bg.clear();
      bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 1 });
      button.scale.set(1.05);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.circle(buttonSize / 2, buttonSize / 2, buttonSize / 2)
        .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.8 });
      button.scale.set(1.0);
    });
    
    this.dialogPanel.addChild(button);
  }

  public positionAtCenter(screenWidth: number, screenHeight: number): void {
    // Center the dialog panel
    if (this.dialogPanel) {
      this.dialogPanel.x = (screenWidth - this.dialogPanel.width) / 2;
      this.dialogPanel.y = (screenHeight - this.dialogPanel.height) / 2;
    }
  }
}

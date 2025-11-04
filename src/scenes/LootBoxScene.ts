import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
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

export class LootBoxScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private tickets: number = 50; // Starting tickets for demo
  private ticketsText: Text | null = null;
  private resultText: Text | null = null;
  private openOneButton: Container | null = null;
  private openTenButton: Container | null = null;
  private isOpening: boolean = false;
  
  // Possible rewards
  private possibleRewards: LootBoxReward[] = [
    { label: 'Gold', emoji: '💰', color: Colors.ROBOT_CYAN, reward: { type: 'gold', amount: 100 } },
    { label: 'Experience', emoji: '⭐', color: Colors.BLUE_SKY, reward: { type: 'exp', amount: 50 } },
    { label: 'Dice', emoji: '🎲', color: Colors.PURPLE_BRIGHT, reward: { type: 'dice', amount: 5 } },
    { label: 'Gold', emoji: '💰', color: Colors.ROBOT_CYAN, reward: { type: 'gold', amount: 200 } },
    { label: 'Energy', emoji: '⚡', color: Colors.ORANGE_EMBER, reward: { type: 'energy', amount: 10 } },
    { label: 'Experience', emoji: '⭐', color: Colors.BLUE_BRIGHT, reward: { type: 'exp', amount: 100 } },
    { label: 'Dice', emoji: '🎲', color: Colors.PURPLE_MYSTIC, reward: { type: 'dice', amount: 10 } },
    { label: 'Gold', emoji: '💰', color: Colors.GOLD_ANCIENT, reward: { type: 'gold', amount: 500 } },
  ];

  constructor() {
    super();
    
    this.container = new Container();
    this.addChild(this.container);
    
    this.createUI();
  }

  private createUI(): void {
    this.container.removeChildren();
    this.createBackground();
    this.createHeader();
    this.createTicketsDisplay();
    this.createLootBoxDisplay();
    this.createOpenButtons();
    this.createBackButton();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.createUI();
  }

  async show(): Promise<void> {
    // Reset state when showing
    this.isOpening = false;
    if (this.resultText) {
      this.resultText.visible = false;
    }
  }

  async hide(): Promise<void> {
  }

  reset(): void {
    this.container.removeChildren();
  }

  private createBackground(): void {
    const bg = new Graphics();
    this.container.addChild(bg);
    
    // Dark fantasy background with gradient
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    // Overlay texture
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });
    
    // Add mystical particles
    for (let i = 0; i < 30; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2.5;
      particle.circle(Math.random() * this.gameWidth, Math.random() * this.gameHeight, size)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 + Math.random() * 0.3 });
      this.container.addChild(particle);
    }
  }

  private createHeader(): void {
    const bannerWidth = Math.min(360, this.gameWidth - 40);
    const bannerHeight = 55;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 18;
    
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
      text: '🎁 Mystery Loot Box 🎁',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 26,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
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
      text: '✨ Open boxes to win amazing rewards! ✨',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 14;
    
    this.container.addChild(banner, title, subtitle);
  }

  private createTicketsDisplay(): void {
    const panelWidth = Math.min(280, this.gameWidth - 80);
    const panelHeight = 60;
    const panelX = (this.gameWidth - panelWidth) / 2;
    const panelY = 110;
    
    const panel = new Graphics();
    
    // Outer glow
    panel.roundRect(panelX - 2, panelY - 2, panelWidth + 4, panelHeight + 4, 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 });
    
    // Main panel
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    // Inner highlight
    panel.roundRect(panelX + 3, panelY + 3, panelWidth - 6, panelHeight - 6, 8)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });
    
    this.container.addChild(panel);
    
    // Tickets text
    this.ticketsText = new Text({
      text: `🎫 Tickets: ${this.tickets}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 1 }
      }
    });
    this.ticketsText.anchor.set(0.5);
    this.ticketsText.x = this.gameWidth / 2;
    this.ticketsText.y = panelY + panelHeight / 2;
    this.container.addChild(this.ticketsText);
  }

  private createLootBoxDisplay(): void {
    const boxSize = Math.min(120, (this.gameWidth - 100) / 2);
    const centerX = this.gameWidth / 2;
    const centerY = 240;
    
    // Loot box shadow
    const shadow = new Graphics();
    shadow.roundRect(centerX - boxSize / 2 + 4, centerY - boxSize / 2 + 4, boxSize, boxSize, 12)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    this.container.addChild(shadow);
    
    // Loot box
    const box = new Graphics();
    
    // Main box body
    box.roundRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, boxSize, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    // Box lid
    const lidHeight = boxSize * 0.3;
    box.roundRect(centerX - boxSize / 2, centerY - boxSize / 2, boxSize, lidHeight, 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
    
    // Decorative cross on lid
    const crossSize = 20;
    box.rect(centerX - 2, centerY - boxSize / 2 + lidHeight / 2 - crossSize / 2, 4, crossSize)
      .fill({ color: Colors.ROBOT_CYAN_LIGHT });
    box.rect(centerX - crossSize / 2, centerY - boxSize / 2 + lidHeight / 2 - 2, crossSize, 4)
      .fill({ color: Colors.ROBOT_CYAN_LIGHT });
    
    // Inner details
    box.roundRect(centerX - boxSize / 2 + 10, centerY - boxSize / 2 + lidHeight + 10, boxSize - 20, boxSize - lidHeight - 20, 5)
      .fill({ color: Colors.ROBOT_CONTAINER, alpha: 0.6 });
    
    this.container.addChild(box);
    
    // Box emoji
    const boxEmoji = new Text({
      text: '🎁',
      style: {
        fontSize: 48
      }
    });
    boxEmoji.anchor.set(0.5);
    boxEmoji.x = centerX;
    boxEmoji.y = centerY + 10;
    this.container.addChild(boxEmoji);
  }

  private createOpenButtons(): void {
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 50;
    const centerX = this.gameWidth / 2;
    const startY = 380;
    
    // Open 1 button
    this.openOneButton = this.createButton(
      '🎁 Open 1 Box',
      centerX - buttonWidth / 2,
      startY,
      buttonWidth,
      buttonHeight,
      () => this.openBoxes(1),
      16,
      this.tickets < 1
    );
    this.container.addChild(this.openOneButton);
    
    // Cost text for open 1
    const cost1Text = new Text({
      text: '1 Ticket',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    cost1Text.anchor.set(0.5);
    cost1Text.x = centerX;
    cost1Text.y = startY + buttonHeight + 8;
    this.container.addChild(cost1Text);
    
    // Open 10 button
    this.openTenButton = this.createButton(
      '🎁✨ Open 10 Boxes',
      centerX - buttonWidth / 2,
      startY + 70,
      buttonWidth,
      buttonHeight,
      () => this.openBoxes(10),
      16,
      this.tickets < 10
    );
    this.container.addChild(this.openTenButton);
    
    // Cost text for open 10
    const cost10Text = new Text({
      text: '10 Tickets',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fill: Colors.ROBOT_CYAN,
        align: 'center'
      }
    });
    cost10Text.anchor.set(0.5);
    cost10Text.x = centerX;
    cost10Text.y = startY + 70 + buttonHeight + 8;
    this.container.addChild(cost10Text);
    
    // Result text (initially hidden)
    this.resultText = new Text({
      text: '',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 1 },
        align: 'center',
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        },
        wordWrap: true,
        wordWrapWidth: this.gameWidth - 40
      }
    });
    this.resultText.anchor.set(0.5);
    this.resultText.x = this.gameWidth / 2;
    this.resultText.y = startY + 150;
    this.resultText.visible = false;
    this.container.addChild(this.resultText);
  }

  private openBoxes(count: number): void {
    if (this.isOpening || this.tickets < count) return;
    
    this.isOpening = true;
    this.tickets -= count;
    
    // Update tickets display
    if (this.ticketsText) {
      this.ticketsText.text = `🎫 Tickets: ${this.tickets}`;
    }
    
    if (this.resultText) {
      this.resultText.visible = false;
    }
    
    // Disable buttons
    this.updateButtonStates();
    
    // Generate random rewards
    const rewards: LootBoxReward[] = [];
    for (let i = 0; i < count; i++) {
      const randomReward = this.possibleRewards[Math.floor(Math.random() * this.possibleRewards.length)];
      rewards.push(randomReward);
    }
    
    // Animate box opening
    setTimeout(() => {
      this.isOpening = false;
      
      // Aggregate rewards by type
      const aggregatedRewards: { [key: string]: { emoji: string; amount: number; label: string } } = {};
      rewards.forEach(reward => {
        const key = `${reward.reward.type}`;
        if (!aggregatedRewards[key]) {
          aggregatedRewards[key] = {
            emoji: reward.emoji,
            amount: 0,
            label: reward.label
          };
        }
        aggregatedRewards[key].amount += reward.reward.amount;
      });
      
      // Show result
      if (this.resultText) {
        let resultText = `🎉 You opened ${count} box${count > 1 ? 'es' : ''}! 🎉\n\n`;
        Object.values(aggregatedRewards).forEach(reward => {
          resultText += `${reward.emoji} +${reward.amount} ${reward.label}\n`;
        });
        this.resultText.text = resultText;
        this.resultText.visible = true;
      }
      
      // Update button states
      this.updateButtonStates();
    }, 1000);
  }

  private updateButtonStates(): void {
    if (this.openOneButton) {
      if (this.tickets < 1 || this.isOpening) {
        this.openOneButton.eventMode = 'none';
        this.openOneButton.alpha = 0.5;
      } else {
        this.openOneButton.eventMode = 'static';
        this.openOneButton.alpha = 1.0;
      }
    }
    
    if (this.openTenButton) {
      if (this.tickets < 10 || this.isOpening) {
        this.openTenButton.eventMode = 'none';
        this.openTenButton.alpha = 0.5;
      } else {
        this.openTenButton.eventMode = 'static';
        this.openTenButton.alpha = 1.0;
      }
    }
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 45;
    
    const backButton = this.createButton(
      '← Back',
      (this.gameWidth - buttonWidth) / 2,
      this.gameHeight - buttonHeight - 20,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    this.container.addChild(backButton);
  }

  update(): void {
    // No continuous update needed
  }
}

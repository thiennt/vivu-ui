import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { gsap } from 'gsap';
import { LootBoxRewardsPopup } from '@/popups/LootBoxRewardsPopup';

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
  public static assetBundles = [];
  
  public container: Container;
  private tickets: number = 50;
  private ticketsText: Text | null = null;
  private openOneButton: Container | null = null;
  private openTenButton: Container | null = null;
  private isOpening: boolean = false;
  private animationArea: Container;
  private summaryText: Text | null = null;
  
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
    
    this.animationArea = new Container();
    this.container.addChild(this.animationArea);
    
    this.createUI();
  }

  private createUI(): void {
    // Remove all except animation area
    for (let i = this.container.children.length - 1; i >= 0; i--) {
      if (this.container.children[i] !== this.animationArea) {
        this.container.removeChildAt(i);
      }
    }
    
    this.createBackground();
    this.createHeader();
    this.createTicketsDisplay();
    this.createDisplayBox();
    this.createOpenButtons();
    this.createBackButton();
    this.createSummaryText();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.createUI();
  }

  async show(): Promise<void> {
    this.isOpening = false;
    this.animationArea.removeChildren();
    if (this.summaryText) {
      this.summaryText.visible = false;
    }
  }

  async hide(): Promise<void> {
  }

  reset(): void {
    this.container.removeChildren();
  }

  private createBackground(): void {
    const bg = new Graphics();
    this.container.addChildAt(bg, 0);
    
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });
    
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });
    
    for (let i = 0; i < 30; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2.5;
      particle.circle(Math.random() * this.gameWidth, Math.random() * this.gameHeight, size)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 + Math.random() * 0.3 });
      this.container.addChildAt(particle, 1);
    }
  }

  private createHeader(): void {
    const bannerWidth = Math.min(360, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 15;
    
    const banner = new Graphics();
    banner.roundRect(bannerX, bannerY, bannerWidth, bannerHeight, 12)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.ROBOT_CYAN });

    const title = new Text({
      text: '🎁 Mystery Loot Box',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 24,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.container.addChild(banner, title);
  }

  private createTicketsDisplay(): void {
    const panelWidth = Math.min(200, this.gameWidth - 80);
    const panelHeight = 50;
    const panelX = (this.gameWidth - panelWidth) / 2;
    const panelY = 80;
    
    const panel = new Graphics();
    panel.roundRect(panelX, panelY, panelWidth, panelHeight, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });
    
    this.container.addChild(panel);
    
    this.ticketsText = new Text({
      text: `🎫 Tickets: ${this.tickets}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 22,
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

  private createDisplayBox(): void {
    const boxSize = 90;
    const centerX = this.gameWidth / 2;
    // Position in the middle between tickets display (at y=130) and open buttons (at startY)
    const ticketsBottom = 130; // 80 (panelY) + 50 (panelHeight)
    const buttonsTop = this.gameHeight - 160;
    const centerY = (ticketsBottom + buttonsTop) / 2;
    
    // Decorative loot box display
    const displayBoxContainer = new Container();
    displayBoxContainer.x = centerX;
    displayBoxContainer.y = centerY;
    this.container.addChild(displayBoxContainer);
    
    // Glow effect
    const glow = new Graphics();
    glow.circle(0, 0, boxSize / 2 + 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.15 });
    displayBoxContainer.addChild(glow);
    
    // Main box
    const box = new Graphics();
    box.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 12)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    displayBoxContainer.addChild(box);
    
    // Lid
    const lidHeight = boxSize * 0.35;
    const lid = new Graphics();
    lid.roundRect(-boxSize / 2, -boxSize / 2, boxSize, lidHeight, 12)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.9 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
    displayBoxContainer.addChild(lid);
    
    // Decorative ribbons
    const ribbon1 = new Graphics();
    ribbon1.rect(-3, -boxSize / 2, 6, boxSize)
      .fill({ color: Colors.ROBOT_CYAN_LIGHT, alpha: 0.8 });
    displayBoxContainer.addChild(ribbon1);
    
    const ribbon2 = new Graphics();
    ribbon2.rect(-boxSize / 2, -3, boxSize, 6)
      .fill({ color: Colors.ROBOT_CYAN_LIGHT, alpha: 0.8 });
    displayBoxContainer.addChild(ribbon2);
    
    // Box emoji
    const boxEmoji = new Text({
      text: '🎁',
      style: { fontSize: 50 }
    });
    boxEmoji.anchor.set(0.5);
    boxEmoji.y = 5;
    displayBoxContainer.addChild(boxEmoji);
    
    // Floating animation
    gsap.to(displayBoxContainer, {
      y: centerY - 8,
      duration: 2,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
    
    // Subtle rotation
    gsap.to(displayBoxContainer, {
      rotation: 0.05,
      duration: 3,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });
  }

  private createOpenButtons(): void {
    const buttonWidth = Math.min(160, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 48;
    const centerX = this.gameWidth / 2;
    const startY = this.gameHeight - 160;
    
    // Open 1
    this.openOneButton = this.createButton(
      'Open 1 (1🎫)',
      centerX - buttonWidth - 10,
      startY,
      buttonWidth,
      buttonHeight,
      () => this.openBoxes(1),
      15,
      this.tickets < 1
    );
    this.container.addChild(this.openOneButton);
    
    // Open 10
    this.openTenButton = this.createButton(
      'Open 10 (10🎫)',
      centerX + 10,
      startY,
      buttonWidth,
      buttonHeight,
      () => this.openBoxes(10),
      15,
      this.tickets < 10
    );
    this.container.addChild(this.openTenButton);
  }

  private createSummaryText(): void {
    this.summaryText = new Text({
      text: '',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_BG_DARK, width: 2 },
        align: 'center',
        wordWrap: true,
        wordWrapWidth: this.gameWidth - 60
      }
    });
    this.summaryText.anchor.set(0.5);
    this.summaryText.x = this.gameWidth / 2;
    this.summaryText.y = this.gameHeight - 180;
    this.summaryText.visible = false;
    this.container.addChild(this.summaryText);
  }

  private animateSingleBox(reward: LootBoxReward, delay: number): void {
    const centerX = this.gameWidth / 2;
    const centerY = 200;
    const boxSize = 100;
    
    // Create box container
    const boxContainer = new Container();
    boxContainer.x = centerX;
    boxContainer.y = centerY;
    boxContainer.alpha = 0;
    boxContainer.scale.set(0.3);
    this.animationArea.addChild(boxContainer);
    
    console.log('Creating single box animation');
    
    // Box
    const box = new Graphics();
    box.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize, 10)
      .fill({ color: Colors.ROBOT_ELEMENT })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN });
    
    const lid = new Graphics();
    lid.roundRect(-boxSize / 2, -boxSize / 2, boxSize, boxSize * 0.3, 10)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.8 });
    
    const emoji = new Text({ text: '🎁', style: { fontSize: 50 } });
    emoji.anchor.set(0.5);
    
    boxContainer.addChild(box, lid, emoji);
    
    console.log('Starting GSAP animation, boxContainer:', boxContainer);
    
    // Animate
    const tween = gsap.to(boxContainer, {
      alpha: 1,
      scale: 1,
      duration: 0.3,
      delay: delay,
      ease: 'back.out(2)',
      onStart: () => console.log('Animation started'),
      onUpdate: () => {
        // Force update
        boxContainer.alpha = tween.progress();
      },
      onComplete: () => {
        console.log('Box appeared, starting shake');
        // Shake
        const shakeTween = gsap.to(boxContainer, {
          rotation: 0.1,
          duration: 0.05,
          yoyo: true,
          repeat: 7,
          onComplete: () => {
            console.log('Shake complete, opening box');
            boxContainer.rotation = 0;
            
            // Open - lid flies
            gsap.to(lid, {
              y: -150,
              rotation: 0.5,
              alpha: 0,
              duration: 0.5,
              ease: 'power2.out'
            });
            
            // Reveal reward
            const rewardEmoji = new Text({
              text: reward.emoji,
              style: { fontSize: 80 }
            });
            rewardEmoji.anchor.set(0.5);
            rewardEmoji.alpha = 0;
            rewardEmoji.scale.set(0.3);
            boxContainer.addChild(rewardEmoji);
            
            gsap.to(emoji, { alpha: 0, duration: 0.2 });
            gsap.to(rewardEmoji, {
              alpha: 1,
              scale: 1,
              duration: 0.4,
              delay: 0.2,
              ease: 'back.out(2)'
            });
            
            // Amount text
            const amountText = new Text({
              text: `+${reward.reward.amount}`,
              style: {
                fontFamily: FontFamily.PRIMARY,
                fontSize: 28,
                fontWeight: 'bold',
                fill: reward.color,
                stroke: { color: Colors.ROBOT_BG_DARK, width: 2 }
              }
            });
            amountText.anchor.set(0.5);
            amountText.y = 60;
            amountText.alpha = 0;
            boxContainer.addChild(amountText);
            
            gsap.to(amountText, {
              alpha: 1,
              y: 50,
              duration: 0.3,
              delay: 0.4
            });
            
            // Fade out after showing
            gsap.to(boxContainer, {
              alpha: 0,
              duration: 0.4,
              delay: 1.5,
              onComplete: () => {
                if (this.animationArea.children.includes(boxContainer)) {
                  this.animationArea.removeChild(boxContainer);
                }
              }
            });
          }
        });
      }
    });
  }

  private animateMultipleBoxes(rewards: LootBoxReward[]): void {
    const padding = 20;
    const availableWidth = this.gameWidth - padding * 2;
    const availableHeight = this.gameHeight - 400;
    
    const cols = rewards.length <= 3 ? rewards.length : rewards.length <= 6 ? 3 : 4;
    const rows = Math.ceil(rewards.length / cols);
    
    const cardSize = Math.min(85, Math.floor(availableWidth / cols) - 15, Math.floor(availableHeight / rows) - 15);
    const gridWidth = cols * (cardSize + 10) - 10;
    const gridHeight = rows * (cardSize + 10) - 10;
    
    const startX = (this.gameWidth - gridWidth) / 2 + cardSize / 2;
    const startY = 180;
    
    rewards.forEach((reward, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * (cardSize + 10);
      const y = startY + row * (cardSize + 10);
      
      // Create card
      const card = new Container();
      card.x = x;
      card.y = y;
      card.alpha = 0;
      card.scale.set(0.1);
      this.animationArea.addChild(card);
      
      // Closed box
      const closedBox = new Container();
      const boxBg = new Graphics();
      boxBg.roundRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 8)
        .fill({ color: Colors.ROBOT_ELEMENT })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN });
      
      const boxLid = new Graphics();
      boxLid.roundRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize * 0.3, 8)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.8 });
      
      const boxEmoji = new Text({ text: '🎁', style: { fontSize: cardSize * 0.5 } });
      boxEmoji.anchor.set(0.5);
      
      closedBox.addChild(boxBg, boxLid, boxEmoji);
      card.addChild(closedBox);
      
      // Opened card (hidden initially)
      const openedCard = new Container();
      openedCard.visible = false;
      
      const cardBg = new Graphics();
      cardBg.roundRect(-cardSize / 2, -cardSize / 2, cardSize, cardSize, 8)
        .fill({ color: Colors.ROBOT_ELEMENT })
        .stroke({ width: 2, color: reward.color });
      
      const rewardEmoji = new Text({
        text: reward.emoji,
        style: { fontSize: cardSize * 0.45 }
      });
      rewardEmoji.anchor.set(0.5);
      rewardEmoji.y = -cardSize * 0.15;
      
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
      
      openedCard.addChild(cardBg, rewardEmoji, amount);
      card.addChild(openedCard);
      
      // Animate appearance
      gsap.to(card, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        delay: i * 0.08,
        ease: 'back.out(2)',
        onComplete: () => {
          // Shake
          gsap.to(closedBox, {
            rotation: 0.15,
            duration: 0.04,
            yoyo: true,
            repeat: 5,
            delay: 0.2,
            onComplete: () => {
              // Open
              gsap.to(boxLid, {
                y: -cardSize * 0.8,
                rotation: 0.3,
                alpha: 0,
                duration: 0.3,
                ease: 'power2.out'
              });
              
              gsap.to(boxEmoji, {
                scale: 1.5,
                alpha: 0,
                duration: 0.3,
                onComplete: () => {
                  closedBox.visible = false;
                  openedCard.visible = true;
                  openedCard.scale.set(0.3);
                  gsap.to(openedCard, {
                    scale: 1,
                    duration: 0.3,
                    ease: 'back.out(2)'
                  });
                }
              });
            }
          });
        }
      });
    });
  }

  private openBoxes(count: number): void {
    if (this.isOpening || this.tickets < count) return;
    
    this.isOpening = true;
    this.tickets -= count;
    
    if (this.ticketsText) {
      this.ticketsText.text = `🎫 Tickets: ${this.tickets}`;
    }
    
    if (this.summaryText) {
      this.summaryText.visible = false;
    }
    
    this.updateButtonStates();
    
    // Generate rewards
    const rewards: LootBoxReward[] = [];
    for (let i = 0; i < count; i++) {
      const randomReward = this.possibleRewards[Math.floor(Math.random() * this.possibleRewards.length)];
      rewards.push(randomReward);
    }
    
    // Show rewards in popup
    navigation.presentPopup(LootBoxRewardsPopup, { rewards });
    
    // Reset state after showing popup
    setTimeout(() => {
      this.isOpening = false;
      this.updateButtonStates();
    }, 500);
  }

  private showSummary(rewards: LootBoxReward[]): void {
    const aggregated: { [key: string]: { emoji: string; amount: number; label: string } } = {};
    rewards.forEach(reward => {
      const key = reward.reward.type;
      if (!aggregated[key]) {
        aggregated[key] = { emoji: reward.emoji, amount: 0, label: reward.label };
      }
      aggregated[key].amount += reward.reward.amount;
    });
    
    if (this.summaryText) {
      let text = '🎉 Total: ';
      const parts = Object.values(aggregated).map(r => `${r.emoji}${r.amount}`);
      text += parts.join(' · ');
      this.summaryText.text = text;
      this.summaryText.alpha = 0;
      this.summaryText.visible = true;
      gsap.to(this.summaryText, { alpha: 1, duration: 0.5 });
    }
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
    const buttonWidth = 80;
    const buttonHeight = 42;
    
    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    this.container.addChild(backButton);
  }

  update(): void {
  }
}
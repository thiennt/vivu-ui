import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

interface SpinSegment {
  label: string;
  emoji: string;
  color: string;
  reward: {
    type: string;
    amount: number;
  };
}

export class RewardSpinScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private wheel: Container;
  private pointer!: Graphics;
  private isSpinning: boolean = false;
  private currentRotation: number = 0;
  private resultText: Text | null = null;
  private spinButton: Container | null = null;
  
  // Wheel segments
  private segments: SpinSegment[] = [
    { label: 'Gold', emoji: '💰', color: Colors.GOLD, reward: { type: 'gold', amount: 100 } },
    { label: 'Experience', emoji: '⭐', color: Colors.BLUE_SKY, reward: { type: 'exp', amount: 50 } },
    { label: 'Dice', emoji: '🎲', color: Colors.PURPLE_BRIGHT, reward: { type: 'dice', amount: 5 } },
    { label: 'Gold', emoji: '💰', color: Colors.GOLD_BRIGHT, reward: { type: 'gold', amount: 200 } },
    { label: 'Energy', emoji: '⚡', color: Colors.ORANGE_EMBER, reward: { type: 'energy', amount: 10 } },
    { label: 'Experience', emoji: '⭐', color: Colors.BLUE_BRIGHT, reward: { type: 'exp', amount: 100 } },
    { label: 'Dice', emoji: '🎲', color: Colors.PURPLE_MYSTIC, reward: { type: 'dice', amount: 10 } },
    { label: 'Gold', emoji: '💰', color: Colors.GOLD_ANCIENT, reward: { type: 'gold', amount: 500 } },
  ];

  constructor() {
    super();
    
    this.container = new Container();
    this.addChild(this.container);
    
    this.wheel = new Container();
    
    this.createUI();
  }

  private createUI(): void {
    this.container.removeChildren();
    this.createBackground();
    this.createHeader();
    this.createWheel();
    this.createPointer();
    this.createSpinButton();
    this.createBackButton();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.createUI();
  }

  async show(): Promise<void> {
    // Reset state when showing
    this.isSpinning = false;
    this.currentRotation = 0;
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
      .fill({ color: Colors.BROWN_DARKEST, alpha: 1.0 });
    
    // Overlay texture
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.3 });
    
    // Add mystical particles
    for (let i = 0; i < 30; i++) {
      const particle = new Graphics();
      const size = 1 + Math.random() * 2.5;
      particle.circle(Math.random() * this.gameWidth, Math.random() * this.gameHeight, size)
        .fill({ color: Colors.GOLD_BRIGHT, alpha: 0.2 + Math.random() * 0.4 });
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
      .fill({ color: Colors.BROWN, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.GOLD });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const title = new Text({
      text: '🎡 Reward Spin Wheel 🎡',
      style: {
        fontFamily: 'Kalam',
        fontSize: 26,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 2 },
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
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
      text: '✨ Spin to win amazing rewards! ✨',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.GOLD,
        align: 'center'
      }
    });
    subtitle.anchor.set(0.5);
    subtitle.x = this.gameWidth / 2;
    subtitle.y = bannerY + bannerHeight + 14;
    
    this.container.addChild(banner, title, subtitle);
  }

  private createWheel(): void {
    // Clear existing wheel
    this.wheel.removeChildren();
    
    const wheelRadius = Math.min(140, (this.gameWidth - 80) / 2, (this.gameHeight - 350) / 2);
    const centerX = this.gameWidth / 2;
    const centerY = 230;
    
    // Wheel shadow
    const shadow = new Graphics();
    shadow.circle(centerX + 4, centerY + 4, wheelRadius + 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    this.container.addChild(shadow);
    
    // Draw wheel segments
    const segmentAngle = (Math.PI * 2) / this.segments.length;
    
    for (let i = 0; i < this.segments.length; i++) {
      const segment = this.segments[i];
      const startAngle = i * segmentAngle - Math.PI / 2;
      const endAngle = startAngle + segmentAngle;
      
      // Draw segment
      const segmentGraphics = new Graphics();
      segmentGraphics.moveTo(0, 0);
      segmentGraphics.arc(0, 0, wheelRadius, startAngle, endAngle);
      segmentGraphics.lineTo(0, 0);
      segmentGraphics.fill({ color: segment.color, alpha: 0.9 });
      segmentGraphics.stroke({ width: 3, color: Colors.GOLD });
      
      this.wheel.addChild(segmentGraphics);
      
      // Add text and emoji
      const midAngle = startAngle + segmentAngle / 2;
      const textRadius = wheelRadius * 0.65;
      const textX = Math.cos(midAngle) * textRadius;
      const textY = Math.sin(midAngle) * textRadius;
      
      // Emoji
      const emoji = new Text({
        text: segment.emoji,
        style: {
          fontFamily: 'Kalam',
          fontSize: 24,
        }
      });
      emoji.anchor.set(0.5);
      emoji.x = textX;
      emoji.y = textY - 10;
      emoji.rotation = midAngle + Math.PI / 2;
      this.wheel.addChild(emoji);
      
      // Label
      const label = new Text({
        text: segment.label,
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fontWeight: 'bold',
          fill: Colors.WHITE,
          stroke: { color: Colors.BROWN_DARKEST, width: 2 }
        }
      });
      label.anchor.set(0.5);
      label.x = textX;
      label.y = textY + 10;
      label.rotation = midAngle + Math.PI / 2;
      this.wheel.addChild(label);
    }
    
    // Outer rim
    const rim = new Graphics();
    rim.circle(0, 0, wheelRadius)
      .stroke({ width: 4, color: Colors.GOLD_BRIGHT });
    rim.circle(0, 0, wheelRadius - 5)
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.6 });
    this.wheel.addChild(rim);
    
    // Center hub
    const hub = new Graphics();
    hub.circle(0, 0, 20)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.GOLD_BRIGHT });
    hub.circle(0, 0, 12)
      .fill({ color: Colors.GOLD, alpha: 0.8 });
    this.wheel.addChild(hub);
    
    // Position wheel
    this.wheel.x = centerX;
    this.wheel.y = centerY;
    this.container.addChild(this.wheel);
  }

  private createPointer(): void {
    const centerX = this.gameWidth / 2;
    const centerY = 230;
    const wheelRadius = Math.min(140, (this.gameWidth - 80) / 2, (this.gameHeight - 350) / 2);
    
    this.pointer = new Graphics();
    
    // Arrow pointer at the top
    const pointerSize = 25;
    this.pointer.moveTo(centerX, centerY - wheelRadius - 15)
      .lineTo(centerX - pointerSize / 2, centerY - wheelRadius - 15 - pointerSize)
      .lineTo(centerX, centerY - wheelRadius - 15 - pointerSize + 10)
      .lineTo(centerX + pointerSize / 2, centerY - wheelRadius - 15 - pointerSize)
      .lineTo(centerX, centerY - wheelRadius - 15)
      .fill({ color: Colors.RED_BRIGHT, alpha: 1 })
      .stroke({ width: 2, color: Colors.GOLD_BRIGHT });
    
    this.container.addChild(this.pointer);
  }

  private createSpinButton(): void {
    const buttonWidth = Math.min(200, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 50;
    const buttonX = (this.gameWidth - buttonWidth) / 2;
    const buttonY = 420;
    
    this.spinButton = this.createFantasyButton(
      '🎯 SPIN THE WHEEL',
      buttonX,
      buttonY,
      buttonWidth,
      buttonHeight,
      () => this.performSpin(),
      false
    );

    this.container.addChild(this.spinButton);
    
    // Result text (initially hidden)
    this.resultText = new Text({
      text: '',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.GOLD_BRIGHT,
        stroke: { color: Colors.BROWN_DARK, width: 2 },
        align: 'center',
        dropShadow: {
          color: Colors.GOLD,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    this.resultText.anchor.set(0.5);
    this.resultText.x = this.gameWidth / 2;
    this.resultText.y = buttonY + 70;
    this.resultText.visible = false;
    this.container.addChild(this.resultText);
  }

  private performSpin(): void {
    if (this.isSpinning) return;
    
    this.isSpinning = true;
    if (this.resultText) {
      this.resultText.visible = false;
    }
    
    // Disable spin button
    if (this.spinButton) {
      this.spinButton.eventMode = 'none';
      this.spinButton.alpha = 0.6;
    }
    
    // Random final rotation (multiple full rotations + random position)
    const fullRotations = 5 + Math.random() * 3; // 5-8 full rotations
    const randomSegment = Math.floor(Math.random() * this.segments.length);
    const segmentAngle = (Math.PI * 2) / this.segments.length;
    const finalRotation = this.currentRotation + (fullRotations * Math.PI * 2) + (randomSegment * segmentAngle);
    
    // Animate wheel spinning with easing
    gsap.to(this.wheel, {
      rotation: finalRotation,
      duration: 4,
      ease: "power4.out",
      onUpdate: () => {
        this.currentRotation = this.wheel.rotation;
      },
      onComplete: () => {
        this.isSpinning = false;
        
        // Calculate which segment won (pointer is at top)
        const normalizedRotation = (this.currentRotation % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        // Add PI/2 because wheel starts at -PI/2 and pointer is at top
        const pointerAngle = (Math.PI / 2);
        const winningIndex = Math.floor(((pointerAngle - normalizedRotation + Math.PI * 2) % (Math.PI * 2)) / segmentAngle) % this.segments.length;
        const winningSegment = this.segments[winningIndex];
        
        // Show result
        if (this.resultText) {
          this.resultText.text = `🎉 You won ${winningSegment.emoji}\n${winningSegment.reward.amount} ${winningSegment.label}! 🎉`;
          this.resultText.visible = true;
        }
        
        // Re-enable spin button
        if (this.spinButton) {
          this.spinButton.eventMode = 'static';
          this.spinButton.alpha = 1.0;
        }
      }
    });
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 45;
    
    const backButton = this.createFantasyButton(
      '← Back',
      (this.gameWidth - buttonWidth) / 2,
      this.gameHeight - buttonHeight - 20,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(HomeScene)
    );

    this.container.addChild(backButton);
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void,
    disabled: boolean = false
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    
    const mainColor = disabled ? Colors.GRAY : Colors.BROWN;
    const strokeColor = disabled ? Colors.GRAY_MID : Colors.GOLD;
    const highlightColor = disabled ? Colors.GRAY_LIGHT : Colors.GOLD_BRIGHT;
    const textColor = disabled ? Colors.GRAY_LIGHTER : Colors.WHITE;
    
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: Colors.BLACK, alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: mainColor, alpha: 0.95 })
      .stroke({ width: 2, color: strokeColor });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: highlightColor, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: textColor,
        stroke: { color: Colors.BROWN_DARK, width: 2 }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    
    if (!disabled) {
      button.eventMode = 'static';
      button.cursor = 'pointer';
      
      button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(2, 2, width, height, 8)
          .fill({ color: Colors.BLACK, alpha: 0.4 });
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.BROWN_LIGHT, alpha: 0.95 })
          .stroke({ width: 2, color: Colors.GOLD_BRIGHT });
        bg.roundRect(2, 2, width - 4, height - 4, 6)
          .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.9 });
        button.scale.set(1.02);
      });
      
      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(2, 2, width, height, 8)
          .fill({ color: Colors.BLACK, alpha: 0.4 });
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.BROWN, alpha: 0.95 })
          .stroke({ width: 2, color: Colors.GOLD });
        bg.roundRect(2, 2, width - 4, height - 4, 6)
          .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });
        button.scale.set(1.0);
      });
      
      button.on('pointerdown', onClick);
    }
    
    return button;
  }

  update(): void {
    // No continuous update needed
  }
}

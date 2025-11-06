import { Colors, FontFamily } from '@/utils/cssStyles';
import { Container, Graphics, Text, Ticker } from "pixi.js";
import { BattlePhaseName } from "@/types";
import { gsap } from "gsap";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logGlow: Graphics;
  private borderPulse: Graphics;
  private logTitle: Text;
  private phaseText: Text;
  private turnText: Text;
  private notificationText: Text;
  private notificationContainer: Container;
  private notificationBg: Graphics;

  private zoneWidth: number = 0;
  private zoneHeight: number = 0;
  private time: number = 0;
  private currentPlayer: number = 1;

  constructor() {
    super();

    this.logGlow = new Graphics();
    //this.addChild(this.logGlow);

    this.borderPulse = new Graphics();
    //this.addChild(this.borderPulse);

    this.logBg = new Graphics();
    this.addChild(this.logBg);

    this.logTitle = new Text();
    this.addChild(this.logTitle);

    this.phaseText = new Text();
    this.addChild(this.phaseText);

    this.turnText = new Text();
    this.addChild(this.turnText);

    this.notificationContainer = new Container();

    this.notificationBg = new Graphics();
    this.notificationContainer.addChild(this.notificationBg);

    this.notificationText = new Text();
    this.notificationContainer.addChild(this.notificationText);

    this.notificationContainer.alpha = 0;
    this.addChild(this.notificationContainer);
  }

  resize(width: number, height: number): void {
    this.zoneWidth = width;
    this.zoneHeight = height;

    this.drawBackground();

    // Golden title - easier to read
    this.logTitle.text = '📜 BATTLE LOG 📜';
    this.logTitle.style = {
      fontFamily: FontFamily.PRIMARY,
      fontSize: 18,
      fontWeight: 'bold',
      fill: Colors.GOLD_BRIGHT,
      stroke: { color: Colors.BLACK, width: 3 },
      align: 'center',
      dropShadow: {
        color: Colors.BLACK,
        blur: 4,
        angle: Math.PI / 4,
        distance: 2,
        alpha: 0.8
      }
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = height * 0.2;

    // Turn display - bright and readable
    this.turnText.style = {
      fontFamily: FontFamily.PRIMARY,
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.WHITE,
      stroke: { color: Colors.BLACK, width: 2.5 },
      align: 'center',
      dropShadow: {
        color: Colors.BLACK,
        blur: 3,
        angle: Math.PI / 4,
        distance: 2,
        alpha: 0.7
      }
    };
    this.turnText.anchor.set(0.5);
    this.turnText.x = width / 2;
    this.turnText.y = height * 0.45;

    // Phase text - bright with strong contrast
    this.phaseText.style = {
      fontFamily: FontFamily.PRIMARY,
      fontSize: 13,
      fontWeight: 'bold',
      fill: Colors.WHITE,
      stroke: { color: Colors.BLACK, width: 2 },
      align: 'center',
      dropShadow: {
        color: Colors.BLACK,
        blur: 2,
        angle: Math.PI / 4,
        distance: 1,
        alpha: 0.6
      }
    };
    this.phaseText.anchor.set(0.5);
    this.phaseText.x = width / 2;
    this.phaseText.y = height * 0.68;

    // Notification styling - bright colors
    this.notificationText.style = {
      fontFamily: FontFamily.PRIMARY,
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.WHITE,
      stroke: { color: Colors.BLACK, width: 3 },
      align: 'center',
      dropShadow: {
        color: Colors.BLACK,
        blur: 4,
        angle: 0,
        distance: 0,
        alpha: 0.8
      }
    };
    this.notificationText.anchor.set(0.5);
    this.notificationContainer.x = width / 2;
    this.notificationContainer.y = height * 0.85;
  }

  private drawBackground(): void {
    this.logGlow.clear();
    this.borderPulse.clear();
    this.logBg.clear();

    const width = this.zoneWidth;
    const height = this.zoneHeight;

    const playerColor = this.currentPlayer === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;

    // Outer mystical glow (team-colored)
    this.logGlow.roundRect(-4, -4, width + 8, height + 8, 12)
      .fill({ color: playerColor, alpha: 0.2 });

    // Pulsing animated border
    this.borderPulse.roundRect(-2, -2, width + 4, height + 4, 10)
      .stroke({ width: 3, color: playerColor, alpha: 0.4 });

    // Dark brown/wooden background - much better contrast
    this.logBg.roundRect(0, 0, width, height, 8)
      .fill({ color: Colors.BROWN_DARKER, alpha: 0.95 });

    // Darker inner layer
    //this.logBg.roundRect(2, 2, width - 4, height - 4, 6)
      //.fill({ color: Colors.BROWN_DARK, alpha: 0.7 });

    // Very subtle gradient
    const segmentHeight = height / 8;
    for (let i = 0; i < 8; i++) {
      const alpha = 0.05 - (i * 0.006);
      //this.logBg.rect(4, 4 + i * segmentHeight, width - 8, segmentHeight)
        //.fill({ color: Colors.BLACK, alpha });
    }

    // Golden border (main)
    this.logBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 3, color: Colors.GOLD, alpha: 0.8 });

    // Team-colored inner border (subtle)
    //this.logBg.roundRect(3, 3, width - 6, height - 6, 5)
      //.stroke({ width: 2, color: playerColor, alpha: 0.5 });

    // Decorative golden corner accents
    this.drawParchmentCorners(this.logBg, 0, 0, width, height, Colors.GOLD_BRIGHT);

    // Top and bottom golden accent bars
    //this.logBg.roundRect(12, 8, width - 24, 3, 1.5)
      //.fill({ color: Colors.GOLD_BRIGHT, alpha: 0.6 })
      //.stroke({ width: 1, color: Colors.GOLD, alpha: 0.4 });

    //this.logBg.roundRect(12, height - 11, width - 24, 3, 1.5)
      //.fill({ color: Colors.GOLD_BRIGHT, alpha: 0.6 })
      //.stroke({ width: 1, color: Colors.GOLD, alpha: 0.4 });
  }

  private drawParchmentCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 10;
    
    // Top-left corner
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.6 });
    graphics.circle(x + 3, y + 3, 1.5).fill({ color: color, alpha: 0.7 });
    
    // Top-right corner
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.6 });
    graphics.circle(x + width - 3, y + 3, 1.5).fill({ color: color, alpha: 0.7 });
    
    // Bottom-left corner
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.6 });
    graphics.circle(x + 3, y + height - 3, 1.5).fill({ color: color, alpha: 0.7 });
    
    // Bottom-right corner
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.6 });
    graphics.circle(x + width - 3, y + height - 3, 1.5).fill({ color: color, alpha: 0.7 });
  }

  updatePhase(phase: BattlePhaseName, currentPlayer: number, currentTurn?: number): void {
    this.currentPlayer = currentPlayer;

    const phaseNames: Record<string, string> = {
      'start_turn': '🎲 Turn Start',
      'draw_phase': '📋 Draw Phase',
      'main_phase': '⚔️ Main Phase',
      'end_turn': '🏁 End Turn',
      'ai_turn': '🤖 Enemy Turn'
    };

    // Update phase text - keep white for readability
    const playerName = currentPlayer === 1 ? 'PLAYER' : 'ENEMY';

    this.phaseText.text = `${playerName} - ${phaseNames[phase] || phase}`;

    // Update turn text if provided
    if (currentTurn !== undefined) {
      this.turnText.text = `⏱ TURN ${currentTurn}`;
    }

    // Redraw background with current player color
    this.drawBackground();
  }

  /**
   * Update method for animations - called every frame
   */
  public update(ticker: Ticker): void {
    this.time += ticker.deltaTime * 0.05;

    // Animate border pulse (mystical breathing effect)
    const pulse = Math.sin(this.time) * 0.3 + 0.7;
    this.borderPulse.alpha = pulse;
  }

  showNotification(message: string, color?: number | string, duration: number = 2000): void {
    this.notificationText.text = message;

    const notificationColor = color !== undefined ? color : Colors.SUCCESS;

    // Draw fantasy notification badge with dark background
    this.notificationBg.clear();

    const padding = 14;
    const bgWidth = this.notificationText.width + padding * 2;
    const bgHeight = this.notificationText.height + padding;

    // Outer glow
    this.notificationBg.roundRect(-bgWidth / 2 - 3, -bgHeight / 2 - 3, bgWidth + 6, bgHeight + 6, 8)
      .fill({ color: notificationColor, alpha: 0.3 });

    // Dark badge background for better contrast
    this.notificationBg.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 6)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: notificationColor, alpha: 0.9 });

    // Inner darker texture
    this.notificationBg.roundRect(-bgWidth / 2 + 2, -bgHeight / 2 + 2, bgWidth - 4, bgHeight - 4, 4)
      .fill({ color: Colors.BROWN_DARKEST, alpha: 0.6 });

    // Inner highlight border
    this.notificationBg.roundRect(-bgWidth / 2 + 2, -bgHeight / 2 + 2, bgWidth - 4, bgHeight - 4, 4)
      .stroke({ width: 1, color: notificationColor, alpha: 0.7 });

    // Cancel any existing animation
    gsap.killTweensOf(this.notificationContainer);

    // Enhanced bounce-in with rotation
    this.notificationContainer.alpha = 0;
    this.notificationContainer.scale.set(0.3);
    this.notificationContainer.rotation = -0.2;

    gsap.timeline()
      .to(this.notificationContainer, {
        alpha: 1,
        scale: 1,
        rotation: 0,
        duration: 0.5,
        ease: 'back.out(2.5)'
      })
      .to(this.notificationContainer, {
        alpha: 0,
        scale: 0.8,
        rotation: 0.1,
        duration: 0.4,
        delay: duration / 1000,
        ease: 'back.in(1.5)'
      });
  }
}
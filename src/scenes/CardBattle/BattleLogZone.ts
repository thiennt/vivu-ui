import { Colors } from "@/utils/colors";
import { Container, Graphics, Text, Ticker } from "pixi.js";
import { BattlePhaseName } from "@/types";
import { gsap } from "gsap";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logGlow: Graphics; // NEW: Glow effect layer
  private borderPulse: Graphics; // NEW: Animated border
  private logTitle: Text;
  private phaseText: Text;
  private turnText: Text;
  private notificationText: Text;
  private notificationContainer: Container;
  private notificationBg: Graphics; // NEW: Background for notifications

  private zoneWidth: number = 0;
  private zoneHeight: number = 0;
  private time: number = 0;
  private currentPlayer: number = 1;

  constructor() {
    super();

    // Add glow layer first (behind everything)
    this.logGlow = new Graphics();
    this.addChild(this.logGlow);

    // Add animated border pulse
    this.borderPulse = new Graphics();
    this.addChild(this.borderPulse);

    this.logBg = new Graphics();
    this.addChild(this.logBg);

    this.logTitle = new Text();
    this.addChild(this.logTitle);

    this.phaseText = new Text();
    this.addChild(this.phaseText);

    this.turnText = new Text();
    this.addChild(this.turnText);

    // Notification container for temporary messages
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

    // Enhanced title with glow
    this.logTitle.text = '⚔️ BATTLE LOG ⚔️';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 18,
      fontWeight: 'bold',
      fill: 0xffd700, // Gold color
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 4,
        angle: Math.PI / 4,
        distance: 2,
        alpha: 0.6
      }
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = height * 0.2;

    // Enhanced turn text
    this.turnText.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 3,
        angle: Math.PI / 4,
        distance: 1,
        alpha: 0.5
      }
    };
    this.turnText.anchor.set(0.5);
    this.turnText.x = width / 2;
    this.turnText.y = height * 0.45;

    // Enhanced phase text with dynamic color
    this.phaseText.style = {
      fontFamily: 'Kalam',
      fontSize: 13,
      fill: Colors.TEXT_SECONDARY,
      align: 'center',
      dropShadow: {
        color: 0x000000,
        blur: 2,
        angle: Math.PI / 4,
        distance: 1,
        alpha: 0.4
      }
    };
    this.phaseText.anchor.set(0.5);
    this.phaseText.x = width / 2;
    this.phaseText.y = height * 0.68;

    // Notification styling
    this.notificationText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.SUCCESS,
      align: 'center',
      dropShadow: {
        color: 0x000000,
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

    // Outer glow
    this.logGlow.roundRect(-4, -4, width + 8, height + 8, 12)
      .fill({ color: playerColor, alpha: 0.15 });

    // Pulsing border layer
    this.borderPulse.roundRect(-2, -2, width + 4, height + 4, 10)
      .stroke({ width: 2, color: playerColor, alpha: 0.4 });

    // Dark neutral background
    const darkBg = 0x1a1a2e;
    this.logBg.roundRect(0, 0, width, height, 8)
      .fill({ color: darkBg, alpha: 0.92 });

    // Subtle gradient overlay (team-colored)
    const segmentHeight = height / 8;
    for (let i = 0; i < 8; i++) {
      const alpha = 0.12 - (i * 0.015);
      this.logBg.rect(4, 4 + i * segmentHeight, width - 8, segmentHeight)
        .fill({ color: playerColor, alpha });
    }

    // Inner shadow for depth
    this.logBg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: 0x000000, alpha: 0.5 });

    // Team-colored border (prominent)
    this.logBg.roundRect(0, 0, width, height, 8)
      .stroke({ width: 3, color: playerColor, alpha: 0.85 });

    // Inner highlight
    this.logBg.roundRect(3, 3, width - 6, height - 6, 5)
      .stroke({ width: 1, color: playerColor, alpha: 0.5 });

    // Gold accent bars (decorative & prominent)
    this.logBg.roundRect(10, 6, width - 20, 4, 2)
      .fill({ color: 0xffd700, alpha: 0.7 })
      .stroke({ width: 1, color: 0xffd700, alpha: 0.3 });

    this.logBg.roundRect(10, height - 10, width - 20, 4, 2)
      .fill({ color: 0xffd700, alpha: 0.7 })
      .stroke({ width: 1, color: 0xffd700, alpha: 0.3 });
  }

  updatePhase(phase: BattlePhaseName, currentPlayer: number, currentTurn?: number): void {
    this.currentPlayer = currentPlayer;

    const phaseNames: Record<string, string> = {
      'start_turn': '🎲 Turn Start',
      'draw_phase': '📋 Draw Phase',
      'main_phase': '⚔️ Main Phase',
      'end_turn': '🏁 End Turn',
      'ai_turn': '🤖 AI Turn'
    };

    // Update phase text with player-specific styling
    const playerName = currentPlayer === 1 ? 'PLAYER' : 'ENEMY';
    const playerColor = currentPlayer === 1 ? Colors.TEAM_ALLY : Colors.TEAM_ENEMY;

    this.phaseText.text = `${playerName} - ${phaseNames[phase] || phase}`;
    this.phaseText.style.fill = playerColor;

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

    // Animate border pulse
    const pulse = Math.sin(this.time) * 0.3 + 0.7;
    this.borderPulse.alpha = pulse;
  }

  showNotification(message: string, color?: number | string, duration: number = 2000): void {
    // Update notification text
    this.notificationText.text = message;

    const notificationColor = color !== undefined ? color : Colors.SUCCESS;
    this.notificationText.style.fill = notificationColor;

    // Draw notification background
    this.notificationBg.clear();

    // Measure text to size background
    const padding = 12;
    const bgWidth = this.notificationText.width + padding * 2;
    const bgHeight = this.notificationText.height + padding;

    // Background with glow
    this.notificationBg.roundRect(-bgWidth / 2 - 2, -bgHeight / 2 - 2, bgWidth + 4, bgHeight + 4, 6)
      .fill({ color: notificationColor, alpha: 0.2 });

    this.notificationBg.roundRect(-bgWidth / 2, -bgHeight / 2, bgWidth, bgHeight, 4)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.95 })
      .stroke({ width: 2, color: notificationColor, alpha: 0.8 });

    // Cancel any existing animation
    gsap.killTweensOf(this.notificationContainer);

    // Enhanced bounce-in animation
    this.notificationContainer.alpha = 0;
    this.notificationContainer.scale.set(0.5);

    gsap.timeline()
      .to(this.notificationContainer, {
        alpha: 1,
        scale: 1,
        duration: 0.4,
        ease: 'back.out(2)'
      })
      .to(this.notificationContainer, {
        alpha: 0,
        scale: 0.8,
        duration: 0.4,
        delay: duration / 1000,
        ease: 'back.in(1.5)'
      });
  }
}
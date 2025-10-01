import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { BattlePhaseName } from "@/types";
import { gsap } from "gsap";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logTitle: Text;
  private phaseText: Text;
  private turnText: Text;
  private notificationText: Text;
  private notificationContainer: Container;

  constructor() {
    super();
    
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
    this.notificationText = new Text();
    this.notificationContainer.addChild(this.notificationText);
    this.notificationContainer.alpha = 0;
    this.addChild(this.notificationContainer);
  }

  resize(width: number, height: number): void {
    this.logBg.clear();
    
    // Simplified battle log background
    // Main background
    this.logBg.roundRect(0, 0, width, height, 8)
      .fill(Colors.PANEL_BACKGROUND)
      .stroke({ width: 1, color: Colors.UI_BORDER, alpha: 0.6 });

    // Simple title without excessive styling
    this.logTitle.text = 'Battle Log';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.TEXT_PRIMARY,
      align: 'center'
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = height * 0.25;

    // Turn text (above phase)
    this.turnText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fill: Colors.TEXT_PRIMARY,
      align: 'center'
    };
    this.turnText.anchor.set(0.5);
    this.turnText.x = width / 2;
    this.turnText.y = height * 0.5;

    // Simple phase text (below turn)
    this.phaseText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_SECONDARY,
      align: 'center'
    };
    this.phaseText.anchor.set(0.5);
    this.phaseText.x = width / 2;
    this.phaseText.y = height * 0.7;

    // Notification text styling
    this.notificationText.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: Colors.SUCCESS,
      align: 'center'
    };
    this.notificationText.anchor.set(0.5);
    this.notificationContainer.x = width / 2;
    this.notificationContainer.y = height * 0.85;
  }

  updatePhase(phase: BattlePhaseName, currentPlayer: number, currentTurn?: number): void {
    const phaseNames: Record<string, string> = {
      'start_turn': 'Turn Start',
      'draw_phase': 'Draw Phase', 
      'main_phase': 'Main Phase',
      'end_turn': 'End Turn',
      'ai_turn': 'AI Turn'
    };
    
    this.phaseText.text = `Player ${currentPlayer} - ${phaseNames[phase] || phase}`;
    
    // Update turn text if provided
    if (currentTurn !== undefined) {
      this.turnText.text = `Turn ${currentTurn}`;
    }
  }

  showNotification(message: string, color?: number | string, duration: number = 2000): void {
    // Update notification text
    this.notificationText.text = message;
    if (color !== undefined) {
      this.notificationText.style.fill = color;
    } else {
      this.notificationText.style.fill = Colors.SUCCESS;
    }

    // Cancel any existing animation
    gsap.killTweensOf(this.notificationContainer);

    // Animate notification
    this.notificationContainer.alpha = 0;
    gsap.timeline()
      .to(this.notificationContainer, {
        alpha: 1,
        duration: 0.3,
        ease: 'power2.out'
      })
      .to(this.notificationContainer, {
        alpha: 0,
        duration: 0.5,
        delay: duration / 1000,
        ease: 'power2.in'
      });
  }
}
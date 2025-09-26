import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { BattlePhaseName } from "@/types";
import { VisualEffects } from "@/utils/visualEffects";

export class BattleLogZone extends Container {
  private logBg: Graphics;
  private logTitle: Text;
  private phaseText: Text;

  constructor() {
    super();
    
    this.logBg = new Graphics();
    this.addChild(this.logBg);

    this.logTitle = new Text();
    this.addChild(this.logTitle);

    this.phaseText = new Text();
    this.addChild(this.phaseText);
  }

  resize(width: number, height: number): void {
    this.logBg.clear();
    
    // Use enhanced mystical frame instead of simple rectangle
    const mysticalFrame = VisualEffects.createMysticalFrame(width, height);
    this.logBg.addChild(mysticalFrame);

    this.logTitle.text = 'Battle Log';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.DECORATION_FRAME,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
        angle: Math.PI / 4,
        distance: 2
      }
    };
    this.logTitle.anchor.set(0.5);
    this.logTitle.x = width / 2;
    this.logTitle.y = height / 3;

    this.phaseText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_PRIMARY,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 1,
        angle: Math.PI / 4,
        distance: 1
      }
    };
    this.phaseText.anchor.set(0.5);
    this.phaseText.x = width / 2;
    this.phaseText.y = (height * 2) / 3;
  }

  updatePhase(phase: BattlePhaseName, currentPlayer: number): void {
    const phaseNames: Record<string, string> = {
      'start_turn': 'Turn Start',
      'draw_phase': 'Draw Phase', 
      'main_phase': 'Main Phase',
      'end_turn': 'End Turn',
      'ai_turn': 'AI Turn'
    };
    
    this.phaseText.text = `Player ${currentPlayer} - ${phaseNames[phase] || phase}`;
  }
}
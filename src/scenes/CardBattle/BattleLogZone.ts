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
    
    // Create enhanced mystical frame directly
    this.logBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY)
      .stroke({ width: 3, color: Colors.DECORATION_MAGIC });
    
    // Add corner decorations
    const cornerSize = 16;
    
    // Top corners
    this.logBg.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    this.logBg.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    // Bottom corners
    this.logBg.moveTo(2, height - cornerSize)
      .lineTo(2, height - 2)
      .lineTo(cornerSize, height - 2)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });
    
    this.logBg.moveTo(width - 2, height - cornerSize)
      .lineTo(width - 2, height - 2)
      .lineTo(width - cornerSize, height - 2)
      .stroke({ width: 2, color: Colors.DECORATION_FRAME });

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
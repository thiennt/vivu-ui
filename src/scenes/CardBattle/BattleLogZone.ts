import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { BattlePhaseName } from "@/types";

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
    this.logTitle.y = height / 3;

    // Simple phase text
    this.phaseText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_SECONDARY,
      align: 'center'
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
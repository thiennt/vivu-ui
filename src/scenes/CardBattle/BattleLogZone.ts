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
    
    // Use the enhanced mystical frame
    // Shadow for depth
    this.logBg.roundRect(2, 2, width, height, 12)
      .fill({ color: Colors.BATTLE_SHADOW_DEEP, alpha: 0.6 });
    
    // Main background with battle theme
    this.logBg.roundRect(0, 0, width, height, 12)
      .fill(Colors.BATTLEFIELD_PRIMARY);
    
    // Inner mystical glow
    this.logBg.roundRect(2, 2, width - 4, height - 4, 10)
      .stroke({ width: 1, color: Colors.MYSTICAL_GLOW, alpha: 0.8 });
    
    // Main mystical border
    this.logBg.roundRect(0, 0, width, height, 12)
      .stroke({ width: 3, color: Colors.BATTLE_MAGIC_AURA });
    
    // Add enhanced corner decorations
    const cornerSize = 18;
    
    // Top corners with mystical energy
    this.logBg.moveTo(cornerSize, 2)
      .lineTo(2, 2)
      .lineTo(2, cornerSize)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    this.logBg.moveTo(width - cornerSize, 2)
      .lineTo(width - 2, 2)
      .lineTo(width - 2, cornerSize)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Bottom corners with mystical energy
    this.logBg.moveTo(2, height - cornerSize)
      .lineTo(2, height - 2)
      .lineTo(cornerSize, height - 2)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    this.logBg.moveTo(width - 2, height - cornerSize)
      .lineTo(width - 2, height - 2)
      .lineTo(width - cornerSize, height - 2)
      .stroke({ width: 3, color: Colors.BATTLE_FRAME_GOLD });
    
    // Add subtle energy orbs in corners
    const orbSize = 4;
    const orbOffset = 6;
    
    // Corner energy orbs
    this.logBg.circle(orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.logBg.circle(width - orbOffset, orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.logBg.circle(orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });
    
    this.logBg.circle(width - orbOffset, height - orbOffset, orbSize)
      .fill({ color: Colors.BATTLE_ENERGY_GLOW, alpha: 0.9 });

    this.logTitle.text = '⚔️ Battle Chronicle ⚔️';
    this.logTitle.style = {
      fontFamily: 'Kalam',
      fontSize: 16,
      fontWeight: 'bold',
      fill: Colors.BATTLE_FRAME_GOLD,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 3,
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
      fill: Colors.MYSTICAL_GLOW,
      align: 'center',
      dropShadow: {
        color: Colors.SHADOW_COLOR,
        blur: 2,
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
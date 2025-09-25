import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { BattlePhaseName } from '@/types';
import { gsap } from 'gsap';

export interface TurnIndicatorOptions {
  width: number;
  height: number;
}

export class TurnIndicator extends Container {
  private currentPlayer: number = 1;
  private currentPhase: BattlePhaseName = 'start_turn';
  private turnNumber: number = 1;
  private options: TurnIndicatorOptions;
  
  private playerText!: Text;
  private phaseText!: Text;
  private turnText!: Text;
  private background!: Graphics;

  constructor(options: TurnIndicatorOptions) {
    super();
    this.options = options;
    this.createIndicator();
  }

  private createIndicator(): void {
    // Background
    this.background = new Graphics()
      .roundRect(0, 0, this.options.width, this.options.height, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ color: Colors.UI_BORDER, width: 2 });
    this.addChild(this.background);

    // Turn number
    this.turnText = new Text({
      text: 'Turn 1',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.ENERGY_TEXT,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    this.turnText.anchor.set(0.5, 0);
    this.turnText.x = this.options.width / 2;
    this.turnText.y = 8;
    this.addChild(this.turnText);

    // Current player
    this.playerText = new Text({
      text: 'Your Turn',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    this.playerText.anchor.set(0.5, 0);
    this.playerText.x = this.options.width / 2;
    this.playerText.y = 28;
    this.addChild(this.playerText);

    // Current phase
    this.phaseText = new Text({
      text: 'Turn Start',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    this.phaseText.anchor.set(0.5, 0);
    this.phaseText.x = this.options.width / 2;
    this.phaseText.y = 48;
    this.addChild(this.phaseText);
  }

  public updateTurn(turnNumber: number, currentPlayer: number): void {
    this.turnNumber = turnNumber;
    this.currentPlayer = currentPlayer;
    
    this.turnText.text = `Turn ${turnNumber}`;
    this.playerText.text = currentPlayer === 1 ? 'Your Turn' : 'Opponent Turn';
    this.playerText.style.fill = currentPlayer === 1 ? Colors.ENERGY_TEXT : 0xff6b6b;
    
    // Update background color based on current player
    const bgColor = currentPlayer === 1 ? 0x4ecdc4 : 0xff6b6b;
    this.background.clear()
      .roundRect(0, 0, this.options.width, this.options.height, 10)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ color: bgColor, width: 2 });

    // Animate turn change
    this.animateTurnChange();
  }

  public updatePhase(phase: BattlePhaseName): void {
    this.currentPhase = phase;
    
    const phaseNames: Record<BattlePhaseName, string> = {
      'start_turn': 'Turn Start',
      'draw_phase': 'Draw Phase',
      'main_phase': 'Main Phase',
      'end_turn': 'End Turn',
      'ai_turn': 'AI Turn'
    };
    
    this.phaseText.text = phaseNames[phase] || phase;
    
    // Animate phase change
    this.animatePhaseChange();
  }

  private animateTurnChange(): void {
    // Pulse animation for turn change
    gsap.to(this.scale, {
      x: 1.1,
      y: 1.1,
      duration: 0.2,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  }

  private animatePhaseChange(): void {
    // Subtle glow animation for phase change
    gsap.to(this.phaseText.style, {
      fontSize: 14,
      duration: 0.15,
      ease: "power2.out",
      yoyo: true,
      repeat: 1,
      onComplete: () => {
        this.phaseText.style.fontSize = 12;
      }
    });
  }

  public getCurrentPlayer(): number {
    return this.currentPlayer;
  }

  public getCurrentPhase(): BattlePhaseName {
    return this.currentPhase;
  }

  public getTurnNumber(): number {
    return this.turnNumber;
  }

  // Show with animation
  public async show(): Promise<void> {
    this.alpha = 0;
    this.scale.set(0.8);
    
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 1,
        duration: 0.3,
        ease: "power2.out"
      });
      
      gsap.to(this.scale, {
        x: 1,
        y: 1,
        duration: 0.3,
        ease: "back.out(1.7)",
        onComplete: resolve
      });
    });
  }

  // Hide with animation
  public async hide(): Promise<void> {
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 0,
        duration: 0.2,
        ease: "power2.in"
      });
      
      gsap.to(this.scale, {
        x: 0.8,
        y: 0.8,
        duration: 0.2,
        ease: "power2.in",
        onComplete: resolve
      });
    });
  }
}
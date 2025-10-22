import { Container, Graphics, Ticker } from 'pixi.js';
import { Colors, hexToPixi } from '@/utils/colors';

/**
 * BattleField - Dynamic animated background for card battles
 * Creates an immersive battlefield atmosphere with gradients, particles, and animations
 */
export class BattleField extends Container {
  private backgroundGradient: Graphics;
  private battlefieldLine: Graphics;
  private vignette: Graphics;
  private cornerDecorations: Graphics[] = [];
  private energyParticles: Array<{
    graphics: Graphics;
    vx: number;
    vy: number;
    life: number;
    maxLife: number;
  }> = [];
  
  private fieldWidth: number = 0;  // Renamed from 'width'
  private fieldHeight: number = 0; // Renamed from 'height'
  private time: number = 0;

  constructor() {
    super();

    // Initialize graphics layers
    this.backgroundGradient = new Graphics();
    this.addChild(this.backgroundGradient);

    this.battlefieldLine = new Graphics();
    this.addChild(this.battlefieldLine);

    this.vignette = new Graphics();
    this.addChild(this.vignette);

    // Create animated energy particles
    this.createEnergyParticles();
  }

  /**
   * Resize and redraw the battlefield
   */
  public resize(width: number, height: number): void {
    this.fieldWidth = width;
    this.fieldHeight = height;

    this.drawBackground();
    this.drawBattlefieldLine();
    this.drawVignette();
    this.drawCornerDecorations();
    this.repositionParticles();
  }

  /**
   * Update animation frame - called every frame from scene
   */
  public update(ticker: Ticker): void {
    this.time += ticker.deltaTime;
    
    // Update battlefield line pulse
    this.updateBattlefieldLine();
    
    // Update energy particles
    this.updateParticles(ticker.deltaTime);
  }

  private drawBackground(): void {
    this.backgroundGradient.clear();

    // Create gradient from top (player 2 side) to bottom (player 1 side)
    const topColor = hexToPixi(Colors.BLUE_NAVY_ALT); // Dark purple (enemy territory)
    const middleColor = hexToPixi(Colors.TEAL_DARKER); // Mid purple-blue (battlefield)
    const bottomColor = hexToPixi(Colors.TEAL_DARKEST); // Dark teal (player territory)

    // Draw gradient rectangles
    const segmentHeight = this.fieldHeight / 20;
    
    for (let i = 0; i < 20; i++) {
      const ratio = i / 20;
      let color;
      
      if (ratio < 0.4) {
        // Top section - blend top to middle
        const localRatio = ratio / 0.4;
        color = this.interpolateColor(topColor, middleColor, localRatio);
      } else if (ratio < 0.6) {
        // Middle section - lightest area (battlefield center)
        color = middleColor;
      } else {
        // Bottom section - blend middle to bottom
        const localRatio = (ratio - 0.6) / 0.4;
        color = this.interpolateColor(middleColor, bottomColor, localRatio);
      }
      
      this.backgroundGradient.rect(0, i * segmentHeight, this.fieldWidth, segmentHeight)
        .fill({ color, alpha: 1 });
    }
  }

  private drawBattlefieldLine(): void {
    this.battlefieldLine.clear();
    const centerY = this.fieldHeight / 2;
    
    // Dashed line across the center
    const dashLength = 10;
    const gapLength = 8;
    let currentX = 0;
    
    while (currentX < this.fieldWidth) {
      this.battlefieldLine.moveTo(currentX, centerY);
      this.battlefieldLine.lineTo(Math.min(currentX + dashLength, this.fieldWidth), centerY);
      currentX += dashLength + gapLength;
    }
    
    this.battlefieldLine.stroke({ width: 2, color: hexToPixi(Colors.BLUE_SKY), alpha: 0.3 });

    // Add subtle glow to center line
    this.battlefieldLine.moveTo(0, centerY);
    this.battlefieldLine.lineTo(this.fieldWidth, centerY);
    this.battlefieldLine.stroke({ width: 6, color: hexToPixi(Colors.BLUE_SKY), alpha: 0.1 });
  }

  private updateBattlefieldLine(): void {
    // Subtle pulsing animation for the battlefield line
    const pulse = Math.sin(this.time * 0.02) * 0.2 + 0.8;
    this.battlefieldLine.alpha = pulse;
  }

  private drawVignette(): void {
    this.vignette.clear();

    // Radial gradient effect (darker at edges)
    const centerX = this.fieldWidth / 2;
    const centerY = this.fieldHeight / 2;
    const radius = Math.max(this.fieldWidth, this.fieldHeight) * 0.7;
    
    for (let r = radius; r > 0; r -= 20) {
      const alpha = (1 - r / radius) * 0.4;
      this.vignette.circle(centerX, centerY, r)
        .fill({ color: hexToPixi(Colors.BLACK), alpha });
    }
  }

  private drawCornerDecorations(): void {
    // Clear existing decorations
    this.cornerDecorations.forEach(decoration => decoration.destroy());
    this.cornerDecorations = [];

    // Draw corner decorations
    this.drawCornerDecoration(0, 0, 'top-left');
    this.drawCornerDecoration(this.fieldWidth, 0, 'top-right');
    this.drawCornerDecoration(0, this.fieldHeight, 'bottom-left');
    this.drawCornerDecoration(this.fieldWidth, this.fieldHeight, 'bottom-right');
  }

  private drawCornerDecoration(x: number, y: number, corner: string): void {
    const decoration = new Graphics();
    const size = 40;
    const thickness = 3;

    decoration.moveTo(x, y);

    switch (corner) {
      case 'top-left':
        decoration.lineTo(x + size, y);
        decoration.moveTo(x, y);
        decoration.lineTo(x, y + size);
        break;
      case 'top-right':
        decoration.lineTo(x - size, y);
        decoration.moveTo(x, y);
        decoration.lineTo(x, y + size);
        break;
      case 'bottom-left':
        decoration.lineTo(x + size, y);
        decoration.moveTo(x, y);
        decoration.lineTo(x, y - size);
        break;
      case 'bottom-right':
        decoration.lineTo(x - size, y);
        decoration.moveTo(x, y);
        decoration.lineTo(x, y - size);
        break;
    }

    decoration.stroke({ width: thickness, color: hexToPixi(Colors.TEAL_PURPLE), alpha: 0.5 });
    this.addChild(decoration);
    this.cornerDecorations.push(decoration);
  }

  private createEnergyParticles(): void {
    // Create 20 small particles for ambient energy effect
    for (let i = 0; i < 20; i++) {
      const graphics = new Graphics();
      const size = Math.random() * 2 + 1;
      graphics.circle(0, 0, size)
        .fill({ color: hexToPixi(Colors.WHITE), alpha: Math.random() * 0.3 + 0.2 });
      
      this.addChild(graphics);
      
      this.energyParticles.push({
        graphics,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        life: Math.random() * 120,
        maxLife: 120 + Math.random() * 60
      });
    }
  }

  private repositionParticles(): void {
    // Position particles randomly across the battlefield
    this.energyParticles.forEach(particle => {
      particle.graphics.x = Math.random() * this.fieldWidth;
      particle.graphics.y = Math.random() * this.fieldHeight;
    });
  }

  private updateParticles(deltaTime: number): void {
    this.energyParticles.forEach(particle => {
      // Move particle
      particle.graphics.x += particle.vx * deltaTime;
      particle.graphics.y += particle.vy * deltaTime;
      
      // Update life
      particle.life += deltaTime;
      
      // Fade out as life progresses
      const lifeRatio = particle.life / particle.maxLife;
      particle.graphics.alpha = (1 - lifeRatio) * (Math.random() * 0.3 + 0.2);
      
      // Reset particle when life is over
      if (particle.life >= particle.maxLife) {
        particle.graphics.x = Math.random() * this.fieldWidth;
        particle.graphics.y = Math.random() * this.fieldHeight;
        particle.vx = (Math.random() - 0.5) * 0.5;
        particle.vy = (Math.random() - 0.5) * 0.5;
        particle.life = 0;
        particle.maxLife = 120 + Math.random() * 60;
        particle.graphics.alpha = Math.random() * 0.3 + 0.2;
      }
      
      // Wrap around screen edges
      if (particle.graphics.x < 0) particle.graphics.x = this.fieldWidth;
      if (particle.graphics.x > this.fieldWidth) particle.graphics.x = 0;
      if (particle.graphics.y < 0) particle.graphics.y = this.fieldHeight;
      if (particle.graphics.y > this.fieldHeight) particle.graphics.y = 0;
    });
  }

  private interpolateColor(color1: number, color2: number, ratio: number): number {
    const r1 = (color1 >> 16) & 0xff;
    const g1 = (color1 >> 8) & 0xff;
    const b1 = color1 & 0xff;

    const r2 = (color2 >> 16) & 0xff;
    const g2 = (color2 >> 8) & 0xff;
    const b2 = color2 & 0xff;

    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);

    return (r << 16) | (g << 8) | b;
  }

  /**
   * Cleanup when destroying
   */
  public destroy(options?: any): void {
    this.energyParticles = [];
    super.destroy(options);
  }
}
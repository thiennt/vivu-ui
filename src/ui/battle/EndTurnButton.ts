import { Container, Graphics, Text, FederatedPointerEvent } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

export interface EndTurnButtonOptions {
  width: number;
  height: number;
}

export interface EndTurnButtonEvents {
  onEndTurn?: () => void;
}

export class EndTurnButton extends Container {
  private options: EndTurnButtonOptions;
  private events: EndTurnButtonEvents;
  private button!: Graphics;
  private buttonText!: Text;
  private isEnabled: boolean = true;
  private isAnimating: boolean = false;

  constructor(options: EndTurnButtonOptions, events: EndTurnButtonEvents = {}) {
    super();
    this.options = options;
    this.events = events;
    this.createButton();
  }

  private createButton(): void {
    // Button background
    this.button = new Graphics();
    this.updateButtonAppearance();
    this.addChild(this.button);

    // Button text
    this.buttonText = new Text({
      text: 'End Turn',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.TEXT_BUTTON,
        align: 'center',
        fontWeight: 'bold'
      }
    });
    this.buttonText.anchor.set(0.5);
    this.buttonText.x = this.options.width / 2;
    this.buttonText.y = this.options.height / 2;
    this.addChild(this.buttonText);

    this.makeInteractive();
  }

  private updateButtonAppearance(): void {
    this.button.clear();
    
    if (this.isEnabled) {
      // Enabled state
      this.button
        .roundRect(0, 0, this.options.width, this.options.height, 10)
        .fill({ color: Colors.BUTTON_PRIMARY })
        .stroke({ color: Colors.BUTTON_BORDER, width: 2 });
    } else {
      // Disabled state
      this.button
        .roundRect(0, 0, this.options.width, this.options.height, 10)
        .fill({ color: Colors.BACKGROUND_PRIMARY })
        .stroke({ color: Colors.UI_BORDER, width: 2 });
    }
  }

  private makeInteractive(): void {
    this.interactive = true;
    this.cursor = 'pointer';
    
    this.on('pointerdown', this.onPointerDown, this);
    this.on('pointerup', this.onPointerUp, this);
    this.on('pointerupoutside', this.onPointerUp, this);
    this.on('pointerover', this.onPointerOver, this);
    this.on('pointerout', this.onPointerOut, this);
  }

  private onPointerDown(event: FederatedPointerEvent): void {
    if (!this.isEnabled || this.isAnimating) return;
    
    // Press animation
    gsap.to(this.scale, {
      x: 0.95,
      y: 0.95,
      duration: 0.1,
      ease: "power2.out"
    });
  }

  private onPointerUp(event: FederatedPointerEvent): void {
    if (!this.isEnabled || this.isAnimating) return;
    
    // Release animation
    gsap.to(this.scale, {
      x: 1,
      y: 1,
      duration: 0.1,
      ease: "power2.out",
      onComplete: () => {
        if (event.type === 'pointerup') {
          this.handleEndTurn();
        }
      }
    });
  }

  private onPointerOver(): void {
    if (!this.isEnabled || this.isAnimating) return;
    
    // Hover effect
    gsap.to(this.button, {
      alpha: 0.8,
      duration: 0.2,
      ease: "power2.out"
    });
  }

  private onPointerOut(): void {
    if (!this.isEnabled || this.isAnimating) return;
    
    // Remove hover effect
    gsap.to(this.button, {
      alpha: 1,
      duration: 0.2,
      ease: "power2.out"
    });
  }

  private handleEndTurn(): void {
    if (!this.isEnabled || this.isAnimating) return;
    
    this.isAnimating = true;
    
    // End turn animation
    gsap.to(this, {
      alpha: 0.5,
      duration: 0.2,
      ease: "power2.out",
      onComplete: () => {
        this.events.onEndTurn?.();
        
        // Reset animation after a delay
        setTimeout(() => {
          gsap.to(this, {
            alpha: 1,
            duration: 0.2,
            ease: "power2.out",
            onComplete: () => {
              this.isAnimating = false;
            }
          });
        }, 500);
      }
    });
  }

  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
    this.updateButtonAppearance();
    this.cursor = enabled ? 'pointer' : 'default';
    this.buttonText.style.fill = enabled ? Colors.TEXT_BUTTON : Colors.TEXT_SECONDARY;
    this.alpha = enabled ? 1 : 0.6;
  }

  public setText(text: string): void {
    this.buttonText.text = text;
  }

  public getEnabled(): boolean {
    return this.isEnabled;
  }

  // Show with animation
  public async show(): Promise<void> {
    this.alpha = 0;
    this.y += 20;
    
    return new Promise((resolve) => {
      gsap.to(this, {
        alpha: 1,
        y: this.y - 20,
        duration: 0.4,
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
        y: this.y + 20,
        duration: 0.3,
        ease: "power2.in",
        onComplete: resolve
      });
    });
  }

  // Pulse animation to draw attention
  public pulse(): void {
    if (this.isAnimating) return;
    
    gsap.to(this.scale, {
      x: 1.05,
      y: 1.05,
      duration: 0.5,
      ease: "power2.inOut",
      yoyo: true,
      repeat: 2
    });
  }
}
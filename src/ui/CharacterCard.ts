import { Container, Graphics, Text, Sprite, Assets, Rectangle } from 'pixi.js';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { gsap } from 'gsap';
import { DropShadowFilter } from 'pixi-filters';

const defaultCharacterCardOptions = {
  width: 90,
  height: 120,
};

export type CharacterCardOptions = typeof defaultCharacterCardOptions;

/**
 * CharacterCard - Optimized Layout
 * - Active effects at top of card
 * - Large avatar area in center
 * - Text-only stats below avatar (ATK: 1000 DEF: 100)
 * - HP and Energy bars at bottom
 * - Status indicators (dead/acted)
 */
export class CharacterCard extends Container {
  public character!: any;
  private cardContainer!: Container;
  private hoverOverlay!: Graphics;
  private glowEffect!: Graphics;
  private stateOverlay!: Graphics;
  private avatarContainer!: Container;
  private activeEffectsContainer!: Container;
  private isDead!: boolean;
  private hasActed!: boolean;
  private cardWidth!: number;
  private cardHeight!: number;

  constructor(character: any, options: Partial<CharacterCardOptions> = {}) {
    super();

    const opts = { ...defaultCharacterCardOptions, ...options };
    this.character = character;
    const { width, height } = opts;
    this.cardWidth = width;
    this.cardHeight = height;

    // Check character state
    this.isDead = character.hp <= 0;
    this.hasActed = character.has_acted || character.hasActed || false;

    // Main card container
    this.cardContainer = new Container();
    this.addChild(this.cardContainer);

    // Build card layers
    this.createBackground();
    this.createPortraitFrame();
    this.createTextStats(); // Text-only stats
    this.createStatusIndicator();
    this.createBars();
    this.createEffectsDisplay(); // Effects at top

    // Set consistent hit area
    this.hitArea = new Rectangle(0, 0, width, height);
  }

  private createBackground(): void {
    const { cardWidth: width, cardHeight: height } = this;

    // Main background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.BLUE_NAVY_DARK, alpha: 0.98 })
      .stroke({ width: 2.5, color: Colors.BLUE_STEEL_DARK });
    
    // Inner layer
    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.BLUE_NAVY, alpha: 0.6 });
    
    this.cardContainer.addChild(bg);

    // State overlay
    this.stateOverlay = new Graphics();
    if (this.isDead) {
      this.stateOverlay.roundRect(0, 0, width, height, 10)
        .fill({ color: Colors.BLACK, alpha: 0.7 });
    } else if (this.hasActed) {
      this.stateOverlay.roundRect(0, 0, width, height, 10)
        .fill({ color: Colors.BLACK, alpha: 0.4 });
    }
    this.cardContainer.addChild(this.stateOverlay);

    // Hover effects
    this.glowEffect = new Graphics();
    this.glowEffect.roundRect(0, 0, width, height, 10)
      .stroke({ width: 3, color: Colors.BLUE_STEEL, alpha: 0 });
    this.cardContainer.addChild(this.glowEffect);

    this.hoverOverlay = new Graphics();
    this.hoverOverlay.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.WHITE, alpha: 0 });
    this.cardContainer.addChild(this.hoverOverlay);
  }

  private createEffectsDisplay(): void {
    const { cardWidth: width } = this;
    
    this.activeEffectsContainer = new Container();
    this.activeEffectsContainer.x = width / 2;
    this.activeEffectsContainer.y = -5; // Overlay on top of card
    this.cardContainer.addChild(this.activeEffectsContainer);
    
    this.drawActiveEffects();
  }

  private drawActiveEffects(): void {
    this.activeEffectsContainer.removeChildren();

    const activeEffects = this.character.active_effects || this.character.activeEffects || [];
    if (activeEffects.length === 0) return;

    // Show all effects, no limit
    const iconSize = 20;
    const spacing = 3;
    const totalWidth = (iconSize * activeEffects.length) + (spacing * (activeEffects.length - 1));
    
    let startX = -totalWidth / 2;

    activeEffects.forEach((effect: any, index: number) => {
      const effectIcon = this.createEffectIcon(effect, iconSize);
      effectIcon.x = startX + (index * (iconSize + spacing));
      this.activeEffectsContainer.addChild(effectIcon);
    });
  }

  private createEffectIcon(effect: any, size: number): Container {
    const container = new Container();

    const effectType = effect.type || 'buff';
    let borderColor: string = Colors.GREEN_BRIGHT;
    
    if (effectType.includes('debuff') || effectType.includes('damage')) {
      borderColor = Colors.RED;
    } else if (effectType.includes('heal') || effectType.includes('shield')) {
      borderColor = Colors.BLUE_SKY;
    }

    // Background
    const bg = new Graphics();
    bg.circle(size / 2, size / 2, size / 2)
      .fill({ color: Colors.BLUE_NAVY_DARK, alpha: 0.95 })
      .stroke({ width: 1.5, color: Colors.BLUE_STEEL_DARK });
    
    bg.circle(size / 2, size / 2, size / 2 - 1.5)
      .stroke({ width: 1, color: borderColor, alpha: 0.8 });
    
    container.addChild(bg);

    // Icon
    const iconText = this.getEffectIcon(effect);
    const icon = new Text({
      text: iconText,
      style: {
        fontSize: size * 0.6,
        fill: Colors.WHITE
      }
    });
    icon.anchor.set(0.5);
    icon.x = size / 2;
    icon.y = size / 2;
    container.addChild(icon);

    // Duration/Stack count
    if (effect.duration || effect.stacks) {
      const countBg = new Graphics();
      countBg.circle(size - 3, size - 3, 4.5)
        .fill({ color: Colors.BLUE_NAVY_DARK, alpha: 0.95 })
        .stroke({ width: 1, color: borderColor });

      const countText = new Text({
        text: `${effect.stacks || effect.duration || ''}`,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 7,
          fontWeight: 'bold',
          fill: Colors.WHITE
        }
      });
      countText.anchor.set(0.5);
      countText.x = size - 3;
      countText.y = size - 3;

      container.addChild(countBg, countText);
    }

    return container;
  }

  private getEffectIcon(effect: any): string {
    const effectName = (effect.name || effect.effect_name || '').toLowerCase();
    const effectType = (effect.type || '').toLowerCase();

    const iconMap: Record<string, string> = {
      'strength': '💪', 'attack': '⚔️', 'power': '⚡',
      'shield': '🛡️', 'defense': '🛡️', 'armor': '🛡️',
      'regen': '💚', 'heal': '💚',
      'speed': '⚡', 'haste': '⚡',
      'poison': '🧪', 'burn': '🔥', 'bleed': '🩸',
      'stun': '💫', 'freeze': '❄️', 'slow': '🐌',
      'weakness': '💔', 'curse': '☠️', 'silence': '🔇',
      'barrier': '✨', 'taunt': '🎯', 'stealth': '👁️'
    };

    for (const [key, icon] of Object.entries(iconMap)) {
      if (effectName.includes(key)) return icon;
    }

    if (effectType.includes('buff')) return '✨';
    if (effectType.includes('debuff')) return '💀';
    if (effectType.includes('damage')) return '🔥';
    if (effectType.includes('heal')) return '💚';

    return '⭐';
  }

  private createPortraitFrame(): void {
    const { cardWidth: width } = this;
    
    const frameTop = 0; // Start inside card padding
    const frameHeight = 60; // Avatar height
    const frameInset = 5;
    const frameWidth = width - (frameInset * 2);

    // Avatar container
    this.avatarContainer = new Container();
    this.avatarContainer.x = width / 2;
    this.avatarContainer.y = frameTop + frameHeight / 2;
    this.cardContainer.addChild(this.avatarContainer);

    // Load avatar
    this.loadAvatar(0, 0, frameWidth - 8, frameHeight - 8);

    // Apply state opacity
    if (this.isDead || this.hasActed) {
      this.avatarContainer.alpha = this.isDead ? 0.35 : 0.65;
    }
  }

  private createTextStats(): void {
    const { cardWidth: width } = this;
    const statsY = this.avatarContainer.y + 40; // Below avatar

    // Create ATK stat frame
    const statFrame = new Graphics();
    statFrame.roundRect(10, statsY - 12, width - 20, 16, 6)
      .fill({ color: Colors.BLUE_NAVY_DARKER, alpha: 0.95 });
    
    this.cardContainer.addChild(statFrame);
    
    const atkValue = this.character.atk || 0;
    
    const statsText = new Text({
      text: `⚔️ ${atkValue}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BLUE_NAVY_DARKER, width: 2.5 },
        align: 'center'
      }
    });
    statsText.anchor.set(0.5);
    statsText.x = width / 2;
    statsText.y = statsY - 4;
    
    if (this.isDead) {
      statsText.alpha = 0.5;
    }

    this.cardContainer.addChild(statsText);

    // create DEF stat frame should be below ATK
    const defFrame = new Graphics();
    defFrame.roundRect(10, statsY + 6, width - 20, 16, 6)
      .fill({ color: Colors.BLUE_NAVY_DARKER, alpha: 0.95 });

    this.cardContainer.addChild(defFrame);
    
    const defValue = this.character.def || 0;
    
    const defText = new Text({
      text: `🛡️ ${defValue}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 11,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BLUE_NAVY_DARKER, width: 2.5 },
        align: 'center'
      }
    });
    defText.anchor.set(0.5);
    defText.x = width / 2;
    defText.y = statsY + 14;
    
    if (this.isDead) {
      defText.alpha = 0.5;
    }

    this.cardContainer.addChild(defText);
  }

  private createStatusIndicator(): void {
    const { cardWidth: width } = this;
    
    if (this.isDead) {
      const badge = this.createStatusBadge('💀', Colors.RED);
      badge.x = width / 2;
      badge.y = 40; // Center of avatar (10 + 90/2)
      this.cardContainer.addChild(badge);
    } else if (this.hasActed) {
      const badge = this.createStatusBadge('✓', Colors.ORANGE);
      badge.x = width / 2;
      badge.y = 40; // Center of avatar
      this.cardContainer.addChild(badge);
    }
  }

  private createStatusBadge(icon: string, color: string): Container {
    const badge = new Container();
    const size = 36;

    const bg = new Graphics();
    bg.circle(0, 0, size / 2)
      .fill({ color: Colors.BLUE_NAVY_DARK, alpha: 0.95 })
      .stroke({ width: 2.5, color: color });
    
    bg.circle(0, 0, size / 2 - 2)
      .stroke({ width: 1, color: Colors.BLUE_STEEL_LIGHT, alpha: 0.4 });
    
    badge.addChild(bg);

    const iconText = new Text({
      text: icon,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 22,
        fontWeight: 'bold',
        fill: Colors.WHITE
      }
    });
    iconText.anchor.set(0.5);
    badge.addChild(iconText);

    return badge;
  }

  private createBars(): void {
    const { cardWidth: width, cardHeight: height } = this;
    const barWidth = width - 20; // More padding
    const barX = 10;

    // HP Bar
    const hpBarY = height - 15;
    const hpBarHeight = 12;
    
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(barX, hpBarY, barWidth, hpBarHeight, 6)
      .fill({ color: Colors.BLUE_NAVY_DARKER, alpha: 0.95 })
      .stroke({ width: 1.5, color: Colors.BLUE_STEEL_DARK });
    
    hpBarBg.roundRect(barX + 1, hpBarY + 1, barWidth - 2, hpBarHeight - 2, 5)
      .stroke({ width: 0.8, color: Colors.BLUE_STEEL, alpha: 0.4 });
    
    this.cardContainer.addChild(hpBarBg);

    // HP Fill
    const hpPercent = Math.max(0, Math.min(1, this.character.hp / this.character.max_hp));
    let hpColor: string = Colors.GREEN_BRIGHT;
    if (hpPercent <= 0.25) hpColor = Colors.RED;
    else if (hpPercent <= 0.5) hpColor = Colors.ORANGE;

    if (hpPercent > 0) {
      const hpFill = new Graphics();
      hpFill.roundRect(barX + 2, hpBarY + 2, (barWidth - 4) * hpPercent, hpBarHeight - 4, 4)
        .fill({ color: hpColor, alpha: 0.9 });
      this.cardContainer.addChild(hpFill);
    }

    // HP Text
    const hpText = new Text({
      text: `${Math.max(0, this.character.hp)}/${this.character.max_hp}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 10,
        fontWeight: 'bold',
        fill: this.isDead ? Colors.RED : Colors.WHITE,
        stroke: { color: Colors.BLUE_NAVY_DARKER, width: 2 }
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = width / 2;
    hpText.y = hpBarY + hpBarHeight / 2;
    this.cardContainer.addChild(hpText);

    // Energy Bar - Hidden to simplify game
    /*
    const energyBarY = height - 12; // 16px from bottom
    const energyBarHeight = 8;

    const energyBarBg = new Graphics();
    energyBarBg.roundRect(barX, energyBarY, barWidth, energyBarHeight, 4)
      .fill({ color: Colors.BLUE_NAVY_DARKER, alpha: 0.95 })
      .stroke({ width: 1.5, color: Colors.BLUE_STEEL_DARK });
    
    energyBarBg.roundRect(barX + 1, energyBarY + 1, barWidth - 2, energyBarHeight - 2, 3)
      .stroke({ width: 0.8, color: Colors.BLUE_STEEL, alpha: 0.4 });
    
    this.cardContainer.addChild(energyBarBg);

    // Energy Fill
    const maxEnergy = this.character.max_energy || 100;
    const currentEnergy = this.character.energy || maxEnergy;
    const energyPercent = Math.max(0, Math.min(1, currentEnergy / maxEnergy));

    const energyFill = new Graphics();
    energyFill.roundRect(barX + 2, energyBarY + 2, (barWidth - 4) * energyPercent, energyBarHeight - 4, 3)
      .fill({ color: Colors.BLUE_STEEL_LIGHTER, alpha: this.isDead ? 0.3 : 0.9 });
    this.cardContainer.addChild(energyFill);
    */
  }

  private async loadAvatar(centerX: number, centerY: number, maxWidth: number, maxHeight: number): Promise<void> {
    try {
      const avatarUrl = this.character.avatar_url || this.character.avatarUrl || this.character.avatar;
      
      if (!avatarUrl) {
        this.loadFallbackAvatar(centerX, centerY);
        return;
      }

      const avatarTexture = await Assets.load(avatarUrl);
      const avatarSprite = new Sprite(avatarTexture);
      
      const scale = Math.min(maxWidth / avatarSprite.width, maxHeight / avatarSprite.height);
      avatarSprite.scale.set(scale);
      avatarSprite.anchor.set(0.5);
      avatarSprite.x = centerX;
      avatarSprite.y = centerY;

      // Glow effect
      const dropShadow = new DropShadowFilter({
        offset: { x: 0, y: 0 },
        blur: 6,
        alpha: 0.6,
        color: Colors.BLUE_STEEL
      });
      avatarSprite.filters = [dropShadow];

      this.avatarContainer.addChild(avatarSprite);
    } catch (error) {
      console.error('Error loading avatar:', error);
      this.loadFallbackAvatar(centerX, centerY);
    }
  }

  private loadFallbackAvatar(centerX: number, centerY: number): void {
    let avatarIcon = '👤';
    
    if (this.character.class) {
      const classIcons: Record<string, string> = {
        'warrior': '⚔️',
        'mage': '🔮',
        'healer': '✨',
        'tank': '🛡️',
        'assassin': '🗡️',
        'ranger': '🏹',
        'paladin': '⚡',
        'druid': '🌿',
        'necromancer': '💀'
      };
      avatarIcon = classIcons[this.character.class.toLowerCase()] || '👤';
    }

    const avatar = new Text({
      text: avatarIcon,
      style: {
        fontSize: 38,
        fill: Colors.WHITE
      }
    });
    avatar.anchor.set(0.5);
    avatar.x = centerX;
    avatar.y = centerY;

    const dropShadow = new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 6,
      alpha: 0.6,
      color: Colors.BLUE_STEEL
    });
    avatar.filters = [dropShadow];

    this.avatarContainer.addChild(avatar);
  }

  public isDraggable(): boolean {
    return !this.isDead && !this.hasActed;
  }

  public updateState(character: any): void {
    this.character = character;
    this.isDead = character.hp <= 0;
    this.hasActed = character.has_acted || character.hasActed || false;
    
    // Rebuild card
    this.cardContainer.removeChildren();
    this.createBackground();
    this.createEffectsDisplay();
    this.createPortraitFrame();
    this.createTextStats();
    this.createStatusIndicator();
    this.createBars();
  }
}
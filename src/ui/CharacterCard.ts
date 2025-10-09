import { Container, Graphics, Text, Sprite, Assets } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';
import { DropShadowFilter } from 'pixi-filters';

const defaultCharacterCardOptions = {
  width: 100,
  height: 120,
};

export type CharacterCardOptions = typeof defaultCharacterCardOptions;

/**
 * Hero-focused CharacterCard with portrait layout
 * - ATK/DEF stats in top corners (above avatar)
 * - Large avatar sprite in center
 * - HP and Energy bars at bottom
 * - Active effects icons displayed below avatar
 * - Visual states for dead/acted
 * - Draggable only when active (not acted)
 */
export class CharacterCard extends Container {
  public character: any;
  private hoverOverlay: Graphics;
  private glowEffect: Graphics;
  private stateOverlay: Graphics;
  private avatarContainer: Container;
  private activeEffectsContainer: Container; // NEW: Container for effect icons
  private isDead: boolean;
  private hasActed: boolean;
  private cardWidth: number;
  private cardHeight: number;

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

    // Main background - vibrant gradient style
    const bg = new Graphics();
    
    bg.roundRect(4, 4, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: 0x000000, alpha: 0.25 });
    
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x2a1f3d, alpha: 0.98 })
      .stroke({ width: 2.5, color: 0x6a4c93 });
    
    bg.roundRect(3, 3, width - 6, height - 6, 6)
      .stroke({ width: 1.5, color: 0x9d7cc3, alpha: 0.4 });

    this.addChild(bg);

    // State overlay for dead/acted
    this.stateOverlay = new Graphics();
    if (this.isDead) {
      this.stateOverlay.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.7 });
    } else if (this.hasActed) {
      this.stateOverlay.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.4 });
    }
    this.addChild(this.stateOverlay);

    // Glow effect for hover
    this.glowEffect = new Graphics();
    this.glowEffect.roundRect(0, 0, width, height, 8)
      .stroke({ width: 3, color: 0xb57edc, alpha: 0 });
    this.addChild(this.glowEffect);

    // Hover overlay
    this.hoverOverlay = new Graphics();
    this.hoverOverlay.roundRect(0, 0, width, height, 8)
      .fill({ color: 0xffffff, alpha: 0 });
    this.addChild(this.hoverOverlay);

    // Avatar frame
    const avatarFrameY = 38;
    const avatarFrameHeight = height - 66;
    const avatarFrame = new Graphics()
      .roundRect(10, avatarFrameY, width - 20, avatarFrameHeight, 6)
      .fill({ color: 0x150a25, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x4a2f5f, alpha: 0.7 });
    
    const avatarFrameGlow = new Graphics()
      .roundRect(11, avatarFrameY + 1, width - 22, avatarFrameHeight - 2, 5)
      .stroke({ width: 1, color: 0x6a4c93, alpha: 0.3 });
    
    this.addChild(avatarFrame, avatarFrameGlow);

    // Avatar container
    this.avatarContainer = new Container();
    this.avatarContainer.x = width / 2;
    this.avatarContainer.y = avatarFrameY + avatarFrameHeight / 2;
    this.addChild(this.avatarContainer);

    // Load avatar sprite
    this.loadAvatar(character, 0, 0, width - 24, avatarFrameHeight - 4);

    // Apply grayscale for dead/acted states
    if (this.isDead || this.hasActed) {
      this.avatarContainer.alpha = this.isDead ? 0.3 : 0.6;
    }

    // ATK stat (top-left)
    const atkX = 8;
    const atkY = 8;
    const statBadgeSize = 28;
    
    const atkBadgeBg = new Graphics()
      .roundRect(atkX - 2, atkY - 2, statBadgeSize + 4, statBadgeSize + 4, 5)
      .fill({ color: 0x1a0f2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0xe74c3c, alpha: this.isDead ? 0.5 : 1 });
    
    const atkIcon = new Text({
      text: '⚔️',
      style: { fontFamily: 'Kalam', fontSize: 13, fill: 0xe74c3c }
    });
    atkIcon.anchor.set(0.5);
    atkIcon.x = atkX + statBadgeSize / 2;
    atkIcon.y = atkY + 5;
    if (this.isDead) atkIcon.alpha = 0.5;
    
    const atkValue = new Text({
      text: `${character.atk || 0}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 1.5 }
      }
    });
    atkValue.anchor.set(0.5);
    atkValue.x = atkX + statBadgeSize / 2;
    atkValue.y = atkY + 19;
    if (this.isDead) atkValue.alpha = 0.5;

    this.addChild(atkBadgeBg, atkIcon, atkValue);

    // DEF stat (top-right)
    const defX = width - statBadgeSize - 8;
    const defY = 8;
    
    const defBadgeBg = new Graphics()
      .roundRect(defX - 2, defY - 2, statBadgeSize + 4, statBadgeSize + 4, 5)
      .fill({ color: 0x1a0f2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a90e2, alpha: this.isDead ? 0.5 : 1 });
    
    const defIcon = new Text({
      text: '🛡️',
      style: { fontFamily: 'Kalam', fontSize: 13, fill: 0x4a90e2 }
    });
    defIcon.anchor.set(0.5);
    defIcon.x = defX + statBadgeSize / 2;
    defIcon.y = defY + 5;
    if (this.isDead) defIcon.alpha = 0.5;
    
    const defValue = new Text({
      text: `${character.def || 0}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 1.5 }
      }
    });
    defValue.anchor.set(0.5);
    defValue.x = defX + statBadgeSize / 2;
    defValue.y = defY + 19;
    if (this.isDead) defValue.alpha = 0.5;

    this.addChild(defBadgeBg, defIcon, defValue);

    // State indicator badge
    if (this.isDead) {
      const deadBadge = new Graphics()
        .circle(width / 2, avatarFrameY + 15, 18)
        .fill({ color: 0x000000, alpha: 0.9 })
        .stroke({ width: 2, color: 0xe74c3c, alpha: 1 });
      
      const deadIcon = new Text({
        text: '💀',
        style: { fontFamily: 'Kalam', fontSize: 20, fill: 0xffffff }
      });
      deadIcon.anchor.set(0.5);
      deadIcon.x = width / 2;
      deadIcon.y = avatarFrameY + 15;
      
      this.addChild(deadBadge, deadIcon);
    } else if (this.hasActed) {
      const actedBadge = new Graphics()
        .circle(width / 2, avatarFrameY + 15, 16)
        .fill({ color: 0x1a0f2e, alpha: 0.95 })
        .stroke({ width: 2, color: 0xf39c12, alpha: 1 });
      
      const actedIcon = new Text({
        text: '✓',
        style: {
          fontFamily: 'Kalam',
          fontSize: 18,
          fontWeight: 'bold',
          fill: 0xf39c12
        }
      });
      actedIcon.anchor.set(0.5);
      actedIcon.x = width / 2;
      actedIcon.y = avatarFrameY + 15;
      
      this.addChild(actedBadge, actedIcon);
    }

    // NEW: Active Effects Container (below avatar, above HP bar)
    this.activeEffectsContainer = new Container();
    this.activeEffectsContainer.x = width / 2;
    this.activeEffectsContainer.y = avatarFrameY + avatarFrameHeight - 8; // Just above HP bar
    this.addChild(this.activeEffectsContainer);
    this.drawActiveEffects(character);

    // Bottom stats section
    const bottomStatsY = height - 24;
    
    // HP Bar
    const hpBarWidth = width - 20;
    const hpBarHeight = 11;
    const hpBarX = 10;
    const hpBarY = bottomStatsY;

    const hpBarBg = new Graphics()
      .roundRect(hpBarX, hpBarY, hpBarWidth, hpBarHeight, 5)
      .fill({ color: 0x1a0f2e, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x4a2f5f, alpha: 0.8 });
    
    this.addChild(hpBarBg);

    // HP Bar fill
    const hpPercent = Math.max(0, character.hp / character.max_hp);
    let hpColor = 0x26de81;
    if (hpPercent <= 0.25) {
      hpColor = 0xe74c3c;
    } else if (hpPercent <= 0.5) {
      hpColor = 0xf39c12;
    }

    if (hpPercent > 0) {
      const hpBarFill = new Graphics()
        .roundRect(hpBarX + 2, hpBarY + 2, (hpBarWidth - 4) * hpPercent, hpBarHeight - 4, 4)
        .fill({ color: hpColor, alpha: 0.95 });
      
      this.addChild(hpBarFill);
    }

    // HP Text
    const hpText = new Text({
      text: `${Math.max(0, character.hp)}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 9,
        fontWeight: 'bold',
        fill: this.isDead ? 0xe74c3c : 0xffffff,
        stroke: { color: 0x000000, width: 1.5 }
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = width / 2;
    hpText.y = hpBarY + hpBarHeight / 2;
    this.addChild(hpText);

    // Energy Bar
    const energyBarY = hpBarY + hpBarHeight + 3;
    const energyBarHeight = 8;

    const energyBarBg = new Graphics()
      .roundRect(hpBarX, energyBarY, hpBarWidth, energyBarHeight, 4)
      .fill({ color: 0x1a0f2e, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x4a2f5f, alpha: 0.8 });
    
    this.addChild(energyBarBg);

    // Energy Bar fill
    const maxEnergy = character.max_energy || 10;
    const currentEnergy = character.energy || maxEnergy;
    const energyPercent = currentEnergy / maxEnergy;
    const energyColor = 0xb57edc;

    const energyBarFill = new Graphics()
      .roundRect(hpBarX + 2, energyBarY + 2, (hpBarWidth - 4) * energyPercent, energyBarHeight - 4, 3)
      .fill({ color: energyColor, alpha: this.isDead ? 0.3 : 0.95 });
    
    this.addChild(energyBarFill);

    // Setup interactivity
    this.setupInteractivity();
  }

  /**
   * NEW: Draw active effects icons below the avatar
   */
  private drawActiveEffects(character: any): void {
    this.activeEffectsContainer.removeChildren();

    // Get active effects from character
    const activeEffects = character.active_effects || character.activeEffects || [];
    
    if (activeEffects.length === 0) return;

    // Display up to 4 effects horizontally
    const maxEffects = 4;
    const effectsToShow = activeEffects.slice(0, maxEffects);
    const iconSize = 16;
    const spacing = 3;
    const totalWidth = (iconSize * effectsToShow.length) + (spacing * (effectsToShow.length - 1));
    
    let startX = -totalWidth / 2;

    effectsToShow.forEach((effect: any, index: number) => {
      const effectIcon = this.createEffectIcon(effect, iconSize);
      effectIcon.x = startX + (index * (iconSize + spacing));
      effectIcon.y = 0;
      this.activeEffectsContainer.addChild(effectIcon);
    });
  }

  /**
   * NEW: Create an effect icon with badge
   */
  private createEffectIcon(effect: any, size: number): Container {
    const iconContainer = new Container();

    // Background badge
    const badge = new Graphics();
    badge.circle(size / 2, size / 2, size / 2)
      .fill({ color: 0x1a0f2e, alpha: 0.95 });

    // Effect type determines border color
    const effectType = effect.type || 'buff';
    let borderColor = 0x26de81; // Green for buffs
    
    if (effectType.includes('debuff') || effectType.includes('damage')) {
      borderColor = 0xe74c3c; // Red for debuffs
    } else if (effectType.includes('heal') || effectType.includes('shield')) {
      borderColor = 0x4a90e2; // Blue for healing/protection
    }

    badge.circle(size / 2, size / 2, size / 2)
      .stroke({ width: 1.5, color: borderColor, alpha: 0.9 });

    iconContainer.addChild(badge);

    // Effect icon/emoji
    const iconText = this.getEffectIcon(effect);
    const icon = new Text({
      text: iconText,
      style: {
        fontFamily: 'Kalam',
        fontSize: size * 0.7,
        fill: 0xffffff
      }
    });
    icon.anchor.set(0.5);
    icon.x = size / 2;
    icon.y = size / 2;
    iconContainer.addChild(icon);

    // Duration/stack count badge (bottom-right corner)
    if (effect.duration || effect.stacks) {
      const countBadge = new Graphics();
      countBadge.circle(size - 3, size - 3, 5)
        .fill({ color: 0x000000, alpha: 0.9 })
        .stroke({ width: 1, color: borderColor, alpha: 1 });

      const countText = new Text({
        text: `${effect.stacks || effect.duration || ''}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 7,
          fontWeight: 'bold',
          fill: 0xffffff
        }
      });
      countText.anchor.set(0.5);
      countText.x = size - 3;
      countText.y = size - 3;

      iconContainer.addChild(countBadge, countText);
    }

    return iconContainer;
  }

  /**
   * NEW: Get appropriate icon for effect type
   */
  private getEffectIcon(effect: any): string {
    const effectName = (effect.name || effect.effect_name || '').toLowerCase();
    const effectType = (effect.type || '').toLowerCase();

    // Map effect names/types to icons
    const iconMap: Record<string, string> = {
      // Buffs
      'strength': '💪',
      'attack': '⚔️',
      'power': '⚡',
      'shield': '🛡️',
      'defense': '🛡️',
      'armor': '🛡️',
      'regen': '💚',
      'heal': '💚',
      'speed': '⚡',
      'haste': '⚡',
      
      // Debuffs
      'poison': '🧪',
      'burn': '🔥',
      'bleed': '🩸',
      'stun': '💫',
      'freeze': '❄️',
      'slow': '🐌',
      'weakness': '💔',
      'curse': '☠️',
      'silence': '🔇',
      
      // Special
      'barrier': '✨',
      'taunt': '🎯',
      'stealth': '👁️',
      'reflect': '🔄'
    };

    // Check effect name first
    for (const [key, icon] of Object.entries(iconMap)) {
      if (effectName.includes(key)) {
        return icon;
      }
    }

    // Fallback based on type
    if (effectType.includes('buff')) return '✨';
    if (effectType.includes('debuff')) return '💀';
    if (effectType.includes('damage')) return '🔥';
    if (effectType.includes('heal')) return '💚';

    return '⭐'; // Default icon
  }

  private async loadAvatar(character: any, centerX: number, centerY: number, maxWidth: number, maxHeight: number): Promise<void> {
    try {
      let avatarTexture = null;
      
      const avatarUrl = character.avatar_url || character.avatarUrl;
      if (avatarUrl) {
        try {
          avatarTexture = await Assets.load(avatarUrl);
        } catch (error) {
          console.warn(`Failed to load avatar from URL: ${avatarUrl}`, error);
        }
      }
      
      if (!avatarTexture && character.avatar) {
        try {
          avatarTexture = await Assets.load(character.avatar);
        } catch (error) {
          console.warn(`Failed to load avatar from key: ${character.avatar}`, error);
        }
      }
      
      if (!avatarTexture) {
        this.loadFallbackAvatar(character, centerX, centerY);
        return;
      }

      const avatarSprite = new Sprite(avatarTexture);
      
      const scale = Math.min(
        maxWidth / avatarSprite.width,
        maxHeight / avatarSprite.height
      );
      
      avatarSprite.scale.set(scale);
      avatarSprite.anchor.set(0.5);
      avatarSprite.x = centerX;
      avatarSprite.y = centerY;

      const dropShadow = new DropShadowFilter({
        offset: { x: 3, y: 3 },
        blur: 4,
        alpha: 0.6,
        color: 0x000000
      });
      avatarSprite.filters = [dropShadow];

      this.avatarContainer.addChild(avatarSprite);
      
    } catch (error) {
      console.error('Error loading avatar:', error);
      this.loadFallbackAvatar(character, centerX, centerY);
    }
  }

  private loadFallbackAvatar(character: any, centerX: number, centerY: number): void {
    let avatarIcon = '👤';
    
    if (character.class) {
      const classIcons: Record<string, string> = {
        'warrior': '⚔️',
        'mage': '🔮',
        'healer': '✨',
        'tank': '🛡️',
        'assassin': '🗡️',
        'ranger': '🏹'
      };
      avatarIcon = classIcons[character.class.toLowerCase()] || '👤';
    }

    const avatar = new Text({
      text: avatarIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        align: 'center',
        fill: 0xffffff
      }
    });
    avatar.anchor.set(0.5);
    avatar.x = centerX;
    avatar.y = centerY;

    const dropShadow = new DropShadowFilter({
      offset: { x: 3, y: 3 },
      blur: 4,
      alpha: 0.6,
      color: 0x000000
    });
    avatar.filters = [dropShadow];

    this.avatarContainer.addChild(avatar);
  }

  private setupInteractivity(): void {
    const isInteractive = !this.isDead && !this.hasActed;
    
    this.interactive = isInteractive;
    this.cursor = isInteractive ? 'pointer' : 'default';

    if (!isInteractive) {
      return;
    }

    this.on('pointerover', () => {
      gsap.to(this.hoverOverlay, { alpha: 0.08, duration: 0.35, ease: 'power2.out' });
      gsap.to(this.glowEffect, { alpha: 0.8, duration: 0.35, ease: 'power2.out' });
      gsap.to(this.scale, { x: 1.03, y: 1.03, duration: 0.35, ease: 'power2.out' });
    });

    this.on('pointerout', () => {
      gsap.to(this.hoverOverlay, { alpha: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(this.glowEffect, { alpha: 0, duration: 0.35, ease: 'power2.out' });
      gsap.to(this.scale, { x: 1.0, y: 1.0, duration: 0.35, ease: 'power2.out' });
    });
  }

  public isDraggable(): boolean {
    return !this.isDead && !this.hasActed;
  }

  public updateState(character: any): void {
    this.character = character;
    this.isDead = character.hp <= 0;
    this.hasActed = character.has_acted || character.hasActed || false;
    
    // Redraw active effects
    this.drawActiveEffects(character);
    
    this.setupInteractivity();
  }

  private drawHexagon(graphics: Graphics, x: number, y: number, radius: number): void {
    const points: number[] = [];
    for (let i = 0; i < 6; i++) {
      const angle = (Math.PI / 3) * i - Math.PI / 2;
      points.push(x + radius * Math.cos(angle), y + radius * Math.sin(angle));
    }
    graphics.poly(points);
  }
}
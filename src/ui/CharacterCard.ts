import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

const defaultCharacterCardOptions = {
  width: 100,
  height: 120,
};

export type CharacterCardOptions = typeof defaultCharacterCardOptions;

export class CharacterCard extends Container {
  public character: any;

  constructor(character: any, options: Partial<CharacterCardOptions> = {}) {
    super();

    const opts = { ...defaultCharacterCardOptions, ...options };
    this.character = character;
    const { width, height } = opts;

    // 1. Art Deco metallic frame with geometric accents
    const frame = new Graphics();
    // Outer metallic frame (gold for legendary, silver for epic, bronze for rare, etc.)
    const rarityMetal: Record<string, number> = {
      legendary: 0xFFD700, // gold
      epic: 0xC0C0C0,      // silver
      rare: 0xCD7F32,      // bronze
      uncommon: 0x7FFFD4,  // aquamarine
      common: 0xB0B0B0     // gray
    };
    const frameColor = rarityMetal[character.rarity] || rarityMetal.common;
    frame.roundRect(0, 0, width, height, 12);
    frame.stroke({ width: 4, color: frameColor, alpha: 0.95 });

    // Art Deco geometric corner accents
    for (const [x, y] of [
      [8, 8], [width - 8, 8], [8, height - 8], [width - 8, height - 8]
    ]) {
      frame.rect(x - 4, y - 4, 8, 8);
      frame.stroke({ width: 2, color: frameColor, alpha: 0.5 });
    }
    this.addChild(frame);

    // 2. Deep gradient background with subtle Art Deco pattern
    const bg = new Graphics();
    // Simulate a vertical gradient (Pixi v8: use a solid for now, or use a gradient texture for full effect)
    const decoBgColor = 0x1a2337; // deep blue
    bg.roundRect(4, 4, width - 8, height - 8, 8);
    bg.fill({ color: decoBgColor, alpha: 1 });

    // Subtle Art Deco pattern overlay (diagonal lines)
    for (let i = 0; i < width; i += 12) {
      bg.moveTo(4 + i, 4);
      bg.lineTo(4, 4 + i);
      bg.stroke({ width: 1, color: 0xffffff, alpha: 0.04 });
    }
    this.addChild(bg);

    // 3. Avatar in a metallic circle with gradient
    const avatarCircle = new Graphics();
    const avatarRadius = width * 0.28;
    avatarCircle.circle(width / 2, height / 2 - 8, avatarRadius);
    avatarCircle.fill({ color: 0x222a38, alpha: 1 });
    avatarCircle.stroke({ width: 3, color: frameColor, alpha: 0.7 });
    this.addChild(avatarCircle);

    this.loadAvatar(character, width, height);

    // 4. Stats in geometric medallions (top corners)
    const statBgColor = 0x222a38;
    const statTextColor = frameColor;
    // ATK (top-left, hexagon)
    const atkMedallion = new Graphics();
    this.drawHexagon(atkMedallion, 18, 18, 13);
    atkMedallion.fill({ color: statBgColor, alpha: 1 });
    atkMedallion.stroke({ width: 2, color: frameColor, alpha: 0.7 });
    this.addChild(atkMedallion);

    const atkText = new Text({
      text: `${character.atk}222`,
      style: {
        fontFamily: 'Merriweather, serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: statTextColor,
        align: 'center'
      }
    });
    atkText.anchor.set(0.5);
    atkText.x = 18;
    atkText.y = 18;
    this.addChild(atkText);

    // DEF (top-right, octagon)
    const defMedallion = new Graphics();
    this.drawOctagon(defMedallion, width - 18, 18, 13);
    defMedallion.fill({ color: statBgColor, alpha: 1 });
    defMedallion.stroke({ width: 2, color: frameColor, alpha: 0.7 });
    this.addChild(defMedallion);

    const defText = new Text({
      text: `${character.def}`,
      style: {
        fontFamily: 'Merriweather, serif',
        fontSize: 13,
        fontWeight: 'bold',
        fill: statTextColor,
        align: 'center'
      }
    });
    defText.anchor.set(0.5);
    defText.x = width - 18;
    defText.y = 18;
    this.addChild(defText);

    // 5. Sleek HP/Energy bars with metallic borders and deco caps
    const barWidth = width * 0.82;
    const barHeight = 7;
    const barX = (width - barWidth) / 2;
    const hpBarY = height - 22;
    const energyBarY = height - 12;

    // HP metallic border
    const hpBarBorder = new Graphics();
    hpBarBorder.roundRect(barX - 2, hpBarY - 2, barWidth + 4, barHeight + 4, 4);
    hpBarBorder.stroke({ width: 2, color: frameColor, alpha: 0.7 });
    this.addChild(hpBarBorder);

    // HP bar
    const hpPercent = Math.max(0, Math.min(1, character.hp / (character.max_hp || character.hp || 1)));
    const hpBar = new Graphics();
    hpBar.roundRect(barX, hpBarY, barWidth * hpPercent, barHeight, 3);
    hpBar.fill({ color: 0xE53935, alpha: 0.95 });
    this.addChild(hpBar);

    // HP deco caps
    const hpCapL = new Graphics();
    hpCapL.roundRect(barX - 6, hpBarY - 2, 4, barHeight + 4, 2);
    hpCapL.fill({ color: frameColor, alpha: 0.8 });
    this.addChild(hpCapL);
    const hpCapR = new Graphics();
    hpCapR.roundRect(barX + barWidth + 2, hpBarY - 2, 4, barHeight + 4, 2);
    hpCapR.fill({ color: frameColor, alpha: 0.8 });
    this.addChild(hpCapR);

    // Energy metallic border
    const energyBarBorder = new Graphics();
    energyBarBorder.roundRect(barX - 2, energyBarY - 2, barWidth + 4, barHeight + 4, 4);
    energyBarBorder.stroke({ width: 2, color: frameColor, alpha: 0.7 });
    this.addChild(energyBarBorder);

    // Energy bar
    const maxEnergy = character.max_energy || 100;
    const currentEnergy = character.current_energy || character.energy || 0;
    const energyPercent = Math.max(0, Math.min(1, currentEnergy / maxEnergy));
    const energyBar = new Graphics();
    energyBar.roundRect(barX, energyBarY, barWidth * energyPercent, barHeight, 3);
    energyBar.fill({ color: 0x00B8D4, alpha: 0.95 });
    this.addChild(energyBar);

    // Energy deco caps
    const energyCapL = new Graphics();
    energyCapL.roundRect(barX - 6, energyBarY - 2, 4, barHeight + 4, 2);
    energyCapL.fill({ color: frameColor, alpha: 0.8 });
    this.addChild(energyCapL);
    const energyCapR = new Graphics();
    energyCapR.roundRect(barX + barWidth + 2, energyBarY - 2, 4, barHeight + 4, 2);
    energyCapR.fill({ color: frameColor, alpha: 0.8 });
    this.addChild(energyCapR);

    // 6. Defeated or acted overlay
    if (character.hp === 0) {
      this.alpha = 0.5;
      const defeatedOverlay = new Graphics();
      defeatedOverlay.roundRect(0, 0, width, height, 12);
      defeatedOverlay.fill({ color: 0x000000, alpha: 0.6 });
      const defeatedText = new Text({
        text: 'DEFEATED',
        style: {
          fontFamily: 'Merriweather, serif',
          fontSize: Math.max(10, Math.min(14, width * 0.12)),
          fontWeight: 'bold',
          fill: 0xffd700,
          align: 'center'
        }
      });
      defeatedText.anchor.set(0.5);
      defeatedText.x = width / 2;
      defeatedText.y = height / 2;
      this.addChild(defeatedOverlay, defeatedText);
    } else if (character.has_acted) {
      this.alpha = 0.5;
      const overlay = new Graphics();
      overlay.roundRect(0, 0, width, height, 12);
      overlay.fill({ color: 0x000000, alpha: 0.3 });
      this.addChild(overlay);
    }
  }

  private async loadAvatar(character: any, width: number, height: number) {
    try {
      const avatarTexture = await Assets.load(character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarIcon = new Sprite(avatarTexture);
      avatarIcon.width = width * 0.44;
      avatarIcon.height = height * 0.44;
      avatarIcon.anchor.set(0.5);
      avatarIcon.x = width / 2;
      avatarIcon.y = height / 2 - 8;
      this.addChild(avatarIcon);

      // Metallic sheen overlay (ellipse)
      const sheen = new Graphics();
      sheen.ellipse(width / 2, height / 2 - 18, width * 0.18, 8);
      sheen.fill({ color: 0xffffff, alpha: 0.13 });
      //this.addChild(sheen);
    } catch (error) {
      console.warn('Failed to load avatar:', error);
    }
  }

  // Draw a regular hexagon centered at (cx, cy) with radius r
  private drawHexagon(g: Graphics, cx: number, cy: number, r: number) {
    g.moveTo(cx + r, cy);
    for (let i = 1; i <= 6; i++) {
      const angle = Math.PI / 3 * i;
      g.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    g.closePath();
  }

  // Draw a regular octagon centered at (cx, cy) with radius r
  private drawOctagon(g: Graphics, cx: number, cy: number, r: number) {
    g.moveTo(cx + r, cy);
    for (let i = 1; i <= 8; i++) {
      const angle = Math.PI / 4 * i;
      g.lineTo(cx + r * Math.cos(angle), cy + r * Math.sin(angle));
    }
    g.closePath();
  }
}
import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Card, CardType, CardRarity } from '@/types';
import { DropShadowFilter } from 'pixi-filters';

export class CardDetailPopup extends Container {
  private dialogPanel!: Graphics;
  private card: Card;

  public static readonly CARD_WIDTH = 300;
  public static readonly CARD_HEIGHT = 400;

  private readonly CARD_MAX_WIDTH = CardDetailPopup.CARD_WIDTH;
  private readonly CARD_MAX_HEIGHT = CardDetailPopup.CARD_HEIGHT;

  constructor(params: { card: Card }) {
    super();
    this.card = params.card;
    this.createDialog();
  }

  private createDialog(): void {
    this.createCardDisplay();
  }

  private createCardDisplay(): void {
    // Use fixed card size (same as DeckCard visual style but larger)
    const cardWidth = this.CARD_MAX_WIDTH;
    const cardHeight = this.CARD_MAX_HEIGHT;

    // Create card with Slay the Spire style (no background overlay)
    this.dialogPanel = new Graphics();

    // Multiple shadow layers for dramatic depth
    this.dialogPanel.roundRect(8, 8, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.6 });

    this.dialogPanel.roundRect(5, 5, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.4 });

    this.dialogPanel.roundRect(2, 2, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.2 });

    // Main card background - aged parchment
    this.dialogPanel.roundRect(0, 0, cardWidth, cardHeight, 16)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 4, color: Colors.GOLD }); // Golden border

    // Inner darker parchment layer
    this.dialogPanel.roundRect(6, 6, cardWidth - 12, cardHeight - 12, 12)
      .fill({ color: Colors.PARCHMENT, alpha: 0.7 });

    // Inner golden highlight/trim
    this.dialogPanel.roundRect(8, 8, cardWidth - 16, cardHeight - 16, 10)
      .stroke({ width: 2, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    // Ornate decorative corners on main card
    this.drawOrnateCorners(0, 0, cardWidth, cardHeight);

    // Top banner
    const rarityColor = this.getRarityColor(this.card.rarity);
    const bannerHeight = 32;
    this.dialogPanel.moveTo(18, 18)
      .lineTo(14, 26)
      .lineTo(18, 18 + bannerHeight)
      .lineTo(cardWidth - 18, 18 + bannerHeight)
      .lineTo(cardWidth - 14, 26)
      .lineTo(cardWidth - 18, 18)
      .lineTo(18, 18)
      .fill({ color: rarityColor, alpha: 0.85 })
      .stroke({ width: 2, color: Colors.BROWN });

    // Art frame
    const frameMargin = 18;
    const frameY = 70;
    const frameHeight = 140;
    const frameWidth = cardWidth - (frameMargin * 2);

    this.dialogPanel.roundRect(frameMargin, frameY, frameWidth, frameHeight, 10)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.95 });

    this.dialogPanel.roundRect(frameMargin + 2, frameY + 2, frameWidth - 4, frameHeight - 4, 8)
      .stroke({ width: 1, color: Colors.BROWN, alpha: 0.6 });

    this.drawFantasyCorners(frameMargin, frameY, frameWidth, frameHeight, Colors.GOLD_BRIGHT);

    this.addChild(this.dialogPanel);

    // Energy cost badge
    const energyBadge = this.createEnergyGem(18, 38, 44, 28);
    this.addChild(energyBadge);

    // Group icon (top right)
    const groupIcon = this.getGroupIcon(this.card.group);
    const groupColor = this.getGroupColor(this.card.group);

    const groupIconBg = new Graphics()
      .circle(cardWidth - 32, 54, 18)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.95 });

    groupIconBg.circle(cardWidth - 32, 54, 15)
      .stroke({ width: 1, color: groupColor, alpha: 0.7 });

    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 26,
        fill: Colors.WHITE
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = cardWidth - 32;
    groupIconText.y = 54;
    groupIconText.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 8,
      alpha: 0.9,
      color: groupColor
    })];

    this.addChild(groupIconBg, groupIconText);

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 80,
        stroke: { color: Colors.GOLD_BRIGHT, width: 1.5 },
        dropShadow: { color: Colors.GOLD, blur: 2, angle: Math.PI / 4, distance: 1, alpha: 0.5 }
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = cardWidth / 2;
    cardNameText.y = 20;
    this.addChild(cardNameText);

    // Avatar icon
    const avatarIcon = new Text({
      text: this.card.icon_url || groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 80,
        fill: Colors.WHITE
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = cardWidth / 2;
    avatarIcon.y = frameY + frameHeight / 2;
    avatarIcon.filters = [new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 12,
      alpha: 0.9,
      color: groupColor
    })];
    this.addChild(avatarIcon);

    // Divider
    const divider = new Graphics();
    divider.moveTo(24, cardHeight - 120)
      .lineTo(cardWidth - 24, cardHeight - 120)
      .stroke({ width: 1.5, color: Colors.BROWN, alpha: 0.5 });
    divider.circle(cardWidth / 2, cardHeight - 120, 2)
      .fill({ color: Colors.GOLD });
    this.addChild(divider);

    // Description
    const descY = cardHeight - 110;
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.BROWN_DARKER,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 40,
        lineHeight: 18
      }
    });
    descText.anchor.set(0.5, 0);
    descText.x = cardWidth / 2;
    descText.y = descY;
    this.addChild(descText);

    // Effects list
    let effectsY = descY + descText.height + 12;
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsTitle = new Text({
        text: '⚡ EFFECTS ⚡',
        style: {
          fontFamily: 'Kalam',
          fontSize: 15,
          fontWeight: 'bold',
          fill: Colors.ORANGE_RUST_DARK,
          align: 'center',
          stroke: { color: Colors.GOLD_BRIGHT, width: 0.5 }
        }
      });
      effectsTitle.anchor.set(0.5, 0);
      effectsTitle.x = cardWidth / 2;
      effectsTitle.y = effectsY;
      this.addChild(effectsTitle);

      effectsY += 22;

      this.card.effects.forEach((effect, index) => {
        const effectBadge = this.createEffectBadge(
          effect,
          cardWidth / 2 - 120,
          effectsY + (index * 28)
        );
        this.addChild(effectBadge);
      });
    }
  }

  private createEnergyGem(x: number, y: number, width: number, height: number): Container {
    const gem = new Container();

    // Gem shape (hexagonal/diamond style)
    const gemBg = new Graphics();
    
    // Dark background
    gemBg.roundRect(0, 0, width, height, height / 4)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.GOLD, alpha: 0.95 });
    
    // Inner shine/highlight
    gemBg.roundRect(2, 2, width - 4, height - 4, height / 4 - 1)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.45,
        fill: Colors.ORANGE,
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 4,
          angle: 0,
          distance: 0,
          alpha: 0.8
        }
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = width * 0.3;
    energyIcon.y = height / 2;

    const energyText = new Text({
      text: this.card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.55,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.BROWN_DARK, width: 3 }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = width * 0.7;
    energyText.y = height / 2;

    gem.addChild(gemBg, energyIcon, energyText);
    gem.x = x;
    gem.y = y;

    return gem;
  }

  private createFantasyBadge(text: string, x: number, y: number, color: string, isSmall: boolean): Container {
    const badge = new Container();
    const badgeWidth = isSmall ? 100 : 120;
    const badgeHeight = isSmall ? 24 : 36;
    const fontSize = isSmall ? 11 : 14;

    // Badge background - parchment style with colored border
    const bg = new Graphics()
      .roundRect(0, 0, badgeWidth, badgeHeight, 6)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.95 })
      .stroke({ width: 2, color: color, alpha: 0.95 });
    
    // Inner accent
    bg.roundRect(2, 2, badgeWidth - 4, badgeHeight - 4, 4)
      .stroke({ width: 1, color: Colors.GOLD, alpha: 0.4 });

    const badgeText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: fontSize,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK,
        align: 'center',
        stroke: {
          color: Colors.GOLD_BRIGHT,
          width: 0.5
        }
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = badgeWidth / 2;
    badgeText.y = badgeHeight / 2;

    badge.addChild(bg, badgeText);
    badge.x = x;
    badge.y = y;

    return badge;
  }

  private createEffectBadge(effect: any, x: number, y: number): Container {
    const badge = new Container();
    const badgeWidth = 280;
    const badgeHeight = 36;

    // Parchment background with ornate border
    const bg = new Graphics()
      .roundRect(0, 0, badgeWidth, badgeHeight, 6)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ORANGE_RUST_DARK, alpha: 0.8 });
    
    // Inner golden accent
    bg.roundRect(2, 2, badgeWidth - 4, badgeHeight - 4, 4)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.4 });

    const effectText = new Text({
      text: `${effect.type}: ${effect.value}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: Colors.BROWN_DARKER,
        align: 'left',
        fontWeight: 'bold'
      }
    });
    effectText.x = 14;
    effectText.y = badgeHeight / 2;
    effectText.anchor.set(0, 0.5);

    badge.addChild(bg, effectText);
    badge.x = x;
    badge.y = y;

    return badge;
  }



  private drawOrnateCorners(x: number, y: number, width: number, height: number): void {
    const cornerSize = 20;
    const cornerColor = Colors.GOLD_BRIGHT;

    // Top-left ornate corner
    this.dialogPanel.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    // Small decorative flourish
    this.dialogPanel.circle(x + 8, y + 8, 2)
      .fill({ color: cornerColor });

    // Top-right
    this.dialogPanel.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + width - 8, y + 8, 2)
      .fill({ color: cornerColor });

    // Bottom-left
    this.dialogPanel.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + 8, y + height - 8, 2)
      .fill({ color: cornerColor });

    // Bottom-right
    this.dialogPanel.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 3, color: cornerColor, alpha: 0.9 });
    
    this.dialogPanel.circle(x + width - 8, y + height - 8, 2)
      .fill({ color: cornerColor });
  }

  private drawFantasyCorners(x: number, y: number, width: number, height: number, color: string): void {
    const cornerSize = 12;

    // More elaborate corner decorations
    const cornerGraphics = new Graphics();

    // Top-left L-shape with ornament
    cornerGraphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + 5, y + 5, 1.5)
      .fill({ color: color });

    // Top-right
    cornerGraphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + width - 5, y + 5, 1.5)
      .fill({ color: color });

    // Bottom-left
    cornerGraphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + 5, y + height - 5, 1.5)
      .fill({ color: color });

    // Bottom-right
    cornerGraphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.9 });
    
    cornerGraphics.circle(x + width - 5, y + height - 5, 1.5)
      .fill({ color: color });

    this.addChild(cornerGraphics);
  }

  private getGroupIcon(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack') || groupLower.includes('damage')) return '⚔️';
    return '✨';
  }

  private getGroupColor(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack') || groupLower.includes('damage')) return Colors.RED;
    return Colors.GREEN_BRIGHT;
  }

  private getRarityColor(rarity?: string): string {
    const rarityColors: { [key: string]: string } = {
      common: Colors.GRAY_SILVER,    // Grey
      uncommon: Colors.GREEN_BRIGHT,  // Green
      rare: Colors.BLUE_SKY,      // Blue
      epic: Colors.PURPLE_BRIGHT,      // Purple
      legendary: Colors.ORANGE  // Gold/Orange
    };
    return rarityColors[rarity?.toLowerCase() || 'common'] || rarityColors.common;
  }

  public positionAtTop(screenWidth: number, screenHeight: number, padding: number = 20): void {
    // Position the card detail popup at the top center of the screen
    // Above the logZone, not overriding p1CharacterZone and p1HandZone
    this.x = (screenWidth - this.CARD_MAX_WIDTH) / 2;
    this.y = padding;
  }
}
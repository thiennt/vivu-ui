import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { Card, CardType, CardRarity } from '@/types';
import { DropShadowFilter } from 'pixi-filters';

export class CardDetailPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private card: Card;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { card: Card }) {
    super();
    this.card = params.card;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    this.createPopupMode();
  }

  private createPopupMode(): void {
    // Create semi-transparent background with vignette
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.BROWN_DARKEST, alpha: 0.85 });

    const cardWidth = Math.min(400, this.gameWidth - 40);
    const cardHeight = Math.min(680, this.gameHeight - 60);
    const cardX = (this.gameWidth - cardWidth) / 2;
    const cardY = (this.gameHeight - cardHeight) / 2;

    // Create card with Slay the Spire style
    this.dialogPanel = new Graphics();

    // Multiple shadow layers for dramatic depth
    this.dialogPanel.roundRect(cardX + 8, cardY + 8, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.6 });

    this.dialogPanel.roundRect(cardX + 5, cardY + 5, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.4 });

    this.dialogPanel.roundRect(cardX + 2, cardY + 2, cardWidth, cardHeight, 16)
      .fill({ color: Colors.BLACK, alpha: 0.2 });

    // Main card background - aged parchment
    this.dialogPanel.roundRect(cardX, cardY, cardWidth, cardHeight, 16)
      .fill({ color: Colors.PARCHMENT_LIGHT, alpha: 0.98 })
      .stroke({ width: 4, color: Colors.GOLD }); // Golden border

    // Inner darker parchment layer
    this.dialogPanel.roundRect(cardX + 6, cardY + 6, cardWidth - 12, cardHeight - 12, 12)
      .fill({ color: Colors.PARCHMENT, alpha: 0.7 });

    // Inner golden highlight/trim
    this.dialogPanel.roundRect(cardX + 8, cardY + 8, cardWidth - 16, cardHeight - 16, 10)
      .stroke({ width: 2, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    // Ornate decorative corners on main card
    this.drawOrnateCorners(cardX, cardY, cardWidth, cardHeight);

    // Top decorative banner with rarity color
    const rarityColor = this.getRarityColor(this.card.rarity);
    const bannerHeight = 40;
    
    // Banner with decorative shape
    this.dialogPanel.moveTo(cardX + 20, cardY + 20)
      .lineTo(cardX + 15, cardY + 30)
      .lineTo(cardX + 20, cardY + 20 + bannerHeight)
      .lineTo(cardX + cardWidth - 20, cardY + 20 + bannerHeight)
      .lineTo(cardX + cardWidth - 15, cardY + 30)
      .lineTo(cardX + cardWidth - 20, cardY + 20)
      .lineTo(cardX + 20, cardY + 20)
      .fill({ color: rarityColor, alpha: 0.85 })
      .stroke({ width: 2, color: Colors.BROWN });

    // Avatar/Art frame with ornate decorative border
    const frameMargin = 25;
    const frameY = cardY + 120;
    const frameHeight = 200;
    const frameWidth = cardWidth - (frameMargin * 2);

    // Dark inner frame with golden border
    this.dialogPanel.roundRect(cardX + frameMargin, frameY, frameWidth, frameHeight, 12)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.GOLD, alpha: 0.95 });

    // Inner bevel/emboss effect
    this.dialogPanel.roundRect(cardX + frameMargin + 3, frameY + 3, frameWidth - 6, frameHeight - 6, 10)
      .stroke({ width: 2, color: Colors.BROWN, alpha: 0.6 });

    // Decorative fantasy corners on art frame
    this.drawFantasyCorners(cardX + frameMargin, frameY, frameWidth, frameHeight, Colors.GOLD_BRIGHT);

    this.addChild(this.dialogBg, this.dialogPanel);

    // Energy cost - Hidden to simplify game
    /*
    const energyBadge = this.createEnergyGem(cardX + 25, cardY + 75, 55, 45);
    this.addChild(energyBadge);
    */

    // Group icon (top right) - ornate version
    const groupIcon = this.getGroupIcon(this.card.group);
    const groupColor = this.getGroupColor(this.card.group);
    
    const groupIconBg = new Graphics()
      .circle(cardX + cardWidth - 40, cardY + 97, 25)
      .fill({ color: Colors.BROWN_DARK, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.GOLD, alpha: 0.95 });
    
    // Inner magical glow
    groupIconBg.circle(cardX + cardWidth - 40, cardY + 97, 22)
      .stroke({ width: 2, color: groupColor, alpha: 0.7 });

    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 36,
        fill: Colors.WHITE
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = cardX + cardWidth - 40;
    groupIconText.y = cardY + 97;

    // Glowing effect
    const groupIconGlow = new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 12,
      alpha: 0.9,
      color: groupColor
    });
    groupIconText.filters = [groupIconGlow];

    this.addChild(groupIconBg, groupIconText);

    // Card name with fantasy styling and stroke
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fontWeight: 'bold',
        fill: Colors.BROWN_DARK, // Dark brown on parchment
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 160,
        stroke: {
          color: Colors.GOLD_BRIGHT,
          width: 2
        },
        dropShadow: {
          color: Colors.GOLD,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.5
        }
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = cardX + cardWidth / 2;
    cardNameText.y = cardY + 30;
    this.addChild(cardNameText);

    // Large avatar icon in frame with dramatic glow
    const avatarIcon = new Text({
      text: this.card.icon_url || groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 140,
        fill: Colors.WHITE
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = cardX + cardWidth / 2;
    avatarIcon.y = frameY + frameHeight / 2;

    const avatarShadow = new DropShadowFilter({
      offset: { x: 0, y: 0 },
      blur: 20,
      alpha: 0.9,
      color: groupColor
    });
    avatarIcon.filters = [avatarShadow];
    this.addChild(avatarIcon);

    // Type and rarity badges with fantasy style
    const badgeY = frameY + frameHeight + 20;
    const typeBadge = this.createFantasyBadge(
      (this.card.card_type || this.card.group).toString().toUpperCase(),
      cardX + cardWidth / 2 - 130,
      badgeY,
      Colors.BROWN,
      false
    );

    const rarityBadge = this.createFantasyBadge(
      (this.card.rarity || 'common').toString().toUpperCase(),
      cardX + cardWidth / 2 + 10,
      badgeY,
      rarityColor,
      false
    );

    this.addChild(typeBadge, rarityBadge);

    // Decorative divider line
    const divider = new Graphics();
    divider.moveTo(cardX + 40, badgeY + 50)
      .lineTo(cardX + cardWidth - 40, badgeY + 50)
      .stroke({ width: 2, color: Colors.BROWN, alpha: 0.5 });
    
    // Center ornament
    divider.circle(cardX + cardWidth / 2, badgeY + 50, 3)
      .fill({ color: Colors.GOLD });
    
    this.addChild(divider);

    // Description
    const descY = badgeY + 65;
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fill: Colors.BROWN_DARKER, // Dark brown for readability
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 60,
        lineHeight: 22
      }
    });
    descText.anchor.set(0.5, 0);
    descText.x = cardX + cardWidth / 2;
    descText.y = descY;
    this.addChild(descText);

    // Effects list with ornate styling
    let effectsY = descY + descText.height + 25;
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsTitle = new Text({
        text: '⚡ EFFECTS ⚡',
        style: {
          fontFamily: 'Kalam',
          fontSize: 20,
          fontWeight: 'bold',
          fill: Colors.ORANGE_RUST_DARK,
          align: 'center',
          stroke: {
            color: Colors.GOLD_BRIGHT,
            width: 1
          }
        }
      });
      effectsTitle.anchor.set(0.5, 0);
      effectsTitle.x = cardX + cardWidth / 2;
      effectsTitle.y = effectsY;
      this.addChild(effectsTitle);

      effectsY += 35;

      this.card.effects.forEach((effect, index) => {
        const effectBadge = this.createEffectBadge(
          effect,
          cardX + cardWidth / 2 - 140,
          effectsY + (index * 36)
        );
        this.addChild(effectBadge);
      });
    }

    // Close button with fantasy styling
    const closeButton = this.createFantasyCloseButton(
      cardX + cardWidth / 2 - 70,
      cardY + cardHeight - 70
    );
    this.addChild(closeButton);

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
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

  private createFantasyCloseButton(x: number, y: number): Container {
    const button = new Container();
    const buttonWidth = 140;
    const buttonHeight = 50;

    // Ornate button with parchment and golden trim
    const bg = new Graphics()
      .roundRect(0, 0, buttonWidth, buttonHeight, 10)
      .fill({ color: Colors.BROWN })
      .stroke({ width: 3, color: Colors.GOLD });
    
    // Inner highlight
    bg.roundRect(3, 3, buttonWidth - 6, buttonHeight - 6, 8)
      .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });

    const buttonText = new Text({
      text: 'CLOSE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: {
          color: Colors.BROWN_DARK,
          width: 2
        }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = buttonWidth / 2;
    buttonText.y = buttonHeight / 2;

    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;

    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      navigation.dismissPopup();
    });

    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, buttonWidth, buttonHeight, 10)
        .fill({ color: Colors.BROWN_LIGHT })
        .stroke({ width: 3, color: Colors.GOLD_BRIGHT });
      bg.roundRect(3, 3, buttonWidth - 6, buttonHeight - 6, 8)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.8 });
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, buttonWidth, buttonHeight, 10)
        .fill({ color: Colors.BROWN })
        .stroke({ width: 3, color: Colors.GOLD });
      bg.roundRect(3, 3, buttonWidth - 6, buttonHeight - 6, 8)
        .stroke({ width: 1, color: Colors.GOLD_BRIGHT, alpha: 0.6 });
    });

    return button;
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

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.removeChildren();
    this.createDialog();
  }

  public positionAtTop(_screenWidth: number, _screenHeight: number, _padding: number = 20): void {
    // Popup is already centered in createPopupMode
  }
}
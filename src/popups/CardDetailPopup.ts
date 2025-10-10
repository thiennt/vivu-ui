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
  private isTooltipMode: boolean;

  constructor(params: { card: Card, tooltipMode?: boolean }) {
    super();
    this.card = params.card;
    this.isTooltipMode = params.tooltipMode || false;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    if (this.isTooltipMode) {
      this.createTooltipMode();
    } else {
      this.createPopupMode();
    }
  }

  private createTooltipMode(): void {
    // Compact tooltip with DeckCard style
    const tooltipWidth = 320;
    const tooltipHeight = 200; // Increased from 180 to fit avatar

    // Multi-layer shadow for depth (matching DeckCard)
    const shadowPanel = new Graphics();
    shadowPanel.roundRect(2.5, 2.5, tooltipWidth, tooltipHeight, 8)
      .fill({ color: 0x000000, alpha: 0.3 });
    shadowPanel.roundRect(1.5, 1.5, tooltipWidth, tooltipHeight, 8)
      .fill({ color: 0x000000, alpha: 0.15 });
    this.addChild(shadowPanel);

    // Main tooltip background - charcoal grey (matching DeckCard)
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(0, 0, tooltipWidth, tooltipHeight, 8)
      .fill({ color: 0x2d3436, alpha: 0.98 })
      .stroke({ width: 2, color: 0x636e72 });

    // Inner glow
    this.dialogPanel.roundRect(2, 2, tooltipWidth - 4, tooltipHeight - 4, 6)
      .stroke({ width: 1, color: 0x95a5a6, alpha: 0.3 });

    this.addChild(this.dialogPanel);

    // Top accent bar
    const rarityColor = this.getRarityColor(this.card.rarity);
    const accentBar = new Graphics();
    accentBar.roundRect(8, 8, tooltipWidth - 16, 3, 1.5)
      .fill({ color: rarityColor, alpha: 0.7 });
    this.addChild(accentBar);

    // Energy cost badge (top-left)
    const energyX = 12;
    const energyY = 18;
    const energyBadge = this.createEnergyBadge(energyX, energyY, 30, 22);
    this.addChild(energyBadge);

    // Group icon (top-right)
    const groupIcon = this.getGroupIcon(this.card.group);
    const groupColor = this.getGroupColor(this.card.group);
    const groupIconBg = new Graphics()
      .circle(tooltipWidth - 20, 28, 14)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: groupColor, alpha: 0.85 });

    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xffffff
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = tooltipWidth - 20;
    groupIconText.y = 28;
    this.addChild(groupIconBg, groupIconText);

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: 200,
        dropShadow: {
          color: 0x000000,
          blur: 3,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
        }
      }
    });
    cardNameText.x = 50;
    cardNameText.y = 20;
    this.addChild(cardNameText);

    // Avatar frame (left side, below energy badge)
    const avatarFrameX = 12;
    const avatarFrameY = 55;
    const avatarFrameSize = 70;

    const avatarFrame = new Graphics()
      .roundRect(avatarFrameX, avatarFrameY, avatarFrameSize, avatarFrameSize, 6)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0x636e72, alpha: 0.6 });
    this.addChild(avatarFrame);

    // Avatar icon with shadow
    const avatarIcon = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 48,
        fill: 0xffffff
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = avatarFrameX + avatarFrameSize / 2;
    avatarIcon.y = avatarFrameY + avatarFrameSize / 2;

    const avatarShadow = new DropShadowFilter({
      offset: { x: 2, y: 2 },
      blur: 3,
      alpha: 0.6,
      color: 0x000000
    });
    avatarIcon.filters = [avatarShadow];
    this.addChild(avatarIcon);

    // Type and rarity badges (right side, next to avatar)
    const badgeX = avatarFrameX + avatarFrameSize + 10;
    let badgeY = 60;

    if (this.card.card_type || this.card.group) {
      const typeBadge = this.createSmallBadge(
        (this.card.card_type || this.card.group).toString().toUpperCase(),
        badgeX,
        badgeY,
        0x636e72
      );
      this.addChild(typeBadge);
      badgeY += 30;
    }

    const rarityBadge = this.createSmallBadge(
      (this.card.rarity || 'common').toString().toUpperCase(),
      badgeX,
      badgeY,
      rarityColor
    );
    this.addChild(rarityBadge);

    // Description (below avatar frame)
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fill: 0xe0e0e0,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: tooltipWidth - 24
      }
    });
    descText.x = 12;
    descText.y = 135;
    this.addChild(descText);

    // Effects summary (compact, at bottom)
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsText = this.card.effects
        .slice(0, 2)
        .map(e => `${e.type}: ${e.value}`)
        .join(' • ');

      const effectsSummary = new Text({
        text: effectsText,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: 0xf39c12,
          align: 'left',
          wordWrap: true,
          wordWrapWidth: tooltipWidth - 24
        }
      });
      effectsSummary.x = 12;
      effectsSummary.y = tooltipHeight - 22;
      this.addChild(effectsSummary);
    }
  }

  private createPopupMode(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.8 });

    const cardWidth = Math.min(400, this.gameWidth - 40);
    const cardHeight = Math.min(650, this.gameHeight - 60);
    const cardX = (this.gameWidth - cardWidth) / 2;
    const cardY = (this.gameHeight - cardHeight) / 2;

    // Create card with DeckCard style
    this.dialogPanel = new Graphics();

    // Multi-layer shadow for depth
    this.dialogPanel.roundRect(cardX + 4, cardY + 4, cardWidth, cardHeight, 12)
      .fill({ color: 0x000000, alpha: 0.4 });

    this.dialogPanel.roundRect(cardX + 2, cardY + 2, cardWidth, cardHeight, 12)
      .fill({ color: 0x000000, alpha: 0.2 });

    // Main card background - charcoal grey (matching DeckCard)
    this.dialogPanel.roundRect(cardX, cardY, cardWidth, cardHeight, 12)
      .fill({ color: 0x2d3436, alpha: 0.98 })
      .stroke({ width: 3, color: 0x636e72 });

    // Inner glow/highlight
    this.dialogPanel.roundRect(cardX + 3, cardY + 3, cardWidth - 6, cardHeight - 6, 9)
      .stroke({ width: 1.5, color: 0x95a5a6, alpha: 0.3 });

    // Top decorative bar with rarity color
    const rarityColor = this.getRarityColor(this.card.rarity);
    this.dialogPanel.roundRect(cardX + 12, cardY + 12, cardWidth - 24, 4, 2)
      .fill({ color: rarityColor, alpha: 0.7 });

    // Avatar/Art frame with decorative corners
    const frameMargin = 20;
    const frameY = cardY + 100;
    const frameHeight = 180;
    const frameWidth = cardWidth - (frameMargin * 2);

    // Dark inner frame
    this.dialogPanel.roundRect(cardX + frameMargin, frameY, frameWidth, frameHeight, 8)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 2, color: 0x636e72, alpha: 0.6 });

    // Decorative corner accents (matching DeckCard)
    this.drawCornerAccents(cardX + frameMargin, frameY, frameWidth, frameHeight);

    this.addChild(this.dialogBg, this.dialogPanel);

    // Energy cost (top left) - larger version
    const energyBadge = this.createEnergyBadge(cardX + 20, cardY + 30, 50, 40);
    this.addChild(energyBadge);

    // Group icon (top right) - larger version
    const groupIcon = this.getGroupIcon(this.card.group);
    const groupColor = this.getGroupColor(this.card.group);
    const groupIconBg = new Graphics()
      .circle(cardX + cardWidth - 35, cardY + 50, 22)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 2, color: groupColor, alpha: 0.9 });

    const groupIconText = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 28,
        fill: 0xffffff
      }
    });
    groupIconText.anchor.set(0.5);
    groupIconText.x = cardX + cardWidth - 35;
    groupIconText.y = cardY + 50;

    this.addChild(groupIconBg, groupIconText);

    // Card name
    const cardNameText = new Text({
      text: this.card.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 26,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 140,
        dropShadow: {
          color: 0x000000,
          blur: 4,
          angle: Math.PI / 4,
          distance: 3,
          alpha: 0.7
        }
      }
    });
    cardNameText.anchor.set(0.5, 0);
    cardNameText.x = cardX + cardWidth / 2;
    cardNameText.y = cardY + 28;
    this.addChild(cardNameText);

    // Large avatar icon in frame
    const avatarIcon = new Text({
      text: groupIcon,
      style: {
        fontFamily: 'Kalam',
        fontSize: 120,
        fill: 0xffffff
      }
    });
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = cardX + cardWidth / 2;
    avatarIcon.y = frameY + frameHeight / 2;

    const avatarShadow = new DropShadowFilter({
      offset: { x: 3, y: 3 },
      blur: 6,
      alpha: 0.6,
      color: 0x000000
    });
    avatarIcon.filters = [avatarShadow];
    this.addChild(avatarIcon);

    // Type and rarity badges below frame
    const badgeY = frameY + frameHeight + 15;
    const typeBadge = this.createBadge(
      (this.card.card_type || this.card.group).toString().toUpperCase(),
      cardX + cardWidth / 2 - 125,
      badgeY,
      0x636e72
    );

    const rarityBadge = this.createBadge(
      (this.card.rarity || 'common').toString().toUpperCase(),
      cardX + cardWidth / 2 + 5,
      badgeY,
      rarityColor
    );

    this.addChild(typeBadge, rarityBadge);

    // Description
    const descY = badgeY + 50;
    const descText = new Text({
      text: this.card.description,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0xe0e0e0,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: cardWidth - 50
      }
    });
    descText.anchor.set(0.5, 0);
    descText.x = cardX + cardWidth / 2;
    descText.y = descY;
    this.addChild(descText);

    // Effects list
    let effectsY = descY + descText.height + 20;
    if (this.card.effects && this.card.effects.length > 0) {
      const effectsTitle = new Text({
        text: '⚡ EFFECTS ⚡',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xf39c12,
          align: 'center'
        }
      });
      effectsTitle.anchor.set(0.5, 0);
      effectsTitle.x = cardX + cardWidth / 2;
      effectsTitle.y = effectsY;
      this.addChild(effectsTitle);

      effectsY += 30;

      this.card.effects.forEach((effect, index) => {
        const effectBadge = this.createEffectBadge(
          effect,
          cardX + cardWidth / 2 - 140,
          effectsY + (index * 32)
        );
        this.addChild(effectBadge);
      });
    }

    // Close button at bottom
    const closeButton = this.createCloseButton(
      cardX + cardWidth / 2 - 60,
      cardY + cardHeight - 60
    );
    this.addChild(closeButton);

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
  }

  private createEnergyBadge(x: number, y: number, width: number, height: number): Container {
    const badge = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, width, height, 8)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 2, color: 0xf39c12, alpha: 0.9 });

    const energyIcon = new Text({
      text: '⚡',
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.4,
        fill: 0xf39c12
      }
    });
    energyIcon.anchor.set(0.5);
    energyIcon.x = width * 0.3;
    energyIcon.y = height / 2;

    const energyText = new Text({
      text: this.card.energy_cost.toString(),
      style: {
        fontFamily: 'Kalam',
        fontSize: height * 0.5,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x000000, width: 2 }
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = width * 0.7;
    energyText.y = height / 2;

    badge.addChild(bg, energyIcon, energyText);
    badge.x = x;
    badge.y = y;

    return badge;
  }

  private createBadge(text: string, x: number, y: number, color: number): Container {
    const badge = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, 115, 35, 8)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 2, color: color, alpha: 0.9 });

    const badgeText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 57.5;
    badgeText.y = 17.5;

    badge.addChild(bg, badgeText);
    badge.x = x;
    badge.y = y;

    return badge;
  }

  private createSmallBadge(text: string, x: number, y: number, color: number): Container {
    const badge = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, 100, 24, 6)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: color, alpha: 0.9 });

    const badgeText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 11,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 50;
    badgeText.y = 12;

    badge.addChild(bg, badgeText);
    badge.x = x;
    badge.y = y;

    return badge;
  }

  private createEffectBadge(effect: any, x: number, y: number): Container {
    const badge = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, 280, 28, 6)
      .fill({ color: 0x1a1d1f, alpha: 0.95 })
      .stroke({ width: 1.5, color: 0xf39c12, alpha: 0.7 });

    const effectText = new Text({
      text: `${effect.type}: ${effect.value}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fill: 0xe0e0e0,
        align: 'left'
      }
    });
    effectText.x = 12;
    effectText.y = 14;
    effectText.anchor.set(0, 0.5);

    badge.addChild(bg, effectText);
    badge.x = x;
    badge.y = y;

    return badge;
  }

  private createCloseButton(x: number, y: number): Container {
    const button = new Container();

    const bg = new Graphics()
      .roundRect(0, 0, 120, 45, 8)
      .fill({ color: 0x636e72 })
      .stroke({ width: 2, color: 0x95a5a6 });

    const buttonText = new Text({
      text: 'CLOSE',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffffff
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = 60;
    buttonText.y = 22.5;

    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;

    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', () => {
      navigation.dismissPopup();
    });

    button.on('pointerover', () => {
      bg.tint = 0x95a5a6;
    });
    button.on('pointerout', () => {
      bg.tint = 0xffffff;
    });

    return button;
  }

  private drawCornerAccents(x: number, y: number, width: number, height: number): void {
    const cornerSize = 8;
    const cornerColor = 0x95a5a6;

    // Top-left
    this.dialogPanel.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 1.5, color: cornerColor, alpha: 0.8 });

    // Top-right
    this.dialogPanel.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 1.5, color: cornerColor, alpha: 0.8 });

    // Bottom-left
    this.dialogPanel.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 1.5, color: cornerColor, alpha: 0.8 });

    // Bottom-right
    this.dialogPanel.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 1.5, color: cornerColor, alpha: 0.8 });
  }

  private getGroupIcon(group: string): string {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack') || groupLower.includes('damage')) return '⚔️';
    if (groupLower.includes('heal')) return '✨';
    if (groupLower.includes('debuff') || groupLower.includes('control')) return '🌀';
    if (groupLower.includes('buff') || groupLower.includes('enhancement')) return '🔼';
    return '⭐';
  }

  private getGroupColor(group: string): number {
    const groupLower = group.toLowerCase();
    if (groupLower.includes('attack')) return 0xe74c3c;
    if (groupLower.includes('heal')) return 0x26de81;
    if (groupLower.includes('debuff')) return 0xa55eea;
    if (groupLower.includes('buff')) return 0x4a90e2;
    return 0xffffff;
  }

  private getRarityColor(rarity?: string): number {
    const rarityColors: { [key: string]: number } = {
      common: 0x95a5a6,
      uncommon: 0x26de81,
      rare: 0x4a90e2,
      epic: 0xa55eea,
      legendary: 0xf39c12
    };
    return rarityColors[rarity?.toLowerCase() || 'common'] || rarityColors.common;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.removeChildren();
    this.createDialog();
  }

  public positionAtTop(screenWidth: number, screenHeight: number, _padding: number = 20): void {
    if (this.isTooltipMode) {
      this.x = (screenWidth - 320) / 2;
      this.y = screenHeight * 0.25;
    }
  }
}

// Helper function to convert Card to battle card format
export function cardToBattleCard(card: Card): Card {
  return {
    ...card,
    energy_cost: card.energy_cost || 0,
    card_type: card.card_type || card.group,
    rarity: card.rarity || 'common'
  };
}
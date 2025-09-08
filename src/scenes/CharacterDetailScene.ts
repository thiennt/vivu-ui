import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { Character } from '@/types';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';

export class CharacterDetailScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  private character: Character | null = null;

  constructor(params?: { selectedCharacter: Character }) {
    super();
    
    this.character = params?.selectedCharacter || null;
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    if (!this.character) {
      navigation.showScreen(HomeScene);
      return;
    }

    this.createBackground();
    this.createHeader();
    this.createCharacterInfo();
    this.createStatsDisplay();
    this.createSkillsDisplay();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(0x2c1810).rect(0, 0, this.gameWidth, this.gameHeight);
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle(this.character!.name, this.gameWidth / 2, 60);
    this.addChild(title);
  }

  private createCharacterInfo(): void {
    const infoContainer = new Container();

    // Responsive card width: 1/3 of screen
    const panelPadding = 10;
    const panelWidth = Math.floor(this.gameWidth / 3) - panelPadding * 1.5;
    const cardWidth = panelWidth;
    const cardHeight = 250;
    const cardX = panelPadding;
    const cardY = 120;

    const largeCard = this.createCard(0, 0, cardWidth, cardHeight, this.character!.rarity);

    // Center X for elements inside the card
    const centerX = cardWidth / 2;

    // Symbol
    const symbolText = new Text({
      text: this.character!.tokenSymbol,
      style: {
        fontFamily: 'Kalam',
        fontSize: 48,
        fontWeight: 'bold',
        fill: 0xffffff,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = centerX;
    symbolText.y = 60;

    // Level
    const levelText = new Text({
      text: `Level ${this.character!.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffecb3,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = centerX;
    levelText.y = 120;

    // Experience
    const expText = new Text({
      text: `EXP: ${this.character!.experience}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    expText.anchor.set(0.5);
    expText.x = centerX;
    expText.y = 150;

    // Rarity
    const rarityText = new Text({
      text: `★ ${this.character!.rarity.toUpperCase()} ★`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: this.getRarityColor(this.character!.rarity),
        align: 'center'
      }
    });
    rarityText.anchor.set(0.5);
    rarityText.x = centerX;
    rarityText.y = 180;

    // Element
    const elementText = new Text({
      text: `Element: ${this.character!.element.toUpperCase()}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: 0xd7ccc8,
        align: 'center'
      }
    });
    elementText.anchor.set(0.5);
    elementText.x = centerX;
    elementText.y = 210;

    largeCard.addChild(symbolText, levelText, expText, rarityText, elementText);
    infoContainer.addChild(largeCard);

    // Position infoContainer with padding
    infoContainer.x = panelPadding;
    infoContainer.y = cardY;

    this.addChild(infoContainer);
  }

  private createStatsDisplay(): void {
    const statsContainer = new Container();

    // Responsive panel width: 2/3 of screen
    const panelPadding = 10;
    const panelWidth = Math.floor(this.gameWidth * 2 / 3) - panelPadding * 1.5 - this.STANDARD_PADDING;
    const panelHeight = 250;

    // Stats panel background
    const statsPanelBg = new Graphics();
    statsPanelBg.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

    statsContainer.addChild(statsPanelBg);

    // Title
    const title = new Text({
      text: 'Character Statistics',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    title.x = panelPadding;
    title.y = 15;
    statsContainer.addChild(title);

    // Stats
    const stats = [
      { name: 'Health', value: this.character!.stats.health, color: 0x4caf50 },
      { name: 'Attack', value: this.character!.stats.attack, color: 0xf44336 },
      { name: 'Defense', value: this.character!.stats.defense, color: 0x2196f3 },
      { name: 'Speed', value: this.character!.stats.speed, color: 0xffeb3b },
      { name: 'Crit Rate', value: this.character!.stats.criticalRate + '%', color: 0xff9800 },
      { name: 'Crit Damage', value: this.character!.stats.criticalDamage + '%', color: 0x9c27b0 }
    ];

    const maxValue = Math.max(...stats.filter(s => typeof s.value === 'number').map(s => s.value as number));

    stats.forEach((stat, index) => {
      const y = 50 + (index * 30);

      // Stat name
      const nameText = new Text({
        text: stat.name + ':',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fill: 0xd7ccc8
        }
      });
      nameText.x = panelPadding;
      nameText.y = y;
      statsContainer.addChild(nameText);

      // Stat value
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.x = panelWidth - 80;
      valueText.y = y;
      statsContainer.addChild(valueText);

      // Stat bar background
      const barBg = new Graphics();
      barBg.fill(0x424242).rect(panelPadding, y + 20, panelWidth - 2 * panelPadding, 4);
      statsContainer.addChild(barBg);

      // Stat bar
      const barWidth = (typeof stat.value === 'number' ? stat.value : 0) / maxValue * (panelWidth - 2 * panelPadding);
      const bar = new Graphics();
      bar.fill(stat.color).rect(panelPadding, y + 20, barWidth, 4);
      statsContainer.addChild(bar);
    });

    // Position statsContainer to the right of character info with padding
    statsContainer.x = Math.floor(this.gameWidth / 3) + panelPadding * 1.5;
    statsContainer.y = 120;

    this.addChild(statsContainer);
  }

  private createSkillsDisplay(): void {
    const skillsContainer = new Container();
    const panelPadding = 15;
    const panelWidth = this.gameWidth - 2 * panelPadding;
    const panelHeight = 150;

    // Place skills panel above the back button with padding
    const bottomPadding = 100; // Height of back button + extra space
    const skillsPanelY = this.gameHeight - panelHeight - bottomPadding;

    // Skills panel background
    const skillsPanel = new Graphics();
    skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

    // Title
    const title = new Text({
      text: 'Skills & Abilities',
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    title.x = panelPadding;
    title.y = 15;

    skillsContainer.addChild(skillsPanel, title);

    // Layout skill cards horizontally, wrap if needed
    const skillCardWidth = 280;
    const skillCardHeight = 80;
    const skillSpacing = 20;
    let x = panelPadding;
    let y = 50;
    const maxRowWidth = panelWidth - panelPadding;

    this.character!.skills.forEach((skill, index) => {
      if (x + skillCardWidth > maxRowWidth) {
        x = panelPadding;
        y += skillCardHeight + 10;
      }

      const skillCard = new Container();

      // Skill background
      const skillBg = new Graphics();
      skillBg.roundRect(0, 0, skillCardWidth, skillCardHeight, 8)
        .fill({ color: 0x5d4037, alpha: 0.8 })
        .stroke({ width: 2, color: 0x8d6e63 });

      // Skill name
      const skillName = new Text({
        text: skill.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xffecb3
        }
      });
      skillName.x = 10;
      skillName.y = 10;

      // Skill description
      const skillDesc = new Text({
        text: skill.description,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: 0xd7ccc8,
          wordWrap: true,
          wordWrapWidth: skillCardWidth - 20
        }
      });
      skillDesc.x = 10;
      skillDesc.y = 30;

      // Skill stats
      const skillStats = new Text({
        text: `Damage: ${skill.damage} | Cooldown: ${skill.cooldown}s | Mana: ${skill.manaCost}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: 0xa1887f
        }
      });
      skillStats.x = 10;
      skillStats.y = 60;

      skillCard.addChild(skillBg, skillName, skillDesc, skillStats);
      skillCard.x = x;
      skillCard.y = y;

      skillsContainer.addChild(skillCard);

      x += skillCardWidth + skillSpacing;
    });

    skillsContainer.x = panelPadding;
    skillsContainer.y = skillsPanelY;

    this.addChild(skillsContainer);
  }

  private getRarityColor(rarity: string): number {
    const colors: { [key: string]: number } = {
      common: 0x8d6e63,
      uncommon: 0x66bb6a,
      rare: 0x42a5f5,
      epic: 0xab47bc,
      legendary: 0xff9800
    };
    return colors[rarity] || colors.common;
  }

  private createBackButton(): void {
    const backButton = this.createButton(
      '← Back to Characters',
      5,
      this.gameHeight - 80,
      200,
      50,
      () => navigation.showScreen(CharactersScene)
    );
    this.addChild(backButton);
  }

  update(time: Ticker): void {
    // No specific animations needed
  }
}
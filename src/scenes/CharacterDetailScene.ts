import * as PIXI from 'pixi.js';
import { BaseScene, SceneManager } from '@/utils/SceneManager';
import { GameScene, Character } from '@/types';

export class CharacterDetailScene extends BaseScene {
  private character: Character | null = null;

  constructor(app: PIXI.Application, sceneManager: SceneManager) {
    super(app, sceneManager);
    this.character = (sceneManager as any).selectedCharacter || null;
  }

  init(): void {
    if (!this.character) {
      this.sceneManager.switchTo(GameScene.CHARACTERS);
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
    const bg = new PIXI.Graphics();
    bg.beginFill(0x2c1810);
    bg.drawRect(0, 0, this.gameWidth, this.gameHeight);
    bg.endFill();
    this.addChildAt(bg, 0);
  }

  private createHeader(): void {
    const title = this.createTitle(this.character!.name, this.gameWidth / 2, 60);
    this.addChild(title);
  }

  private createCharacterInfo(): void {
    const infoContainer = new PIXI.Container();
    
    // Large character card
    const largeCard = this.createCard(50, 120, 200, 250, this.character!.rarity);
    
    // Token symbol
    const symbolText = new PIXI.Text(this.character!.tokenSymbol, {
      fontFamily: 'Kalam',
      fontSize: 48,
      fontWeight: 'bold',
      fill: 0xffffff,
      align: 'center'
    });
    symbolText.anchor.set(0.5);
    symbolText.x = 100;
    symbolText.y = 60;
    
    // Level
    const levelText = new PIXI.Text(`Level ${this.character!.level}`, {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffecb3,
      align: 'center'
    });
    levelText.anchor.set(0.5);
    levelText.x = 100;
    levelText.y = 120;
    
    // Experience
    const expText = new PIXI.Text(`EXP: ${this.character!.experience}`, {
      fontFamily: 'Kalam',
      fontSize: 16,
      fill: 0xd7ccc8,
      align: 'center'
    });
    expText.anchor.set(0.5);
    expText.x = 100;
    expText.y = 150;
    
    // Rarity
    const rarityText = new PIXI.Text(`★ ${this.character!.rarity.toUpperCase()} ★`, {
      fontFamily: 'Kalam',
      fontSize: 14,
      fontWeight: 'bold',
      fill: this.getRarityColor(this.character!.rarity),
      align: 'center'
    });
    rarityText.anchor.set(0.5);
    rarityText.x = 100;
    rarityText.y = 180;
    
    // Element
    const elementText = new PIXI.Text(`Element: ${this.character!.element.toUpperCase()}`, {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: 0xd7ccc8,
      align: 'center'
    });
    elementText.anchor.set(0.5);
    elementText.x = 100;
    elementText.y = 210;
    
    largeCard.addChild(symbolText, levelText, expText, rarityText, elementText);
    infoContainer.addChild(largeCard);
    
    this.addChild(infoContainer);
  }

  private createStatsDisplay(): void {
    const statsContainer = new PIXI.Container();
    
    // Stats panel
    const statsPanel = new PIXI.Graphics();
    statsPanel.beginFill(0x3e2723, 0.9);
    statsPanel.lineStyle(3, 0x8d6e63);
    statsPanel.drawRoundedRect(0, 0, 300, 250, 12);
    statsPanel.endFill();
    
    // Title
    const title = new PIXI.Text('Character Statistics', {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    title.x = 15;
    title.y = 15;
    
    // Stats
    const stats = [
      { name: 'Health', value: this.character!.stats.health, color: 0x4caf50 },
      { name: 'Attack', value: this.character!.stats.attack, color: 0xf44336 },
      { name: 'Defense', value: this.character!.stats.defense, color: 0x2196f3 },
      { name: 'Speed', value: this.character!.stats.speed, color: 0xffeb3b },
      { name: 'Crit Rate', value: this.character!.stats.criticalRate + '%', color: 0xff9800 },
      { name: 'Crit Damage', value: this.character!.stats.criticalDamage + '%', color: 0x9c27b0 }
    ];
    
    stats.forEach((stat, index) => {
      const y = 50 + (index * 30);
      
      // Stat name
      const nameText = new PIXI.Text(stat.name + ':', {
        fontFamily: 'Kalam',
        fontSize: 16,
        fill: 0xd7ccc8
      });
      nameText.x = 15;
      nameText.y = y;
      
      // Stat value
      const valueText = new PIXI.Text(stat.value.toString(), {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: stat.color
      });
      valueText.x = 200;
      valueText.y = y;
      
      // Stat bar
      const barBg = new PIXI.Graphics();
      barBg.beginFill(0x424242);
      barBg.drawRect(15, y + 20, 270, 4);
      barBg.endFill();
      
      const maxValue = Math.max(...stats.filter(s => typeof s.value === 'number').map(s => s.value as number));
      const barWidth = (typeof stat.value === 'number' ? stat.value : 0) / maxValue * 270;
      
      const bar = new PIXI.Graphics();
      bar.beginFill(stat.color);
      bar.drawRect(15, y + 20, barWidth, 4);
      bar.endFill();
      
      statsPanel.addChild(nameText, valueText, barBg, bar);
    });
    
    statsContainer.addChild(statsPanel, title);
    statsContainer.x = this.gameWidth - 350;
    statsContainer.y = 120;
    
    this.addChild(statsContainer);
  }

  private createSkillsDisplay(): void {
    const skillsContainer = new PIXI.Container();
    
    // Skills panel
    const skillsPanel = new PIXI.Graphics();
    skillsPanel.beginFill(0x3e2723, 0.9);
    skillsPanel.lineStyle(3, 0x8d6e63);
    skillsPanel.drawRoundedRect(0, 0, this.gameWidth - 100, 150, 12);
    skillsPanel.endFill();
    
    // Title
    const title = new PIXI.Text('Skills & Abilities', {
      fontFamily: 'Kalam',
      fontSize: 20,
      fontWeight: 'bold',
      fill: 0xffecb3
    });
    title.x = 15;
    title.y = 15;
    
    skillsContainer.addChild(skillsPanel, title);
    
    // Skills
    this.character!.skills.forEach((skill, index) => {
      const skillCard = new PIXI.Container();
      
      // Skill background
      const skillBg = new PIXI.Graphics();
      skillBg.beginFill(0x5d4037, 0.8);
      skillBg.lineStyle(2, 0x8d6e63);
      skillBg.drawRoundedRect(0, 0, 280, 80, 8);
      skillBg.endFill();
      
      // Skill name
      const skillName = new PIXI.Text(skill.name, {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0xffecb3
      });
      skillName.x = 10;
      skillName.y = 10;
      
      // Skill description
      const skillDesc = new PIXI.Text(skill.description, {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: 0xd7ccc8,
        wordWrap: true,
        wordWrapWidth: 260
      });
      skillDesc.x = 10;
      skillDesc.y = 30;
      
      // Skill stats
      const skillStats = new PIXI.Text(
        `Damage: ${skill.damage} | Cooldown: ${skill.cooldown}s | Mana: ${skill.manaCost}`,
        {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: 0xa1887f
        }
      );
      skillStats.x = 10;
      skillStats.y = 60;
      
      skillCard.addChild(skillBg, skillName, skillDesc, skillStats);
      skillCard.x = 15 + (index * 300);
      skillCard.y = 50;
      
      skillsContainer.addChild(skillCard);
    });
    
    skillsContainer.x = 50;
    skillsContainer.y = this.gameHeight - 220;
    
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
      50,
      this.gameHeight - 80,
      200,
      50,
      () => this.sceneManager.switchTo(GameScene.CHARACTERS)
    );
    this.addChild(backButton);
  }

  update(deltaTime: number): void {
    // No specific animations needed
  }

  destroy(): void {
    this.removeChildren();
  }
}
import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors, hexToPixi } from '@/utils/colors';
import { skillsApi } from '@/services/api';

interface Skill {
  id?: string;
  name: string;
  description: string;
  skill_type?: string;
}

export class LearnSkillPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private skillType: string;
  private onSkillSelected: (skillType: string, skill: Skill) => void;
  private gameWidth: number;
  private gameHeight: number;
  private availableSkills: Skill[] = [];
  private isLoading: boolean = true;

  constructor(params: { skillType: string; onSkillSelected: (skillType: string, skill: Skill) => void }) {
    super();
    this.skillType = params.skillType;
    this.onSkillSelected = params.onSkillSelected;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.loadSkillsAndCreateDialog();
  }

  private async loadSkillsAndCreateDialog(): Promise<void> {
    // Show loading state
    this.createLoadingDialog();

    try {
      // Fetch available skills from API
      const skills = await skillsApi.getAvailableSkills(this.skillType);
      this.availableSkills = skills;
      this.isLoading = false;

      // Recreate dialog with loaded skills
      this.removeChildren();
      this.createDialog();
    } catch (error) {
      console.error('Failed to load skills:', error);
      this.isLoading = false;
      this.availableSkills = this.getFallbackSkills(this.skillType);
      
      // Show dialog with fallback data
      this.removeChildren();
      this.createDialog();
    }
  }

  private createLoadingDialog(): void {
    // Dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.85 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 200;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Fantasy parchment panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: hexToPixi(Colors.PARCHMENT_LIGHT), alpha: 0.98 })
      .stroke({ width: 3, color: hexToPixi(Colors.GOLD) });
    
    const loadingText = new Text({
      text: 'Loading skills...',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.BROWN),
        align: 'center'
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.x = this.gameWidth / 2;
    loadingText.y = this.gameHeight / 2;

    this.addChild(this.dialogBg, this.dialogPanel, loadingText);
  }

  private createDialog(): void {
    // Dark overlay
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.85 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 550;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Fantasy parchment panel
    this.dialogPanel = new Graphics();
    
    // Shadow
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth, dialogHeight, 12)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.6 });
    
    // Main parchment
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: hexToPixi(Colors.PARCHMENT_LIGHT), alpha: 0.98 })
      .stroke({ width: 3, color: hexToPixi(Colors.GOLD) });
    
    // Inner layer
    this.dialogPanel.roundRect(dialogX + 4, dialogY + 4, dialogWidth - 8, dialogHeight - 8, 10)
      .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.6 });
    
    // Golden highlight
    this.dialogPanel.roundRect(dialogX + 6, dialogY + 6, dialogWidth - 12, dialogHeight - 12, 9)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.5 });
    
    // Decorative corners
    this.drawPanelCorners(this.dialogPanel, dialogX, dialogY, dialogWidth, dialogHeight, hexToPixi(Colors.GOLD_BRIGHT));

    // Title banner
    const bannerWidth = dialogWidth - 80;
    const bannerHeight = 40;
    const bannerX = dialogX + 40;
    const bannerY = dialogY + 20;
    
    const titleBanner = new Graphics();
    titleBanner.moveTo(bannerX + 10, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 10, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 10, bannerY)
      .lineTo(bannerX + 10, bannerY)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });

    const skillTypeLabel = this.skillType.replace('_', ' ').toUpperCase();
    const dialogTitle = new Text({
      text: `📜 Learn ${skillTypeLabel}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 },
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = bannerY + bannerHeight / 2;

    const instructionText = new Text({
      text: 'Choose a skill to learn:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: hexToPixi(Colors.BROWN),
        align: 'center'
      }
    });
    instructionText.anchor.set(0.5, 0);
    instructionText.x = this.gameWidth / 2;
    instructionText.y = dialogY + 75;

    // Use loaded skills from API
    let optionY = dialogY + 105;

    const skillOptions: Container[] = [];

    this.availableSkills.forEach((skill) => {
      const optionContainer = new Container();
      
      // Skill card with scroll design
      const optionBg = new Graphics();
      
      optionBg.roundRect(0, 0, dialogWidth - 40, 60, 6)
        .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.5 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD), alpha: 0.5 });
      
      // Skill type badge
      const badgeColor = this.skillType === 'active_skill' ? Colors.SKILL_ACTIVE : Colors.SKILL_PASSIVE;
      const badge = new Graphics();
      badge.roundRect(5, 5, 60, 16, 4)
        .fill({ color: badgeColor, alpha: 0.8 })
        .stroke({ width: 1, color: hexToPixi(Colors.WHITE) });
      
      const badgeText = new Text({
        text: this.skillType === 'active_skill' ? 'ACTIVE' : 'PASSIVE',
        style: {
          fontFamily: 'Kalam',
          fontSize: 9,
          fontWeight: 'bold',
          fill: hexToPixi(Colors.WHITE)
        }
      });
      badgeText.anchor.set(0.5);
      badgeText.x = 35;
      badgeText.y = 13;
      
      const skillName = new Text({
        text: skill.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: hexToPixi(Colors.BROWN_DARK)
        }
      });
      skillName.x = 10;
      skillName.y = 26;
      
      const skillDescription = new Text({
        text: skill.description,
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fill: hexToPixi(Colors.BROWN_WOOD),
          wordWrap: true,
          wordWrapWidth: dialogWidth - 60
        }
      });
      skillDescription.x = 10;
      skillDescription.y = 43;
      
      optionContainer.addChild(optionBg, badge, badgeText, skillName, skillDescription);
      optionContainer.x = dialogX + 20;
      optionContainer.y = optionY;
      
      // Make option interactive
      optionContainer.interactive = true;
      optionContainer.cursor = 'pointer';
      optionContainer.on('pointerdown', () => {
        this.onSkillSelected(this.skillType, skill);
        navigation.dismissPopup();
      });
      
      optionContainer.on('pointerover', () => {
        optionBg.clear();
        optionBg.roundRect(0, 0, dialogWidth - 40, 60, 6)
          .fill({ color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.3 })
          .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
        optionBg.roundRect(2, 2, dialogWidth - 44, 56, 5)
          .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.8 });
      });
      
      optionContainer.on('pointerout', () => {
        optionBg.clear();
        optionBg.roundRect(0, 0, dialogWidth - 40, 60, 6)
          .fill({ color: hexToPixi(Colors.PARCHMENT), alpha: 0.5 })
          .stroke({ width: 2, color: hexToPixi(Colors.GOLD), alpha: 0.5 });
      });
      
      skillOptions.push(optionContainer);
      optionY += 65;
    });

    const closeButton = this.createFantasyButton(
      'Close',
      dialogX + (dialogWidth - 120) / 2,
      dialogY + dialogHeight - 60,
      120,
      40,
      () => navigation.dismissPopup()
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    this.addChild(this.dialogBg, this.dialogPanel, titleBanner, dialogTitle, instructionText, ...skillOptions, closeButton);
  }

  private drawPanelCorners(graphics: Graphics, x: number, y: number, width: number, height: number, color: number): void {
    const cornerSize = 12;
    
    graphics.moveTo(x, y + cornerSize)
      .lineTo(x, y)
      .lineTo(x + cornerSize, y)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x + width - cornerSize, y)
      .lineTo(x + width, y)
      .lineTo(x + width, y + cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x, y + height - cornerSize)
      .lineTo(x, y + height)
      .lineTo(x + cornerSize, y + height)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
    
    graphics.moveTo(x + width - cornerSize, y + height)
      .lineTo(x + width, y + height)
      .lineTo(x + width, y + height - cornerSize)
      .stroke({ width: 2, color: color, alpha: 0.8 });
    graphics.circle(x + width - 4, y + height - 4, 2).fill({ color: color, alpha: 0.9 });
  }

  private createFantasyButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(2, 2, width, height, 8)
      .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
      .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: hexToPixi(Colors.WHITE),
        stroke: { color: hexToPixi(Colors.BROWN_DARK), width: 2 }
      }
    });
    buttonText.anchor.set(0.5);
    buttonText.x = width / 2;
    buttonText.y = height / 2;
    
    button.addChild(bg, buttonText);
    button.x = x;
    button.y = y;
    
    button.interactive = true;
    button.cursor = 'pointer';
    button.on('pointerdown', onClick);
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.BROWN_LIGHT), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD_BRIGHT) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: hexToPixi(Colors.BLACK), alpha: 0.4 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: hexToPixi(Colors.BROWN), alpha: 0.95 })
        .stroke({ width: 2, color: hexToPixi(Colors.GOLD) });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: hexToPixi(Colors.GOLD_BRIGHT), alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    return button;
  }

  private getFallbackSkills(skillType: string): Skill[] {
    // Fallback skills data in case API fails
    const skillsData: Record<string, Skill[]> = {
      active_skill: [
        { name: 'Fireball', description: 'Deals fire damage to target enemy. Moderate damage with burn effect.' },
        { name: 'Heal', description: 'Restores HP to target ally. Can be used multiple times per battle.' },
        { name: 'Lightning Strike', description: 'Electric attack that can chain to nearby enemies. High damage.' },
        { name: 'Shield Bash', description: 'Physical attack that also reduces enemy defense temporarily.' },
        { name: 'Frost Bolt', description: 'Ice attack that slows enemy movement and attack speed.' }
      ],
      passive_skill: [
        { name: 'Iron Will', description: 'Increases resistance to debuffs and status effects by 25%.' },
        { name: 'Critical Focus', description: 'Increases critical hit rate by 10% and critical damage by 15%.' },
        { name: 'Battle Fury', description: 'Attack power increases by 5% for each enemy defeated in battle.' },
        { name: 'Mana Shield', description: 'Absorbs 20% of incoming damage using MP instead of HP.' },
        { name: 'Swift Strike', description: 'Increases attack speed by 15% and dodge rate by 8%.' },
        { name: 'Berserker Rage', description: 'Attack power increases as HP decreases. Max +30% at 25% HP.' }
      ]
    };
    
    return skillsData[skillType] || [];
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    this.removeChildren();
    if (this.isLoading) {
      this.createLoadingDialog();
    } else {
      this.createDialog();
    }
  }
}
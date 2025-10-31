import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';
import { skillsApi } from '@/services/api';

interface Skill {
  id?: string;
  name: string;
  description: string;
  skill_type?: string;
}

export class SkillChangePopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private skillType: string;
  private currentSkill: Skill;
  private onSkillSelected: (skillType: string, skill: Skill) => void;
  private gameWidth: number;
  private gameHeight: number;
  private availableSkills: Skill[] = [];
  private isLoading: boolean = true;

  constructor(params: { 
    skillType: string; 
    currentSkill: Skill; 
    onSkillSelected: (skillType: string, skill: Skill) => void 
  }) {
    super();
    this.skillType = params.skillType;
    this.currentSkill = params.currentSkill;
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
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 200;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    const loadingText = new Text({
      text: 'Loading skills...',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    loadingText.anchor.set(0.5);
    loadingText.x = this.gameWidth / 2;
    loadingText.y = this.gameHeight / 2;

    this.addChild(this.dialogBg, this.dialogPanel, loadingText);
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 450;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Dialog title
    const dialogTitle = new Text({
      text: `Change ${this.skillType.replace('_', ' ').toUpperCase()} Skill`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Current skill info
    const currentText = new Text({
      text: `Current: ${this.currentSkill.name}`,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    currentText.anchor.set(0.5, 0);
    currentText.x = this.gameWidth / 2;
    currentText.y = dialogY + 55;

    // Use loaded skills from API
    let optionY = dialogY + 90;

    const skillOptions: Container[] = [];

    this.availableSkills.forEach((skill) => {
      const optionContainer = new Container();
      
      const optionBg = new Graphics();
      const isCurrentSkill = skill.name === this.currentSkill.name;
      optionBg.roundRect(0, 0, dialogWidth - 40, 50, 6)
        .fill({ color: isCurrentSkill ? Colors.BUTTON_PRIMARY : Colors.CONTAINER_BACKGROUND, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.BUTTON_BORDER });
      
      const skillName = new Text({
        text: skill.name,
        style: {
          fontFamily: 'Orbitron',
          fontSize: 14,
          fontWeight: 'bold',
          fill: isCurrentSkill ? Colors.TEXT_BUTTON : Colors.TEXT_PRIMARY
        }
      });
      skillName.x = 10;
      skillName.y = 5;
      
      const skillDescription = new Text({
        text: skill.description,
        style: {
          fontFamily: 'Orbitron',
          fontSize: 12,
          fill: isCurrentSkill ? Colors.TEXT_BUTTON : Colors.TEXT_SECONDARY,
          wordWrap: true,
          wordWrapWidth: dialogWidth - 60
        }
      });
      skillDescription.x = 10;
      skillDescription.y = 25;
      
      optionContainer.addChild(optionBg, skillName, skillDescription);
      optionContainer.x = dialogX + 20;
      optionContainer.y = optionY;
      
      // Make option interactive (except current skill)
      if (!isCurrentSkill) {
        optionContainer.interactive = true;
        optionContainer.cursor = 'pointer';
        optionContainer.on('pointerdown', () => {
          this.onSkillSelected(this.skillType, skill);
          navigation.dismissPopup();
        });
        
        // Add hover effect
        optionContainer.on('pointerover', () => {
          optionBg.tint = Colors.HOVER_LIGHT;
        });
        optionContainer.on('pointerout', () => {
          optionBg.tint = Colors.ACTIVE_WHITE;
        });
      }
      
      skillOptions.push(optionContainer);
      optionY += 60;
    });

    const closeButton = this.createButton(
      'Close',
      dialogX + (dialogWidth - 100) / 2,
      dialogY + dialogHeight - 60,
      100,
      40,
      () => {
        navigation.dismissPopup();
      }
    );

    // Make background clickable to close
    this.dialogBg.interactive = true;
    this.dialogBg.on('pointerdown', () => {
      navigation.dismissPopup();
    });
    
    this.addChild(this.dialogBg, this.dialogPanel, dialogTitle, currentText, ...skillOptions, closeButton);
  }

  private createButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5);
    bg.fill({ color: Colors.BUTTON_PRIMARY });
    bg.stroke({ width: 2, color: Colors.BUTTON_BORDER });
    
    const buttonText = new Text({
      text,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_BUTTON
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
    
    // Add hover effect
    button.on('pointerover', () => {
      bg.tint = Colors.HOVER_TINT;
    });
    button.on('pointerout', () => {
      bg.tint = Colors.ACTIVE_WHITE;
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
    // Recreate dialog with new dimensions
    this.removeChildren();
    if (this.isLoading) {
      this.createLoadingDialog();
    } else {
      this.createDialog();
    }
  }
}
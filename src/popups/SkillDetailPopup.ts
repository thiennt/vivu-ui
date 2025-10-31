import { Container, Graphics, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { Colors } from '@/utils/colors';

interface Skill {
  name: string;
  description: string;
  skill_type?: string;
}

export class SkillDetailPopup extends Container {
  private dialogBg!: Graphics;
  private dialogPanel!: Graphics;
  private skill: Skill;
  private gameWidth: number;
  private gameHeight: number;

  constructor(params: { skill: Skill }) {
    super();
    this.skill = params.skill;
    this.gameWidth = navigation.width;
    this.gameHeight = navigation.height;
    this.createDialog();
  }

  private createDialog(): void {
    // Create semi-transparent background
    this.dialogBg = new Graphics();
    this.dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.OVERLAY_DARK, alpha: 0.7 });
    
    const dialogWidth = Math.min(400, this.gameWidth - 40);
    const dialogHeight = 300;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    // Create dialog panel
    this.dialogPanel = new Graphics();
    this.dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Dialog title
    const dialogTitle = new Text({
      text: 'Skill Details',
      style: {
        fontFamily: 'Orbitron',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Skill name
    const skillNameText = new Text({
      text: this.skill.name,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.RARITY_LEGENDARY,
        align: 'center'
      }
    });
    skillNameText.anchor.set(0.5, 0);
    skillNameText.x = this.gameWidth / 2;
    skillNameText.y = dialogY + 60;

    // Skill type badge if available
    let skillTypeBadge: Container | null = null;
    if (this.skill.skill_type) {
      skillTypeBadge = this.createSkillTypeBadge(this.skill.skill_type, dialogX + 20, dialogY + 95);
    }

    // Skill description
    const skillDescText = new Text({
      text: this.skill.description,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'left',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    skillDescText.x = dialogX + 20;
    skillDescText.y = skillTypeBadge ? dialogY + 125 : dialogY + 100;

    // Close button
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
    
    const children = [this.dialogBg, this.dialogPanel, dialogTitle, skillNameText, skillDescText, closeButton];
    if (skillTypeBadge) {
      children.splice(-1, 0, skillTypeBadge); // Insert before close button
    }
    
    this.addChild(...children);
  }

  private createSkillTypeBadge(skillType: string, x: number, y: number): Container {
    const badge = new Container();
    
    const skillTypeColors: { [key: string]: string } = {
      normal_attack: Colors.SKILL_NORMAL,
      active_skill: Colors.SKILL_ACTIVE,
      passive_skill: Colors.SKILL_PASSIVE
    };
    
    const color = skillTypeColors[skillType] || Colors.SKILL_NORMAL;
    
    const badgeBg = new Graphics();
    badgeBg.roundRect(0, 0, 80, 25, 4)
      .fill({ color: color, alpha: 0.8 })
      .stroke({ width: 1, color: Colors.TEXT_WHITE });
    
    const badgeText = new Text({
      text: skillType.replace('_', ' ').toUpperCase(),
      style: {
        fontFamily: 'Orbitron',
        fontSize: 10,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 40;
    badgeText.y = 12.5;
    
    badge.addChild(badgeBg, badgeText);
    badge.x = x;
    badge.y = y;
    
    return badge;
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

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    // Recreate dialog with new dimensions
    this.removeChildren();
    this.createDialog();
  }
}
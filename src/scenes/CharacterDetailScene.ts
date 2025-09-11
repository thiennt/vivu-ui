import { Assets, Container, Graphics, Sprite, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors } from '@/utils/colors';
import { LearnSkillPopup } from '@/popups/LearnSkillPopup';
import { SkillChangePopup } from '@/popups/SkillChangePopup';
import { EquipmentChangePopup } from '@/popups/EquipmentChangePopup';
import { SkillDetailPopup } from '@/popups/SkillDetailPopup';

export class CharacterDetailScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  private character: any = null;
  private characterSkills: any[] = [];
  private loadingManager: LoadingStateManager;
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private infoContainer: Container;
  private statsContainer: Container;
  private skillsContainer: Container;
  private equipmentContainer: Container;
  private buttonContainer: Container;

  constructor(params?: { selectedCharacter: any }) {
    super();
    
    this.character = params?.selectedCharacter || null;
    
    // Create containers once
    this.container = new Container();
    this.backgroundContainer = new Container();
    this.headerContainer = new Container();
    this.infoContainer = new Container();
    this.statsContainer = new Container();
    this.skillsContainer = new Container();
    this.equipmentContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.infoContainer,
      this.statsContainer,
      this.skillsContainer,
      this.equipmentContainer,
      this.buttonContainer
    );
    
    // Initialize loading manager
    this.loadingManager = new LoadingStateManager(this.container, this.gameWidth, this.gameHeight);
    
    // Load character data and create UI
    this.loadCharacterData();
  }
  
  private async loadCharacterData(): Promise<void> {
    if (!this.character) {
      navigation.showScreen(HomeScene);
      return;
    }

    this.loadingManager.showLoading();
    
    // Load character skills
    this.character = await charactersApi.getCharacter(this.character.id);
    this.characterSkills = this.character.character_skills || [];

    this.loadingManager.hideLoading();
    
    // Show mock data indicator if we're likely using mock data
    if (isLikelyUsingMockData()) {
      this.loadingManager.showMockDataIndicator();
    }
    
    this.initializeUI();
  }
  
  private initializeUI(): void {
    if (!this.character) {
      navigation.showScreen(HomeScene);
      return;
    }
    
    this.createBackground();
    this.createHeader();
    this.createCharacterInfo();
    this.createStatsDisplay();
    this.createSkillsDisplay();
    this.createEquipmentDisplay();
    this.createBackButton();
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Update loading manager dimensions
    this.loadingManager.updateDimensions(width, height);
    
    if (!this.character) {
      navigation.showScreen(HomeScene);
      return;
    }

    // Update UI layout without recreating
    this.updateLayout();
  }
  
  private updateLayout(): void {
    // Clear and recreate layout - this is more efficient than destroying/recreating all elements
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.infoContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.skillsContainer.removeChildren();
    this.equipmentContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createCharacterInfo();
    this.createStatsDisplay();
    this.createSkillsDisplay();
    this.createEquipmentDisplay();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    const title = this.createTitle(this.character!.name, this.gameWidth / 2, 60);
    this.headerContainer.addChild(title);
  }

  private async createCharacterInfo(): Promise<void> {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;

    // Panel container
    const headerPanelContainer = new Container();
    
    // Header panel background
    const headerPanel = new Graphics();
    headerPanel.roundRect(0, 0, panelWidth, 120, 12)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });
    
    // Avatar placeholder (left side)
    const avatarSize = 80;
    const avatar = new Graphics();
    avatar.roundRect(padding, 20, avatarSize, avatarSize, 8)
      .fill({ color: this.getRarityColor(this.character!.rarity), alpha: 0.8 })
      .stroke({ width: 2, color: Colors.BUTTON_PRIMARY });

    // Avatar text (ticker symbol)
    const avatarTexture = await Assets.load(this.character!.avatar_url || 'https://pixijs.com/assets/bunny.png');
    const avatarIcon = new Sprite(avatarTexture);
    avatarIcon.width = avatarSize - 10;
    avatarIcon.height = avatarSize - 10;
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = padding + avatarSize / 2;
    avatarIcon.y = 20 + avatarSize / 2;

    // Character name (center-left)
    const nameText = new Text({
      text: this.character!.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 28,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    nameText.x = padding + avatarSize + 20;
    nameText.y = 25;

    headerPanelContainer.addChild(
      headerPanel,
      avatar,
      avatarIcon,
      nameText
    );

    // Core stats: HP, ATK, DEF, AGI (prominent display)
    const coreStats = [
      { name: '❤️', value: this.character!.hp, color: 0x4caf50 },
      { name: '⚔️', value: this.character!.atk, color: 0xf44336 },
      { name: '🛡️', value: this.character!.def, color: 0x2196f3 },
      { name: '⚡', value: this.character!.agi, color: 0xffeb3b }
    ];

    const statWidth = (panelWidth - 2 * padding - avatar.width) / 4;
    coreStats.forEach((stat, index) => {
      const x = padding + avatarSize + 20 + (index * statWidth);

      // Stat name
      const statNameText = new Text({
        text: stat.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 18,
          fontWeight: 'bold',
          fill: Colors.TEXT_SECONDARY
        }
      });
      statNameText.x = x;
      statNameText.y = 60;

      // Stat value
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 20,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.x = x;
      valueText.y = 80;

      headerPanelContainer.addChild(statNameText, valueText);
    });

    this.infoContainer.x = padding;
    this.infoContainer.y = 120;
    this.infoContainer.addChild(headerPanelContainer);
  }

  private createStatsDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;

    // Other Stats Section
    const otherStatsContainer = new Container();
    const otherStatsHeight = 120;
    const otherStatsPanel = new Graphics();
    otherStatsPanel.roundRect(0, 0, panelWidth, otherStatsHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });
    otherStatsContainer.addChild(otherStatsPanel);

    // Other stats in grid layout
    const otherStats = [
      { name: 'CritRate', value: this.character!.crit_rate + '%', color: 0xff9800 },
      { name: 'CritDmg', value: this.character!.crit_dmg + '%', color: 0x9c27b0 },
      { name: 'Res', value: this.character!.res, color: 0x607d8b },
      { name: 'Damage', value: this.character!.damage, color: 0xff5722 },
      { name: 'Mitig', value: this.character!.mitigation, color: 0x795548 },
      { name: 'Hit', value: this.character!.hit_rate, color: 0x4caf50 },
      { name: 'Dodge', value: this.character!.dodge, color: 0x9e9e9e }
    ];

    const colWidth = (panelWidth - 2 * padding) / 3;
    const rowHeight = 35;
    
    otherStats.forEach((stat, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = padding + (col * colWidth);
      const y = 20 + (row * rowHeight);
      
      // Stat name and value on same line
      const statText = new Text({
        text: `${stat.name}: ${stat.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fill: stat.color
        }
      });
      statText.x = x;
      statText.y = y;
      
      otherStatsContainer.addChild(statText);
    });

    // Position both panels vertically
    const startY = 260; // Below info panel

    this.statsContainer.x = padding;
    this.statsContainer.y = startY;
    this.statsContainer.addChild(otherStatsContainer);
  }

  private createSkillsDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 180; // Reduced height since we're only showing skill names

    // Skills panel background
    const skillsPanel = new Graphics();
    skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Title
    const title = new Text({
      text: 'Skills:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    title.x = padding;
    title.y = 15;

    this.skillsContainer.addChild(skillsPanel, title);

    // Define all skill types that should always be shown
    const skillTypes = [
      { type: 'normal_attack', label: 'Normal', color: 0x9e9e9e },
      { type: 'active_skill', label: 'Active', color: 0x2196f3 },
      { type: 'passive_skill', label: 'Passive', color: 0x4caf50 }
    ];

    // Skills layout - always show 3 skill types
    let y = 50;
    
    skillTypes.forEach((skillType) => {
      // Find existing skill of this type
      const charSkill = this.characterSkills.find(cs => 
        cs && cs.skill && cs.skill.skill_type === skillType.type
      );
      
      // Badge background
      const badge = new Graphics();
      badge.roundRect(padding, y - 5, 70, 20, 4)
        .fill({ color: skillType.color, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.TEXT_WHITE });
      
      // Badge text
      const badgeText = new Text({
        text: skillType.label,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fontWeight: 'bold',
          fill: Colors.TEXT_WHITE
        }
      });
      badgeText.anchor.set(0.5);
      badgeText.x = padding + 35;
      badgeText.y = y + 5;

      if (charSkill && charSkill.skill) {
        // Skill exists - show skill name only (no description)
        const skill = charSkill.skill;
        
        // Create a container for the skill to make it clickable
        const skillContainer = new Container();
        
        // Skill name - made clickable to show details
        const skillName = new Text({
          text: skill.name,
          style: {
            fontFamily: 'Kalam',
            fontSize: 14,
            fontWeight: 'bold',
            fill: Colors.TEXT_PRIMARY
          }
        });
        skillName.x = padding + 80;
        skillName.y = y;
        
        // Make skill name clickable to show detail popup
        skillName.interactive = true;
        skillName.cursor = 'pointer';
        skillName.on('pointerdown', () => {
          this.showSkillDetailPopup(skill);
        });
        
        // Add hover effect for skill name
        skillName.on('pointerover', () => {
          skillName.style.fill = Colors.BUTTON_PRIMARY;
        });
        skillName.on('pointerout', () => {
          skillName.style.fill = Colors.TEXT_PRIMARY;
        });

        // Add change skill button for active and passive skills
        if (skillType.type === 'active_skill' || skillType.type === 'passive_skill') {
          const changeButton = new Container();
          const buttonBg = new Graphics();
          buttonBg.roundRect(0, 0, 60, 18, 4) // Reduced button size
            .fill({ color: Colors.BUTTON_HOVER, alpha: 0.7 })
            .stroke({ width: 1, color: Colors.BUTTON_BORDER });
          
          const buttonText = new Text({
            text: 'Change',
            style: {
              fontFamily: 'Kalam',
              fontSize: 9, // Reduced font size
              fill: Colors.TEXT_BUTTON
            }
          });
          buttonText.anchor.set(0.5);
          buttonText.x = 30;
          buttonText.y = 9;

          changeButton.addChild(buttonBg, buttonText);
          changeButton.x = panelWidth - padding - 70;
          changeButton.y = y - 1;
          
          // Make change button interactive
          changeButton.interactive = true;
          changeButton.cursor = 'pointer';
          changeButton.on('pointerdown', () => {
            this.showSkillChangeDialog(skillType.type, skill);
          });

          skillContainer.addChild(changeButton);
        }

        skillContainer.addChild(skillName);
        this.skillsContainer.addChild(badge, badgeText, skillContainer);
      } else {
        // Skill slot is empty - show learn option
        const emptyText = new Text({
          text: '(Empty)',
          style: {
            fontFamily: 'Kalam',
            fontSize: 14,
            fontStyle: 'italic',
            fill: Colors.TEXT_TERTIARY
          }
        });
        emptyText.x = padding + 80;
        emptyText.y = y;

        // Learn skill button
        const learnButton = new Container();
        const buttonBg = new Graphics();
        buttonBg.roundRect(0, 0, 70, 18, 4) // Reduced button size
          .fill({ color: Colors.BUTTON_PRIMARY, alpha: 0.7 })
          .stroke({ width: 1, color: Colors.BUTTON_BORDER });
        
        const buttonText = new Text({
          text: 'Learn Skill',
          style: {
            fontFamily: 'Kalam',
            fontSize: 9, // Reduced font size
            fill: Colors.TEXT_BUTTON
          }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 35;
        buttonText.y = 9;

        learnButton.addChild(buttonBg, buttonText);
        learnButton.x = padding + 80 + emptyText.width + 10;
        learnButton.y = y - 1;
        
        // Make learn button interactive
        learnButton.interactive = true;
        learnButton.cursor = 'pointer';
        learnButton.on('pointerdown', () => {
          this.showLearnSkillDialog(skillType.type);
        });

        this.skillsContainer.addChild(badge, badgeText, emptyText, learnButton);
      }

      y += 40; // Reduced spacing since we removed descriptions
    });

    this.skillsContainer.x = padding;
    this.skillsContainer.y = 400; // Below stats sections
  }

  private showSkillDetailPopup(skill: any): void {
    navigation.presentPopup(class extends SkillDetailPopup {
      constructor() {
        super({
          skill: skill
        });
      }
    });
  }

  private showLearnSkillDialog(skillType: string): void {
    const self = this;
    navigation.presentPopup(class extends LearnSkillPopup {
      constructor() {
        super({
          skillType,
          onSkillSelected: (skillType: string, skill: { name: string; description: string }) => {
            self.learnSkill(skillType, skill);
          }
        });
      }
    });
  }

  private learnSkill(skillType: string, skill: {name: string, description: string}): void {
    // This is where you would add the skill to the character
    // For now, just log and refresh the display
    console.log(`Learned ${skillType}: ${skill.name}`);
    
    // Update the skills display
    this.skillsContainer.removeChildren();
    this.createSkillsDisplay();
  }

  private showSkillChangeDialog(skillType: string, currentSkill: any): void {
    const self = this;
    navigation.presentPopup(class extends SkillChangePopup {
      constructor() {
        super({
          skillType,
          currentSkill,
          onSkillSelected: (skillType: string, skill: { name: string; description: string }) => {
            self.changeSkill(skillType, skill);
          }
        });
      }
    });
  }

  private changeSkill(skillType: string, skill: {name: string, description: string}): void {
    // This is where you would update the character's skill
    // For now, just log and refresh the display
    console.log(`Changed ${skillType} to ${skill.name}`);
    
    // Update the skills display
    this.skillsContainer.removeChildren();
    this.createSkillsDisplay();
  }

  private createEquipmentDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 100;

    // Equipment panel background
    const equipmentPanel = new Graphics();
    equipmentPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND, alpha: 0.9 })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    // Title
    const title = new Text({
      text: 'Equipment:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    title.x = padding;
    title.y = 15;

    this.equipmentContainer.addChild(equipmentPanel, title);

    // Equipment slots
    const equipmentSlots = [
      { name: 'Weapon', item: 'Sword', type: 'weapon' },
      { name: 'Armor', item: 'Plate', type: 'armor' },
      { name: 'Accessory', item: '(empty)', type: 'accessory' }
    ];

    const slotWidth = (panelWidth - 2 * padding) / 3;
    
    equipmentSlots.forEach((slot, index) => {
      const x = padding + (index * slotWidth);
      const y = 45;
      
      // Create equipment slot container for click handling
      const slotContainer = new Container();
      
      // Slot background
      const slotBg = new Graphics();
      slotBg.roundRect(0, 0, slotWidth - 10, 40, 6)
        .fill({ color: slot.item === '(empty)' ? 0x424242 : Colors.BUTTON_BORDER, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.BUTTON_PRIMARY });
      
      // Slot type label
      const slotLabel = new Text({
        text: `[${slot.name}]`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: 'bold',
          fill: Colors.TEXT_SECONDARY
        }
      });
      slotLabel.x = 5;
      slotLabel.y = 5;
      
      // Item name
      const itemText = new Text({
        text: slot.item,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fill: slot.item === '(empty)' ? Colors.TEXT_TERTIARY : Colors.TEXT_PRIMARY
        }
      });
      itemText.x = 5;
      itemText.y = 22;
      
      slotContainer.addChild(slotBg, slotLabel, itemText);
      slotContainer.x = x;
      slotContainer.y = y;
      
      // Make equipment slot interactive
      slotContainer.interactive = true;
      slotContainer.cursor = 'pointer';
      slotContainer.on('pointerdown', () => {
        this.showEquipmentChangeDialog(slot.type, slot.name, slot.item);
      });
      
      // Add hover effect
      slotContainer.on('pointerover', () => {
        slotBg.tint = 0xcccccc;
      });
      slotContainer.on('pointerout', () => {
        slotBg.tint = 0xffffff;
      });
      
      this.equipmentContainer.addChild(slotContainer);
    });

    this.equipmentContainer.x = padding;
    this.equipmentContainer.y = 600; // Adjusted for smaller skills panel (reduced from 655)
  }

  private showEquipmentChangeDialog(equipmentType: string, slotName: string, currentItem: string): void {
    const self = this;
    navigation.presentPopup(class extends EquipmentChangePopup {
      constructor() {
        super({
          equipmentType,
          slotName,
          currentItem,
          onEquipmentSelected: (equipmentType: string, slotName: string, equipment: { name: string; description: string }) => {
            self.equipItem(equipmentType, equipment);
          }
        });
      }
    });
  }

  private equipItem(equipmentType: string, equipment: {name: string, description: string}): void {
    // This is where you would update the character's equipment
    // For now, just refresh the display
    console.log(`Equipped ${equipment.name} in ${equipmentType} slot`);
    
    // Update the equipment display
    this.equipmentContainer.removeChildren();
    this.createEquipmentDisplay();
  }

  private getRarityColor(rarity: string): number {
    const colors: { [key: string]: number } = {
      common: Colors.RARITY_COMMON,
      uncommon: 0x66bb6a,
      rare: 0x42a5f5,
      epic: 0xab47bc,
      legendary: 0xff9800
    };
    return colors[rarity] || colors.common;
  }

  private createBackButton(): void {
    // Responsive button sizing - improved for small screens
    const buttonWidth = Math.min(180, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = Math.max(40, Math.min(46, this.gameHeight * 0.07));
    
    const backButton = this.createButton(
      '← Back to Characters',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(CharactersScene),
      14 // Reduced base font size
    );
    this.buttonContainer.addChild(backButton);
  }

  update(_time: Ticker): void {
    // No specific animations needed
  }
}
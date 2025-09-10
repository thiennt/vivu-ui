import { Assets, Container, Graphics, Sprite, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors } from '@/utils/colors';

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
    const panelHeight = 220; // Increased height for multi-line descriptions

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
        // Skill exists - show skill details
        const skill = charSkill.skill;
        
        // Skill name
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

        // Skill description with multi-line support
        const descriptionWidth = panelWidth - (padding + 80 + skillName.width + 20) - padding;
        const skillDesc = new Text({
          text: skill.description,
          style: {
            fontFamily: 'Kalam',
            fontSize: 12,
            fill: Colors.TEXT_SECONDARY,
            wordWrap: true,
            wordWrapWidth: Math.max(200, descriptionWidth)
          }
        });
        skillDesc.x = padding + 80 + skillName.width + 10;
        skillDesc.y = y;

        this.skillsContainer.addChild(badge, badgeText, skillName, skillDesc);
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
        buttonBg.roundRect(0, 0, 80, 20, 4)
          .fill({ color: Colors.BUTTON_PRIMARY, alpha: 0.7 })
          .stroke({ width: 1, color: Colors.BUTTON_BORDER });
        
        const buttonText = new Text({
          text: 'Learn Skill',
          style: {
            fontFamily: 'Kalam',
            fontSize: 10,
            fill: Colors.TEXT_BUTTON
          }
        });
        buttonText.anchor.set(0.5);
        buttonText.x = 40;
        buttonText.y = 10;

        learnButton.addChild(buttonBg, buttonText);
        learnButton.x = padding + 80 + emptyText.width + 10;
        learnButton.y = y - 2;
        
        // Make learn button interactive
        learnButton.interactive = true;
        learnButton.cursor = 'pointer';
        learnButton.on('pointerdown', () => {
          this.showLearnSkillDialog(skillType.type);
        });

        this.skillsContainer.addChild(badge, badgeText, emptyText, learnButton);
      }

      y += 55; // Increased spacing for multi-line descriptions
    });

    this.skillsContainer.x = padding;
    this.skillsContainer.y = 400; // Below stats sections
  }

  private showLearnSkillDialog(skillType: string): void {
    // Create a simple dialog for now - this could be expanded later
    const dialogBg = new Graphics();
    dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const dialogPanel = new Graphics();
    const dialogWidth = Math.min(400, this.gameWidth - 40);
    const dialogHeight = 200;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    const dialogTitle = new Text({
      text: `Learn ${skillType.replace('_', ' ').toUpperCase()} Skill`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    const dialogText = new Text({
      text: 'Skill learning feature coming soon!\nThis will allow you to choose from available skills.',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center',
        wordWrap: true,
        wordWrapWidth: dialogWidth - 40
      }
    });
    dialogText.anchor.set(0.5);
    dialogText.x = this.gameWidth / 2;
    dialogText.y = dialogY + dialogHeight / 2;

    const closeButton = this.createButton(
      'Close',
      dialogX + (dialogWidth - 100) / 2,
      dialogY + dialogHeight - 60,
      100,
      40,
      () => {
        this.container.removeChild(dialogContainer);
      }
    );

    const dialogContainer = new Container();
    dialogContainer.addChild(dialogBg, dialogPanel, dialogTitle, dialogText, closeButton);
    
    // Make background clickable to close
    dialogBg.interactive = true;
    dialogBg.on('pointerdown', () => {
      this.container.removeChild(dialogContainer);
    });
    
    this.container.addChild(dialogContainer);
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
    this.equipmentContainer.y = 655; // Below skills section (adjusted for larger skills panel)
  }

  private showEquipmentChangeDialog(equipmentType: string, slotName: string, currentItem: string): void {
    // Create equipment change dialog
    const dialogBg = new Graphics();
    dialogBg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x000000, alpha: 0.7 });
    
    const dialogPanel = new Graphics();
    const dialogWidth = Math.min(500, this.gameWidth - 40);
    const dialogHeight = 400;
    const dialogX = (this.gameWidth - dialogWidth) / 2;
    const dialogY = (this.gameHeight - dialogHeight) / 2;
    
    dialogPanel.roundRect(dialogX, dialogY, dialogWidth, dialogHeight, 12)
      .fill({ color: Colors.PANEL_BACKGROUND })
      .stroke({ width: 3, color: Colors.BUTTON_PRIMARY });

    const dialogTitle = new Text({
      text: `Change ${slotName}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    dialogTitle.anchor.set(0.5, 0);
    dialogTitle.x = this.gameWidth / 2;
    dialogTitle.y = dialogY + 20;

    // Current equipment
    const currentText = new Text({
      text: `Current: ${currentItem}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    currentText.anchor.set(0.5, 0);
    currentText.x = this.gameWidth / 2;
    currentText.y = dialogY + 55;

    // Available equipment options (mock data for now)
    const availableEquipment = this.getAvailableEquipment(equipmentType);
    let optionY = dialogY + 90;

    const equipmentOptions: Container[] = [];

    availableEquipment.forEach((equipment) => {
      const optionContainer = new Container();
      
      const optionBg = new Graphics();
      optionBg.roundRect(0, 0, dialogWidth - 40, 40, 6)
        .fill({ color: equipment.name === currentItem ? Colors.BUTTON_PRIMARY : Colors.CONTAINER_BACKGROUND, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.BUTTON_BORDER });
      
      const equipmentName = new Text({
        text: equipment.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: Colors.TEXT_PRIMARY
        }
      });
      equipmentName.x = 10;
      equipmentName.y = 5;
      
      const equipmentStats = new Text({
        text: equipment.description,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.TEXT_SECONDARY
        }
      });
      equipmentStats.x = 10;
      equipmentStats.y = 22;
      
      optionContainer.addChild(optionBg, equipmentName, equipmentStats);
      optionContainer.x = dialogX + 20;
      optionContainer.y = optionY;
      
      // Make option interactive
      optionContainer.interactive = true;
      optionContainer.cursor = 'pointer';
      optionContainer.on('pointerdown', () => {
        this.equipItem(equipmentType, equipment);
        this.container.removeChild(dialogContainer);
      });
      
      // Add hover effect
      optionContainer.on('pointerover', () => {
        optionBg.tint = 0xdddddd;
      });
      optionContainer.on('pointerout', () => {
        optionBg.tint = 0xffffff;
      });
      
      equipmentOptions.push(optionContainer);
      optionY += 50;
    });

    const closeButton = this.createButton(
      'Close',
      dialogX + (dialogWidth - 100) / 2,
      dialogY + dialogHeight - 60,
      100,
      40,
      () => {
        this.container.removeChild(dialogContainer);
      }
    );

    const dialogContainer = new Container();
    dialogContainer.addChild(dialogBg, dialogPanel, dialogTitle, currentText, ...equipmentOptions, closeButton);
    
    // Make background clickable to close
    dialogBg.interactive = true;
    dialogBg.on('pointerdown', () => {
      this.container.removeChild(dialogContainer);
    });
    
    this.container.addChild(dialogContainer);
  }

  private getAvailableEquipment(equipmentType: string): Array<{name: string, description: string}> {
    // Mock available equipment data - this could be fetched from API later
    const equipmentData: Record<string, Array<{name: string, description: string}>> = {
      weapon: [
        { name: 'Rusty Sword', description: '+5 ATK' },
        { name: 'Steel Blade', description: '+12 ATK, +2% Crit Rate' },
        { name: 'Flame Sword', description: '+18 ATK, Fire damage' },
        { name: 'Dragon Slayer', description: '+25 ATK, +5% Crit Rate, +10% Crit Dmg' }
      ],
      armor: [
        { name: 'Cloth Armor', description: '+3 DEF' },
        { name: 'Leather Vest', description: '+8 DEF, +2% Dodge' },
        { name: 'Chain Mail', description: '+15 DEF, +5% Mitigation' },
        { name: 'Plate Armor', description: '+22 DEF, +8% Mitigation, +5 RES' }
      ],
      accessory: [
        { name: '(empty)', description: 'No accessory equipped' },
        { name: 'Lucky Ring', description: '+3% Crit Rate' },
        { name: 'Power Amulet', description: '+10% Damage' },
        { name: 'Guardian Pendant', description: '+5% Hit Rate, +3% Dodge' },
        { name: 'Mystic Orb', description: '+8 RES, +5% Magic Damage' }
      ]
    };
    
    return equipmentData[equipmentType] || [];
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
    const backButton = this.createButton(
      '← Back to Characters',
      5,
      this.gameHeight - 60, // Adjust for new layout
      200,
      50,
      () => navigation.showScreen(CharactersScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  update(_time: Ticker): void {
    // No specific animations needed
  }
}
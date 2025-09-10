import { Assets, Container, Graphics, Sprite, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, ApiError, isLikelyUsingMockData } from '@/services/api';
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
    const panelHeight = 180;

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

    // Skills layout - one per row
    let y = 50;
    
    this.characterSkills.forEach((char_skill, index: number) => {
      if (!char_skill) return;
      const skill = char_skill.skill;
      // Skill type badge
      const badgeColors: { [key: string]: number } = {
        'normal_attack': 0x9e9e9e,
        'active_skill': 0x2196f3,
        'passive_skill': 0x4caf50
      };
      
      const badgeLabels: { [key: string]: string } = {
        'normal_attack': 'Normal',
        'active_skill': 'Active',
        'passive_skill': 'Passive'
      };
      
      const badgeColor = badgeColors[skill.skill_type] || 0x9e9e9e;
      const badgeLabel = badgeLabels[skill.skill_type] || 'Unknown';
      
      // Badge background
      const badge = new Graphics();
      badge.roundRect(padding, y - 5, 70, 20, 4)
        .fill({ color: badgeColor, alpha: 0.8 })
        .stroke({ width: 1, color: Colors.TEXT_WHITE });
      
      // Badge text
      const badgeText = new Text({
        text: badgeLabel,
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

      // Skill description (truncated)
      const maxDescLength = 50;
      const truncatedDesc = skill.description.length > maxDescLength 
        ? skill.description.substring(0, maxDescLength) + '...'
        : skill.description;
        
      const skillDesc = new Text({
        text: truncatedDesc,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: Colors.TEXT_SECONDARY
        }
      });
      skillDesc.x = padding + 80 + skillName.width + 10;
      skillDesc.y = y;

      this.skillsContainer.addChild(badge, badgeText, skillName, skillDesc);

      y += 30;
    });

    this.skillsContainer.x = padding;
    this.skillsContainer.y = 400; // Below stats sections
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
      { name: 'Weapon', item: 'Sword' },
      { name: 'Armor', item: 'Plate' },
      { name: 'Accessory', item: '(empty)' }
    ];

    const slotWidth = (panelWidth - 2 * padding) / 3;
    
    equipmentSlots.forEach((slot, index) => {
      const x = padding + (index * slotWidth);
      const y = 45;
      
      // Slot background
      const slotBg = new Graphics();
      slotBg.roundRect(x, y, slotWidth - 10, 40, 6)
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
      slotLabel.x = x + 5;
      slotLabel.y = y + 5;
      
      // Item name
      const itemText = new Text({
        text: slot.item,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fill: slot.item === '(empty)' ? Colors.TEXT_TERTIARY : Colors.TEXT_PRIMARY
        }
      });
      itemText.x = x + 5;
      itemText.y = y + 22;
      
      this.equipmentContainer.addChild(slotBg, slotLabel, itemText);
    });

    this.equipmentContainer.x = padding;
    this.equipmentContainer.y = 615; // Below skills section
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

  update(time: Ticker): void {
    // No specific animations needed
  }
}
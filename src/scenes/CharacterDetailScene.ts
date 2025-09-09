import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/utils/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, skillsApi, ApiError } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';

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
    try {
      if (!this.character || !this.character.id) {
        navigation.showScreen(HomeScene);
        return;
      }

      this.loadingManager.showLoading();
      
      // Load character skills
      this.characterSkills = await charactersApi.getCharacterSkills(this.character.id);
      
      this.loadingManager.hideLoading();
      this.initializeUI();
    } catch (error) {
      console.error('Failed to load character data:', error);
      const errorMessage = error instanceof ApiError 
        ? error.message 
        : 'Failed to load character data. Please try again.';
      
      this.loadingManager.showError(errorMessage, () => this.loadCharacterData());
    }
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
    bg.fill(0x2c1810).rect(0, 0, this.gameWidth, this.gameHeight);
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    const title = this.createTitle(this.character!.name, this.gameWidth / 2, 60);
    this.headerContainer.addChild(title);
  }

  private createCharacterInfo(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    
    // Header panel background
    const headerPanel = new Graphics();
    headerPanel.roundRect(0, 0, panelWidth, 120, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });
    
    // Avatar placeholder (left side)
    const avatarSize = 80;
    const avatar = new Graphics();
    avatar.roundRect(padding, 20, avatarSize, avatarSize, 8)
      .fill({ color: 0x5d4037, alpha: 0.8 })
      .stroke({ width: 2, color: 0x8d6e63 });
    
    // Avatar text (ticker symbol)
    const avatarText = new Text({
      text: this.character!.ticker,
      style: {
        fontFamily: 'Kalam',
        fontSize: 24,
        fontWeight: 'bold',
        fill: 0xffffff
      }
    });
    avatarText.anchor.set(0.5);
    avatarText.x = padding + avatarSize / 2;
    avatarText.y = 20 + avatarSize / 2;

    // Character name (center-left)
    const nameText = new Text({
      text: this.character!.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 28,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    nameText.x = padding + avatarSize + 20;
    nameText.y = 25;

    // Ticker badge (right of name)
    const tickerBadge = new Graphics();
    const tickerWidth = 60;
    tickerBadge.roundRect(nameText.x + nameText.width + 15, 25, tickerWidth, 30, 4)
      .fill({ color: this.getRarityColor(this.character!.rarity), alpha: 0.8 })
      .stroke({ width: 1, color: 0xffffff });
    
    const tickerText = new Text({
      text: this.character!.ticker,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff
      }
    });
    tickerText.anchor.set(0.5);
    tickerText.x = nameText.x + nameText.width + 15 + tickerWidth / 2;
    tickerText.y = 40;

    // Class and level (right side)
    const classLevelText = new Text({
      text: `${this.character!.c_class} L${this.character!.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xd7ccc8
      }
    });
    classLevelText.x = panelWidth - classLevelText.width - padding;
    classLevelText.y = 25;

    // Description (below name)
    const descText = new Text({
      text: `"${this.character!.description}"`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fill: 0xa1887f,
        wordWrap: true,
        wordWrapWidth: panelWidth - padding - avatarSize - 40
      }
    });
    descText.x = padding + avatarSize + 20;
    descText.y = 65;

    headerPanel.addChild(avatar, avatarText, nameText, tickerBadge, tickerText, classLevelText, descText);
    
    this.infoContainer.x = padding;
    this.infoContainer.y = 120;
    this.infoContainer.addChild(headerPanel);
  }

  private createStatsDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    
    // Core Stats Section
    const coreStatsHeight = 80;
    const coreStatsPanel = new Graphics();
    coreStatsPanel.roundRect(0, 0, panelWidth, coreStatsHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

    // Core stats: HP, ATK, DEF, AGI (prominent display)
    const coreStats = [
      { name: 'HP', value: this.character!.max_hp, color: 0x4caf50 },
      { name: 'ATK', value: this.character!.atk, color: 0xf44336 },
      { name: 'DEF', value: this.character!.def, color: 0x2196f3 },
      { name: 'AGI', value: this.character!.agi, color: 0xffeb3b }
    ];

    const statWidth = (panelWidth - 2 * padding) / 4;
    coreStats.forEach((stat, index) => {
      const x = padding + (index * statWidth);
      
      // Stat name
      const nameText = new Text({
        text: stat.name + ':',
        style: {
          fontFamily: 'Kalam',
          fontSize: 18,
          fontWeight: 'bold',
          fill: 0xd7ccc8
        }
      });
      nameText.x = x;
      nameText.y = 20;
      
      // Stat value
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 24,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.x = x;
      valueText.y = 45;
      
      coreStatsPanel.addChild(nameText, valueText);
    });

    // Other Stats Section
    const otherStatsHeight = 120;
    const otherStatsPanel = new Graphics();
    otherStatsPanel.roundRect(0, 0, panelWidth, otherStatsHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

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
      
      otherStatsPanel.addChild(statText);
    });

    // Position both panels vertically
    const startY = 260; // Below header
    coreStatsPanel.x = 0;
    coreStatsPanel.y = 0;
    
    otherStatsPanel.x = 0;
    otherStatsPanel.y = coreStatsHeight + 15;

    this.statsContainer.x = padding;
    this.statsContainer.y = startY;
    this.statsContainer.addChild(coreStatsPanel, otherStatsPanel);
  }

  private createSkillsDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 120;

    // Skills panel background
    const skillsPanel = new Graphics();
    skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

    // Title
    const title = new Text({
      text: 'Skills:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffecb3
      }
    });
    title.x = padding;
    title.y = 15;

    this.skillsContainer.addChild(skillsPanel, title);

    // Skills layout - one per row
    let y = 45;
    
    this.characterSkills.forEach((skill, index: number) => {
      if (!skill) return;
      
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
        .stroke({ width: 1, color: 0xffffff });
      
      // Badge text
      const badgeText = new Text({
        text: badgeLabel,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0xffffff
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
          fill: 0xffecb3
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
          fill: 0xd7ccc8
        }
      });
      skillDesc.x = padding + 80 + skillName.width + 10;
      skillDesc.y = y;

      this.skillsContainer.addChild(badge, badgeText, skillName, skillDesc);
      
      y += 25;
    });

    this.skillsContainer.x = padding;
    this.skillsContainer.y = 475; // Below stats sections
  }

  private createEquipmentDisplay(): void {
    const padding = 15;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 100;

    // Equipment panel background
    const equipmentPanel = new Graphics();
    equipmentPanel.roundRect(0, 0, panelWidth, panelHeight, 12)
      .fill({ color: 0x3e2723, alpha: 0.9 })
      .stroke({ width: 3, color: 0x8d6e63 });

    // Title
    const title = new Text({
      text: 'Equipment:',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: 0xffecb3
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
        .fill({ color: slot.item === '(empty)' ? 0x424242 : 0x5d4037, alpha: 0.8 })
        .stroke({ width: 1, color: 0x8d6e63 });
      
      // Slot type label
      const slotLabel = new Text({
        text: `[${slot.name}]`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: 'bold',
          fill: 0xd7ccc8
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
          fill: slot.item === '(empty)' ? 0x9e9e9e : 0xffecb3
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
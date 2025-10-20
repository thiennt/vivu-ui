import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, equipmentApi, isLikelyUsingMockData } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors } from '@/utils/colors';
import { LearnSkillPopup } from '@/popups/LearnSkillPopup';
import { SkillChangePopup } from '@/popups/SkillChangePopup';
import { EquipmentChangePopup } from '@/popups/EquipmentChangePopup';
import { SkillDetailPopup } from '@/popups/SkillDetailPopup';
import { ScrollBox } from '@pixi/ui';

type TabType = 'stats' | 'skills' | 'equipment';

export class CharacterDetailScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  private character: any = null;
  private characterSkills: any[] = [];
  private characterEquipment: any = null;
  private loadingManager: LoadingStateManager;
  
  // Tab state
  private activeTab: TabType = 'stats';
  
  // UI containers
  public container: Container;
  private backgroundContainer: Container;
  private headerContainer: Container;
  private infoContainer: Container;
  private tabsContainer: Container;
  private contentContainer: Container;
  private scrollBox: ScrollBox | null = null;
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
    this.tabsContainer = new Container();
    this.contentContainer = new Container();
    this.statsContainer = new Container();
    this.skillsContainer = new Container();
    this.equipmentContainer = new Container();
    this.buttonContainer = new Container();
    
    this.addChild(this.container);
    this.container.addChild(
      this.backgroundContainer,
      this.headerContainer,
      this.infoContainer,
      this.tabsContainer,
      this.contentContainer,
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
    
    // Load character skills and equipment
    this.character = await charactersApi.getCharacter(this.character.id);
    this.characterSkills = this.character.character_skills || [];
    this.characterEquipment = await equipmentApi.getCharacterEquipment(this.character.id);

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
    this.createTabs();
    this.createTabContent();
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
    // Clear and recreate layout
    this.backgroundContainer.removeChildren();
    this.headerContainer.removeChildren();
    this.infoContainer.removeChildren();
    this.tabsContainer.removeChildren();
    this.contentContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.skillsContainer.removeChildren();
    this.equipmentContainer.removeChildren();
    this.buttonContainer.removeChildren();
    
    // Reset scroll box
    this.scrollBox = null;
    
    // Recreate layout with current dimensions
    this.createBackground();
    this.createHeader();
    this.createCharacterInfo();
    this.createTabs();
    this.createTabContent();
    this.createBackButton();
  }

  private createBackground(): void {
    const bg = new Graphics();
    
    // Dark hero portrait background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x1a1a2e, alpha: 1.0 });
    
    // Darker overlay for portrait feel
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: 0x16213e, alpha: 0.5 });
    
    this.backgroundContainer.addChild(bg);
  }

  private createHeader(): void {
    // Fantasy banner for character name
    const bannerWidth = Math.min(340, this.gameWidth - 40);
    const bannerHeight = 50;
    const bannerX = (this.gameWidth - bannerWidth) / 2;
    const bannerY = 20;
    
    const banner = new Graphics();
    banner.moveTo(bannerX + 12, bannerY)
      .lineTo(bannerX, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth - 12, bannerY + bannerHeight)
      .lineTo(bannerX + bannerWidth, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 12, bannerY)
      .lineTo(bannerX + 12, bannerY)
      .fill({ color: 0x4a2f5f, alpha: 0.95 })
      .stroke({ width: 2.5, color: 0x8b9dc3 });
    
    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });

    const title = new Text({
      text: this.character!.name,
      style: {
        fontFamily: 'Kalam',
        fontSize: 26,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x1a1a2e, width: 2 },
        dropShadow: {
          color: 0x6b8cae,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.7
        }
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = bannerY + bannerHeight / 2;
    
    this.headerContainer.addChild(banner, title);
  }

  private async createCharacterInfo(): Promise<void> {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    const headerPanelContainer = new Container();
    
    // Fantasy hero info panel
    const headerPanel = new Graphics();
    
    // Shadow
    headerPanel.roundRect(3, 3, panelWidth, 125, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    // Main portrait panel
    headerPanel.roundRect(0, 0, panelWidth, 125, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    // Inner layer
    headerPanel.roundRect(3, 3, panelWidth - 6, 119, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });
    
    // Steel highlight
    headerPanel.roundRect(5, 5, panelWidth - 10, 115, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });
    
    // Avatar with ornate frame
    const avatarSize = 90;
    const avatar = new Graphics();
    
    // Avatar frame shadow
    avatar.roundRect(padding + 2, 17 + 2, avatarSize, avatarSize, 8)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    // Avatar frame
    avatar.roundRect(padding, 17, avatarSize, avatarSize, 8)
      .fill({ color: 0x0f0f1e, alpha: 0.95 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    // Inner avatar frame
    avatar.roundRect(padding + 2, 19, avatarSize - 4, avatarSize - 4, 6)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.5 });

    // Avatar sprite
    const avatarTexture = await Assets.load(this.character!.avatar_url || 'https://pixijs.com/assets/bunny.png');
    const avatarIcon = new Sprite(avatarTexture);
    avatarIcon.width = avatarSize - 8;
    avatarIcon.height = avatarSize - 8;
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = padding + avatarSize / 2;
    avatarIcon.y = 17 + avatarSize / 2;

    // Rarity indicator gem
    const rarityBadge = new Graphics();
    rarityBadge.circle(padding + avatarSize - 12, 27, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.95 })
      .stroke({ width: 2, color: this.getRarityColor(this.character!.rarity) });

    headerPanelContainer.addChild(
      headerPanel,
      avatar,
      rarityBadge,
      avatarIcon
    );

    // Core stats with fantasy badges
    const coreStats = [
      { name: '❤️', value: this.character!.hp, color: Colors.STAT_HP, label: 'HP' },
      { name: '⚔️', value: this.character!.atk, color: Colors.STAT_ATK, label: 'ATK' },
      { name: '🛡️', value: this.character!.def, color: Colors.STAT_DEF, label: 'DEF' },
      { name: '⚡', value: this.character!.agi, color: Colors.STAT_AGI, label: 'AGI' }
    ];

    const statStartX = padding + avatarSize + 15;
    const statWidth = (panelWidth - statStartX - padding) / 2;
    
    coreStats.forEach((stat, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = statStartX + (col * statWidth);
      const y = 25 + (row * 48);

      // Stat badge
      const statBadge = new Graphics();
      statBadge.roundRect(x, y, statWidth - 8, 40, 6)
        .fill({ color: 0x0f0f1e, alpha: 0.95 })
        .stroke({ width: 1.5, color: 0x4a5f7f });
      
      statBadge.roundRect(x + 2, y + 2, statWidth - 12, 36, 4)
        .stroke({ width: 1, color: stat.color, alpha: 0.6 });

      // Icon
      const iconText = new Text({
        text: stat.name,
        style: {
          fontFamily: 'Arial',
          fontSize: 18,
          fill: stat.color
        }
      });
      iconText.x = x + 6;
      iconText.y = y + 11;

      // Label
      const labelText = new Text({
        text: stat.label,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: 0x8b9dc3
        }
      });
      labelText.x = x + 30;
      labelText.y = y + 8;

      // Value
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontWeight: 'bold',
          fill: 0xffffff
        }
      });
      valueText.x = x + 30;
      valueText.y = y + 20;

      headerPanelContainer.addChild(statBadge, iconText, labelText, valueText);
    });

    this.infoContainer.x = padding;
    this.infoContainer.y = 85;
    this.infoContainer.addChild(headerPanelContainer);
  }

  private createTabs(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;
    const tabsY = 225;
    
    const tabs: { type: TabType; label: string; icon: string }[] = [
      { type: 'stats', label: 'Stats', icon: '📊' },
      { type: 'skills', label: 'Skills', icon: '📜' },
      { type: 'equipment', label: 'Equipment', icon: '⚔️' }
    ];
    
    const tabWidth = (panelWidth - 10) / 3;
    const tabHeight = 36;
    
    tabs.forEach((tab, index) => {
      const x = padding + (index * (tabWidth + 5));
      const isActive = this.activeTab === tab.type;
      
      const tabButton = this.createTabButton(
        tab.label,
        tab.icon,
        x,
        tabsY,
        tabWidth,
        tabHeight,
        isActive,
        () => this.switchTab(tab.type)
      );
      
      this.tabsContainer.addChild(tabButton);
    });
  }

  private createTabButton(
    label: string,
    icon: string,
    x: number,
    y: number,
    width: number,
    height: number,
    isActive: boolean,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    
    if (isActive) {
      // Active tab styling
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x4a2f5f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.8 });
    } else {
      // Inactive tab styling
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x2a2a2a, alpha: 0.8 })
        .stroke({ width: 1.5, color: 0x4a5f7f });
    }
    
    const iconText = new Text({
      text: icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 16,
        fill: isActive ? 0xffffff : 0x8b9dc3
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2 - 20;
    iconText.y = height / 2;
    
    const labelText = new Text({
      text: label,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: isActive ? 'bold' : 'normal',
        fill: isActive ? 0xffffff : 0x8b9dc3
      }
    });
    labelText.anchor.set(0.5);
    labelText.x = width / 2 + 10;
    labelText.y = height / 2;
    
    button.addChild(bg, iconText, labelText);
    button.x = x;
    button.y = y;
    button.interactive = true;
    button.cursor = 'pointer';
    
    if (!isActive) {
      button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: 0x3a3a3a, alpha: 0.9 })
          .stroke({ width: 1.5, color: 0x6b8cae });
      });
      
      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: 0x2a2a2a, alpha: 0.8 })
          .stroke({ width: 1.5, color: 0x4a5f7f });
      });
    }
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  private switchTab(tabType: TabType): void {
    if (this.activeTab === tabType) return;
    
    this.activeTab = tabType;
    
    // Clear and recreate tabs and content
    this.tabsContainer.removeChildren();
    this.contentContainer.removeChildren();
    this.statsContainer.removeChildren();
    this.skillsContainer.removeChildren();
    this.equipmentContainer.removeChildren();
    this.scrollBox = null;
    
    this.createTabs();
    this.createTabContent();
  }

  private createTabContent(): void {
    const padding = 12;
    const contentY = 270;
    const contentHeight = this.gameHeight - contentY - 60; // Reserve space for back button
    const contentWidth = this.gameWidth - 2 * padding;
    
    // Create scroll content container
    const scrollContent = new Container();
    
    // Add appropriate content based on active tab
    switch (this.activeTab) {
      case 'stats':
        this.createStatsDisplay();
        scrollContent.addChild(this.statsContainer);
        this.statsContainer.x = 0;
        this.statsContainer.y = 0;
        break;
      case 'skills':
        this.createSkillsDisplay();
        scrollContent.addChild(this.skillsContainer);
        this.skillsContainer.x = 0;
        this.skillsContainer.y = 0;
        break;
      case 'equipment':
        this.createEquipmentDisplay();
        scrollContent.addChild(this.equipmentContainer);
        this.equipmentContainer.x = 0;
        this.equipmentContainer.y = 0;
        break;
    }
    
    // Create ScrollBox
    this.scrollBox = new ScrollBox({
      width: contentWidth,
      height: contentHeight,
    });
    this.scrollBox.x = padding;
    this.scrollBox.y = contentY;
    this.scrollBox.addItem(scrollContent);
    
    this.contentContainer.addChild(this.scrollBox);
  }

  private createStatsDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    const otherStatsContainer = new Container();
    const otherStatsHeight = 115;
    
    // Fantasy stats panel
    const otherStatsPanel = new Graphics();
    
    otherStatsPanel.roundRect(2, 2, panelWidth, otherStatsHeight, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    otherStatsPanel.roundRect(0, 0, panelWidth, otherStatsHeight, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    otherStatsPanel.roundRect(3, 3, panelWidth - 6, otherStatsHeight - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });
    
    otherStatsPanel.roundRect(5, 5, panelWidth - 10, otherStatsHeight - 10, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });
    
    otherStatsContainer.addChild(otherStatsPanel);

    // Title
    const title = new Text({
      text: '⚔️ Combat Stats',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x8b9dc3
      }
    });
    title.x = 10;
    title.y = 10;
    otherStatsContainer.addChild(title);

    // Stats grid
    const otherStats = [
      { name: 'Crit Rate', value: this.character!.crit_rate + '%', color: Colors.STAT_CRIT_RATE },
      { name: 'Crit Dmg', value: this.character!.crit_dmg + '%', color: Colors.STAT_CRIT_DMG },
      { name: 'Resist', value: this.character!.res, color: Colors.STAT_RES },
      { name: 'Damage', value: this.character!.damage, color: Colors.STAT_DAMAGE },
      { name: 'Mitig', value: this.character!.mitigation, color: Colors.STAT_MITIGATION },
      { name: 'Hit', value: this.character!.hit_rate, color: Colors.STAT_HIT },
      { name: 'Dodge', value: this.character!.dodge, color: Colors.STAT_DODGE }
    ];

    const colWidth = (panelWidth - 24) / 3;
    const rowHeight = 28;
    
    otherStats.forEach((stat, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 12 + (col * colWidth);
      const y = 35 + (row * rowHeight);
      
      const statText = new Text({
        text: `${stat.name}: ${stat.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: 0xffffff
        }
      });
      statText.x = x;
      statText.y = y;
      
      otherStatsContainer.addChild(statText);
    });

    this.statsContainer.addChild(otherStatsContainer);
  }

  private createSkillsDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 170;

    // Fantasy skills panel
    const skillsPanel = new Graphics();
    
    skillsPanel.roundRect(2, 2, panelWidth, panelHeight, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    skillsPanel.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });
    
    skillsPanel.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });

    // Title
    const title = new Text({
      text: '🎯 Active Skills',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x8b9dc3
      }
    });
    title.x = 10;
    title.y = 12;

    this.skillsContainer.addChild(skillsPanel, title);

    const skillTypes = [
      { type: 'normal_attack', label: 'Normal', color: Colors.SKILL_NORMAL },
      { type: 'active_skill', label: 'Active', color: Colors.SKILL_ACTIVE },
      { type: 'passive_skill', label: 'Passive', color: Colors.SKILL_PASSIVE }
    ];

    let y = 42;
    
    skillTypes.forEach((skillType) => {
      const charSkill = this.characterSkills.find(cs => 
        cs && cs.skill && cs.skill.skill_type === skillType.type
      );
      
      // Skill type badge
      const badge = new Graphics();
      badge.roundRect(10, y - 4, 60, 18, 4)
        .fill({ color: skillType.color, alpha: 0.9 })
        .stroke({ width: 1, color: 0x8b9dc3 });
      
      const badgeText = new Text({
        text: skillType.label,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fontWeight: 'bold',
          fill: 0xffffff
        }
      });
      badgeText.anchor.set(0.5);
      badgeText.x = 40;
      badgeText.y = y + 5;

      if (charSkill && charSkill.skill) {
        const skill = charSkill.skill;
        
        const skillContainer = new Container();
        
        // Skill name (clickable to view details)
        const skillName = new Text({
          text: skill.name,
          style: {
            fontFamily: 'Kalam',
            fontSize: 13,
            fontWeight: 'bold',
            fill: 0xffffff
          }
        });
        skillName.x = 78;
        skillName.y = y;
        
        skillName.interactive = true;
        skillName.cursor = 'pointer';
        skillName.on('pointerdown', () => {
          this.showSkillDetailPopup(skill);
        });
        
        skillName.on('pointerover', () => {
          skillName.style.fill = 0x6b8cae;
        });
        skillName.on('pointerout', () => {
          skillName.style.fill = 0xffffff;
        });

        // Change button for active/passive
        if (skillType.type === 'active_skill' || skillType.type === 'passive_skill') {
          const changeButton = this.createSmallButton(
            'Change',
            panelWidth - 65,
            y - 2,
            55,
            16,
            () => this.showSkillChangeDialog(skillType.type, skill)
          );
          skillContainer.addChild(changeButton);
        }

        skillContainer.addChild(skillName);
        this.skillsContainer.addChild(badge, badgeText, skillContainer);
      } else {
        // Empty skill slot indicator
        const emptyText = new Text({
          text: '(Empty)',
          style: {
            fontFamily: 'Kalam',
            fontSize: 13,
            fontStyle: 'italic',
            fill: 0x6b8cae
          }
        });
        emptyText.x = 78;
        emptyText.y = y;

        const learnButton = this.createSmallButton(
          'Learn',
          panelWidth - 58,
          y - 2,
          50,
          16,
          () => this.showLearnSkillDialog(skillType.type)
        );

        this.skillsContainer.addChild(badge, badgeText, emptyText, learnButton);
      }

      y += 38;
    });
  }

  private createSmallButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 4)
      .fill({ color: 0x4a2f5f, alpha: 0.9 })
      .stroke({ width: 1, color: 0x6b8cae });
    
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 9,
        fontWeight: 'bold',
        fill: 0xffffff
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 4)
        .fill({ color: 0x6b4a7f, alpha: 0.95 })
        .stroke({ width: 1, color: 0x8b9dc3 });
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 4)
        .fill({ color: 0x4a2f5f, alpha: 0.9 })
        .stroke({ width: 1, color: 0x6b8cae });
    });
    
    button.on('pointerdown', onClick);
    
    return button;
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
    console.log(`Learned ${skillType}: ${skill.name}`);
    
    this.skillsContainer.removeChildren();
    this.createSkillsDisplay();
    
    // Refresh the scroll content
    if (this.activeTab === 'skills') {
      this.refreshTabContent();
    }
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
    console.log(`Changed ${skillType} to ${skill.name}`);
    
    this.skillsContainer.removeChildren();
    this.createSkillsDisplay();
    
    // Refresh the scroll content
    if (this.activeTab === 'skills') {
      this.refreshTabContent();
    }
  }

  private refreshTabContent(): void {
    this.contentContainer.removeChildren();
    this.scrollBox = null;
    this.createTabContent();
  }

  private createEquipmentDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;
    const panelHeight = 95;

    // Fantasy equipment panel
    const equipmentPanel = new Graphics();
    
    equipmentPanel.roundRect(2, 2, panelWidth, panelHeight, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    equipmentPanel.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    equipmentPanel.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });
    
    equipmentPanel.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });

    // Title
    const title = new Text({
      text: '🛡️ Equipment Slots',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x8b9dc3
      }
    });
    title.x = 10;
    title.y = 12;

    this.equipmentContainer.addChild(equipmentPanel, title);

    const equipmentSlots = [
      { 
        name: 'Weapon', 
        item: this.characterEquipment?.weapon?.name || '(empty)', 
        type: 'weapon',
        equipment: this.characterEquipment?.weapon
      },
      { 
        name: 'Armor', 
        item: this.characterEquipment?.armor?.name || '(empty)', 
        type: 'armor',
        equipment: this.characterEquipment?.armor
      },
      { 
        name: 'Accessory', 
        item: this.characterEquipment?.accessory?.name || '(empty)', 
        type: 'accessory',
        equipment: this.characterEquipment?.accessory
      }
    ];

    const slotWidth = (panelWidth - 30) / 3;
    
    equipmentSlots.forEach((slot, index) => {
      const x = 10 + (index * (slotWidth + 5));
      const y = 38;
      
      const slotContainer = new Container();
      
      // Equipment slot with interactive hover
      const slotBg = new Graphics();
      slotBg.roundRect(0, 0, slotWidth, 42, 6)
        .fill({ color: slot.item === '(empty)' ? 0x2a2a2a : 0x0f0f1e, alpha: 0.95 })
        .stroke({ width: 1.5, color: 0x4a5f7f });
      
      slotBg.roundRect(2, 2, slotWidth - 4, 38, 4)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });
      
      // Label
      const slotLabel = new Text({
        text: slot.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: 0x8b9dc3
        }
      });
      slotLabel.x = 5;
      slotLabel.y = 5;
      
      // Item
      const itemText = new Text({
        text: slot.item,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: slot.item === '(empty)' ? 'normal' : 'bold',
          fill: slot.item === '(empty)' ? 0x6b8cae : 0xffffff
        }
      });
      itemText.x = 5;
      itemText.y = 22;
      
      slotContainer.addChild(slotBg, slotLabel, itemText);
      slotContainer.x = x;
      slotContainer.y = y;
      
      slotContainer.interactive = true;
      slotContainer.cursor = 'pointer';
      slotContainer.on('pointerdown', () => {
        this.showEquipmentChangeDialog(slot.type, slot.name, slot.item);
      });
      
      slotContainer.on('pointerover', () => {
        slotBg.tint = 0xcccccc;
      });
      slotContainer.on('pointerout', () => {
        slotBg.tint = 0xffffff;
      });
      
      this.equipmentContainer.addChild(slotContainer);
    });
    
    // Add Equipment Bonuses Panel
    this.createEquipmentBonusesPanel(panelWidth, panelHeight + 20);
  }

  private createEquipmentBonusesPanel(panelWidth: number, yOffset: number): void {
    const panelHeight = 125;
    
    const bonusContainer = new Container();
    bonusContainer.y = yOffset;
    
    // Fantasy panel
    const panel = new Graphics();
    
    panel.roundRect(2, 2, panelWidth, panelHeight, 10)
      .fill({ color: 0x000000, alpha: 0.5 });
    
    panel.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });
    
    panel.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });
    
    panel.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });
    
    bonusContainer.addChild(panel);

    // Title
    const title = new Text({
      text: '✨ Equipment Bonuses',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0x8b9dc3
      }
    });
    title.x = 10;
    title.y = 10;
    bonusContainer.addChild(title);

    // Calculate total bonuses from equipment
    const bonuses = this.calculateEquipmentBonuses();
    
    // Display bonuses in grid
    const bonusStats = [
      { name: 'HP', value: bonuses.hp, color: Colors.STAT_HP },
      { name: 'ATK', value: bonuses.atk, color: Colors.STAT_ATK },
      { name: 'DEF', value: bonuses.def, color: Colors.STAT_DEF },
      { name: 'AGI', value: bonuses.agi, color: Colors.STAT_AGI },
      { name: 'Crit Rate', value: bonuses.crit_rate ? bonuses.crit_rate + '%' : 0, color: Colors.STAT_CRIT_RATE },
      { name: 'Crit Dmg', value: bonuses.crit_dmg ? bonuses.crit_dmg + '%' : 0, color: Colors.STAT_CRIT_DMG }
    ];

    const colWidth = (panelWidth - 24) / 3;
    const rowHeight = 28;
    
    bonusStats.forEach((stat, index) => {
      const col = index % 3;
      const row = Math.floor(index / 3);
      const x = 12 + (col * colWidth);
      const y = 35 + (row * rowHeight);
      
      const statContainer = new Container();
      
      // Stat icon
      const icon = new Text({
        text: '+',
        style: {
          fontFamily: 'Arial',
          fontSize: 12,
          fill: stat.color
        }
      });
      icon.x = x;
      icon.y = y;
      
      // Stat text
      const statText = new Text({
        text: `${stat.name}: ${stat.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fontWeight: stat.value > 0 ? 'bold' : 'normal',
          fill: stat.value > 0 ? 0xffffff : 0x6b8cae
        }
      });
      statText.x = x + 12;
      statText.y = y;
      
      bonusContainer.addChild(icon, statText);
    });

    this.equipmentContainer.addChild(bonusContainer);
  }

  private calculateEquipmentBonuses(): any {
    const bonuses = {
      hp: 0,
      atk: 0,
      def: 0,
      agi: 0,
      crit_rate: 0,
      crit_dmg: 0
    };
    
    if (!this.characterEquipment) return bonuses;
    
    // Sum bonuses from all equipped items
    const items = [
      this.characterEquipment.weapon,
      this.characterEquipment.armor,
      this.characterEquipment.accessory
    ];
    
    items.forEach(item => {
      if (item && item.bonuses) {
        bonuses.hp += item.bonuses.hp || 0;
        bonuses.atk += item.bonuses.atk || 0;
        bonuses.def += item.bonuses.def || 0;
        bonuses.agi += item.bonuses.agi || 0;
        bonuses.crit_rate += item.bonuses.crit_rate || 0;
        bonuses.crit_dmg += item.bonuses.crit_dmg || 0;
      }
    });
    
    return bonuses;
  }

  private showEquipmentChangeDialog(equipmentType: string, slotName: string, currentItem: string): void {
    const self = this;
    navigation.presentPopup(class extends EquipmentChangePopup {
      constructor() {
        super({
          equipmentType,
          slotName,
          currentItem,
          characterId: self.character.id,
          onEquipmentSelected: async (equipmentType: string, slotName: string, equipment: any) => {
            await self.equipItem(equipmentType, equipment);
          }
        });
      }
    });
  }

  private async equipItem(equipmentType: string, equipment: any): Promise<void> {
    console.log(`Equipped ${equipment.name} in ${equipmentType} slot`);
    
    this.loadingManager.showLoading();
    
    try {
      // Call API to equip item
      if (equipment && equipment.id) {
        await equipmentApi.equipItem(this.character.id, equipment.id, equipmentType);
      } else {
        // Unequip if equipment is null or empty
        await equipmentApi.unequipItem(this.character.id, equipmentType);
      }
      
      // Reload equipment data
      this.characterEquipment = await equipmentApi.getCharacterEquipment(this.character.id);
      
      // Refresh equipment display
      this.equipmentContainer.removeChildren();
      this.createEquipmentDisplay();
      
      // Refresh the scroll content if we're on the equipment tab
      if (this.activeTab === 'equipment') {
        this.refreshTabContent();
      }
    } catch (error) {
      console.error('Failed to equip item:', error);
    } finally {
      this.loadingManager.hideLoading();
    }
  }

  private getRarityColor(rarity: string): string {
    const colors: { [key: string]: string } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    return colors[rarity] || colors.common;
  }

  private createBackButton(): void {
    const buttonWidth = Math.min(160, this.gameWidth - 2 * this.STANDARD_PADDING);
    const buttonHeight = 40;
    
    const backButton = this.createFantasyButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(CharactersScene)
    );
    this.buttonContainer.addChild(backButton);
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
      .fill({ color: 0x000000, alpha: 0.5 });
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x4a2f5f, alpha: 0.95 })
      .stroke({ width: 2, color: 0x8b9dc3 });
    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });
    
    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x1a1a2e, width: 2 }
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
    
    button.on('pointerover', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x6b4a7f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.9 });
      button.scale.set(1.02);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(2, 2, width, height, 8)
        .fill({ color: 0x000000, alpha: 0.5 });
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x4a2f5f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', onClick);
    
    return button;
  }

  update(): void {
    // No specific animations needed
  }
}
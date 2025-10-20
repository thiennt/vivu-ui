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

  // Replace the createStatsDisplay method in CharacterDetailScene.ts

  private createStatsDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    const otherStatsContainer = new Container();

    // Calculate height based on number of stats (7 stats * 32px per row + title space)
    const statsCount = 7;
    const rowHeight = 32;
    const titleHeight = 40;
    const otherStatsHeight = titleHeight + (statsCount * rowHeight) + 10;

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

    // Stats list - one per row
    const otherStats = [
      { name: 'Crit Rate', value: this.character!.crit_rate + '%', icon: '🎯', color: Colors.STAT_CRIT_RATE },
      { name: 'Crit Damage', value: this.character!.crit_dmg + '%', icon: '💥', color: Colors.STAT_CRIT_DMG },
      { name: 'Resistance', value: this.character!.res, icon: '🛡️', color: Colors.STAT_RES },
      { name: 'Damage', value: this.character!.damage, icon: '⚔️', color: Colors.STAT_DAMAGE },
      { name: 'Mitigation', value: this.character!.mitigation, icon: '🔰', color: Colors.STAT_MITIGATION },
      { name: 'Hit Rate', value: this.character!.hit_rate, icon: '🎲', color: Colors.STAT_HIT },
      { name: 'Dodge', value: this.character!.dodge, icon: '💨', color: Colors.STAT_DODGE }
    ];

    otherStats.forEach((stat, index) => {
      const y = titleHeight + (index * rowHeight);

      // Create stat row container
      const statRow = new Container();

      // Stat background bar
      const statBg = new Graphics();
      statBg.roundRect(10, y, panelWidth - 20, 28, 6)
        .fill({ color: 0x0f0f1e, alpha: 0.7 })
        .stroke({ width: 1, color: stat.color, alpha: 0.4 });

      // Icon
      const iconText = new Text({
        text: stat.icon,
        style: {
          fontFamily: 'Arial',
          fontSize: 16,
          fill: stat.color
        }
      });
      iconText.x = 18;
      iconText.y = y + 6;

      // Stat name
      const nameText = new Text({
        text: stat.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 13,
          fontWeight: 'bold',
          fill: 0xffffff
        }
      });
      nameText.x = 45;
      nameText.y = y + 7;

      // Stat value (right aligned)
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.anchor.set(1, 0);
      valueText.x = panelWidth - 20;
      valueText.y = y + 7;

      statRow.addChild(statBg, iconText, nameText, valueText);
      otherStatsContainer.addChild(statRow);
    });

    this.statsContainer.addChild(otherStatsContainer);
  }

  // Replace the createSkillsDisplay method in CharacterDetailScene.ts

  private createSkillsDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    // Get the character's main skill (assuming it's the first skill or a specific type)
    const mainSkill = this.characterSkills.length > 0 ? this.characterSkills[0] : null;
    let skill = mainSkill?.skill;

    // Skills panel with dynamic height
    const panelHeight = skill ? 280 : 230;

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

    this.skillsContainer.addChild(skillsPanel);

    // Title
    const title = new Text({
      text: '⚡ Character Skill',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x8b9dc3,
        stroke: { color: 0x1a1a2e, width: 1 }
      }
    });
    title.x = 10;
    title.y = 12;
    this.skillsContainer.addChild(title);

    if (skill) {
      // Skill icon container
      const iconSize = 80;
      const iconBg = new Graphics();
      iconBg.roundRect(15, 50, iconSize, iconSize, 12)
        .fill({ color: this.getSkillTypeColor(skill.skill_type), alpha: 0.9 })
        .stroke({ width: 3, color: 0x8b9dc3 });

      iconBg.roundRect(18, 53, iconSize - 6, iconSize - 6, 10)
        .stroke({ width: 1, color: 0xffffff, alpha: 0.3 });

      const skillIcon = new Text({
        text: this.getSkillTypeIcon(skill.skill_type),
        style: {
          fontFamily: 'Arial',
          fontSize: 42,
          align: 'center'
        }
      });
      skillIcon.anchor.set(0.5);
      skillIcon.x = 15 + iconSize / 2;
      skillIcon.y = 50 + iconSize / 2;

      this.skillsContainer.addChild(iconBg, skillIcon);

      // Skill type badge
      const typeBadge = new Graphics();
      typeBadge.roundRect(15, 138, 80, 22, 11)
        .fill({ color: 0x4a2f5f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });

      const typeBadgeText = new Text({
        text: this.getSkillTypeName(skill.skill_type),
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fontWeight: 'bold',
          fill: 0xffffff
        }
      });
      typeBadgeText.anchor.set(0.5);
      typeBadgeText.x = 55;
      typeBadgeText.y = 149;

      this.skillsContainer.addChild(typeBadge, typeBadgeText);

      // Skill name
      const skillName = new Text({
        text: skill.name,
        style: {
          fontFamily: 'Kalam',
          fontSize: 18,
          fontWeight: 'bold',
          fill: 0xffffff,
          stroke: { color: 0x1a1a2e, width: 2 },
          dropShadow: {
            color: 0x6b8cae,
            blur: 2,
            angle: Math.PI / 4,
            distance: 1,
            alpha: 0.5
          }
        }
      });
      skillName.x = 110;
      skillName.y = 55;

      // Make skill name clickable for details
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

      this.skillsContainer.addChild(skillName);

      // Skill description
      const descText = new Text({
        text: skill.description || 'No description available',
        style: {
          fontFamily: 'Kalam',
          fontSize: 13,
          fill: 0xaaaaaa,
          wordWrap: true,
          wordWrapWidth: panelWidth - 130,
          lineHeight: 20
        }
      });
      descText.x = 110;
      descText.y = 85;
      this.skillsContainer.addChild(descText);

      // Skill stats section (if available)
      if (skill.damage || skill.cooldown || skill.cost) {
        const statsY = 165;

        const statsContainer = new Container();

        // Stats background
        const statsBg = new Graphics();
        statsBg.roundRect(110, statsY, panelWidth - 125, 60, 8)
          .fill({ color: 0x0f0f1e, alpha: 0.8 })
          .stroke({ width: 1.5, color: 0x4a5f7f });

        this.skillsContainer.addChild(statsBg);

        let statX = 120;

        // Damage
        if (skill.damage) {
          const dmgIcon = new Text({
            text: '⚔️',
            style: { fontSize: 16 }
          });
          dmgIcon.x = statX;
          dmgIcon.y = statsY + 8;

          const dmgText = new Text({
            text: `Damage: ${skill.damage}%`,
            style: {
              fontFamily: 'Kalam',
              fontSize: 12,
              fill: 0xffffff
            }
          });
          dmgText.x = statX + 20;
          dmgText.y = statsY + 10;

          this.skillsContainer.addChild(dmgIcon, dmgText);
          statX += 130;
        }

        // Cooldown
        if (skill.cooldown) {
          const cdIcon = new Text({
            text: '⏱️',
            style: { fontSize: 16 }
          });
          cdIcon.x = statX;
          cdIcon.y = statsY + 8;

          const cdText = new Text({
            text: `CD: ${skill.cooldown} turns`,
            style: {
              fontFamily: 'Kalam',
              fontSize: 12,
              fill: 0xffffff
            }
          });
          cdText.x = statX + 20;
          cdText.y = statsY + 10;

          this.skillsContainer.addChild(cdIcon, cdText);
        }

        // Cost
        if (skill.cost) {
          const costIcon = new Text({
            text: '💧',
            style: { fontSize: 16 }
          });
          costIcon.x = 120;
          costIcon.y = statsY + 33;

          const costText = new Text({
            text: `Cost: ${skill.cost} MP`,
            style: {
              fontFamily: 'Kalam',
              fontSize: 12,
              fill: 0xffffff
            }
          });
          costText.x = 140;
          costText.y = statsY + 35;

          this.skillsContainer.addChild(costIcon, costText);
        }
      }

      // Change skill button
      const changeButton = this.createSkillButton(
        'Change Skill',
        panelWidth - 110,
        panelHeight - 45,
        100,
        32,
        () => this.showSkillChangeDialog(skill.skill_type, skill)
      );
      this.skillsContainer.addChild(changeButton);

    } else {
      // No skill equipped - show empty state
      const emptyIcon = new Text({
        text: '❓',
        style: {
          fontSize: 64,
          fill: 0x4a5f7f
        }
      });
      emptyIcon.anchor.set(0.5);
      emptyIcon.x = panelWidth / 2;
      emptyIcon.y = 90;

      const emptyText = new Text({
        text: 'No Skill Equipped',
        style: {
          fontFamily: 'Kalam',
          fontSize: 16,
          fontStyle: 'italic',
          fill: 0x6b8cae,
          stroke: { color: 0x1a1a2e, width: 1 }
        }
      });
      emptyText.anchor.set(0.5);
      emptyText.x = panelWidth / 2;
      emptyText.y = 135;

      const learnButton = this.createSkillButton(
        'Learn Skill',
        (panelWidth - 120) / 2,
        panelHeight - 50,
        120,
        36,
        () => this.showLearnSkillDialog('active_skill')
      );

      this.skillsContainer.addChild(emptyIcon, emptyText, learnButton);
    }
  }

  private getSkillTypeIcon(skillType: string): string {
    const icons: { [key: string]: string } = {
      'normal_attack': '👊',
      'active_skill': '⚡',
      'passive_skill': '✨',
      'ultimate': '💫'
    };
    return icons[skillType] || '⚔️';
  }

  private getSkillTypeColor(skillType: string): string {
    const colors: { [key: string]: string } = {
      'normal_attack': Colors.SKILL_NORMAL,
      'active_skill': Colors.SKILL_ACTIVE,
      'passive_skill': Colors.SKILL_PASSIVE,
      'ultimate': '#a855f7'
    };
    return colors[skillType] || Colors.SKILL_ACTIVE;
  }

  private getSkillTypeName(skillType: string): string {
    const names: { [key: string]: string } = {
      'normal_attack': 'Normal',
      'active_skill': 'Active',
      'passive_skill': 'Passive',
      'ultimate': 'Ultimate'
    };
    return names[skillType] || 'Skill';
  }

  private createSkillButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 8)
      .fill({ color: 0x4a2f5f, alpha: 0.95 })
      .stroke({ width: 2, color: 0x8b9dc3 });

    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 13,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x1a1a2e, width: 1.5 }
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
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: 0x6b4a7f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.9 });
      button.scale.set(1.03);
    });

    button.on('pointerout', () => {
      bg.clear();
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

  private learnSkill(skillType: string, skill: { name: string, description: string }): void {
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

  private changeSkill(skillType: string, skill: { name: string, description: string }): void {
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

  // Replace the createEquipmentDisplay method in CharacterDetailScene.ts

  private createEquipmentDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    // Title
    const title = new Text({
      text: '⚔️ Equipment',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x8b9dc3,
        stroke: { color: 0x1a1a2e, width: 1 }
      }
    });
    title.x = 10;
    title.y = 10;
    this.equipmentContainer.addChild(title);

    const equipmentSlots = [
      {
        name: 'Weapon',
        icon: '⚔️',
        item: this.characterEquipment?.weapon?.name || '(empty)',
        type: 'weapon',
        equipment: this.characterEquipment?.weapon,
        color: 0xffd700
      },
      {
        name: 'Armor',
        icon: '🛡️',
        item: this.characterEquipment?.armor?.name || '(empty)',
        type: 'armor',
        equipment: this.characterEquipment?.armor,
        color: 0x3b82f6
      },
      {
        name: 'Accessory',
        icon: '💎',
        item: this.characterEquipment?.accessory?.name || '(empty)',
        type: 'accessory',
        equipment: this.characterEquipment?.accessory,
        color: 0xa855f7
      }
    ];

    let currentY = 45;

    equipmentSlots.forEach((slot) => {
      const card = this.createEquipmentCard(slot, panelWidth);
      card.x = 0;
      card.y = currentY;
      this.equipmentContainer.addChild(card);
      currentY += 100;
    });

    // Equipment Bonuses Section
    const bonusY = currentY + 15;
    const bonusTitle = new Text({
      text: '✨ Total Equipment Bonuses',
      style: {
        fontFamily: 'Kalam',
        fontSize: 16,
        fontWeight: 'bold',
        fill: 0x8b9dc3,
        stroke: { color: 0x1a1a2e, width: 1 }
      }
    });
    bonusTitle.x = 10;
    bonusTitle.y = bonusY;
    this.equipmentContainer.addChild(bonusTitle);

    const bonusPanel = this.createEquipmentBonusPanel(panelWidth);
    bonusPanel.x = 0;
    bonusPanel.y = bonusY + 35;
    this.equipmentContainer.addChild(bonusPanel);
  }

  private createEquipmentCard(slot: any, width: number): Container {
    const card = new Container();
    const height = 90;
    const isEmpty = slot.item === '(empty)';

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: isEmpty ? 0x4a5f7f : slot.color, alpha: isEmpty ? 0.5 : 0.8 });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: isEmpty ? 0x4a5f7f : slot.color, alpha: 0.4 });

    card.addChild(bg);

    // Equipment icon
    const iconSize = 60;
    const iconBg = new Graphics();
    iconBg.roundRect(15, 15, iconSize, iconSize, 10)
      .fill({ color: isEmpty ? 0x2a2a2a : slot.color, alpha: isEmpty ? 0.3 : 0.2 })
      .stroke({ width: 2.5, color: isEmpty ? 0x4a5f7f : slot.color, alpha: isEmpty ? 0.5 : 0.8 });

    const iconText = new Text({
      text: slot.icon,
      style: {
        fontSize: 32,
        fill: isEmpty ? 0x6b8cae : slot.color
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = 15 + iconSize / 2;
    iconText.y = 15 + iconSize / 2;

    card.addChild(iconBg, iconText);

    // Slot name badge
    const badgeWidth = 80;
    const badge = new Graphics();
    badge.roundRect(90, 15, badgeWidth, 22, 11)
      .fill({ color: isEmpty ? 0x3a3a3a : slot.color, alpha: isEmpty ? 0.5 : 0.3 })
      .stroke({ width: 1.5, color: isEmpty ? 0x4a5f7f : slot.color });

    const badgeText = new Text({
      text: slot.name.toUpperCase(),
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fontWeight: 'bold',
        fill: isEmpty ? 0x8b9dc3 : 0xffffff
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 90 + badgeWidth / 2;
    badgeText.y = 26;

    card.addChild(badge, badgeText);

    // Equipment name
    const itemText = new Text({
      text: slot.item,
      style: {
        fontFamily: 'Kalam',
        fontSize: 15,
        fontWeight: isEmpty ? 'normal' : 'bold',
        fill: isEmpty ? 0x6b8cae : 0xffffff,
        fontStyle: isEmpty ? 'italic' : 'normal',
        stroke: { color: 0x1a1a2e, width: isEmpty ? 0 : 1.5 }
      }
    });
    itemText.x = 90;
    itemText.y = 45;
    card.addChild(itemText);

    // Equipment stats (if equipped)
    if (!isEmpty && slot.equipment) {
      const statsText = new Text({
        text: this.getEquipmentStatsText(slot.equipment),
        style: {
          fontFamily: 'Kalam',
          fontSize: 12,
          fill: 0x4ecca3,
          wordWrap: true,
          wordWrapWidth: width - 190
        }
      });
      statsText.x = 90;
      statsText.y = 65;
      card.addChild(statsText);
    } else if (isEmpty) {
      const emptyHint = new Text({
        text: 'Tap to equip item',
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fill: 0x6b8cae,
          fontStyle: 'italic'
        }
      });
      emptyHint.x = 90;
      emptyHint.y = 65;
      card.addChild(emptyHint);
    }

    // Action button
    const buttonWidth = 75;
    const buttonHeight = 28;
    const button = this.createEquipmentButton(
      isEmpty ? 'Equip' : 'Change',
      width - buttonWidth - 15,
      height - buttonHeight - 12,
      buttonWidth,
      buttonHeight,
      () => this.showEquipmentChangeDialog(slot.type, slot.name, slot.item)
    );
    card.addChild(button);

    // Equipped indicator
    if (!isEmpty) {
      const equippedBadge = new Graphics();
      equippedBadge.roundRect(width - 95, 15, 70, 18, 9)
        .fill({ color: 0x4ecca3, alpha: 0.95 });

      const equippedText = new Text({
        text: 'EQUIPPED',
        style: {
          fontFamily: 'Kalam',
          fontSize: 9,
          fontWeight: 'bold',
          fill: 0x0f3460
        }
      });
      equippedText.anchor.set(0.5);
      equippedText.x = width - 60;
      equippedText.y = 24;

      card.addChild(equippedBadge, equippedText);
    }

    // Make card interactive
    card.interactive = true;
    card.cursor = 'pointer';
    card.on('pointerover', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 10)
        .fill({ color: 0x1a1a2e, alpha: 0.98 })
        .stroke({ width: 3, color: isEmpty ? 0x6b8cae : slot.color });
      bg.roundRect(3, 3, width - 6, height - 6, 8)
        .fill({ color: 0x16213e, alpha: 0.7 });
      bg.roundRect(5, 5, width - 10, height - 10, 7)
        .stroke({ width: 1, color: isEmpty ? 0x6b8cae : slot.color, alpha: 0.6 });
    });

    card.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 10)
        .fill({ color: 0x1a1a2e, alpha: 0.98 })
        .stroke({ width: 2, color: isEmpty ? 0x4a5f7f : slot.color, alpha: isEmpty ? 0.5 : 0.8 });
      bg.roundRect(3, 3, width - 6, height - 6, 8)
        .fill({ color: 0x16213e, alpha: 0.7 });
      bg.roundRect(5, 5, width - 10, height - 10, 7)
        .stroke({ width: 1, color: isEmpty ? 0x4a5f7f : slot.color, alpha: 0.4 });
    });

    card.on('pointerdown', () => {
      this.showEquipmentChangeDialog(slot.type, slot.name, slot.item);
    });

    return card;
  }

  private createEquipmentButton(
    text: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 7)
      .fill({ color: 0x4a2f5f, alpha: 0.95 })
      .stroke({ width: 2, color: 0x8b9dc3 });

    bg.roundRect(2, 2, width - 4, height - 4, 5)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fontWeight: 'bold',
        fill: 0xffffff,
        stroke: { color: 0x1a1a2e, width: 1.5 }
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
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: 0x6b4a7f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: 0x4a2f5f, alpha: 0.95 })
        .stroke({ width: 2, color: 0x8b9dc3 });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: 0x6b8cae, alpha: 0.6 });
      button.scale.set(1.0);
    });

    button.on('pointerdown', (e) => {
      e.stopPropagation(); // Prevent card click from triggering
      onClick();
    });

    return button;
  }

  private getEquipmentStatsText(equipment: any): string {
    const stats = [];
    if (equipment.atk_bonus) stats.push(`+${equipment.atk_bonus} ATK`);
    if (equipment.def_bonus) stats.push(`+${equipment.def_bonus} DEF`);
    if (equipment.hp_bonus) stats.push(`+${equipment.hp_bonus} HP`);
    if (equipment.agi_bonus) stats.push(`+${equipment.agi_bonus} AGI`);
    if (equipment.crit_rate_bonus) stats.push(`+${equipment.crit_rate_bonus}% Crit`);
    return stats.join(' • ') || 'No bonuses';
  }

  private createEquipmentBonusPanel(width: number): Container {
    const panel = new Container();
    const height = 140;

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: 0x1a1a2e, alpha: 0.98 })
      .stroke({ width: 2, color: 0x4a5f7f });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: 0x16213e, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: 0x6b8cae, alpha: 0.4 });

    panel.addChild(bg);

    // Calculate total bonuses
    const bonuses = this.calculateEquipmentBonuses();

    const bonusStats = [
      { label: 'Attack', value: bonuses.atk, icon: '⚔️', color: Colors.STAT_ATK },
      { label: 'Defense', value: bonuses.def, icon: '🛡️', color: Colors.STAT_DEF },
      { label: 'HP', value: bonuses.hp, icon: '❤️', color: Colors.STAT_HP },
      { label: 'Agility', value: bonuses.agi, icon: '⚡', color: Colors.STAT_AGI },
      { label: 'Crit Rate', value: bonuses.crit_rate ? `${bonuses.crit_rate}%` : 0, icon: '🎯', color: Colors.STAT_CRIT_RATE },
      { label: 'Crit Dmg', value: bonuses.crit_dmg ? `${bonuses.crit_dmg}%` : 0, icon: '💥', color: Colors.STAT_CRIT_DMG }
    ];

    bonusStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 15 + (col * (width / 2));
      const y = 15 + (row * 38);

      // Bonus stat row
      const statBg = new Graphics();
      statBg.roundRect(x, y, (width / 2) - 20, 32, 6)
        .fill({ color: 0x0f0f1e, alpha: 0.8 })
        .stroke({ width: 1, color: stat.color, alpha: 0.5 });

      // Icon
      const iconText = new Text({
        text: stat.icon,
        style: { fontSize: 16 }
      });
      iconText.x = x + 8;
      iconText.y = y + 8;

      // Label
      const labelText = new Text({
        text: stat.label,
        style: {
          fontFamily: 'Kalam',
          fontSize: 11,
          fill: 0x8b9dc3
        }
      });
      labelText.x = x + 32;
      labelText.y = y + 6;

      // Value
      const hasBonus = (typeof stat.value === 'number' && stat.value > 0) ||
        (typeof stat.value === 'string' && stat.value !== '0' && stat.value !== '0%');

      const valueText = new Text({
        text: `+${stat.value}`,
        style: {
          fontFamily: 'Kalam',
          fontSize: 14,
          fontWeight: 'bold',
          fill: hasBonus ? stat.color : 0x4a5f7f
        }
      });
      valueText.x = x + 32;
      valueText.y = y + 18;

      panel.addChild(statBg, iconText, labelText, valueText);
    });

    return panel;
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

    const items = [
      this.characterEquipment.weapon,
      this.characterEquipment.armor,
      this.characterEquipment.accessory
    ];

    items.forEach(item => {
      if (item) {
        bonuses.hp += item.hp_bonus || 0;
        bonuses.atk += item.atk_bonus || 0;
        bonuses.def += item.def_bonus || 0;
        bonuses.agi += item.agi_bonus || 0;
        bonuses.crit_rate += item.crit_rate_bonus || 0;
        bonuses.crit_dmg += item.crit_dmg_bonus || 0;
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
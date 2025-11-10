import { Assets, Container, Graphics, Sprite, Text } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { HomeScene } from './HomeScene';
import { BaseScene } from '@/ui/BaseScene';
import { CharactersScene } from './CharactersScene';
import { charactersApi, equipmentApi, skillsApi, nftApi } from '@/services/api';
import { LoadingStateManager } from '@/utils/loadingStateManager';
import { Colors, FontFamily } from '@/utils/cssStyles';
import { LearnSkillPopup } from '@/popups/LearnSkillPopup';
import { SkillChangePopup } from '@/popups/SkillChangePopup';
import { EquipmentChangePopup } from '@/popups/EquipmentChangePopup';
import { SkillDetailPopup } from '@/popups/SkillDetailPopup';
import { AvatarChangePopup } from '@/popups/AvatarChangePopup';
import { ErrorPopup } from '@/popups/ErrorPopup';
import { ScrollBox } from '@pixi/ui';

type TabType = 'skin' | 'skills' | 'equipment';

export class CharacterDetailScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  private character: any = null;
  private characterSkills: any[] = [];
  private characterEquipment: any = null;
  private loadingManager: LoadingStateManager;

  // Tab state
  private activeTab: TabType = 'skin';

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
  private skinContainer: Container;
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
    this.skinContainer = new Container();
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
    this.skinContainer.removeChildren();
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

    // Robot theme dark background
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 1.0 });

    // Darker overlay with cyan tint
    bg.rect(0, 0, this.gameWidth, this.gameHeight)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.3 });

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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2.5, color: Colors.ROBOT_CYAN });

    banner.moveTo(bannerX + 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 15, bannerY + 3)
      .lineTo(bannerX + bannerWidth - 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + bannerWidth - 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 15, bannerY + bannerHeight - 3)
      .lineTo(bannerX + 4, bannerY + bannerHeight / 2)
      .lineTo(bannerX + 15, bannerY + 3)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.6 });

    const title = new Text({
      text: this.character!.name,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 26,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_CYAN, width: 2 },
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
          angle: Math.PI / 4,
          distance: 2,
          alpha: 0.6
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

    // Robot theme hero info panel
    const headerPanel = new Graphics();

    // Outer glow
    headerPanel.roundRect(3, 3, panelWidth, 125, 14)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.25 });

    // Main portrait panel
    headerPanel.roundRect(0, 0, panelWidth, 125, 14)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.7 })
      .stroke({ width: 1, color: Colors.ROBOT_CYAN });

    // Inner layer
    headerPanel.roundRect(3, 3, panelWidth - 6, 119, 12)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.5 });

    // Cyan highlight
    headerPanel.roundRect(5, 5, panelWidth - 10, 115, 10)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });

    // Avatar with robot frame
    const avatarSize = 90;
    const avatar = new Graphics();

    // Avatar frame glow
    avatar.roundRect(padding + 2, 17 + 2, avatarSize, avatarSize, 8)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.3 });

    // Avatar frame
    avatar.roundRect(padding, 17, avatarSize, avatarSize, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.95 })
      .stroke({ width: 1, color: Colors.ROBOT_CYAN });

    // Inner avatar frame
    avatar.roundRect(padding + 2, 19, avatarSize - 4, avatarSize - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });

    // Avatar sprite
    const avatarTexture = await Assets.load(this.character!.avatar_url || 'https://pixijs.com/assets/bunny.png');
    const avatarIcon = new Sprite(avatarTexture);
    avatarIcon.width = avatarSize - 8;
    avatarIcon.height = avatarSize - 8;
    avatarIcon.anchor.set(0.5);
    avatarIcon.x = padding + avatarSize / 2;
    avatarIcon.y = 17 + avatarSize / 2;

    headerPanelContainer.addChild(
      headerPanel,
      avatar,
      avatarIcon // clickable avatar
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
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 1.5, color: Colors.ROBOT_CYAN });

      statBadge.roundRect(x + 2, y + 2, statWidth - 12, 36, 4)
        .stroke({ width: 1, color: stat.color, alpha: 0.6 });

      // Icon
      const iconText = new Text({
        text: stat.name,
        style: {
          fontFamily: FontFamily.ARIAL,
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 10,
          fill: Colors.ROBOT_CYAN_MID
        }
      });
      labelText.x = x + 30;
      labelText.y = y + 8;

      // Value
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 16,
          fontWeight: 'bold',
          fill: Colors.WHITE
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
      { type: 'skin', label: 'Skin', icon: '👕' },
      // { type: 'skills', label: 'Skills', icon: '📜' }, // Hidden to simplify game
      { type: 'equipment', label: 'Equipment', icon: '⚔️' }
    ];

    const spacing = 5;
    const tabWidth = (panelWidth - spacing) / 2; // Changed from 3 to 2 tabs
    const tabHeight = 36;

    tabs.forEach((tab, index) => {
      const x = padding + (index * (tabWidth + spacing));
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
      // Active tab styling - robot theme
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.8 });
    } else {
      // Inactive tab styling - robot theme
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.8 })
        .stroke({ width: 1.5, color: Colors.ROBOT_CYAN, alpha: 0.4 });
    }

    const labelText = new Text({
      text: icon + ' ' + label,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 13,
        fontWeight: isActive ? 'bold' : 'normal',
        fill: isActive ? Colors.WHITE : Colors.ROBOT_CYAN_MID
      }
    });
    labelText.anchor.set(0.5);
    labelText.x = width / 2 + 10;
    labelText.y = height / 2;

    button.addChild(bg, labelText);
    button.x = x;
    button.y = y;
    button.interactive = true;
    button.cursor = 'pointer';

    if (!isActive) {
      button.on('pointerover', () => {
        bg.clear();
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.6 })
          .stroke({ width: 1.5, color: Colors.ROBOT_CYAN, alpha: 0.7 });
      });

      button.on('pointerout', () => {
        bg.clear();
        bg.roundRect(0, 0, width, height, 8)
          .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.8 })
          .stroke({ width: 1.5, color: Colors.ROBOT_CYAN, alpha: 0.4 });
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
    this.skinContainer.removeChildren();
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
      case 'skin':
        this.createSkinDisplay();
        scrollContent.addChild(this.skinContainer);
        this.skinContainer.x = 0;
        this.skinContainer.y = 0;
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
      .fill({ color: Colors.BLACK, alpha: 0.5 });

    otherStatsPanel.roundRect(0, 0, panelWidth, otherStatsHeight, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    otherStatsPanel.roundRect(3, 3, panelWidth - 6, otherStatsHeight - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    otherStatsPanel.roundRect(5, 5, panelWidth - 10, otherStatsHeight - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.4 });

    otherStatsContainer.addChild(otherStatsPanel);

    // Title
    const title = new Text({
      text: '⚔️ Combat Stats',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT
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
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.7 })
        .stroke({ width: 1, color: stat.color, alpha: 0.4 });

      // Icon
      const iconText = new Text({
        text: stat.icon,
        style: {
          fontFamily: FontFamily.ARIAL,
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 13,
          fontWeight: 'bold',
          fill: Colors.WHITE
        }
      });
      nameText.x = 45;
      nameText.y = y + 7;

      // Stat value (right aligned)
      const valueText = new Text({
        text: stat.value.toString(),
        style: {
          fontFamily: FontFamily.PRIMARY,
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

  private createSkinDisplay(): void {
    const padding = 12;
    const panelWidth = this.gameWidth - 2 * padding;

    // Title
    const title = new Text({
      text: '👕 Character Skins',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
      }
    });
    title.x = 10;
    title.y = 10;
    this.skinContainer.addChild(title);

    // Current skin display
    const currentSkinPanel = this.createCurrentSkinPanel(panelWidth);
    currentSkinPanel.x = 0;
    currentSkinPanel.y = 45;
    this.skinContainer.addChild(currentSkinPanel);

    // Skin bonuses display
    const bonusY = 220;
    const bonusTitle = new Text({
      text: '✨ Skin Stat Bonuses',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
      }
    });
    bonusTitle.x = 10;
    bonusTitle.y = bonusY;
    this.skinContainer.addChild(bonusTitle);

    const bonusPanel = this.createSkinBonusPanel(panelWidth);
    bonusPanel.x = 0;
    bonusPanel.y = bonusY + 35;
    this.skinContainer.addChild(bonusPanel);

    // Description
    const descY = bonusY + 195;
    const descText = new Text({
      text: 'Change your character\'s appearance with skins! Each skin provides random stat bonuses to HP, ATK, and DEF.',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fill: Colors.ROBOT_CYAN_MID,
        wordWrap: true,
        wordWrapWidth: panelWidth - 20,
        lineHeight: 18,
        fontStyle: 'italic'
      }
    });
    descText.x = 10;
    descText.y = descY;
    this.skinContainer.addChild(descText);
  }

  private createCurrentSkinPanel(width: number): Container {
    const panel = new Container();
    const height = 160;

    // Panel background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.4 });

    panel.addChild(bg);

    // Current skin avatar with frame
    const avatarSize = 100;
    const avatarFrame = new Graphics();
    avatarFrame.roundRect(20, 30, avatarSize, avatarSize, 12)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.95 })
      .stroke({ width: 3, color: Colors.ROBOT_CYAN_LIGHT });

    avatarFrame.roundRect(23, 33, avatarSize - 6, avatarSize - 6, 10)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.5 });

    panel.addChild(avatarFrame);

    // Avatar sprite (async load)
    this.loadCurrentSkinAvatar(panel, 20 + avatarSize / 2, 30 + avatarSize / 2, avatarSize - 10);

    // Skin info section
    const infoX = 135;
    
    // "Current Skin" label
    const labelText = new Text({
      text: 'CURRENT SKIN',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 11,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_MID
      }
    });
    labelText.x = infoX;
    labelText.y = 35;
    panel.addChild(labelText);

    // Skin name/character name
    const skinName = new Text({
      text: this.character?.name || 'Default',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 2 }
      }
    });
    skinName.x = infoX;
    skinName.y = 55;
    panel.addChild(skinName);

    // Change button
    const buttonWidth = 120;
    const buttonHeight = 36;
    const changeSkinBtn = this.createSkinButton(
      'Change Skin',
      infoX,
      95,
      buttonWidth,
      buttonHeight,
      () => this.showSkinChangeDialog()
    );
    panel.addChild(changeSkinBtn);

    return panel;
  }

  private async loadCurrentSkinAvatar(parent: Container, x: number, y: number, size: number): Promise<void> {
    try {
      const avatarTexture = await Assets.load(this.character?.avatar_url || 'https://pixijs.com/assets/bunny.png');
      const avatarSprite = new Sprite(avatarTexture);
      avatarSprite.width = size;
      avatarSprite.height = size;
      avatarSprite.anchor.set(0.5);
      avatarSprite.x = x;
      avatarSprite.y = y;
      parent.addChild(avatarSprite);
    } catch (error) {
      console.error('Failed to load skin avatar:', error);
    }
  }

  private createSkinBonusPanel(width: number): Container {
    const panel = new Container();
    const height = 140;

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.4 });

    panel.addChild(bg);

    // Get skin bonuses (or defaults if not set)
    const hpBonus = this.character?.skin_hp_bonus || 0;
    const atkBonus = this.character?.skin_atk_bonus || 0;
    const defBonus = this.character?.skin_def_bonus || 0;

    const bonusStats = [
      { label: 'HP Bonus', value: `${hpBonus.toFixed(1)}%`, icon: '❤️', color: Colors.STAT_HP },
      { label: 'ATK Bonus', value: `${atkBonus.toFixed(1)}%`, icon: '⚔️', color: Colors.STAT_ATK },
      { label: 'DEF Bonus', value: `${defBonus.toFixed(1)}%`, icon: '🛡️', color: Colors.STAT_DEF }
    ];

    bonusStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 15 + (col * (width / 2));
      const y = 15 + (row * 60);

      // Bonus stat row
      const statBg = new Graphics();
      statBg.roundRect(x, y, (width / 2) - 20, 50, 6)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.8 })
        .stroke({ width: 1, color: stat.color, alpha: 0.5 });

      // Icon
      const iconText = new Text({
        text: stat.icon,
        style: { fontSize: 20 }
      });
      iconText.x = x + 10;
      iconText.y = y + 8;

      // Label
      const labelText = new Text({
        text: stat.label,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 11,
          fill: Colors.ROBOT_CYAN_LIGHT
        }
      });
      labelText.x = x + 40;
      labelText.y = y + 8;

      // Value
      const valueText = new Text({
        text: stat.value,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 18,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.x = x + 40;
      valueText.y = y + 25;

      panel.addChild(statBg, iconText, labelText, valueText);
    });

    return panel;
  }

  private createSkinButton(
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });

    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1.5 }
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
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });
      button.scale.set(1.0);
    });

    button.on('pointerdown', onClick);

    return button;
  }

  private showSkinChangeDialog(): void {
    const self = this;
    navigation.presentPopup(class extends AvatarChangePopup {
      constructor() {
        super({
          currentAvatarUrl: self.character.avatar_url || '',
          characterId: self.character.id,
          onAvatarSelected: async (nftId: string, avatarUrl: string) => {
            await self.updateCharacterSkin(nftId, avatarUrl);
          }
        });
      }
    });
  }

  private async updateCharacterSkin(nftId: string, avatarUrl: string): Promise<void> {
    console.log(`Updating character skin to NFT: ${nftId}`);

    // Show loading indicator
    this.loadingManager.showLoading();

    try {
      // Generate random bonuses (0-10% for each stat)
      const hpBonus = Math.random() * 10;
      const atkBonus = Math.random() * 10;
      const defBonus = Math.random() * 10;

      // Call API to update avatar (reusing existing avatar update API)
      await nftApi.updateCharacterAvatar(this.character.id, nftId);

      // Update local character data
      this.character.avatar_url = avatarUrl;
      this.character.current_skin_id = nftId;
      this.character.skin_hp_bonus = hpBonus;
      this.character.skin_atk_bonus = atkBonus;
      this.character.skin_def_bonus = defBonus;

      // Refresh character info and skin display
      this.infoContainer.removeChildren();
      await this.createCharacterInfo();

      // Refresh skin display
      this.skinContainer.removeChildren();
      this.createSkinDisplay();

      // Refresh the scroll content if we're on the skin tab
      if (this.activeTab === 'skin') {
        this.refreshTabContent();
      }

    } catch (error) {
      console.error('Failed to update skin:', error);
      
      // Show error popup to user
      navigation.presentPopup(class extends ErrorPopup {
        constructor() {
          super({
            message: 'Failed to update character skin. Please try again.'
          });
        }
      });
    } finally {
      this.loadingManager.hideLoading();
    }
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
      .fill({ color: Colors.BLACK, alpha: 0.5 });

    skillsPanel.roundRect(0, 0, panelWidth, panelHeight, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    skillsPanel.roundRect(3, 3, panelWidth - 6, panelHeight - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    skillsPanel.roundRect(5, 5, panelWidth - 10, panelHeight - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN, alpha: 0.4 });

    this.skillsContainer.addChild(skillsPanel);

    // Title
    const title = new Text({
      text: '⚡ Character Skill',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
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
        .stroke({ width: 3, color: Colors.ROBOT_CYAN_LIGHT });

      iconBg.roundRect(18, 53, iconSize - 6, iconSize - 6, 10)
        .stroke({ width: 1, color: Colors.WHITE, alpha: 0.3 });

      const skillIcon = new Text({
        text: this.getSkillTypeIcon(skill.skill_type),
        style: {
          fontFamily: FontFamily.ARIAL,
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
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });

      const typeBadgeText = new Text({
        text: this.getSkillTypeName(skill.skill_type),
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 11,
          fontWeight: 'bold',
          fill: Colors.WHITE
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 18,
          fontWeight: 'bold',
          fill: Colors.WHITE,
          stroke: { color: Colors.ROBOT_ELEMENT, width: 2 },
          dropShadow: {
            color: Colors.ROBOT_CYAN_MID,
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
        skillName.style.fill = Colors.ROBOT_CYAN_MID;
      });
      skillName.on('pointerout', () => {
        skillName.style.fill = Colors.WHITE;
      });

      this.skillsContainer.addChild(skillName);

      // Skill description
      const descText = new Text({
        text: skill.description || 'No description available',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 13,
          fill: Colors.GRAY_LIGHTER,
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
          .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.8 })
          .stroke({ width: 1.5, color: Colors.ROBOT_CYAN });

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
              fontFamily: FontFamily.PRIMARY,
              fontSize: 12,
              fill: Colors.WHITE
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
              fontFamily: FontFamily.PRIMARY,
              fontSize: 12,
              fill: Colors.WHITE
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
              fontFamily: FontFamily.PRIMARY,
              fontSize: 12,
              fill: Colors.WHITE
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
          fill: Colors.ROBOT_CYAN
        }
      });
      emptyIcon.anchor.set(0.5);
      emptyIcon.x = panelWidth / 2;
      emptyIcon.y = 90;

      const emptyText = new Text({
        text: 'No Skill Equipped',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 16,
          fontStyle: 'italic',
          fill: Colors.ROBOT_CYAN_MID,
          stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });

    bg.roundRect(2, 2, width - 4, height - 4, 6)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1.5 }
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
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 8)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 6)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });
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
          onSkillSelected: async (skillType: string, skill: { id?: string; name: string; description: string }) => {
            await self.learnSkill(skillType, skill);
          }
        });
      }
    });
  }

  private async learnSkill(skillType: string, skill: { id?: string; name: string, description: string }): Promise<void> {
    console.log(`Learning ${skillType}: ${skill.name}`);

    // Show loading indicator
    this.loadingManager.showLoading();

    try {
      // Call API to learn skill
      if (skill.id) {
        await skillsApi.learnSkill(this.character.id, skill.id);
      }

      // Reload character data to get updated skills
      this.character = await charactersApi.getCharacter(this.character.id);
      this.characterSkills = this.character.character_skills || [];

      // Refresh skills display
      this.skillsContainer.removeChildren();
      this.createSkillsDisplay();

      // Refresh the scroll content
      if (this.activeTab === 'skills') {
        this.refreshTabContent();
      }
    } catch (error) {
      console.error('Failed to learn skill:', error);
      // Still refresh UI to show any partial changes
      this.skillsContainer.removeChildren();
      this.createSkillsDisplay();
      if (this.activeTab === 'skills') {
        this.refreshTabContent();
      }
    } finally {
      this.loadingManager.hideLoading();
    }
  }

  private showSkillChangeDialog(skillType: string, currentSkill: any): void {
    const self = this;
    navigation.presentPopup(class extends SkillChangePopup {
      constructor() {
        super({
          skillType,
          currentSkill,
          onSkillSelected: async (skillType: string, skill: { id?: string; name: string; description: string }) => {
            await self.changeSkill(skillType, currentSkill, skill);
          }
        });
      }
    });
  }

  private async changeSkill(skillType: string, currentSkill: any, newSkill: { id?: string; name: string, description: string }): Promise<void> {
    console.log(`Changing ${skillType} from ${currentSkill.name} to ${newSkill.name}`);

    // Show loading indicator
    this.loadingManager.showLoading();

    try {
      // Call API to change skill
      if (currentSkill.id && newSkill.id) {
        await skillsApi.changeSkill(this.character.id, currentSkill.id, newSkill.id);
      }

      // Reload character data to get updated skills
      this.character = await charactersApi.getCharacter(this.character.id);
      this.characterSkills = this.character.character_skills || [];

      // Refresh skills display
      this.skillsContainer.removeChildren();
      this.createSkillsDisplay();

      // Refresh the scroll content
      if (this.activeTab === 'skills') {
        this.refreshTabContent();
      }
    } catch (error) {
      console.error('Failed to change skill:', error);
      // Still refresh UI to show any partial changes
      this.skillsContainer.removeChildren();
      this.createSkillsDisplay();
      if (this.activeTab === 'skills') {
        this.refreshTabContent();
      }
    } finally {
      this.loadingManager.hideLoading();
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
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
      }
    });
    title.x = 10;
    title.y = 10;
    this.equipmentContainer.addChild(title);

    const equipmentSlots = [
      {
        name: 'Weapon',
        icon: '⚔️',
        type: 'weapon',
        level: this.character?.weapon_level || 1,
        exp: this.character?.weapon_exp || 0,
        value: this.character?.weapon_value || 0,
        color: Colors.STAT_ATK
      },
      {
        name: 'Helmet',
        icon: '🪖',
        type: 'helmet',
        level: this.character?.helmet_level || 1,
        exp: this.character?.helmet_exp || 0,
        value: this.character?.helmet_value || 0,
        color: Colors.STAT_DEF
      },
      {
        name: 'Armor',
        icon: '🛡️',
        type: 'armor',
        level: this.character?.armor_level || 1,
        exp: this.character?.armor_exp || 0,
        value: this.character?.armor_value || 0,
        color: Colors.STAT_HP
      }
    ];

    let currentY = 45;

    equipmentSlots.forEach((slot) => {
      const card = this.createPermanentEquipmentCard(slot, panelWidth);
      card.x = 0;
      card.y = currentY;
      this.equipmentContainer.addChild(card);
      currentY += 120;
    });

    // Equipment Bonuses Section
    const bonusY = currentY + 15;
    const bonusTitle = new Text({
      text: '✨ Total Equipment Bonuses',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 16,
        fontWeight: 'bold',
        fill: Colors.ROBOT_CYAN_LIGHT,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1 }
      }
    });
    bonusTitle.x = 10;
    bonusTitle.y = bonusY;
    this.equipmentContainer.addChild(bonusTitle);

    const bonusPanel = this.createPermanentEquipmentBonusPanel(panelWidth);
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: isEmpty ? Colors.ROBOT_CYAN : slot.color, alpha: isEmpty ? 0.5 : 0.8 });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: isEmpty ? Colors.ROBOT_CYAN : slot.color, alpha: 0.4 });

    card.addChild(bg);

    // Equipment icon
    const iconSize = 60;
    const iconBg = new Graphics();
    iconBg.roundRect(15, 15, iconSize, iconSize, 10)
      .fill({ color: isEmpty ? Colors.GRAY_DARKER : slot.color, alpha: isEmpty ? 0.3 : 0.2 })
      .stroke({ width: 2.5, color: isEmpty ? Colors.ROBOT_CYAN : slot.color, alpha: isEmpty ? 0.5 : 0.8 });

    const iconText = new Text({
      text: slot.icon,
      style: {
        fontSize: 32,
        fill: isEmpty ? Colors.ROBOT_CYAN_MID : slot.color
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
      .fill({ color: isEmpty ? Colors.GRAY_DARK : slot.color, alpha: isEmpty ? 0.5 : 0.3 })
      .stroke({ width: 1.5, color: isEmpty ? Colors.ROBOT_CYAN : slot.color });

    const badgeText = new Text({
      text: slot.name.toUpperCase(),
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 10,
        fontWeight: 'bold',
        fill: isEmpty ? Colors.ROBOT_CYAN_LIGHT : Colors.WHITE
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
        fontFamily: FontFamily.PRIMARY,
        fontSize: 15,
        fontWeight: isEmpty ? 'normal' : 'bold',
        fill: isEmpty ? Colors.ROBOT_CYAN_MID : Colors.WHITE,
        fontStyle: isEmpty ? 'italic' : 'normal',
        stroke: { color: Colors.ROBOT_ELEMENT, width: isEmpty ? 0 : 1.5 }
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 12,
          fill: Colors.GREEN_MINT,
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 11,
          fill: Colors.ROBOT_CYAN_MID,
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
        .fill({ color: Colors.GREEN_MINT, alpha: 0.95 });

      const equippedText = new Text({
        text: 'EQUIPPED',
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 9,
          fontWeight: 'bold',
          fill: Colors.ROBOT_BG_DARK
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
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
        .stroke({ width: 3, color: isEmpty ? Colors.ROBOT_CYAN_MID : slot.color });
      bg.roundRect(3, 3, width - 6, height - 6, 8)
        .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });
      bg.roundRect(5, 5, width - 10, height - 10, 7)
        .stroke({ width: 1, color: isEmpty ? Colors.ROBOT_CYAN_MID : slot.color, alpha: 0.6 });
    });

    card.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 10)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
        .stroke({ width: 2, color: isEmpty ? Colors.ROBOT_CYAN : slot.color, alpha: isEmpty ? 0.5 : 0.8 });
      bg.roundRect(3, 3, width - 6, height - 6, 8)
        .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });
      bg.roundRect(5, 5, width - 10, height - 10, 7)
        .stroke({ width: 1, color: isEmpty ? Colors.ROBOT_CYAN : slot.color, alpha: 0.4 });
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });

    bg.roundRect(2, 2, width - 4, height - 4, 5)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });

    const buttonText = new Text({
      text: text,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1.5 }
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
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.ROBOT_CYAN_LIGHT });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.6 });
      button.scale.set(1.0);
    });

    button.on('pointerdown', (e) => {
      e.stopPropagation(); // Prevent card click from triggering
      onClick();
    });

    return button;
  }

  private createPermanentEquipmentCard(slot: any, width: number): Container {
    const card = new Container();
    const height = 110;

    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: slot.color, alpha: 0.8 });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: slot.color, alpha: 0.4 });

    card.addChild(bg);

    // Equipment icon
    const iconSize = 70;
    const iconBg = new Graphics();
    iconBg.roundRect(15, 20, iconSize, iconSize, 10)
      .fill({ color: slot.color, alpha: 0.2 })
      .stroke({ width: 2.5, color: slot.color, alpha: 0.8 });

    const iconText = new Text({
      text: slot.icon,
      style: {
        fontSize: 36,
        fill: slot.color
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = 15 + iconSize / 2;
    iconText.y = 20 + iconSize / 2;

    card.addChild(iconBg, iconText);

    // Equipment name badge
    const badgeWidth = 85;
    const badge = new Graphics();
    badge.roundRect(100, 20, badgeWidth, 24, 12)
      .fill({ color: slot.color, alpha: 0.3 })
      .stroke({ width: 1.5, color: slot.color });

    const badgeText = new Text({
      text: slot.name.toUpperCase(),
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 11,
        fontWeight: 'bold',
        fill: Colors.WHITE
      }
    });
    badgeText.anchor.set(0.5);
    badgeText.x = 100 + badgeWidth / 2;
    badgeText.y = 32;

    card.addChild(badge, badgeText);

    // Level display
    const levelText = new Text({
      text: `Level ${slot.level}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 15,
        fontWeight: 'bold',
        fill: Colors.WHITE,
        stroke: { color: Colors.ROBOT_ELEMENT, width: 1.5 }
      }
    });
    levelText.x = 100;
    levelText.y = 50;
    card.addChild(levelText);

    // Experience bar
    const expBarWidth = width - 215;
    const expBarBg = new Graphics();
    expBarBg.roundRect(100, 72, expBarWidth, 12, 6)
      .fill({ color: Colors.ROBOT_BG_DARK, alpha: 0.8 })
      .stroke({ width: 1, color: slot.color, alpha: 0.5 });

    const expToNextLevel = slot.level * 100;
    const expProgress = Math.min(slot.exp / expToNextLevel, 1);
    const expBarFill = new Graphics();
    expBarFill.roundRect(100, 72, expBarWidth * expProgress, 12, 6)
      .fill({ color: slot.color, alpha: 0.9 });

    card.addChild(expBarBg, expBarFill);

    // EXP text
    const expText = new Text({
      text: `EXP: ${slot.exp}/${expToNextLevel}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 10,
        fill: Colors.ROBOT_CYAN_LIGHT
      }
    });
    expText.x = 100;
    expText.y = 87;
    card.addChild(expText);

    // Stat bonus value
    const statBonusText = new Text({
      text: `Stat Bonus: +${slot.value}`,
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 13,
        fontWeight: 'bold',
        fill: Colors.GREEN_MINT
      }
    });
    statBonusText.x = width - 145;
    statBonusText.y = 52;
    card.addChild(statBonusText);

    // Level up button
    const buttonWidth = 90;
    const buttonHeight = 28;
    const levelUpButton = this.createLevelUpButton(
      width - buttonWidth - 15,
      height - buttonHeight - 12,
      buttonWidth,
      buttonHeight,
      () => this.levelUpEquipment(slot.type)
    );
    card.addChild(levelUpButton);

    return card;
  }

  private createLevelUpButton(
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const button = new Container();

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 7)
      .fill({ color: Colors.GREEN_MINT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.WHITE });

    bg.roundRect(2, 2, width - 4, height - 4, 5)
      .stroke({ width: 1, color: Colors.WHITE, alpha: 0.6 });

    const buttonText = new Text({
      text: 'Level Up',
      style: {
        fontFamily: FontFamily.PRIMARY,
        fontSize: 12,
        fontWeight: 'bold',
        fill: Colors.ROBOT_BG_DARK,
        stroke: { color: Colors.WHITE, width: 1 }
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
        .fill({ color: Colors.GREEN_MINT, alpha: 1 })
        .stroke({ width: 2, color: Colors.WHITE });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.WHITE, alpha: 0.9 });
      button.scale.set(1.05);
    });

    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 7)
        .fill({ color: Colors.GREEN_MINT, alpha: 0.95 })
        .stroke({ width: 2, color: Colors.WHITE });
      bg.roundRect(2, 2, width - 4, height - 4, 5)
        .stroke({ width: 1, color: Colors.WHITE, alpha: 0.6 });
      button.scale.set(1.0);
    });

    button.on('pointerdown', (e) => {
      e.stopPropagation();
      onClick();
    });

    return button;
  }

  private async levelUpEquipment(equipmentType: string): Promise<void> {
    console.log(`Leveling up ${equipmentType}`);

    // Update character equipment level locally
    const levelKey = `${equipmentType}_level` as keyof typeof this.character;
    const expKey = `${equipmentType}_exp` as keyof typeof this.character;
    const valueKey = `${equipmentType}_value` as keyof typeof this.character;

    const currentLevel = (this.character[levelKey] as number) || 1;
    const currentExp = (this.character[expKey] as number) || 0;
    const currentValue = (this.character[valueKey] as number) || 0;

    // Increase level and stats
    (this.character as any)[levelKey] = currentLevel + 1;
    (this.character as any)[expKey] = 0; // Reset exp
    (this.character as any)[valueKey] = currentValue + 5 + currentLevel; // Increase value

    // Refresh equipment display
    this.equipmentContainer.removeChildren();
    this.createEquipmentDisplay();

    // Refresh the scroll content
    if (this.activeTab === 'equipment') {
      this.refreshTabContent();
    }
  }

  private createPermanentEquipmentBonusPanel(width: number): Container {
    const panel = new Container();
    const height = 140;

    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 10)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.4 });

    panel.addChild(bg);

    // Calculate total bonuses from permanent equipment
    const bonuses = {
      weapon: this.character?.weapon_value || 0,
      helmet: this.character?.helmet_value || 0,
      armor: this.character?.armor_value || 0,
      total: (this.character?.weapon_value || 0) + (this.character?.helmet_value || 0) + (this.character?.armor_value || 0)
    };

    const bonusStats = [
      { label: 'Weapon', value: bonuses.weapon, icon: '⚔️', color: Colors.STAT_ATK },
      { label: 'Helmet', value: bonuses.helmet, icon: '🪖', color: Colors.STAT_DEF },
      { label: 'Armor', value: bonuses.armor, icon: '🛡️', color: Colors.STAT_HP },
      { label: 'Total Bonus', value: bonuses.total, icon: '✨', color: Colors.GREEN_MINT }
    ];

    bonusStats.forEach((stat, index) => {
      const row = Math.floor(index / 2);
      const col = index % 2;
      const x = 15 + (col * (width / 2));
      const y = 15 + (row * 60);

      // Bonus stat row
      const statBg = new Graphics();
      statBg.roundRect(x, y, (width / 2) - 20, 50, 6)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.8 })
        .stroke({ width: 1, color: stat.color, alpha: 0.5 });

      // Icon
      const iconText = new Text({
        text: stat.icon,
        style: { fontSize: 20 }
      });
      iconText.x = x + 10;
      iconText.y = y + 8;

      // Label
      const labelText = new Text({
        text: stat.label,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 11,
          fill: Colors.ROBOT_CYAN_LIGHT
        }
      });
      labelText.x = x + 40;
      labelText.y = y + 8;

      // Value
      const valueText = new Text({
        text: `+${stat.value}`,
        style: {
          fontFamily: FontFamily.PRIMARY,
          fontSize: 18,
          fontWeight: 'bold',
          fill: stat.color
        }
      });
      valueText.x = x + 40;
      valueText.y = y + 25;

      panel.addChild(statBg, iconText, labelText, valueText);
    });

    return panel;
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
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN });

    bg.roundRect(3, 3, width - 6, height - 6, 8)
      .fill({ color: Colors.ROBOT_BG_MID, alpha: 0.7 });

    bg.roundRect(5, 5, width - 10, height - 10, 7)
      .stroke({ width: 1, color: Colors.ROBOT_CYAN_MID, alpha: 0.4 });

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
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.8 })
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 11,
          fill: Colors.ROBOT_CYAN_LIGHT
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
          fontFamily: FontFamily.PRIMARY,
          fontSize: 14,
          fontWeight: 'bold',
          fill: hasBonus ? stat.color : Colors.ROBOT_CYAN
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
      this.characterEquipment.helmet
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

    const backButton = this.createButton(
      '← Back',
      this.STANDARD_PADDING,
      this.gameHeight - buttonHeight - this.STANDARD_PADDING,
      buttonWidth,
      buttonHeight,
      () => navigation.showScreen(CharactersScene)
    );
    this.buttonContainer.addChild(backButton);
  }

  private createAvatarChangeButton(x: number, y: number, width: number, height: number): Container {
    const button = new Container();
    
    const bg = new Graphics();
    bg.roundRect(0, 0, width, height, 5)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 1.5, color: Colors.ROBOT_CYAN });
    
    const buttonText = new Text({
      text: '🖼️',
      style: {
        fontFamily: FontFamily.ARIAL,
        fontSize: 12,
        fill: Colors.WHITE
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
      bg.roundRect(0, 0, width, height, 5)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.95 })
        .stroke({ width: 1.5, color: Colors.ROBOT_CYAN_LIGHT });
      button.scale.set(1.05);
    });
    
    button.on('pointerout', () => {
      bg.clear();
      bg.roundRect(0, 0, width, height, 5)
        .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
        .stroke({ width: 1.5, color: Colors.ROBOT_CYAN });
      button.scale.set(1.0);
    });
    
    button.on('pointerdown', () => this.showAvatarChangeDialog());
    
    return button;
  }

  private showAvatarChangeDialog(): void {
    const self = this;
    navigation.presentPopup(class extends AvatarChangePopup {
      constructor() {
        super({
          currentAvatarUrl: self.character.avatar_url || '',
          characterId: self.character.id,
          onAvatarSelected: async (nftId: string, avatarUrl: string) => {
            await self.updateCharacterAvatar(nftId, avatarUrl);
          }
        });
      }
    });
  }

  private async updateCharacterAvatar(nftId: string, avatarUrl: string): Promise<void> {
    console.log(`Updating character avatar to NFT: ${nftId}`);

    // Show loading indicator
    this.loadingManager.showLoading();

    try {
      // Call API to update avatar
      await nftApi.updateCharacterAvatar(this.character.id, nftId);

      // Update local character data
      this.character.avatar_url = avatarUrl;

      // Refresh character info display
      this.infoContainer.removeChildren();
      await this.createCharacterInfo();

    } catch (error) {
      console.error('Failed to update avatar:', error);
      
      // Show error popup to user
      navigation.presentPopup(class extends ErrorPopup {
        constructor() {
          super({
            message: 'Failed to update character avatar. Please try again.'
          });
        }
      });
    } finally {
      this.loadingManager.hideLoading();
    }
  }

  update(): void {
    // No specific animations needed
  }
}
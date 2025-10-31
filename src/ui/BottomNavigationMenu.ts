import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';

export class BottomNavigationMenu extends Container {
  private menuHeight = 60;
  private gameWidth: number;
  private gameHeight: number;

  constructor(gameWidth: number, gameHeight: number) {
    super();
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.createBottomMenu();
  }

  private createBottomMenu(): void {
    // Robot theme navigation bar background
    const menuBg = new Graphics();
    
    // Shadow at top
    menuBg.rect(0, 0, this.gameWidth, 2)
      .fill({ color: Colors.BLACK, alpha: 0.5 });
    
    // Main robot bar background
    menuBg.rect(0, 0, this.gameWidth, this.menuHeight)
      .fill({ color: Colors.ROBOT_ELEMENT, alpha: 0.95 })
      .stroke({ width: 2, color: Colors.ROBOT_CYAN, alpha: 0.9 });
    
    // Top cyan glow border
    menuBg.rect(0, 0, this.gameWidth, 3)
      .fill({ color: Colors.ROBOT_CYAN, alpha: 0.7 });

    this.addChild(menuBg);

    // Menu items with fantasy icons
    const menuItems = [
      { text: '🏠', label: 'Home', action: 'home' },
      { text: '👤', label: 'Player', action: 'player' },
      { text: '🏰', label: 'Dungeon', action: 'dungeon' },
      { text: '⛏️', label: 'Items', action: 'items' },
      { text: '📋', label: 'Quests', action: 'quests' },
      //{ text: '🛒', label: 'Store', action: 'store' },
    ];

    const itemWidth = this.gameWidth / menuItems.length;

    menuItems.forEach((item, index) => {
      const menuItem = this.createFantasyMenuItem(
        item.text,
        item.label,
        index * itemWidth,
        0,
        itemWidth,
        this.menuHeight,
        () => this.handleNavigation(item.action)
      );
      this.addChild(menuItem);
    });

    // Position at bottom of screen
    this.y = this.gameHeight - this.menuHeight;
    this.zIndex = 9999;
  }

  private handleNavigation(action: string): void {
    // Import scenes dynamically to avoid circular imports
    switch (action) {
      case 'home':
        import('@/scenes/HomeScene').then(({ HomeScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(HomeScene);
          });
        });
        break;
      case 'player':
        import('@/scenes/PlayerDetailScene').then(({ PlayerDetailScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(PlayerDetailScene);
          });
        });
        break;
      case 'dungeon':
        import('@/scenes/TowerScene').then(({ TowerScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(TowerScene);
          });
        });
        break;
      case 'items':
        import('@/scenes/ItemsScene').then(({ ItemsScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(ItemsScene);
          });
        });
        break;
      case 'store':
        import('@/scenes/HomeScene').then(({ HomeScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(HomeScene);
          });
        });
        break;
    }
  }

  private createFantasyMenuItem(
    icon: string,
    label: string,
    x: number,
    y: number,
    width: number,
    height: number,
    onClick: () => void
  ): Container {
    const item = new Container();

    // Item background (for hover effect)
    const itemBg = new Graphics();
    itemBg.rect(0, 0, width, height)
      .fill({ color: Colors.BLACK, alpha: 0 });

    // Icon with cyan glow
    const iconText = new Text({
      text: icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 26,
        fill: Colors.ROBOT_CYAN_LIGHT,
        align: 'center',
        dropShadow: {
          color: Colors.ROBOT_CYAN,
          blur: 4,
          angle: 0,
          distance: 0,
          alpha: 0.6
        }
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2;
    iconText.y = height / 2 - 8;

    // Label with robot style
    const labelText = new Text({
      text: label,
      style: {
        fontFamily: 'Orbitron',
        fontSize: 10,
        fill: Colors.ROBOT_CYAN_MID,
        align: 'center',
        stroke: { color: Colors.ROBOT_BG_DARK, width: 1 }
      }
    });
    labelText.anchor.set(0.5);
    labelText.x = width / 2;
    labelText.y = height - 10;

    item.addChild(itemBg, iconText, labelText);
    item.x = x;
    item.y = y;
    item.interactive = true;
    item.cursor = 'pointer';

    // Hover effects - cyan highlight
    item.on('pointerover', () => {
      itemBg.clear();
      itemBg.rect(0, 0, width, height)
        .fill({ color: Colors.ROBOT_CYAN, alpha: 0.2 });
      iconText.scale.set(1.1);
    });

    item.on('pointerout', () => {
      itemBg.clear();
      itemBg.rect(0, 0, width, height)
        .fill({ color: Colors.BLACK, alpha: 0 });
      iconText.scale.set(1.0);
    });

    item.on('pointerdown', onClick);

    return item;
  }

  public updateDimensions(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;
    
    // Remove all children and recreate
    this.removeChildren();
    this.createBottomMenu();
  }

  public getMenuHeight(): number {
    return this.menuHeight;
  }
}
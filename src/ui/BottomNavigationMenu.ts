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
    // Fantasy wooden bar background
    const menuBg = new Graphics();
    
    // Shadow at top
    menuBg.rect(0, 0, this.gameWidth, 2)
      .fill({ color: Colors.BLACK, alpha: 0.5 });
    
    // Main wooden bar
    menuBg.rect(0, 0, this.gameWidth, this.menuHeight)
      .fill({ color: Colors.BROWN_DARK_WOOD, alpha: 0.98 })
      .stroke({ width: 2, color: Colors.GOLD_BRONZE, alpha: 0.9 });
    
    // Top golden border
    menuBg.rect(0, 0, this.gameWidth, 3)
      .fill({ color: Colors.GOLD, alpha: 0.7 });

    this.addChild(menuBg);

    // Menu items with fantasy icons
    const menuItems = [
      { text: '🏠', label: 'Home', action: 'home' },
      { text: '👤', label: 'Player', action: 'player' },
      { text: '🏰', label: 'Dungeon', action: 'dungeon' },
      { text: '🛒', label: 'Store', action: 'store' },
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
        import('@/scenes/DungeonScene').then(({ DungeonScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(DungeonScene);
          });
        });
        break;
      case 'store':
        import('@/scenes/CharactersScene').then(({ CharactersScene }) => {
          import('@/utils/navigation').then(({ navigation }) => {
            navigation.showScreen(CharactersScene);
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

    // Icon with glow
    const iconText = new Text({
      text: icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 26,
        align: 'center',
        dropShadow: {
          color: Colors.GOLD_BRIGHT,
          blur: 3,
          angle: 0,
          distance: 0,
          alpha: 0.5
        }
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2;
    iconText.y = height / 2 - 8;

    // Label with fantasy style
    const labelText = new Text({
      text: label,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.PARCHMENT_LIGHTEST,
        align: 'center',
        stroke: { color: Colors.BROWN_DARK, width: 1 }
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

    // Hover effects - golden highlight
    item.on('pointerover', () => {
      itemBg.clear();
      itemBg.rect(0, 0, width, height)
        .fill({ color: Colors.GOLD_BRIGHT, alpha: 0.2 });
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
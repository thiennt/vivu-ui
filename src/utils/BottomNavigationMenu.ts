import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from './colors';

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
    // Background for the bottom menu - make it more visible
    const menuBg = new Graphics();
    menuBg.rect(0, 0, this.gameWidth, this.menuHeight)
      .fill({ color: 0x2c1810, alpha: 0.98 }) // More opaque brown background
      .stroke({ width: 3, color: 0x8b4513 }); // Stronger border

    // Menu items
    const menuItems = [
      { text: '🏠', label: 'Home', action: 'home' },
      { text: '👤', label: 'Player', action: 'player' },
      { text: '🏰', label: 'Dungeon', action: 'dungeon' },
      { text: '🛒', label: 'Store', action: 'store' },
    ];

    const itemWidth = this.gameWidth / menuItems.length;

    menuItems.forEach((item, index) => {
      const menuItem = this.createMenuItem(
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

    this.addChild(menuBg);

    // Position at bottom of screen
    this.y = this.gameHeight - this.menuHeight;
    this.zIndex = 9999; // Even higher z-index
    console.log('Bottom navigation created at y:', this.y, 'with height:', this.menuHeight);
  }

  private handleNavigation(action: string): void {
    // Import scenes dynamically to avoid circular imports
    switch (action) {
      case 'home':
        import('@/scenes/HomeScene').then(({ HomeScene }) => {
          import('./navigation').then(({ navigation }) => {
            navigation.showScreen(HomeScene);
          });
        });
        break;
      case 'player':
        import('@/scenes/PlayerDetailScene').then(({ PlayerDetailScene }) => {
          import('./navigation').then(({ navigation }) => {
            navigation.showScreen(PlayerDetailScene);
          });
        });
        break;
      case 'dungeon':
        import('@/scenes/DungeonScene').then(({ DungeonScene }) => {
          import('./navigation').then(({ navigation }) => {
            navigation.showScreen(DungeonScene);
          });
        });
        break;
      case 'store':
        import('@/scenes/CharactersScene').then(({ CharactersScene }) => {
          import('./navigation').then(({ navigation }) => {
            navigation.showScreen(CharactersScene);
          });
        });
        break;
    }
  }

  private createMenuItem(
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
      .fill({ color: 0x000000, alpha: 0 }); // Transparent by default

    // Icon
    const iconText = new Text({
      text: icon,
      style: {
        fontFamily: 'Arial',
        fontSize: 24,
        align: 'center'
      }
    });
    iconText.anchor.set(0.5);
    iconText.x = width / 2;
    iconText.y = height / 2 - 8;

    // Label
    const labelText = new Text({
      text: label,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    labelText.anchor.set(0.5);
    labelText.x = width / 2;
    labelText.y = height - 12;

    item.addChild(itemBg, iconText, labelText);
    item.x = x;
    item.y = y;
    item.interactive = true;
    item.cursor = 'pointer';

    // Hover effects
    item.on('pointerover', () => {
      itemBg.clear();
      itemBg.rect(0, 0, width, height)
        .fill({ color: Colors.BUTTON_HOVER, alpha: 0.3 });
    });

    item.on('pointerout', () => {
      itemBg.clear();
      itemBg.rect(0, 0, width, height)
        .fill({ color: 0x000000, alpha: 0 });
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
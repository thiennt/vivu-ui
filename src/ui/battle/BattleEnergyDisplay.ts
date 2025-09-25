import { Container, Graphics, Text } from 'pixi.js';
import { Colors } from '@/utils/colors';

export interface BattleEnergyDisplayOptions {
  width: number;
  height: number;
  isOpponent?: boolean;
}

export class BattleEnergyDisplay extends Container {
  private currentEnergy: number = 0;
  private maxEnergy: number = 0;
  private deckCount: number = 0;
  private discardCount: number = 0;
  private options: BattleEnergyDisplayOptions;
  
  private energyText!: Text;
  private deckText!: Text;
  private discardText!: Text;

  constructor(options: BattleEnergyDisplayOptions) {
    super();
    this.options = options;
    this.createDisplay();
  }

  private createDisplay(): void {
    const elementWidth = 80;
    const spacing = 10;
    const totalWidth = (elementWidth * 3) + (spacing * 2);
    const startX = (this.options.width - totalWidth) / 2;

    // Energy display
    this.createEnergyDisplay(startX, 0, elementWidth);
    
    // Deck remaining display
    this.createDeckDisplay(startX + elementWidth + spacing, 0, elementWidth);
    
    // Discard pile display
    this.createDiscardDisplay(startX + (elementWidth + spacing) * 2, 0, elementWidth);
  }

  private createEnergyDisplay(x: number, y: number, width: number): void {
    const container = new Container();
    container.x = x;
    container.y = y;

    // Background
    const bg = new Graphics()
      .roundRect(0, 0, width, this.options.height, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ color: Colors.UI_BORDER, width: 1 });
    container.addChild(bg);

    // Energy icon/indicator
    const energyIndicator = new Graphics()
      .circle(width / 2, this.options.height / 2 - 8, 8)
      .fill({ color: Colors.ENERGY_ACTIVE });
    container.addChild(energyIndicator);

    // Energy text
    this.energyText = new Text({
      text: '0/0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    this.energyText.anchor.set(0.5);
    this.energyText.x = width / 2;
    this.energyText.y = this.options.height - 12;
    container.addChild(this.energyText);

    this.addChild(container);
  }

  private createDeckDisplay(x: number, y: number, width: number): void {
    const container = new Container();
    container.x = x;
    container.y = y;

    // Background
    const bg = new Graphics()
      .roundRect(0, 0, width, this.options.height, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ color: Colors.UI_BORDER, width: 1 });
    container.addChild(bg);

    // Deck icon (stacked cards visual)
    const deckIcon = new Graphics()
      .roundRect(width / 2 - 8, this.options.height / 2 - 12, 16, 10, 2)
      .fill({ color: Colors.TEXT_SECONDARY })
      .roundRect(width / 2 - 6, this.options.height / 2 - 10, 12, 8, 1)
      .fill({ color: Colors.TEXT_PRIMARY });
    container.addChild(deckIcon);

    // Label
    const label = new Text({
      text: 'Deck',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = this.options.height / 2 + 5;
    container.addChild(label);

    // Deck count text
    this.deckText = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    this.deckText.anchor.set(0.5);
    this.deckText.x = width / 2;
    this.deckText.y = this.options.height - 8;
    container.addChild(this.deckText);

    this.addChild(container);
  }

  private createDiscardDisplay(x: number, y: number, width: number): void {
    const container = new Container();
    container.x = x;
    container.y = y;

    // Background
    const bg = new Graphics()
      .roundRect(0, 0, width, this.options.height, 5)
      .fill({ color: Colors.BACKGROUND_SECONDARY })
      .stroke({ color: Colors.UI_BORDER, width: 1 });
    container.addChild(bg);

    // Discard icon
    const discardIcon = new Graphics()
      .roundRect(width / 2 - 8, this.options.height / 2 - 10, 16, 8, 2)
      .fill({ color: 0x666666 });
    container.addChild(discardIcon);

    // Label
    const label = new Text({
      text: 'Discard',
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    label.anchor.set(0.5);
    label.x = width / 2;
    label.y = this.options.height / 2 + 5;
    container.addChild(label);

    // Discard count text
    this.discardText = new Text({
      text: '0',
      style: {
        fontFamily: 'Kalam',
        fontSize: 12,
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    this.discardText.anchor.set(0.5);
    this.discardText.x = width / 2;
    this.discardText.y = this.options.height - 8;
    container.addChild(this.discardText);

    this.addChild(container);
  }

  public updateEnergy(current: number, max: number): void {
    this.currentEnergy = current;
    this.maxEnergy = max;
    this.energyText.text = `${current}/${max}`;
  }

  public updateDeckCount(count: number): void {
    this.deckCount = count;
    this.deckText.text = count.toString();
  }

  public updateDiscardCount(count: number): void {
    this.discardCount = count;
    this.discardText.text = count.toString();
  }

  public getEnergyInfo(): { current: number; max: number } {
    return { current: this.currentEnergy, max: this.maxEnergy };
  }

  public getDeckCount(): number {
    return this.deckCount;
  }

  public getDiscardCount(): number {
    return this.discardCount;
  }
}
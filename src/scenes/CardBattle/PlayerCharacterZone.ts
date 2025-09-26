import { Colors } from "@/utils/colors";
import { Container, Graphics, Text } from "pixi.js";
import { CardInDeck, CharacterState } from "@/types";


export class PlayerCharacterZone extends Container {
  private zoneBg: Graphics;

  private playerInfoZone: Container;
  private playerInfoLabel: Text;
  private energyText: Text;
  private energyCount: number = 0; // Placeholder for energy value
  private deckText: Text;
  private deckCount: number = 0; // Placeholder for deck count


  private charactersZone: Container;
  private characters: CharacterState[] = [];
  
  private playerNo: number = 1; // Default to player 1

  constructor(params?: { playerNo: number }) {
    super();

    this.playerNo = params?.playerNo ?? 1;
    
    this.zoneBg = new Graphics();
    this.addChild(this.zoneBg);

    this.playerInfoZone = new Container();
    this.addChild(this.playerInfoZone);

    this.playerInfoLabel = new Text();
    this.playerInfoZone.addChild(this.playerInfoLabel);

    this.energyText = new Text();
    this.playerInfoZone.addChild(this.energyText);

    this.deckText = new Text();
    this.playerInfoZone.addChild(this.deckText);

    this.charactersZone = new Container();
    this.addChild(this.charactersZone);
  }

  resize(width: number, height: number): void {
    this.zoneBg.roundRect(0, 0, width, height, 10)
      .fill(Colors.UI_BACKGROUND)
      .stroke({ width: 2, color: Colors.UI_BORDER });
    
    // Layout player info zone at the left
    const infoWidth = width * 0.3;
    this.playerInfoZone.x = 0;
    this.playerInfoZone.y = 0;
    this.playerInfoZone.width = infoWidth;
    this.playerInfoZone.height = height;

    this.playerInfoLabel.text = this.playerNo === 1 ? 'P1' : 'P2';
    this.playerInfoLabel.style = {
      fontFamily: 'Kalam',
      fontSize: 14,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.playerInfoLabel.x = 10;
    this.playerInfoLabel.y = 10;

    this.energyText.text = 'Energy: ';
    this.energyText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.energyText.x = 10;
    this.energyText.y = 30;

    this.deckText.text = 'Deck: ';
    this.deckText.style = {
      fontFamily: 'Kalam',
      fontSize: 12,
      fill: Colors.TEXT_PRIMARY,
      align: 'left'
    };
    this.deckText.x = 10;
    this.deckText.y = 50;

    // Layout characters zone to the right of player info
    const charactersWidth = width - infoWidth;
    this.charactersZone.x = infoWidth;
    this.charactersZone.y = 0;
    this.charactersZone.width = charactersWidth;
    this.charactersZone.height = height;

    this.loadCharacters();
  }

  private loadCharacters(): void {
    
  }

}
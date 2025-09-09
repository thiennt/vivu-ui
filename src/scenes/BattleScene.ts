import { Container, Graphics, Text, Ticker } from 'pixi.js';
import { navigation } from '@/utils/navigation';
import { mockCharacters } from '@/utils/mockData';
import { BaseScene } from '@/utils/BaseScene';
import { HomeScene } from './HomeScene';
import { Colors } from '@/utils/colors';
import { gsap } from 'gsap';

export class BattleScene extends BaseScene {
  /** Assets bundles required by this screen */
  public static assetBundles = [];
  
  public container: Container;
  private team1: any[] = [];
  private team2: any[] = [];
  private battleLog: string[] = [];
  private currentTurn: number = 0;
  private isAnimating: boolean = false;
  private logContainer!: Container;
  private team1Container!: Container;
  private team2Container!: Container;
  private effectsContainer!: Container;

  constructor() {
    super();

    this.container = new Container();
    this.addChild(this.container);
    
    // Initialize battle teams (4v4)
    this.initializeTeams();
  }

  private initializeTeams(): void {
    // Select first 4 characters for team 1
    this.team1 = mockCharacters.slice(0, 4).map(char => ({
      ...char,
      current_hp: char.max_hp,
      current_energy: char.current_energy || 0,
      team: 1
    }));
    
    // Select next 4 characters for team 2 (or duplicate if not enough)
    this.team2 = mockCharacters.slice(4, 8).map(char => ({
      ...char,
      current_hp: char.max_hp,
      current_energy: char.current_energy || 0,
      team: 2
    }));
    
    // If we don't have 8 characters, duplicate some
    while (this.team2.length < 4) {
      const char = mockCharacters[this.team2.length % mockCharacters.length];
      this.team2.push({
        ...char,
        id: `${char.id}_copy`,
        current_hp: char.max_hp,
        current_energy: char.current_energy || 0,
        team: 2
      });
    }
  }

  resize(width: number, height: number): void {
    this.gameWidth = width;
    this.gameHeight = height;

    // Clear and recreate layout
    this.container.removeChildren();
    this.createBackground();
    this.createEffectsContainer();
    this.createBattleLayout();
    this.createBattleLog();
    this.createActionButtons();
  }

  /** Show the screen with animation */
  async show(): Promise<void> {
    this.container.alpha = 1;
    return Promise.resolve();
  }

  /** Hide the screen with animation */
  async hide(): Promise<void> {
    this.container.alpha = 0;
    return Promise.resolve();
  }

  /** Reset screen after hidden */
  reset(): void {
    this.container.removeChildren();
    this.battleLog = [];
    this.currentTurn = 0;
    this.isAnimating = false;
  }

  private createBackground(): void {
    const bg = new Graphics();
    bg.fill(Colors.BACKGROUND_PRIMARY).rect(0, 0, this.gameWidth, this.gameHeight);
    this.container.addChild(bg);
    
    // Add title
    const title = new Text({
      text: '4v4 Battle Arena',
      style: {
        fontFamily: 'Kalam',
        fontSize: 32,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY,
        align: 'center'
      }
    });
    title.anchor.set(0.5);
    title.x = this.gameWidth / 2;
    title.y = 30;
    this.container.addChild(title);
  }

  private createEffectsContainer(): void {
    // Container for visual effects and animations
    this.effectsContainer = new Container();
    this.container.addChild(this.effectsContainer);
  }

  private createBattleLayout(): void {
    // Create containers for each team
    this.team1Container = new Container();
    this.team2Container = new Container();
    
    const cardWidth = 100;
    const spacing = 15;
    const teamWidth = (cardWidth + spacing) * 4 - spacing; // 4 characters in a row
    
    // Position enemies (team 1) at the top
    const team1X = this.gameWidth / 2 - teamWidth / 2;
    const team1Y = 80; // Top area
    
    // Position allies (team 2) at the bottom
    const team2X = this.gameWidth / 2 - teamWidth / 2;
    const team2Y = this.gameHeight - 200; // Bottom area
    
    // Create team 1 cards (enemies) - 4 in a row at top
    this.team1.forEach((character, index) => {
      const x = index * (cardWidth + spacing);
      const y = 0;
      
      const card = this.createBattleCard(character, x, y);
      this.team1Container.addChild(card);
    });
    
    // Create team 2 cards (allies) - 4 in a row at bottom
    this.team2.forEach((character, index) => {
      const x = index * (cardWidth + spacing);
      const y = 0;
      
      const card = this.createBattleCard(character, x, y);
      this.team2Container.addChild(card);
    });
    
    this.team1Container.x = team1X;
    this.team1Container.y = team1Y;
    this.team2Container.x = team2X;
    this.team2Container.y = team2Y;
    
    // Add team labels
    const team1Label = new Text({
      text: 'Enemies',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    team1Label.anchor.set(0.5);
    team1Label.x = this.gameWidth / 2;
    team1Label.y = team1Y - 30;
    
    const team2Label = new Text({
      text: 'Allies',
      style: {
        fontFamily: 'Kalam',
        fontSize: 18,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    team2Label.anchor.set(0.5);
    team2Label.x = this.gameWidth / 2;
    team2Label.y = team2Y - 30;
    
    this.container.addChild(this.team1Container, this.team2Container, team1Label, team2Label);
  }

  private createBattleCard(character: any, x: number, y: number): Container {
    const cardWidth = 100;
    const cardHeight = 120;
    const card = new Container();
    
    // Rarity colors
    const rarityColors: { [key: string]: number } = {
      common: Colors.RARITY_COMMON,
      uncommon: Colors.RARITY_UNCOMMON,
      rare: Colors.RARITY_RARE,
      epic: Colors.RARITY_EPIC,
      legendary: Colors.RARITY_LEGENDARY
    };
    
    // Card background
    const bg = new Graphics();
    bg.roundRect(0, 0, cardWidth, cardHeight, 8)
      .fill(rarityColors[character.rarity] || rarityColors.common)
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Character ticker/symbol
    const symbolText = new Text({
      text: character.ticker,
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_WHITE,
        align: 'center'
      }
    });
    symbolText.anchor.set(0.5);
    symbolText.x = cardWidth / 2;
    symbolText.y = 15;
    
    // Level
    const levelText = new Text({
      text: `Lv.${character.level}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 10,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    levelText.anchor.set(0.5);
    levelText.x = cardWidth / 2;
    levelText.y = 30;
    
    // HP Bar
    const hpBarBg = new Graphics();
    hpBarBg.roundRect(5, 45, cardWidth - 10, 8, 4)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const hpPercentage = character.current_hp / character.max_hp;
    const hpBarFill = new Graphics();
    hpBarFill.roundRect(6, 46, (cardWidth - 12) * hpPercentage, 6, 3)
      .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
    
    // HP Text
    const hpText = new Text({
      text: `HP: ${character.current_hp}/${character.max_hp}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    hpText.anchor.set(0.5);
    hpText.x = cardWidth / 2;
    hpText.y = 58;
    
    // Energy Bar
    const energyBarBg = new Graphics();
    energyBarBg.roundRect(5, 70, cardWidth - 10, 8, 4)
      .fill(Colors.BACKGROUND_SECONDARY)
      .stroke({ width: 1, color: Colors.CARD_BORDER });
    
    const maxEnergy = 100; // Assuming max energy is 100
    const energyPercentage = character.current_energy / maxEnergy;
    const energyBarFill = new Graphics();
    energyBarFill.roundRect(6, 71, (cardWidth - 12) * energyPercentage, 6, 3)
      .fill(0x2196f3); // Blue for energy
    
    // Energy Text
    const energyText = new Text({
      text: `EN: ${character.current_energy}/${maxEnergy}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 8,
        fill: Colors.TEXT_SECONDARY,
        align: 'center'
      }
    });
    energyText.anchor.set(0.5);
    energyText.x = cardWidth / 2;
    energyText.y = 83;
    
    // Attack and Defense stats
    const statsText = new Text({
      text: `ATK: ${character.atk} DEF: ${character.def}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 7,
        fill: Colors.TEXT_TERTIARY,
        align: 'center'
      }
    });
    statsText.anchor.set(0.5);
    statsText.x = cardWidth / 2;
    statsText.y = 95;
    
    card.addChild(bg, symbolText, levelText, hpBarBg, hpBarFill, hpText, energyBarBg, energyBarFill, energyText, statsText);
    card.x = x;
    card.y = y;
    
    // Store character reference for updates
    (card as any).character = character;
    
    return card;
  }

  private createBattleLog(): void {
    this.logContainer = new Container();
    
    // Log background
    const logBg = new Graphics();
    const logWidth = this.gameWidth - 40;
    const logHeight = 80;
    logBg.roundRect(0, 0, logWidth, logHeight, 8)
      .fill({ color: Colors.BACKGROUND_SECONDARY, alpha: 0.8 })
      .stroke({ width: 2, color: Colors.CARD_BORDER });
    
    // Log title
    const logTitle = new Text({
      text: 'Battle Log',
      style: {
        fontFamily: 'Kalam',
        fontSize: 14,
        fontWeight: 'bold',
        fill: Colors.TEXT_PRIMARY
      }
    });
    logTitle.x = 10;
    logTitle.y = 5;
    
    this.logContainer.addChild(logBg, logTitle);
    this.logContainer.x = 20;
    this.logContainer.y = this.gameHeight - 120;
    
    this.container.addChild(this.logContainer);
  }

  private createActionButtons(): void {
    const buttonContainer = new Container();
    
    // Start Battle button
    const startButton = this.createButton(
      'Start Battle',
      0,
      0,
      120,
      40,
      () => this.startBattle()
    );
    
    // Next Turn button
    const nextTurnButton = this.createButton(
      'Next Turn',
      130,
      0,
      120,
      40,
      () => this.processTurn()
    );
    
    // Back button
    const backButton = this.createButton(
      '← Back to Home',
      260,
      0,
      140,
      40,
      () => navigation.showScreen(HomeScene)
    );
    
    buttonContainer.addChild(startButton, nextTurnButton, backButton);
    buttonContainer.x = (this.gameWidth - 520) / 2;
    buttonContainer.y = this.gameHeight - 60;
    
    this.container.addChild(buttonContainer);
  }

  private async animateAction(attacker: any, target: any, actionType: string, damage: number): Promise<void> {
    const attackerCard = this.findCharacterCard(attacker);
    const targetCard = this.findCharacterCard(target);
    
    if (!attackerCard || !targetCard) return;

    // Attacker animation
    await this.animateAttackerCard(attackerCard, actionType);
    
    // Action effect animation
    await this.animateActionEffect(targetCard, actionType);
    
    // Target hit animation
    await this.animateTargetHit(targetCard, damage);
  }

  private findCharacterCard(character: any): Container | null {
    const isTeam1 = character.team === 1;
    const teamContainer = isTeam1 ? this.team1Container : this.team2Container;
    const team = isTeam1 ? this.team1 : this.team2;
    
    const index = team.findIndex(char => char.id === character.id);
    if (index >= 0 && index < teamContainer.children.length) {
      return teamContainer.children[index] as Container;
    }
    return null;
  }

  private async animateAttackerCard(card: Container, actionType: string): Promise<void> {
    // Different animations based on action type
    switch (actionType) {
      case 'slash':
        // Quick forward dash and back
        await gsap.to(card, { 
          x: card.x + 20, 
          duration: 0.1, 
          ease: 'power2.out' 
        });
        await gsap.to(card, { 
          x: card.x, 
          duration: 0.2, 
          ease: 'power2.inOut' 
        });
        break;
      case 'fire':
        // Glow and shake effect
        await gsap.to(card, { 
          scaleX: 1.1, 
          scaleY: 1.1, 
          rotation: 0.1, 
          duration: 0.3, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
        break;
      case 'ice':
        // Vertical bob effect
        await gsap.to(card, { 
          y: card.y - 10, 
          duration: 0.2, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
        break;
      default:
        // Default punch animation
        await gsap.to(card, { 
          scaleX: 1.05, 
          scaleY: 1.05, 
          duration: 0.15, 
          yoyo: true, 
          repeat: 1,
          ease: 'power2.inOut' 
        });
    }
  }

  private async animateActionEffect(targetCard: Container, actionType: string): Promise<void> {
    const effect = new Graphics();
    const targetX = targetCard.x + (targetCard.parent?.x || 0) + 50;
    const targetY = targetCard.y + (targetCard.parent?.y || 0) + 60;
    
    switch (actionType) {
      case 'slash':
        // Slash effect - diagonal line
        effect.fill(0xFFFFFF)
          .rect(-2, -20, 4, 40)
          .fill(0xFFAA00)
          .rect(-1, -20, 2, 40);
        effect.rotation = Math.PI / 4;
        break;
      case 'fire':
        // Fire burst effect
        effect.fill(0xFF4444)
          .circle(0, 0, 25)
          .fill(0xFF8800)
          .circle(0, 0, 15)
          .fill(0xFFDD00)
          .circle(0, 0, 8);
        break;
      case 'ice':
        // Ice shard effect
        effect.fill(0x88DDFF)
          .moveTo(0, -15)
          .lineTo(10, 15)
          .lineTo(-10, 15)
          .closePath()
          .fill(0xAAEEFF)
          .circle(0, 0, 8);
        break;
      default:
        // Default impact effect
        effect.fill(0xFFFFFF)
          .circle(0, 0, 20)
          .fill(0xFFDD00)
          .circle(0, 0, 12);
    }
    
    effect.x = targetX;
    effect.y = targetY;
    effect.alpha = 0;
    effect.scale.set(0.5);
    
    this.effectsContainer.addChild(effect);
    
    // Animate effect
    await gsap.to(effect, { 
      alpha: 1, 
      scale: 1.2, 
      duration: 0.2, 
      ease: 'power2.out' 
    });
    await gsap.to(effect, { 
      alpha: 0, 
      scale: 0.8, 
      duration: 0.3, 
      ease: 'power2.in' 
    });
    
    this.effectsContainer.removeChild(effect);
  }

  private async animateTargetHit(targetCard: Container, damage: number): Promise<void> {
    // Shake effect for target
    const originalX = targetCard.x;
    await gsap.to(targetCard, { 
      x: originalX - 5, 
      duration: 0.05 
    });
    await gsap.to(targetCard, { 
      x: originalX + 5, 
      duration: 0.05 
    });
    await gsap.to(targetCard, { 
      x: originalX, 
      duration: 0.05 
    });
    
    // Damage number animation
    await this.showDamageNumber(targetCard, damage);
  }

  private async showDamageNumber(targetCard: Container, damage: number): Promise<void> {
    const damageText = new Text({
      text: `-${damage}`,
      style: {
        fontFamily: 'Kalam',
        fontSize: 20,
        fontWeight: 'bold',
        fill: 0xFF4444,
        stroke: { color: 0xFFFFFF, width: 2 }
      }
    });
    
    damageText.anchor.set(0.5);
    damageText.x = targetCard.x + (targetCard.parent?.x || 0) + 50;
    damageText.y = targetCard.y + (targetCard.parent?.y || 0) + 30;
    
    this.effectsContainer.addChild(damageText);
    
    // Animate damage number floating up and fading
    await gsap.to(damageText, { 
      y: damageText.y - 50, 
      alpha: 0, 
      scale: 1.5,
      duration: 1, 
      ease: 'power2.out' 
    });
    
    this.effectsContainer.removeChild(damageText);
  }

  private startBattle(): void {
    this.battleLog = ['Battle Started!'];
    this.currentTurn = 1;
    this.updateBattleLog();
  }

  private async processTurn(): Promise<void> {
    if (this.isAnimating) return;
    
    this.isAnimating = true;
    
    // Get all living characters
    const team1Alive = this.team1.filter(char => char.current_hp > 0);
    const team2Alive = this.team2.filter(char => char.current_hp > 0);
    
    // Check for battle end conditions
    if (team1Alive.length === 0) {
      this.battleLog.push('Allies Win!');
      this.updateBattleLog();
      this.isAnimating = false;
      return;
    }
    
    if (team2Alive.length === 0) {
      this.battleLog.push('Enemies Win!');
      this.updateBattleLog();
      this.isAnimating = false;
      return;
    }
    
    // Combine and sort all characters by agility (speed determines turn order)
    const allAlive = [...team1Alive.map(c => ({...c, team: 1})), ...team2Alive.map(c => ({...c, team: 2}))];
    allAlive.sort((a, b) => b.agi - a.agi);
    
    // Process each character's turn in order with animations
    for (const attacker of allAlive) {
      if (attacker.current_hp <= 0) continue; // Skip if character died this turn
      
      // Find valid targets (opposing team)
      const targets = attacker.team === 1 ? 
        this.team2.filter(char => char.current_hp > 0) : 
        this.team1.filter(char => char.current_hp > 0);
      
      if (targets.length === 0) break; // No targets available
      
      // Select target (for now, random - could be improved with AI)
      const target = targets[Math.floor(Math.random() * targets.length)];
      
      // Choose action type based on character stats and random chance
      const actionType = this.chooseActionType(attacker);
      
      // Calculate damage with some strategy
      const baseDamage = attacker.atk;
      const defense = target.def;
      const critChance = attacker.crit_rate / 100;
      const isCrit = Math.random() < critChance;
      
      let damage = Math.max(1, baseDamage - defense + Math.floor(Math.random() * 5) - 2);
      
      // Apply action type modifiers
      switch (actionType) {
        case 'fire':
          damage = Math.floor(damage * 1.2); // Fire does more damage
          break;
        case 'ice':
          damage = Math.floor(damage * 0.9); // Ice does less damage but could have other effects
          break;
        case 'slash':
          // Slash has higher crit chance
          if (!isCrit && Math.random() < 0.2) {
            damage = Math.floor(damage * (attacker.crit_dmg / 100));
            this.battleLog.push(`💥 Slash Critical Hit!`);
          }
          break;
      }
      
      if (isCrit) {
        damage = Math.floor(damage * (attacker.crit_dmg / 100));
        this.battleLog.push(`💥 Critical Hit!`);
      }
      
      // Apply damage
      target.current_hp = Math.max(0, target.current_hp - damage);
      
      // Gain energy for attacking
      attacker.current_energy = Math.min(100, attacker.current_energy + 15);
      
      // Animate the action
      await this.animateAction(attacker, target, actionType, damage);
      
      // Log the attack with action type
      const actionEmoji = this.getActionEmoji(actionType);
      const critText = isCrit ? ' (CRIT)' : '';
      this.battleLog.push(`${attacker.ticker} ${actionEmoji} ${actionType}s ${target.ticker} for ${damage} damage${critText}`);
      
      if (target.current_hp === 0) {
        this.battleLog.push(`${target.ticker} is defeated!`);
        // Attacker gains bonus energy for defeating enemy
        attacker.current_energy = Math.min(100, attacker.current_energy + 25);
      }
      
      // Update UI after each action
      this.updateBattleCards();
      this.updateBattleLog();
      
      // Small delay between actions for better visual flow
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    this.currentTurn++;
    this.isAnimating = false;
  }

  private chooseActionType(character: any): string {
    const actions = ['slash', 'fire', 'ice', 'punch'];
    
    // Simple logic based on character stats or random
    if (character.atk > 80) {
      // High attack characters prefer slash
      return Math.random() < 0.4 ? 'slash' : actions[Math.floor(Math.random() * actions.length)];
    } else if (character.agi > 70) {
      // Fast characters prefer ice
      return Math.random() < 0.4 ? 'ice' : actions[Math.floor(Math.random() * actions.length)];
    } else {
      // Others prefer fire or random
      return Math.random() < 0.3 ? 'fire' : actions[Math.floor(Math.random() * actions.length)];
    }
  }

  private getActionEmoji(actionType: string): string {
    switch (actionType) {
      case 'slash': return '⚔️';
      case 'fire': return '🔥';
      case 'ice': return '❄️';
      default: return '👊';
    }
  }

  private updateBattleCards(): void {
    // Update team 1 cards
    this.team1Container.children.forEach((cardContainer: Container, index) => {
      if (index < this.team1.length) {
        this.updateCardBars(cardContainer, this.team1[index]);
      }
    });
    
    // Update team 2 cards
    this.team2Container.children.forEach((cardContainer: Container, index) => {
      if (index < this.team2.length) {
        this.updateCardBars(cardContainer, this.team2[index]);
      }
    });
  }

  private updateCardBars(cardContainer: Container, character: any): void {
    // Find and update HP bar
    const hpBarFill = cardContainer.children[4] as Graphics; // HP bar fill
    const hpText = cardContainer.children[5] as Text; // HP text
    const energyBarFill = cardContainer.children[7] as Graphics; // Energy bar fill
    const energyText = cardContainer.children[8] as Text; // Energy text
    
    if (hpBarFill && hpText) {
      const hpPercentage = character.current_hp / character.max_hp;
      hpBarFill.clear();
      hpBarFill.roundRect(6, 46, (100 - 12) * hpPercentage, 6, 3)
        .fill(hpPercentage > 0.5 ? 0x4caf50 : hpPercentage > 0.25 ? 0xff9800 : 0xf44336);
      
      hpText.text = `HP: ${character.current_hp}/${character.max_hp}`;
    }
    
    if (energyBarFill && energyText) {
      const energyPercentage = character.current_energy / 100;
      energyBarFill.clear();
      energyBarFill.roundRect(6, 71, (100 - 12) * energyPercentage, 6, 3)
        .fill(0x2196f3);
      
      energyText.text = `EN: ${character.current_energy}/100`;
    }
    
    // Add visual effect for defeated characters
    if (character.current_hp === 0) {
      cardContainer.alpha = 0.5; // Make defeated characters semi-transparent
      
      // Add "DEFEATED" overlay if not already present
      if (!cardContainer.children.find(child => (child as any).isDefeatedOverlay)) {
        const defeatedOverlay = new Graphics();
        defeatedOverlay.roundRect(0, 0, 100, 120, 8)
          .fill({ color: 0x000000, alpha: 0.6 });
        
        const defeatedText = new Text({
          text: 'DEFEATED',
          style: {
            fontFamily: 'Kalam',
            fontSize: 10,
            fontWeight: 'bold',
            fill: 0xff4444,
            align: 'center'
          }
        });
        defeatedText.anchor.set(0.5);
        defeatedText.x = 50;
        defeatedText.y = 60;
        
        (defeatedOverlay as any).isDefeatedOverlay = true;
        (defeatedText as any).isDefeatedOverlay = true;
        
        cardContainer.addChild(defeatedOverlay, defeatedText);
      }
    } else {
      cardContainer.alpha = 1; // Ensure living characters are fully visible
    }
  }

  private updateBattleLog(): void {
    // Clear existing log text
    const logChildren = this.logContainer.children.slice(2); // Keep background and title
    logChildren.forEach(child => this.logContainer.removeChild(child));
    
    // Show last 3 log entries
    const recentLogs = this.battleLog.slice(-3);
    recentLogs.forEach((log, index) => {
      const logText = new Text({
        text: log,
        style: {
          fontFamily: 'Kalam',
          fontSize: 10,
          fill: Colors.TEXT_SECONDARY
        }
      });
      logText.x = 10;
      logText.y = 22 + index * 15;
      this.logContainer.addChild(logText);
    });
  }

  public update(_time: Ticker): void {
    // Animation updates can be added here
  }
}
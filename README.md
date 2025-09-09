# VIVU - Fantasy Crypto Card Game UI

A whimsical fantasy turn-based card game UI built with PixiJS and TypeScript, featuring crypto-themed characters and immersive gameplay screens.

![Home Screen](https://github.com/user-attachments/assets/8ee7c6bd-8e1e-4f27-9046-2b535715af55)

## 🎮 Features

### Game Screens
- **🏠 Home Screen**: Mystical welcome with animated elements and player information
- **👤 Player Profile**: Complete stats display and character collection overview
- **🃏 Character Collection**: Grid-based character browsing with crypto token themes
- **📊 Character Details**: In-depth character information with skills and abilities
- **🏰 Dungeon Selection**: Adventure areas with "Crypto Caves" and "Blockchain Forest"
- **⚔️ Stage Selection**: Chapter-based progression with difficulty levels
- **🛡️ Formation Setup**: Drag-and-drop battle preparation with 3x2 grid

### Character System
- **Crypto-Themed**: Characters inspired by BTC, ETH, ADA, SOL, DOGE
- **Rarity System**: Common → Uncommon → Rare → Epic → Legendary
- **Element Types**: Fire, Water, Earth, Air, Light, Dark
- **Comprehensive Stats**: Health, Attack, Defense, Speed, Critical Rate/Damage

### UI Design
- **Hand-drawn Aesthetic**: Kalam font with rounded, whimsical elements
- **Fantasy Theme**: Magical backgrounds, mystical colors, animated effects
- **Responsive Design**: Centered layout with 400px minimum width
- **Interactive Elements**: Hover effects, smooth transitions, intuitive navigation

## 🛠️ Technology Stack

- **PixiJS 7.3.0**: High-performance 2D rendering engine
- **TypeScript**: Type-safe development with comprehensive interfaces
- **Vite**: Fast development server and optimized builds
- **ESLint**: Code quality and consistency

## 🚀 Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/thiennt/vivu-ui.git
cd vivu-ui

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🎯 Game Navigation

### Using UI Buttons
Navigate through the game using the intuitive button interface in each screen.

### Console Commands
For development and testing, you can navigate programmatically:

```javascript
// Available in browser console
game.switchToScene('home')
game.switchToScene('characters')
game.switchToScene('player_detail')
game.switchToScene('character_detail')
game.switchToScene('dungeon')
game.switchToScene('stage')
game.switchToScene('formation')

// Get current scene
game.getCurrentScene()
```

## 📋 Game Screens Overview

### Home Screen
![Home Screen](https://github.com/user-attachments/assets/8ee7c6bd-8e1e-4f27-9046-2b535715af55)
- Welcome message with player information
- Navigation to all game sections
- Animated mystical background elements

### Character Collection
![Character Collection](https://github.com/user-attachments/assets/fc0f9173-3c15-4e48-b0d5-b0e4fa31da18)
- Grid layout showcasing all characters
- Crypto token symbols (BTC, ETH, ADA, SOL, DOGE)
- Rarity-based color coding
- Detailed stats preview

### Battle Formation
![Battle Formation](https://github.com/user-attachments/assets/d0ff08ff-349d-4cad-8f33-0f7b76bbfa24)
- 3x2 formation grid with front/back positioning
- Drag-and-drop character placement
- Available character pool
- Save/Reset functionality

## 🎨 Design System

### Color Palette
- **Primary Background**: Deep brown tones (#2c1810, #1a0e0a)
- **UI Elements**: Green accents (#43a047, #2e7d32, #66bb6a)
- **Text**: Light cream (#ffecb3, #d7ccc8)
- **Accents**: Mystical blues and purples for magical elements

### Character Rarities
- **Common**: Green (#4caf50)
- **Uncommon**: Light Green (#66bb6a)
- **Rare**: Blue (#42a5f5)
- **Epic**: Purple (#ab47bc)
- **Legendary**: Orange (#ff9800)

### Typography
- **Primary Font**: Kalam (Google Fonts)
- **Style**: Hand-drawn, whimsical, fantasy-themed

## 📁 Project Structure

```
src/
├── scenes/           # Game screens
│   ├── HomeScene.ts
│   ├── CharactersScene.ts
│   ├── CharacterDetailScene.ts
│   ├── PlayerDetailScene.ts
│   ├── DungeonScene.ts
│   ├── StageScene.ts
│   └── FormationScene.ts
├── utils/            # Utilities and managers
│   ├── SceneManager.ts
│   └── mockData.ts
├── types/            # TypeScript interfaces
│   └── index.ts
└── main.ts           # Application entry point
```

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues

### Code Style
- TypeScript with strict mode enabled
- ESLint for code quality
- Modular scene-based architecture
- Comprehensive type definitions

## 🎮 Game Data

The game includes rich mock data featuring:
- **5 Crypto Characters**: BTC Paladin, ETH Mage, ADA Guardian, SOL Archer, DOGE Warrior
- **2 Dungeons**: Crypto Caves, Blockchain Forest
- **Multiple Chapters and Stages** with progressive difficulty
- **Comprehensive Player Stats** and progression system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details

## 🙏 Acknowledgments

- PixiJS team for the amazing 2D rendering engine
- Google Fonts for the Kalam typography
- Crypto community for character inspiration
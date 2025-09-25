/**
 * CardBattleScene Storybook Story
 * 
 * This would be a proper Storybook story if Storybook was configured.
 * For now, this serves as documentation for how the component would be displayed.
 */

// NOTE: This would require Storybook to be installed and configured
// The actual implementation would need: @storybook/core, @storybook/builder-vite, etc.

import type { Meta, StoryObj } from '@storybook/html';
import { CardBattleScene } from '../scenes/CardBattleScene';

const meta: Meta = {
  title: 'Scenes/CardBattleScene',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# CardBattleScene

A React-like component implementing a card battle scene layout with the following structure:

## Layout Structure (top to bottom):
1. **Opponent Info Panel** - HP/ATK/DEF, avatar
2. **Opponent Hand Zone** - Cards face down  
3. **Opponent Discard Pile**
4. **Battle Log Area** - Central area showing recent actions
5. **Player Characters Row** - Up to 3 character cards
6. **Player Hand Zone** - Interactive cards face up
7. **Player Info Panel & Discard Pile**  
8. **END TURN Button** - Prominent, accessible

## Features:
- ✅ Responsive layout that adapts to screen size
- ✅ Uses existing design tokens and color system
- ✅ Mock data with realistic game state
- ✅ Interactive elements (cards, buttons)
- ✅ Proper visual hierarchy and spacing
- ✅ HP/ATK/DEF bars and character stats
- ✅ Energy cost indicators on cards
- ✅ Battle log with turn information
- ✅ Accessible END TURN button
- ✅ TypeScript types and lint compliance

## Usage:
The component integrates with the existing vivu-ui system and extends BaseScene.
It can be navigated to from the HomeScene through the Card Battle menu option.
        `,
      },
    },
  },
  argTypes: {
    width: { control: { type: 'range', min: 320, max: 1200, step: 10 } },
    height: { control: { type: 'range', min: 480, max: 800, step: 10 } },
  },
};

export default meta;
type Story = StoryObj;

export const Default: Story = {
  args: {
    width: 800,
    height: 600,
  },
  render: (args) => {
    // In a real Storybook setup, this would create a PIXI app and render the scene
    const container = document.createElement('div');
    container.style.width = `${args.width}px`;
    container.style.height = `${args.height}px`;
    container.style.border = '2px solid #8b4513';
    container.style.borderRadius = '10px';
    container.style.background = 'linear-gradient(180deg, #4a1f0d 0%, #6b2e17 100%)';
    container.style.position = 'relative';
    container.style.overflow = 'hidden';
    
    // Add placeholder text
    const placeholder = document.createElement('div');
    placeholder.style.position = 'absolute';
    placeholder.style.top = '50%';
    placeholder.style.left = '50%';
    placeholder.style.transform = 'translate(-50%, -50%)';
    placeholder.style.color = '#ffa500';
    placeholder.style.fontSize = '18px';
    placeholder.style.fontWeight = 'bold';
    placeholder.style.textAlign = 'center';
    placeholder.innerHTML = `
      <div>CardBattleScene</div>
      <div style="font-size: 14px; margin-top: 10px; color: #fff4e0;">
        ${args.width}x${args.height}
      </div>
      <div style="font-size: 12px; margin-top: 5px; color: #ffe0b3;">
        (PIXI.js scene would render here)
      </div>
    `;
    
    container.appendChild(placeholder);
    return container;
  },
};

export const Mobile: Story = {
  args: {
    width: 375,
    height: 667,
  },
  render: Default.render,
};

export const Desktop: Story = {
  args: {
    width: 1024,
    height: 768,
  },
  render: Default.render,
};
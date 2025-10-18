# 🎲 StatField

Vue component for RPG character stat generation with dice rolling. Perfect for D&D, Pathfinder, and any tabletop RPG character creation.

## ✨ Features

- 🎲 **Dice-only input** - Values come from dice rolls, not manual entry
- 🎯 **Smart validation** - Min/max ranges with automatic validation
- 🎨 **Customizable styling** - CSS variables for easy theming
- 📊 **Roll details** - Optional display of individual die results
- 🎭 **Multiple dice types** - d4, d6, d8, d10, d12, d20, d100
- ⚡ **Vue 3 events** - Full Vuetify-style event system
- 🔢 **Modifiers** - Support for +/- modifiers (e.g., "2d6+3")
- 📱 **Mobile-friendly** - Responsive design

## 📦 Installation

```bash
npm install @stat-field/vue
```

## 🚀 Quick Start

```vue
<script setup>
import { ref } from 'vue';
import { VStatField } from '@stat-field/vue';

const strength = ref(null);
</script>

<template>
  <VStatField
    v-model="strength"
    die="3d6"
    label="Strength"
    :min="3"
    :max="18"
    show-details
    @roll="handleRoll"
  />
</template>
```

## 📖 API Reference

### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `modelValue` | `Number \| null` | `null` | The current value (v-model) |
| `die` | `String` | **required** | Dice notation (e.g., "3d6", "1d20+5") |
| `label` | `String` | `''` | Label text above the input |
| `placeholder` | `String` | `''` | Placeholder text |
| `hint` | `String` | `''` | Hint text below input |
| `hideRollButton` | `Boolean` | `false` | Hide the roll button |
| `min` | `Number` | `undefined` | Minimum allowed value |
| `max` | `Number` | `undefined` | Maximum allowed value |
| `required` | `Boolean` | `false` | Mark field as required |
| `rules` | `Array` | `[]` | Validation rules |
| `showDetails` | `Boolean` | `false` | Show roll breakdown |
| `variant` | `String` | `'default'` | Style variant: 'default', 'compact', 'inline' |
| `disabled` | `Boolean` | `false` | Disable the field |
| `loading` | `Boolean` | `false` | Show loading state |
| `autoRoll` | `Boolean` | `false` | Auto-roll on mount |
| `seed` | `Number` | `undefined` | Seed for deterministic rolls |

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `update:modelValue` | `Number` | Emitted when value changes |
| `roll` | `RollResult` | Emitted when dice are rolled |
| `input` | `Number` | Emitted on value change (Vuetify-style) |
| `change` | `Number` | Emitted after roll completes |
| `focus` | `FocusEvent` | Emitted when input gains focus |
| `blur` | `FocusEvent` | Emitted when input loses focus |
| `click` | `MouseEvent` | Emitted when input is clicked |
| `click:append` | `MouseEvent` | Emitted when roll button is clicked |
| `error` | `Error` | Emitted on roll error |
| `validation-error` | `String` | Emitted on validation failure |

### Slots

| Slot | Props | Description |
|------|-------|-------------|
| `prepend` | `{ value, roll }` | Content before input |
| `append` | `{ roll, loading, disabled }` | Custom roll button content |
| `error` | `{ error }` | Custom error message |
| `details` | `{ roll }` | Custom roll details display |

### Exposed Methods

```typescript
interface VStatFieldExposed {
  roll(): Promise<void>;  // Trigger a roll
  focus(): void;          // Focus the input
  blur(): void;           // Blur the input
  value: Ref<number>;     // Current value
  lastRoll: Ref<RollResult>; // Last roll result
}
```

## 🎨 Theming

Customize appearance with CSS variables:

```css
.v-stat-field {
  --stat-primary-color: #667eea;
  --stat-primary-hover: #5568d3;
  --stat-error-color: #ff4757;
  --stat-border-color: #ddd;
  --stat-border-radius: 4px;
  --stat-text-color: #333;
  --stat-bg-color: white;
  --stat-label-color: #666;
  --stat-hint-color: #999;
}
```

## 📝 Examples

### D&D Character Stats

```vue
<template>
  <div class="character-stats">
    <VStatField v-model="str" die="3d6" label="Strength" :min="3" :max="18" />
    <VStatField v-model="dex" die="3d6" label="Dexterity" :min="3" :max="18" />
    <VStatField v-model="con" die="3d6" label="Constitution" :min="3" :max="18" />
    <VStatField v-model="int" die="3d6" label="Intelligence" :min="3" :max="18" />
    <VStatField v-model="wis" die="3d6" label="Wisdom" :min="3" :max="18" />
    <VStatField v-model="cha" die="3d6" label="Charisma" :min="3" :max="18" />
  </div>
</template>
```

### With Validation Rules

```vue
<script setup>
const rules = [
  (value) => value >= 8 || 'Minimum stat is 8',
  (value) => value <= 15 || 'Maximum stat is 15'
];
</script>

<template>
  <VStatField
    v-model="stat"
    die="3d6"
    label="Balanced Stat"
    :rules="rules"
  />
</template>
```

### Custom Roll Button

```vue
<template>
  <VStatField v-model="hp" die="1d10+5" label="Hit Points">
    <template #append="{ roll, loading }">
      <button @click="roll" :disabled="loading">
        {{ loading ? 'Rolling...' : '🎲 Roll HP' }}
      </button>
    </template>
  </VStatField>
</template>
```

### Compact Variant

```vue
<template>
  <VStatField
    v-model="initiative"
    die="1d20"
    label="Initiative"
    variant="compact"
  />
</template>
```

## 🎯 Use Cases

- **Character Creation** - Generate D&D/Pathfinder ability scores
- **Initiative Tracking** - Roll initiative for combat
- **HP Generation** - Roll hit points for new characters
- **Random Stats** - Any RPG stat that needs dice rolls
- **Loot Tables** - Generate random loot values
- **Skill Checks** - Quick dice rolling for skill checks

## 🛠️ Development

```bash
# Install dependencies
npm install

# Run demo
open demo.html

# Build library
npm run build
```

## 📄 License

MIT © Logan

## 🔗 Links

- [Demo](https://rakmaster.github.io/stat-field/)
- [GitHub](https://github.com/rakmaster/stat-field)
- [npm](https://www.npmjs.com/package/@stat-field/vue)

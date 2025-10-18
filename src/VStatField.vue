<template>
  <div class="v-stat-field" :class="variantClass">
    <!-- Label -->
    <label v-if="label" class="stat-label" :for="inputId">
      {{ label }}
      <span v-if="required" class="required-indicator">*</span>
    </label>

    <!-- Input Group -->
    <div class="stat-input-group">
      <!-- Prepend Slot -->
      <slot name="prepend" :value="localValue" :roll="handleRoll" />

      <!-- Number Input (Read-only) -->
      <input
        :id="inputId"
        ref="inputRef"
        type="number"
        :value="localValue"
        :placeholder="placeholder"
        :min="min"
        :max="max"
        :disabled="disabled"
        :readonly="true"
        class="stat-input"
        @focus="handleFocus"
        @blur="handleBlur"
        @click="handleClick"
      />

      <!-- Append: Roll Button -->
      <button
        v-if="!hideRollButton"
        @click="handleRollClick"
        :disabled="disabled || loading"
        class="stat-roll-btn"
        type="button"
      >
        <slot name="append" :roll="handleRoll" :loading="loading" :disabled="disabled">
          <span v-if="loading">⏳</span>
          <span v-else class="dice-icons">{{ diceIcons }}</span>
        </slot>
      </button>
    </div>

    <!-- Hint Text -->
    <div v-if="hint && !error" class="stat-hint">
      {{ hint }}
    </div>

    <!-- Error Message -->
    <div v-if="error" class="stat-error">
      <slot name="error" :error="error">
        {{ error }}
      </slot>
    </div>

    <!-- Details (optional) -->
    <div v-if="showDetails && lastRoll" class="stat-details">
      <slot name="details" :roll="lastRoll">
        {{ die }}: [{{ lastRoll.rolls.join(', ') }}]
        <span v-if="lastRoll.modifier !== 0">
          {{ lastRoll.modifier > 0 ? '+' : '' }}{{ lastRoll.modifier }}
        </span>
        = {{ lastRoll.total }}
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { rollDetailed } from '@dice-roller/core';

const props = defineProps({
  // Value
  modelValue: {
    type: [Number, null],
    default: null
  },
  
  // Dice configuration
  die: {
    type: String,
    required: true,
    validator: (value) => /^\d+d\d+([+-]\d+)?$/.test(value)
  },
  
  // Input configuration
  label: {
    type: String,
    default: ''
  },
  placeholder: {
    type: String,
    default: ''
  },
  hint: {
    type: String,
    default: ''
  },
  hideRollButton: {
    type: Boolean,
    default: false
  },
  
  // Validation
  min: {
    type: Number,
    default: undefined
  },
  max: {
    type: Number,
    default: undefined
  },
  required: {
    type: Boolean,
    default: false
  },
  rules: {
    type: Array,
    default: () => []
  },
  
  // Display
  showDetails: {
    type: Boolean,
    default: false
  },
  
  // Styling
  variant: {
    type: String,
    default: 'default', // 'default', 'compact', 'inline'
    validator: (value) => ['default', 'compact', 'inline'].includes(value)
  },
  
  // State
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  
  // Auto-roll
  autoRoll: {
    type: Boolean,
    default: false
  },
  
  // Seed for deterministic rolls
  seed: {
    type: Number,
    default: undefined
  }
});

const emit = defineEmits([
  'update:modelValue',
  'roll',
  'input',
  'change',
  'focus',
  'blur',
  'click',
  'click:append',
  'error',
  'validation-error'
]);

// Refs
const inputRef = ref(null);
const localValue = ref(props.modelValue);
const error = ref(null);
const lastRoll = ref(null);
const inputId = computed(() => `stat-field-${Math.random().toString(36).substr(2, 9)}`);

// Computed
const variantClass = computed(() => `variant-${props.variant}`);

// Parse die notation to show appropriate icons
const diceIcons = computed(() => {
  const match = props.die.match(/^(\d+)d(\d+)/);
  if (!match) return '🎲';
  
  const count = parseInt(match[1]);
  const sides = parseInt(match[2]);
  
  // Map die types to emoji
  const dieEmoji = {
    4: '🔺',
    6: '⚄',
    8: '🔷',
    10: '🔟',
    12: '🌟',
    20: '🎲',
    100: '💯'
  };
  
  const icon = dieEmoji[sides] || '🎲';
  return icon.repeat(Math.min(count, 3)) + (count > 3 ? '…' : '');
});

// Watch for external value changes
watch(() => props.modelValue, (newVal) => {
  localValue.value = newVal;
});

// Watch for local value changes
watch(localValue, (newVal) => {
  emit('update:modelValue', newVal);
  emit('input', newVal);
});

// Validation
function validateValue(value) {
  if (props.required && (value === null || value === undefined)) {
    return { valid: false, error: 'This field is required' };
  }
  
  if (value !== null && value !== undefined) {
    if (props.min !== undefined && value < props.min) {
      return { valid: false, error: `Value must be at least ${props.min}` };
    }
    
    if (props.max !== undefined && value > props.max) {
      return { valid: false, error: `Value must be at most ${props.max}` };
    }
  }
  
  // Custom rules
  if (props.rules && props.rules.length > 0) {
    for (const rule of props.rules) {
      const result = rule(value);
      
      if (result === true) continue;
      if (result === false) {
        return { valid: false, error: 'Invalid value' };
      }
      if (typeof result === 'string') {
        return { valid: false, error: result };
      }
    }
  }
  
  return { valid: true };
}

// Methods
async function handleRoll() {
  if (props.disabled || props.loading) {
    return;
  }
  
  try {
    error.value = null;
    
    const options = props.seed !== undefined ? { seed: props.seed } : {};
    const result = rollDetailed(props.die, options);
    
    lastRoll.value = result;
    localValue.value = result.total;
    
    // Validate the rolled value
    const validation = validateValue(result.total);
    if (!validation.valid) {
      error.value = validation.error;
      emit('validation-error', validation.error);
    } else {
      emit('change', result.total);
    }
    
    emit('roll', result);
  } catch (err) {
    error.value = err.message;
    emit('error', err);
  }
}

function handleRollClick(event) {
  emit('click:append', event);
  handleRoll();
}

function handleFocus(event) {
  emit('focus', event);
}

function handleBlur(event) {
  emit('blur', event);
}

function handleClick(event) {
  emit('click', event);
}

// Auto-roll on mount if specified
onMounted(() => {
  if (props.autoRoll) {
    handleRoll();
  }
});

// Expose methods and refs
defineExpose({
  roll: handleRoll,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  value: localValue,
  lastRoll
});
</script>

<style scoped>
.v-stat-field {
  --stat-primary-color: #667eea;
  --stat-primary-hover: #5568d3;
  --stat-secondary-color: #764ba2;
  --stat-error-color: #ff4757;
  --stat-border-color: #ddd;
  --stat-border-radius: 4px;
  --stat-text-color: #333;
  --stat-bg-color: white;
  --stat-label-color: #666;
  --stat-hint-color: #999;
  
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  margin-bottom: 16px;
}

/* Label */
.stat-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: var(--stat-label-color);
  margin-bottom: 6px;
}

.required-indicator {
  color: var(--stat-error-color);
  margin-left: 2px;
}

/* Input Group */
.stat-input-group {
  display: flex;
  gap: 8px;
  align-items: stretch;
}

.stat-input {
  flex: 1;
  padding: 10px 12px;
  border: 2px solid var(--stat-border-color);
  border-radius: var(--stat-border-radius);
  font-size: 16px;
  font-weight: 600;
  color: var(--stat-text-color);
  background: var(--stat-bg-color);
  transition: border-color 0.2s, box-shadow 0.2s;
  cursor: default;
  text-align: center;
}

.stat-input:focus {
  outline: none;
  border-color: var(--stat-primary-color);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.stat-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #f5f5f5;
}

.stat-input::placeholder {
  color: var(--stat-hint-color);
  font-weight: normal;
}

/* Remove spinner arrows from number input */
.stat-input::-webkit-inner-spin-button,
.stat-input::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.stat-input[type=number] {
  -moz-appearance: textfield;
}

/* Roll Button */
.stat-roll-btn {
  padding: 10px 16px;
  background: var(--stat-primary-color);
  color: white;
  border: none;
  border-radius: var(--stat-border-radius);
  font-size: 18px;
  cursor: pointer;
  transition: background 0.2s, transform 0.1s;
  white-space: nowrap;
  min-width: 48px;
}

.stat-roll-btn:hover:not(:disabled) {
  background: var(--stat-primary-hover);
  transform: translateY(-1px);
}

.stat-roll-btn:active:not(:disabled) {
  transform: translateY(0);
}

.stat-roll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.dice-icons {
  display: inline-block;
  line-height: 1;
}

/* Hint */
.stat-hint {
  font-size: 12px;
  color: var(--stat-hint-color);
  margin-top: 4px;
}

/* Error */
.stat-error {
  font-size: 12px;
  color: var(--stat-error-color);
  margin-top: 4px;
  font-weight: 500;
}

/* Details */
.stat-details {
  font-size: 12px;
  color: var(--stat-hint-color);
  margin-top: 4px;
  font-family: 'Courier New', monospace;
}

/* Variants */
.variant-compact {
  margin-bottom: 12px;
}

.variant-compact .stat-input {
  padding: 8px 10px;
  font-size: 14px;
}

.variant-compact .stat-roll-btn {
  padding: 8px 12px;
  font-size: 16px;
  min-width: 40px;
}

.variant-inline .stat-label {
  display: inline-block;
  margin-right: 12px;
  margin-bottom: 0;
}

.variant-inline .stat-input-group {
  display: inline-flex;
}

.variant-inline {
  display: inline-flex;
  align-items: center;
  margin-bottom: 0;
}
</style>

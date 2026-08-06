<template>
  <div v-if="modelValue && !isExpanded" :class="['unit-summary', { light: lockedLight }]">
    <span>Unidade principal</span>
    <button class="summary-box" type="button" :disabled="disabled" @click="openPicker">
      <span>
        <ion-icon :icon="businessOutline" />
        <strong>{{ modelValue }}</strong>
      </span>
      <em><ion-icon :icon="createOutline" /> Editar</em>
    </button>
  </div>

  <div v-else :class="['unit-picker', { light: lockedLight }]">
    <div class="unit-head">
      <span>
        <ion-icon :icon="businessOutline" />
        Senac detectado
      </span>
      <small>{{ options.length }} unidades</small>
    </div>

    <div :class="['selected-box', { empty: !modelValue }]">
      <div>
        <small>Unidade principal</small>
        <strong>{{ modelValue || 'Selecione uma unidade do Senac' }}</strong>
      </div>
      <ion-icon :icon="chevronDownOutline" />
    </div>

    <div class="search-box">
      <ion-icon :icon="searchOutline" />
      <input
        v-model="search"
        type="search"
        autocomplete="off"
        name="agua-unit-search"
        :disabled="disabled"
        placeholder="Buscar por estado ou sigla, ex: SC"
      />
    </div>

    <div class="unit-list" role="listbox" aria-label="Unidades Senac">
      <button
        v-for="option in filteredOptions"
        :key="option"
        :class="{ active: option === modelValue }"
        :disabled="disabled"
        type="button"
        @click="selectUnit(option)"
      >
        <span>{{ option }}</span>
        <ion-icon v-if="option === modelValue" :icon="checkmarkCircleOutline" />
      </button>

      <p v-if="!filteredOptions.length">Nenhuma unidade encontrada para essa busca.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue';
import { IonIcon } from '@ionic/vue';
import {
  businessOutline,
  checkmarkCircleOutline,
  chevronDownOutline,
  createOutline,
  searchOutline,
} from 'ionicons/icons';

const props = defineProps({
  modelValue: {
    type: String,
    default: '',
  },
  options: {
    type: Array,
    default: () => [],
  },
  lockedLight: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(['update:modelValue']);
const search = ref('');
const isExpanded = ref(!props.modelValue);

const filteredOptions = computed(() => {
  const term = search.value.trim().toLowerCase();

  if (!term) {
    return props.options;
  }

  return props.options.filter((option) => String(option).toLowerCase().includes(term));
});

watch(
  () => props.modelValue,
  (value) => {
    if (!value) {
      isExpanded.value = true;
    }
  },
);

watch(
  () => props.options,
  () => {
    search.value = '';

    if (!props.modelValue) {
      isExpanded.value = true;
    }
  },
);

const openPicker = () => {
  if (props.disabled) {
    return;
  }

  isExpanded.value = true;
};

const selectUnit = (option) => {
  if (props.disabled) {
    return;
  }

  emit('update:modelValue', option);
  search.value = '';
  isExpanded.value = false;
};
</script>

<style scoped>
.unit-picker,
.unit-summary {
  --picker-card: var(--agua-muted);
  --picker-bg: var(--agua-branco);
  --picker-muted: var(--agua-branco);
  --picker-text: var(--agua-texto);
  --picker-soft: var(--agua-suave);
  --picker-border: var(--agua-borda);
  --picker-input-border: var(--agua-input-border);
  --picker-primary: var(--agua-petroleo);
  --picker-accent: var(--agua-agua);
  --picker-shadow: var(--agua-shadow);

  color: var(--picker-text);
  color-scheme: inherit;
}

.unit-picker.light,
.unit-summary.light {
  --picker-card: #f2f4f7;
  --picker-bg: #ffffff;
  --picker-muted: #ffffff;
  --picker-text: #16343d;
  --picker-soft: #718087;
  --picker-border: #e1e7e8;
  --picker-input-border: #d8e1e3;
  --picker-primary: #0d4b5e;
  --picker-accent: #1ca7a0;
  --picker-shadow: 0 16px 36px rgba(13, 75, 94, 0.08);

  color-scheme: light;
}

.unit-summary {
  display: grid;
  gap: 8px;
}

.unit-summary > span {
  color: var(--picker-text);
  font-size: 12px;
  font-weight: 700;
}

.summary-box {
  align-items: center;
  background: var(--picker-bg);
  border: 1px solid var(--picker-input-border);
  border-radius: 14px;
  color: var(--picker-text);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  min-height: 52px;
  padding: 0 14px;
  text-align: left;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
  width: 100%;
}

.summary-box:hover {
  border-color: var(--picker-accent);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
  transform: translateY(-1px);
}

.summary-box:disabled,
.unit-list button:disabled,
.search-box input:disabled {
  cursor: not-allowed;
  opacity: 0.65;
}

.summary-box > span,
.summary-box em {
  align-items: center;
  display: inline-flex;
  gap: 9px;
}

.summary-box ion-icon {
  color: var(--picker-soft);
  font-size: 18px;
}

.summary-box strong {
  color: var(--picker-primary);
  font-size: 14px;
  line-height: 1.3;
}

.summary-box em {
  color: var(--picker-accent);
  font-size: 12px;
  font-style: normal;
  font-weight: 700;
  white-space: nowrap;
}

.summary-box em ion-icon {
  color: currentColor;
  font-size: 15px;
}

.unit-picker {
  background: var(--picker-card);
  border: 1px solid var(--picker-input-border);
  border-radius: 18px;
  box-shadow: var(--picker-shadow);
  display: grid;
  gap: 12px;
  padding: 14px;
}

.unit-head {
  align-items: center;
  display: flex;
  justify-content: space-between;
}

.unit-head span {
  align-items: center;
  background: rgba(28, 167, 160, 0.1);
  border-radius: 999px;
  color: var(--picker-primary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 6px;
  padding: 7px 10px;
}

.unit-head small {
  color: var(--picker-soft);
  font-size: 11px;
  font-weight: 700;
}

.selected-box {
  align-items: center;
  background: var(--picker-muted);
  border: 1px solid var(--picker-border);
  border-radius: 15px;
  display: grid;
  gap: 10px;
  grid-template-columns: 1fr auto;
  min-height: 58px;
  padding: 12px 14px;
}

.selected-box.empty strong {
  color: var(--picker-soft);
  font-weight: 600;
}

.selected-box small {
  color: var(--picker-soft);
  display: block;
  font-size: 10px;
  font-weight: 700;
  margin-bottom: 3px;
}

.selected-box strong {
  color: var(--picker-primary);
  display: block;
  font-size: 14px;
  line-height: 1.3;
}

.selected-box > ion-icon {
  color: var(--picker-accent);
  font-size: 18px;
}

.search-box {
  align-items: center;
  background: var(--picker-card);
  border: 1px solid var(--picker-input-border);
  border-radius: 14px;
  display: grid;
  gap: 9px;
  grid-template-columns: auto 1fr;
  min-height: 46px;
  padding: 0 12px;
}

.search-box:focus-within {
  border-color: var(--picker-accent);
  box-shadow: 0 0 0 4px rgba(28, 167, 160, 0.14);
}

.search-box ion-icon {
  color: var(--picker-soft);
  font-size: 17px;
}

.search-box input {
  background: transparent;
  border: 0;
  color: var(--picker-text);
  color-scheme: inherit;
  font: 400 13px Poppins, sans-serif;
  min-width: 0;
  outline: none;
  width: 100%;
}

.unit-list {
  display: grid;
  gap: 8px;
  max-height: 216px;
  overflow: auto;
  padding-right: 4px;
}

.unit-list button {
  align-items: center;
  background: var(--picker-muted);
  border: 1px solid var(--picker-border);
  border-radius: 13px;
  color: var(--picker-text);
  cursor: pointer;
  display: flex;
  font: 700 13px Poppins, sans-serif;
  justify-content: space-between;
  min-height: 42px;
  padding: 0 12px;
  text-align: left;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}

.unit-list button:hover,
.unit-list button.active {
  background: rgba(28, 167, 160, 0.12);
  border-color: rgba(28, 167, 160, 0.45);
  color: var(--picker-primary);
  transform: translateY(-1px);
}

.unit-list button ion-icon {
  color: #22c55e;
  font-size: 18px;
}

.unit-list p {
  color: var(--picker-soft);
  font-size: 12px;
  line-height: 1.6;
  margin: 4px 0 0;
}
</style>

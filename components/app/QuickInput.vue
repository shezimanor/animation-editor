<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    modelValue: number;
    max?: number;
    min?: number;
    step?: number;
  }>(),
  {
    max: Infinity,
    min: -Infinity,
    step: 1
  }
);

const emit = defineEmits<{
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number): void;
}>();

let lastValidValue = props.modelValue;

const updateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let newValue = parseFloat(target.value);
  // 不處理非數字的輸入(暫時)
  if (!isNaN(newValue)) {
    if (props.min !== undefined && newValue < props.min) {
      newValue = props.min;
    }
    if (props.max !== undefined && newValue > props.max) {
      newValue = props.max;
    }
    lastValidValue = newValue;
    emit('update:modelValue', newValue);
    // 自定義的 change 事件，外部元件的方法(@change="method")可以用 $event 這個特殊參數取到 newValue
    emit('change', newValue);
  }
};

// 檢查是否為合法數字，不合法則回復上次合法數字
const validateValue = (event: Event) => {
  const target = event.target as HTMLInputElement;
  let newValue = parseFloat(target.value);
  if (isNaN(newValue)) {
    target.value = lastValidValue.toString();
  } else {
    if (props.min !== undefined && newValue < props.min) {
      newValue = props.min;
    }
    if (props.max !== undefined && newValue > props.max) {
      newValue = props.max;
    }
    lastValidValue = newValue;
    emit('update:modelValue', newValue);
    // 自定義的 change 事件，外部元件的方法(@change="method")可以用 $event 這個特殊參數取到 newValue
    emit('change', newValue);
  }
};
</script>

<template>
  <input
    type="number"
    :value="modelValue"
    :max="max"
    :min="min"
    :step="step"
    @input="updateValue"
    @blur="validateValue"
    @keyup.enter="validateValue"
    class="quick-input"
  />
</template>

<style lang="scss" scoped>
.quick-input {
  @apply h-6 w-16 rounded border px-1 text-right font-sans text-xs text-neutral-500 outline-none focus:ring-1 focus:ring-neutral-300 dark:text-white;
  -moz-appearance: textfield;
  appearance: none;
}
.quick-input::-webkit-outer-spin-button,
.quick-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>

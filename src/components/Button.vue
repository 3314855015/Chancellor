<template>
  <button 
    class="btn" 
    :class="[variant, size, { 'disabled': disabled, 'loading': loading }]"
    :disabled="disabled || loading"
    @click="onClick"
  >
    <span v-if="loading" class="loading-spinner"></span>
    <span v-else class="btn-content">
      <span v-if="icon" class="btn-icon">{{ icon }}</span>
      <span class="btn-text">{{ label }}</span>
    </span>
  </button>
</template>

<script setup lang="ts">
interface Props {
  label: string
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger'
  size?: 'small' | 'medium' | 'large'
  icon?: string
  disabled?: boolean
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'medium',
  disabled: false,
  loading: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const onClick = (event: MouseEvent) => {
  // 使用props属性
  if (!props.disabled && !props.loading) {
    emit('click', event)
  }
}
</script>

<style scoped>
.btn {
  border: 2px solid transparent;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  backdrop-filter: blur(10px);
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Variants */
.btn.primary {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  color: white;
  border-color: #6BB5D6;
}

.btn.secondary {
  background: rgba(255, 255, 255, 0.9);
  color: #2c3e50;
  border-color: rgba(135, 206, 235, 0.3);
}

.btn.success {
  background: linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%);
  color: white;
  border-color: #43A047;
}

.btn.warning {
  background: linear-gradient(135deg, #FF9800 0%, #FFB74D 100%);
  color: white;
  border-color: #F57C00;
}

.btn.danger {
  background: linear-gradient(135deg, #F44336 0%, #EF5350 100%);
  color: white;
  border-color: #E53935;
}

/* Sizes */
.btn.small {
  padding: 6px 12px;
  font-size: 0.8rem;
}

.btn.medium {
  padding: 10px 20px;
  font-size: 0.9rem;
}

.btn.large {
  padding: 14px 28px;
  font-size: 1rem;
}

/* Hover effects */
.btn:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
}

.btn.primary:hover {
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
}

.btn.secondary:hover {
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.3);
}

.btn.success:hover {
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.4);
}

.btn.warning:hover {
  box-shadow: 0 4px 12px rgba(255, 152, 0, 0.4);
}

.btn.danger:hover {
  box-shadow: 0 4px 12px rgba(244, 67, 54, 0.4);
}

/* Loading spinner */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-icon {
  font-size: 1.1em;
}
</style>
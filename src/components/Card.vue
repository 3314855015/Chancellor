<template>
  <div class="card" :class="{ hoverable, 'no-padding': noPadding }" @click="onClick">
    <div v-if="$slots.header" class="card-header">
      <slot name="header"></slot>
    </div>
    <div class="card-content" :class="{ 'no-padding': noPadding }">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="card-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  hoverable?: boolean
  noPadding?: boolean
}

withDefaults(defineProps<Props>(), {
  hoverable: true,
  noPadding: false
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const onClick = (event: MouseEvent) => {
  emit('click', event)
}
</script>

<style scoped>
.card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.card.hoverable:hover {
  transform: translateY(-3px);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
}

.card.no-padding {
  padding: 0;
}

.card-header {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px solid rgba(135, 206, 235, 0.3);
}

.card-content.no-padding {
  padding: 0;
}

.card-footer {
  margin-top: 15px;
  padding-top: 15px;
  border-top: 1px solid rgba(135, 206, 235, 0.3);
}
</style>
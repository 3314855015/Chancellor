<template>
  <footer class="footer">
    <div class="footer-content">
      <p>{{ text }}</p>
    </div>
  </footer>
</template>

<script setup lang="ts">
interface Props {
  text?: string
}

withDefaults(defineProps<Props>(), {
  text: '© 2024 就业画像系统 · 温暖可爱的设计风格 · 为教育就业而生'
})
</script>

<style scoped>
.footer {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  padding: 15px 20px;
  margin-top: 40px;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-content p {
  margin: 0;
  color: #2c3e50;
  font-weight: 500;
  font-size: 0.9rem;
}
</style>
<template>
  <header class="header">
    <div class="header-content">
      <div class="title-section">
        <h1>{{ title }}</h1>
        <p>{{ subtitle }}</p>
      </div>
      <nav class="navigation">
        <button 
          v-for="nav in navigation" 
          :key="nav.path"
          class="nav-btn"
          @click="$router.push(nav.path)"
        >
          {{ nav.icon }} {{ nav.label }}
        </button>
      </nav>
    </div>
  </header>
</template>

<script setup lang="ts">
interface NavigationItem {
  icon: string
  label: string
  path: string
}

interface Props {
  title: string
  subtitle: string
  navigation: NavigationItem[]
}

defineProps<Props>()
</script>

<style scoped>
.header {
  background: linear-gradient(135deg, #87CEEB 0%, #98D8F0 100%);
  padding: 15px 20px;
  box-shadow: 0 2px 10px rgba(135, 206, 235, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-section h1 {
  margin: 0;
  font-size: 2rem;
  color: #2c3e50;
  font-weight: 600;
}

.title-section p {
  margin: 5px 0 0;
  color: #34495e;
  font-size: 1rem;
}

.navigation {
  display: flex;
  gap: 10px;
}

.nav-btn {
  background: rgba(255, 255, 255, 0.9);
  border: 2px solid transparent;
  color: #2c3e50;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.nav-btn:hover {
  background: rgba(255, 255, 255, 1);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(135, 206, 235, 0.4);
}

@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 15px;
    text-align: center;
  }
  
  .navigation {
    flex-wrap: wrap;
    justify-content: center;
  }
}
</style>
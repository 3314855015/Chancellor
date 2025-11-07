<template>
  <div class="student-welcome" :class="studentStatus">
    <div class="welcome-content">
      <h1 class="welcome-title">{{ welcomeTitle }}</h1>
      <div class="status-display" :class="studentStatus">
        <span class="status-icon">{{ statusIcon }}</span>
        <span class="status-text">{{ statusText }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// 从父组件传递学生状态
const props = defineProps({
  studentStatus: {
    type: String,
    default: 'wild' // 'wild' 在野, 'selected' 中举
  }
})

const statusIcon = computed(() => {
  return props.studentStatus === 'wild' ? '📜' : '🏆'
})

const statusText = computed(() => {
  return props.studentStatus === 'wild' ? '范进中举' : '榜上有名'
})

const welcomeTitle = computed(() => {
  return props.studentStatus === 'wild' ? '噫！好！我中了！' : '恭喜您可以撑地了！'
})
</script>

<style scoped>
.student-welcome {
  padding: 6rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
  background-size: 400% 400%;
}

/* 在野状态样式 */
.student-welcome.wild {
  background: linear-gradient(135deg, #e1bee7 0%, #ce93d8 30%, #ba68c8 100%);
  color: #4a148c;
}

/* 中举状态样式 - 深蓝渐变 */
.student-welcome.selected {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 30%, #3b82f6 100%);
  color: #ffffff;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.student-welcome::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 80%, rgba(255, 255, 255, 0.3) 0%, transparent 50%);
  animation: float 6s ease-in-out infinite;
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(0deg);
  }
  50% {
    transform: translateY(-20px) rotate(180deg);
  }
}

.welcome-content {
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.welcome-title {
  font-size: 4rem;
  font-weight: 800;
  margin: 0 0 2rem 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  animation: titleGlow 3s ease-in-out infinite;
}

/* 在野状态标题样式 */
.student-welcome.wild .welcome-title {
  background: linear-gradient(135deg, #4a148c 0%, #7b1fa2 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

/* 中举状态标题样式 - 金色渐变 */
.student-welcome.selected .welcome-title {
  background: linear-gradient(135deg, #ffd700 0%, #ffed4e 50%, #ffd700 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
  }
}

.status-display {
  display: inline-flex;
  align-items: center;
  gap: 15px;
  background: rgba(255, 255, 255, 0.7);
  padding: 1rem 2rem;
  border-radius: 30px;
  backdrop-filter: blur(15px);
  border: 1px solid rgba(74, 20, 140, 0.3);
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(74, 20, 140, 0.1);
}

.status-display:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(74, 20, 140, 0.2);
}

.status-display.wild {
  border-color: rgba(255, 193, 7, 0.5);
}

.status-display.selected {
  border-color: rgba(255, 215, 0, 0.5);
}

.status-icon {
  font-size: 2rem;
  animation: iconBounce 2s ease-in-out infinite;
}

@keyframes iconBounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-10px);
  }
}

.status-text {
  font-size: 1.5rem;
  font-weight: 600;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
}

.status-display.wild .status-text {
  color: #ffc107;
}

.status-display.selected .status-text {
  color: #ffd700;
}

@media (max-width: 768px) {
  .student-welcome {
    padding: 3rem 1rem;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
  
  .status-display {
    flex-direction: column;
    gap: 10px;
    padding: 1rem 1.5rem;
  }
  
  .status-text {
    font-size: 1.2rem;
  }
}
</style>
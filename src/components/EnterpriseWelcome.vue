<template>
  <div class="enterprise-welcome">
    <div class="welcome-content">
      <h1 class="welcome-title">招新，不可怕</h1>
      <p class="welcome-subtitle">招新是凉爽的夏夜，可供人无忧的安眠~</p>
      <div class="welcome-actions">
        <button class="welcome-btn primary" @click="startRecruiting">
          😴 开始安眠
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const startRecruiting = () => {
  // 跳转到智能匹配招新功能
  alert('开始安眠 - 智能匹配招新')
}
</script>

<style scoped>
.enterprise-welcome {
  background: linear-gradient(135deg, #bbdefb 0%, #90caf9 30%, #64b5f6 100%);
  color: #0d47a1;
  padding: 6rem 2rem;
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  overflow: hidden;
  animation: gradientShift 8s ease infinite;
  background-size: 400% 400%;
}

@keyframes gradientShift {
  0%, 100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

.enterprise-welcome::before {
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
  margin: 0 0 1.5rem 0;
  text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  background: linear-gradient(135deg, #0d47a1 0%, #1565c0 100%);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  animation: titleGlow 3s ease-in-out infinite;
}

@keyframes titleGlow {
  0%, 100% {
    text-shadow: 3px 3px 6px rgba(0, 0, 0, 0.3);
  }
  50% {
    text-shadow: 3px 3px 12px rgba(0, 0, 0, 0.5);
  }
}

.welcome-subtitle {
  font-size: 1.5rem;
  margin: 0 0 3rem 0;
  opacity: 0.95;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.3);
  line-height: 1.6;
  font-weight: 400;
  font-style: italic;
}

.welcome-actions {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.welcome-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.welcome-btn.primary {
  background: rgba(255, 255, 255, 0.9);
  color: #0d47a1;
  box-shadow: 0 4px 15px rgba(13, 71, 161, 0.2);
}

.welcome-btn.primary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(13, 71, 161, 0.3);
}

@media (max-width: 768px) {
  .enterprise-welcome {
    padding: 3rem 1rem;
  }
  
  .welcome-title {
    font-size: 2.2rem;
  }
  
  .welcome-subtitle {
    font-size: 1.2rem;
  }
  
  .welcome-actions {
    flex-direction: column;
    align-items: center;
  }
  
  .welcome-btn {
    width: 200px;
  }
}
</style>
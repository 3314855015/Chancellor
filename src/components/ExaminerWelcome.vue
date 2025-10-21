<template>
  <div class="examiner-welcome">
    <div class="welcome-content">
      <h1 class="welcome-title">公平，公正，公开</h1>
      <p class="welcome-subtitle">我是人民好考官！</p>
      <div class="welcome-actions">
        <button class="welcome-btn primary" @click="startSupervising">
          📝 开始监考
        </button>
        <button class="welcome-btn secondary" @click="generateTeacherKey">
          🎓 发榜招生
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const startSupervising = () => {
  // 跳转到任务管理功能
  alert('开始监考 - 进入任务管理')
}

const generateTeacherKey = () => {
  // 跳转到生成教师密钥功能
  alert('发榜招生 - 生成教师密钥')
}
</script>

<style scoped>
.examiner-welcome {
  background: linear-gradient(135deg, #c8e6c9 0%, #a5d6a7 30%, #81c784 100%);
  color: #1b5e20;
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

.examiner-welcome::before {
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
  background: linear-gradient(135deg, #1b5e20 0%, #388e3c 100%);
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
  font-weight: 500;
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
  color: #1b5e20;
  box-shadow: 0 4px 15px rgba(27, 94, 32, 0.2);
}

.welcome-btn.primary:hover {
  background: white;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 94, 32, 0.3);
}

.welcome-btn.secondary {
  background: rgba(255, 255, 255, 0.7);
  color: #1b5e20;
  border: 2px solid rgba(27, 94, 32, 0.3);
  box-shadow: 0 4px 15px rgba(27, 94, 32, 0.1);
}

.welcome-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.9);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 94, 32, 0.2);
}

@media (max-width: 768px) {
  .examiner-welcome {
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
<template>
  <div class="cute-about">
    <!-- 可爱风格头部 -->
    <div class="cute-header">
      <div class="cute-title">
        <h1>📖 关于就业画像系统</h1>
        <p>✨ 温暖可爱的教育就业平台 ✨</p>
      </div>
      <div class="cute-nav">
        <button class="cute-btn" @click="$router.push('/')">🏠 首页</button>
        <button class="cute-btn" @click="$router.push('/about')">📖 关于</button>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="cute-main">
      <div class="about-content">
        <!-- 项目介绍 -->
        <div class="cute-card">
          <h2 class="cute-subtitle">🎯 项目概述</h2>
          <p>基于现代化技术栈构建的温暖教育就业平台，致力于为学生、教师和企业提供精准的就业匹配服务。</p>
        </div>

        <!-- 技术栈展示 -->
        <div class="cute-card">
          <h2 class="cute-subtitle">🔧 技术架构</h2>
          <div class="tech-grid">
            <div class="tech-item">
              <div class="tech-icon">⚡</div>
              <h3>前端技术</h3>
              <ul>
                <li>Vue.js 3 + TypeScript</li>
                <li>Vite 构建工具</li>
                <li>温暖可爱UI设计</li>
              </ul>
            </div>
            <div class="tech-item">
              <div class="tech-icon">🔧</div>
              <h3>后端技术</h3>
              <ul>
                <li>Spring Framework</li>
                <li>Supabase (开发环境)</li>
                <li>RESTful API</li>
              </ul>
            </div>
            <div class="tech-item">
              <div class="tech-icon">🤖</div>
              <h3>AI集成</h3>
              <ul>
                <li>n8n工作流</li>
                <li>智能推荐算法</li>
                <li>自动化任务处理</li>
              </ul>
            </div>
          </div>
        </div>

        <!-- 核心功能 -->
        <div class="cute-card">
          <h2 class="cute-subtitle">🚀 核心功能</h2>
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">🔑</div>
              <h4>密钥管理系统</h4>
              <p>管理员生成企业密钥和考官密钥，确保系统安全</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📋</div>
              <h4>任务发布系统</h4>
              <p>考官发布任务，学生接取并完成任务获得点数</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📊</div>
              <h4>能力点数系统</h4>
              <p>温暖可爱能力点展示，动态调整学生能力维度</p>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🤝</div>
              <h4>智能匹配系统</h4>
              <p>企业智能匹配适合的学生，优化就业对接</p>
            </div>
          </div>
        </div>

        <!-- 角色系统 -->
        <div class="cute-card">
          <h2 class="cute-subtitle">👥 角色系统</h2>
          <div class="role-info">
            <div class="role-item">
              <h3>👑 管理员</h3>
              <p>生成企业密钥【请帖】和考官密钥【升官】，管理系统安全</p>
            </div>
            <div class="role-item">
              <h3>📚 考官</h3>
              <p>发布任务、评审学生、分配能力点数，指导学生成长</p>
            </div>
            <div class="role-item">
              <h3>🏢 州牧</h3>
              <p>查看匹配学生、使用点数进行人才对接</p>
            </div>
            <div class="role-item">
              <h3>🎓 监生</h3>
              <p>接取任务、提升能力、寻求就业机会</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 可爱风格底部 -->
    <div class="cute-footer">
      <p>💝 © 2024 就业画像系统 · 温暖可爱的设计风格 · 为教育就业而生</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// 关于页面逻辑
</script>

<style scoped>
.cute-about {
  min-height: 100vh;
  background: white;
  color: #2d3748;
  font-family: 'Comic Sans MS', 'Yuanti SC', 'YouYuan', sans-serif;
}

.cute-header {
  background: #87CEEB; /* 天蓝色 */
  border-bottom: none;
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 4px 15px rgba(135, 206, 235, 0.3);
}

.cute-title h1 {
  margin: 0;
  font-size: 2rem;
  color: white;
  text-shadow: 2px 2px 0 #4682B4;
}

.cute-title p {
  margin: 5px 0 0;
  color: white;
  font-size: 1rem;
  font-weight: bold;
}

.cute-nav {
  display: flex;
  gap: 10px;
}

.cute-btn {
  background: #4682B4;
  border: 1px solid transparent;
  color: white;
  padding: 8px 16px;
  font-family: inherit;
  font-size: 0.9rem;
  cursor: pointer;
  border-radius: 20px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(70, 130, 180, 0.2);
}

.cute-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 6px 20px rgba(70, 130, 180, 0.4);
  background: #5F9EA0;
}

.cute-main {
  max-width: 1000px;
  margin: 0 auto;
  padding: 30px 20px;
}

.about-content {
  display: flex;
  flex-direction: column;
  gap: 25px;
}

.cute-card {
  background: white;
  border: 2px solid transparent;
  border-radius: 15px;
  padding: 25px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.1);
}

.cute-card:hover {
  transform: translateY(-5px) scale(1.02);
  box-shadow: 0 8px 25px rgba(135, 206, 235, 0.3);
  border-color: transparent;
}

.cute-subtitle {
  color: #4682B4;
  font-size: 1.5rem;
  margin-bottom: 15px;
  text-shadow: 1px 1px 0 #B0E0E6;
  text-align: center;
}

.tech-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.tech-item {
  text-align: center;
  padding: 20px;
  background: #F0F8FF;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(135, 206, 235, 0.1);
}

.tech-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(135, 206, 235, 0.3);
  background: #E6F3FF;
}

.tech-icon {
  font-size: 2.5rem;
  margin-bottom: 12px;
}

.tech-item h3 {
  color: #4682B4;
  margin-bottom: 12px;
  font-size: 1.2rem;
}

.tech-item ul {
  list-style: none;
  padding: 0;
}

.tech-item li {
  padding: 4px 0;
  color: #5d4037;
  font-size: 0.9rem;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.feature-item {
  text-align: center;
  padding: 18px;
  background: #F0F8FF;
  border: 1px solid transparent;
  border-radius: 12px;
  transition: all 0.3s ease;
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: 0 1px 4px rgba(135, 206, 235, 0.1);
}

.feature-item:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(135, 206, 235, 0.3);
  background: #E6F3FF;
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 10px;
}

.feature-item h4 {
  color: #4682B4;
  margin-bottom: 8px;
  font-size: 1rem;
}

.feature-item p {
  color: #5d4037;
  font-size: 0.8rem;
  line-height: 1.3;
}

.role-info {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 20px;
}

.role-item {
  padding: 15px;
  background: #F0F8FF;
  border-left: 4px solid transparent;
  border-radius: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 1px 4px rgba(135, 206, 235, 0.1);
}

.role-item:hover {
  transform: translateX(5px);
  box-shadow: 0 4px 15px rgba(70, 130, 180, 0.3);
  background: #E6F3FF;
}

.role-item h3 {
  color: #4682B4;
  margin-bottom: 8px;
  font-size: 1.1rem;
}

.role-item p {
  color: #5d4037;
  font-size: 0.85rem;
  line-height: 1.4;
}

.cute-footer {
  background: #87CEEB;
  border-top: none;
  padding: 15px;
  text-align: center;
  color: white;
  margin-top: 40px;
  font-weight: bold;
  font-size: 0.9rem;
}

@media (max-width: 768px) {
  .cute-header {
    flex-direction: column;
    gap: 15px;
  }
  
  .tech-grid,
  .feature-grid,
  .role-info {
    grid-template-columns: 1fr;
  }
  
  .cute-card {
    padding: 20px;
  }
  
  .feature-item {
    height: auto;
    min-height: 120px;
  }
}
</style>
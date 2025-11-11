import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

import App from './App.vue'
import router from './router'
import { initializeApp } from './services/appInit'

import './styles/index.scss'

// 应用启动前的初始化
async function bootstrap() {
  try {
    console.log('🚀 启动应用初始化...')
    
    // 初始化应用服务
    const initResult = await initializeApp({
      enableSecurity: true,
      enableAnalytics: false,
      enableNotifications: true
    })
    
    if (!initResult.success) {
      console.warn('⚠️ 应用初始化有警告，但继续启动应用')
    }
    
    // 创建Vue应用
    const app = createApp(App)

    // 注册所有Element Plus图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
      app.component(key, component)
    }

    app.use(createPinia())
    app.use(router)
    app.use(ElementPlus)

    // 挂载应用
    app.mount('#app')
    
    console.log('✅ 应用启动完成')
    
  } catch (error) {
    console.error('❌ 应用启动失败:', error)
    
    // 显示错误页面
    const errorElement = document.getElementById('app')
    if (errorElement) {
      errorElement.innerHTML = `
        <div style="padding: 40px; text-align: center; color: #dc3545;">
          <h2>😵 应用启动失败</h2>
          <p>请刷新页面重试，或联系系统管理员</p>
          <button onclick="window.location.reload()" style="padding: 8px 16px; margin-top: 16px;">
            重新加载
          </button>
        </div>
      `
    }
  }
}

// 启动应用
bootstrap()
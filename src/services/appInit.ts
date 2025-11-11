/**
 * 应用初始化服务
 * 在应用启动时执行必要的初始化操作
 */

import { initializeSecurityServices } from './securityInit'

/**
 * 应用初始化配置
 */
interface AppInitConfig {
  enableSecurity: boolean
  enableAnalytics: boolean
  enableNotifications: boolean
}

/**
 * 初始化应用
 */
export async function initializeApp(config: AppInitConfig = {
  enableSecurity: true,
  enableAnalytics: false,
  enableNotifications: true
}) {
  try {
    console.log('🚀 正在初始化应用...')
    
    // 初始化安全服务
    if (config.enableSecurity) {
      await initializeSecurityServices()
    }
    
    // 这里可以添加其他初始化逻辑
    // 如分析服务、通知服务等
    
    console.log('✅ 应用初始化完成')
    
    return { success: true }
  } catch (error) {
    console.error('❌ 应用初始化失败:', error)
    return { success: false, error }
  }
}

/**
 * 检查应用是否已初始化
 */
export function isAppInitialized(): boolean {
  // 这里可以添加更复杂的检查逻辑
  return localStorage.getItem('app_initialized') === 'true'
}

/**
 * 标记应用为已初始化
 */
export function markAppAsInitialized() {
  localStorage.setItem('app_initialized', 'true')
}

/**
 * 清理应用资源
 */
export async function cleanupApp() {
  try {
    console.log('🧹 正在清理应用资源...')
    
    // 清理安全服务
    const { cleanupSecurityServices } = await import('./securityInit')
    cleanupSecurityServices()
    
    // 清理其他资源
    localStorage.removeItem('app_initialized')
    
    console.log('✅ 应用资源清理完成')
  } catch (error) {
    console.error('❌ 应用资源清理失败:', error)
  }
}
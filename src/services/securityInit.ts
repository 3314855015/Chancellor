/**
 * 安全设置初始化服务
 * 用于在应用启动时初始化安全相关的服务
 */

import sessionService from './sessionService'
import apiRateLimitService from './apiRateLimitService'

/**
 * 初始化安全服务
 */
export async function initializeSecurityServices() {
  try {
    console.log('正在初始化安全服务...')
    
    // 初始化会话管理服务
    await sessionService.initialize()
    
    // 初始化API限制服务
    await apiRateLimitService.initialize()
    
    console.log('安全服务初始化完成')
    
    return { success: true }
  } catch (error) {
    console.error('安全服务初始化失败:', error)
    return { success: false, error }
  }
}

/**
 * 清理安全服务资源
 */
export function cleanupSecurityServices() {
  try {
    console.log('正在清理安全服务资源...')
    
    // 清理会话服务
    sessionService.destroy()
    
    // API限制服务不需要特殊清理
    
    console.log('安全服务资源清理完成')
  } catch (error) {
    console.error('安全服务资源清理失败:', error)
  }
}

/**
 * 重新加载安全设置
 * 用于在安全设置更改后重新加载所有服务的配置
 */
export async function reloadSecuritySettings() {
  try {
    console.log('正在重新加载安全设置...')
    
    // 重新初始化会话服务以获取最新设置
    await sessionService.initialize()
    
    // 重新初始化API限制服务
    await apiRateLimitService.initialize()
    
    console.log('安全设置重新加载完成')
    
    return { success: true }
  } catch (error) {
    console.error('重新加载安全设置失败:', error)
    return { success: false, error }
  }
}
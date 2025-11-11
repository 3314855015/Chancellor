import { ref } from 'vue'
import securityService from './securityService'

class SessionService {
  private lastActivityTime = ref(0)
  private activityTimer: number | null = null
  private timeoutTimer: number | null = null
  private sessionTimeoutMinutes = 60 // 默认60分钟

  /**
   * 初始化会话管理
   */
  async initialize() {
    try {
      // 获取安全设置中的会话超时时间
      const settings = await securityService.getSecuritySettings()
      if (settings.success && settings.data) {
        this.sessionTimeoutMinutes = settings.data.sessionTimeoutMinutes
      }
      
      // 启动活动监听
      this.startActivityMonitoring()
      
      // 重置活动时间
      this.resetActivityTime()
      
      console.log('会话管理已初始化，超时时间:', this.sessionTimeoutMinutes, '分钟')
    } catch (error) {
      console.error('初始化会话管理失败:', error)
    }
  }

  /**
   * 重置活动时间
   */
  resetActivityTime() {
    this.lastActivityTime.value = Date.now()
    this.startTimeoutTimer()
  }

  /**
   * 启动活动监听
   */
  private startActivityMonitoring() {
    // 监听用户活动
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart']
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        this.resetActivityTime()
      }, { passive: true })
    })
  }

  /**
   * 启动超时计时器
   */
  private startTimeoutTimer() {
    // 清除之前的计时器
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
    }

    // 设置新的超时计时器
    this.timeoutTimer = window.setTimeout(() => {
      this.handleSessionTimeout()
    }, this.sessionTimeoutMinutes * 60 * 1000)
  }

  /**
   * 处理会话超时
   */
  private handleSessionTimeout() {
    console.log('会话超时，自动登出')
    
    // 这里可以调用登出逻辑
    this.logout()
  }

  /**
   * 手动登出
   */
  logout() {
    // 清除计时器
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
    }

    // 清除活动监听（这里简化处理，实际项目中可能需要更复杂的清理）
    
    // 触发登出事件
    this.triggerLogout()
  }

  /**
   * 触发登出
   */
  private triggerLogout() {
    // 这里可以调用认证服务的登出方法
    // authService.logout()
    
    // 显示超时提示
    this.showTimeoutNotification()
    
    // 重定向到登录页面
    setTimeout(() => {
      window.location.href = '/'
    }, 3000)
  }

  /**
   * 显示超时通知
   */
  private showTimeoutNotification() {
    // 这里可以集成通知系统
    const notification = document.createElement('div')
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #dc3545;
      color: white;
      padding: 16px;
      border-radius: 8px;
      z-index: 9999;
      max-width: 300px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `
    notification.innerHTML = `
      <div style="font-weight: bold; margin-bottom: 8px;">🔒 会话超时</div>
      <div>由于长时间无操作，会话已超时。3秒后将自动跳转到登录页面。</div>
    `
    
    document.body.appendChild(notification)
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification)
      }
    }, 3000)
  }

  /**
   * 更新会话超时设置
   */
  async updateSessionTimeout(minutes: number) {
    this.sessionTimeoutMinutes = minutes
    
    // 重置计时器
    this.resetActivityTime()
    
    console.log('会话超时时间已更新为:', minutes, '分钟')
  }

  /**
   * 获取剩余会话时间（分钟）
   */
  getRemainingTime(): number {
    const elapsed = Date.now() - this.lastActivityTime.value
    const remaining = this.sessionTimeoutMinutes * 60 * 1000 - elapsed
    return Math.max(0, Math.floor(remaining / 60000))
  }

  /**
   * 清理资源
   */
  destroy() {
    if (this.timeoutTimer) {
      clearTimeout(this.timeoutTimer)
      this.timeoutTimer = null
    }
    
    if (this.activityTimer) {
      clearInterval(this.activityTimer)
      this.activityTimer = null
    }
  }
}

export default new SessionService()
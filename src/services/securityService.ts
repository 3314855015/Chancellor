import { supabase } from '@/lib/supabase.client'

export interface SecuritySetting {
  id: number
  setting_category: string
  setting_key: string
  setting_value: string
  setting_type: string
  description: string
  created_at: string
  updated_at: string
}

export interface SecuritySettings {
  // 密码策略
  minPasswordLength: number
  passwordExpiryDays: number
  passwordHistoryCount: number
  
  // 会话管理
  sessionTimeoutMinutes: number
  maxConcurrentSessions: number
  
  // API访问控制
  n8nApiRateLimit: number
  supabaseApiRateLimit: number
  apiKeyRotationDays: number
  
  // 审计日志
  logRetentionDays: number
  logSensitiveOperations: boolean
}

class SecurityService {
  // 安全设置缓存
  private settingsCache: SecuritySettings | null = null
  private cacheTimestamp: number = 0
  private cacheDuration = 5 * 60 * 1000 // 5分钟缓存

  /**
   * 获取所有安全设置
   */
  async getSecuritySettings(): Promise<{
    success: boolean
    data: SecuritySettings | null
    error?: string
  }> {
    try {
      // 检查缓存
      if (this.settingsCache && Date.now() - this.cacheTimestamp < this.cacheDuration) {
        console.log('使用缓存的安全设置')
        return { success: true, data: this.settingsCache }
      }

      const { data, error } = await supabase
        .from('security_settings')
        .select('*')
        .order('setting_category')

      if (error) {
        console.error('获取安全设置失败:', error)
        return { success: false, data: null, error: error.message }
      }

      // 将数据库中的设置转换为前端需要的格式
      const settings = this.transformSettings(data)
      
      // 更新缓存
      this.settingsCache = settings
      this.cacheTimestamp = Date.now()
      
      return { success: true, data: settings }
    } catch (error) {
      console.error('获取安全设置异常:', error)
      
      // 如果数据库查询失败但缓存存在，返回缓存数据
      if (this.settingsCache) {
        console.warn('数据库查询失败，使用缓存数据')
        return { success: true, data: this.settingsCache }
      }
      
      return { success: false, data: null, error: '获取安全设置失败' }
    }
  }

  /**
   * 保存安全设置
   */
  async saveSecuritySettings(settings: SecuritySettings): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      // 验证设置
      const validationError = this.validateSettings(settings)
      if (validationError) {
        return { success: false, error: validationError }
      }

      // 将前端设置转换为数据库格式
      const dbSettings = this.transformToDbSettings(settings)

      // 批量更新设置
      const updates = Object.entries(dbSettings).map(([key, value]) => {
        return supabase
          .from('security_settings')
          .update({ 
            setting_value: value.toString(),
            updated_at: new Date().toISOString()
          })
          .eq('setting_key', key)
      })

      // 等待所有更新完成
      const results = await Promise.all(updates)
      
      // 检查是否有更新失败
      const hasError = results.some(result => result.error)
      if (hasError) {
        return { success: false, error: '部分设置保存失败' }
      }

      // 清除缓存，确保下次获取的是最新数据
      this.clearCache()

      // 记录审计日志
      await this.logSecurityChange('安全设置更新', settings)

      return { success: true }
    } catch (error) {
      console.error('保存安全设置异常:', error)
      return { success: false, error: '保存安全设置失败' }
    }
  }

  /**
   * 清除缓存
   */
  clearCache() {
    this.settingsCache = null
    this.cacheTimestamp = 0
    console.log('安全设置缓存已清除')
  }

  /**
   * 重置为默认设置
   */
  async resetToDefaultSettings(): Promise<{
    success: boolean
    error?: string
  }> {
    try {
      const defaultSettings = {
        minPasswordLength: 8,
        passwordExpiryDays: 90,
        passwordHistoryCount: 5,
        sessionTimeoutMinutes: 60,
        maxConcurrentSessions: 3,
        n8nApiRateLimit: 1000,
        supabaseApiRateLimit: 5000,
        apiKeyRotationDays: 90,
        logRetentionDays: 180,
        logSensitiveOperations: true
      }

      return await this.saveSecuritySettings(defaultSettings)
    } catch (error) {
      console.error('重置设置异常:', error)
      return { success: false, error: '重置设置失败' }
    }
  }

  /**
   * 验证安全设置
   */
  private validateSettings(settings: SecuritySettings): string | null {
    if (settings.minPasswordLength < 6) {
      return '最小密码长度不能少于6位'
    }
    if (settings.minPasswordLength > 20) {
      return '最小密码长度不能超过20位'
    }
    if (settings.passwordExpiryDays < 30) {
      return '密码过期时间不能少于30天'
    }
    if (settings.sessionTimeoutMinutes < 15) {
      return '会话超时时间不能少于15分钟'
    }
    if (settings.maxConcurrentSessions < 1) {
      return '最大并发会话数不能少于1个'
    }
    
    return null
  }

  /**
   * 将数据库设置转换为前端格式
   */
  private transformSettings(dbSettings: SecuritySetting[]): SecuritySettings {
    const settingsMap: Record<string, any> = {}
    
    dbSettings.forEach(setting => {
      let value: any = setting.setting_value
      
      // 根据类型转换值
      switch (setting.setting_type) {
        case 'number':
          value = Number(value)
          break
        case 'boolean':
          value = value === 'true'
          break
        default:
          // 保持字符串类型
          break
      }
      
      settingsMap[setting.setting_key] = value
    })

    return {
      minPasswordLength: settingsMap.min_password_length || 8,
      passwordExpiryDays: settingsMap.password_expiry_days || 90,
      passwordHistoryCount: settingsMap.password_history_count || 5,
      sessionTimeoutMinutes: settingsMap.session_timeout_minutes || 60,
      maxConcurrentSessions: settingsMap.max_concurrent_sessions || 3,
      n8nApiRateLimit: settingsMap.n8n_api_rate_limit || 1000,
      supabaseApiRateLimit: settingsMap.supabase_api_rate_limit || 5000,
      apiKeyRotationDays: settingsMap.api_key_rotation_days || 90,
      logRetentionDays: settingsMap.log_retention_days || 180,
      logSensitiveOperations: settingsMap.log_sensitive_operations !== false
    }
  }

  /**
   * 将前端设置转换为数据库格式
   */
  private transformToDbSettings(settings: SecuritySettings): Record<string, any> {
    return {
      min_password_length: settings.minPasswordLength,
      password_expiry_days: settings.passwordExpiryDays,
      password_history_count: settings.passwordHistoryCount,
      session_timeout_minutes: settings.sessionTimeoutMinutes,
      max_concurrent_sessions: settings.maxConcurrentSessions,
      n8n_api_rate_limit: settings.n8nApiRateLimit,
      supabase_api_rate_limit: settings.supabaseApiRateLimit,
      api_key_rotation_days: settings.apiKeyRotationDays,
      log_retention_days: settings.logRetentionDays,
      log_sensitive_operations: settings.logSensitiveOperations
    }
  }

  /**
   * 记录安全设置变更日志
   */
  private async logSecurityChange(action: string, settings: SecuritySettings): Promise<void> {
    try {
      // 这里可以调用N8N webhook来记录审计日志
      // 或者直接保存到数据库的审计日志表
      console.log('安全设置变更:', action, settings)
      
      // 如果启用了敏感操作日志记录，则保存到审计日志表
      if (settings.logSensitiveOperations) {
        // 这里可以添加审计日志记录逻辑
        // await this.saveAuditLog(action, settings)
      }
    } catch (error) {
      console.error('记录安全变更日志失败:', error)
    }
  }

  /**
   * 获取密码策略设置（供其他模块使用）
   */
  async getPasswordPolicy(): Promise<{
    minLength: number
    expiryDays: number
    historyCount: number
  }> {
    const { data, error } = await this.getSecuritySettings()
    
    if (error || !data) {
      // 返回默认值
      return {
        minLength: 8,
        expiryDays: 90,
        historyCount: 5
      }
    }

    return {
      minLength: data.minPasswordLength,
      expiryDays: data.passwordExpiryDays,
      historyCount: data.passwordHistoryCount
    }
  }

  /**
   * 获取API限制设置（供N8N调用）
   */
  async getApiRateLimits(): Promise<{
    n8n: number
    supabase: number
  }> {
    const { data, error } = await this.getSecuritySettings()
    
    if (error || !data) {
      return {
        n8n: 1000,
        supabase: 5000
      }
    }

    return {
      n8n: data.n8nApiRateLimit,
      supabase: data.supabaseApiRateLimit
    }
  }
}

export default new SecurityService()
import { ref } from 'vue'
import securityService from './securityService'

interface ApiCallRecord {
  timestamp: number
  endpoint: string
  userId?: string
}

class ApiRateLimitService {
  private callHistory: ApiCallRecord[] = []
  private currentLimits = ref({
    n8n: 1000,
    supabase: 5000
  })

  /**
   * 初始化API限制服务
   */
  async initialize() {
    try {
      const limits = await securityService.getApiRateLimits()
      this.currentLimits.value = limits
      
      console.log('API限制服务已初始化:', limits)
    } catch (error) {
      console.error('初始化API限制服务失败:', error)
    }
  }

  /**
   * 检查API调用是否超过限制
   */
  checkRateLimit(serviceType: 'n8n' | 'supabase', endpoint: string, userId?: string): {
    allowed: boolean
    remaining: number
    resetTime?: number
    message?: string
  } {
    const limit = this.currentLimits.value[serviceType]
    const now = Date.now()
    const oneHourAgo = now - 60 * 60 * 1000

    // 过滤出最近一小时内的调用记录
    const recentCalls = this.callHistory.filter(
      record => record.timestamp > oneHourAgo && record.endpoint === endpoint
    )

    // 如果提供了用户ID，进一步过滤该用户的调用
    const userCalls = userId 
      ? recentCalls.filter(record => record.userId === userId)
      : recentCalls

    const callCount = userCalls.length
    const remaining = Math.max(0, limit - callCount)

    if (callCount >= limit) {
      // 计算下次重置时间（1小时后）
      const oldestCall = recentCalls[0]?.timestamp || now
      const resetTime = oldestCall + 60 * 60 * 1000

      return {
        allowed: false,
        remaining: 0,
        resetTime,
        message: `API调用频率超过限制。剩余 ${Math.ceil((resetTime - now) / 60000)} 分钟后重置`
      }
    }

    return {
      allowed: true,
      remaining,
      message: `剩余调用次数: ${remaining}/${limit}`
    }
  }

  /**
   * 记录API调用
   */
  recordApiCall(serviceType: 'n8n' | 'supabase', endpoint: string, userId?: string) {
    const record: ApiCallRecord = {
      timestamp: Date.now(),
      endpoint,
      userId
    }

    this.callHistory.push(record)

    // 清理超过24小时的旧记录
    this.cleanupOldRecords()

    // 检查是否超过限制，如果超过则发出警告
    const checkResult = this.checkRateLimit(serviceType, endpoint, userId)
    if (!checkResult.allowed) {
      console.warn('API调用频率警告:', checkResult.message)
    }
  }

  /**
   * 清理旧记录
   */
  private cleanupOldRecords() {
    const now = Date.now()
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000
    
    this.callHistory = this.callHistory.filter(
      record => record.timestamp > twentyFourHoursAgo
    )
  }

  /**
   * 获取当前限制状态
   */
  getRateLimitStatus(serviceType: 'n8n' | 'supabase', endpoint: string, userId?: string) {
    return this.checkRateLimit(serviceType, endpoint, userId)
  }

  /**
   * 更新API限制设置
   */
  async updateRateLimits(limits: { n8n: number; supabase: number }) {
    this.currentLimits.value = limits
    
    // 重新检查当前调用状态
    this.callHistory.forEach(record => {
      const checkResult = this.checkRateLimit(
        record.endpoint.includes('n8n') ? 'n8n' : 'supabase',
        record.endpoint,
        record.userId
      )
      
      if (!checkResult.allowed) {
        console.warn('API限制更新后检查:', checkResult.message)
      }
    })

    console.log('API限制已更新:', limits)
  }

  /**
   * 获取当前限制设置
   */
  getCurrentLimits() {
    return this.currentLimits.value
  }

  /**
   * 重置调用记录（用于测试或特殊情况）
   */
  resetCallHistory() {
    this.callHistory = []
    console.log('API调用记录已重置')
  }

  /**
   * 创建API调用包装器
   */
  createApiWrapper(serviceType: 'n8n' | 'supabase', endpoint: string) {
    return async (apiCall: () => Promise<any>, userId?: string) => {
      // 检查频率限制
      const limitCheck = this.checkRateLimit(serviceType, endpoint, userId)
      
      if (!limitCheck.allowed) {
        throw new Error(`API调用频率超过限制: ${limitCheck.message}`)
      }

      try {
        // 记录调用
        this.recordApiCall(serviceType, endpoint, userId)
        
        // 执行API调用
        const result = await apiCall()
        
        return result
      } catch (error) {
        console.error(`API调用失败 [${serviceType} - ${endpoint}]:`, error)
        throw error
      }
    }
  }
}

export default new ApiRateLimitService()
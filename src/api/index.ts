import axios from 'axios'
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

// 请求配置接口
interface RequestConfig extends AxiosRequestConfig {
  retry?: number
  retryDelay?: number
  timeout?: number
}

// 响应数据接口
interface ResponseData<T = any> {
  code: number
  message: string
  data: T
}

class HttpClient {
  private instance: AxiosInstance
  // 重试配置（暂未使用）
  // private retryCount: number = 3
  // private retryDelay: number = 1000

  constructor(config: RequestConfig) {
    this.instance = axios.create({
      baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
      timeout: config.timeout || 30000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    this.setupInterceptors()
  }

  // 设置拦截器
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加认证token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        console.log(`[Request] ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('[Request Error]', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ResponseData>) => {
        console.log(`[Response] ${response.config.url}`, response.data)
        
        // 统一处理响应数据
        if (response.data.code === 200) {
          return response
        } else {
          // 业务错误处理
          this.handleBusinessError(response.data)
          return Promise.reject(response.data)
        }
      },
      (error) => {
        console.error('[Response Error]', error)
        
        // 网络错误处理
        this.handleNetworkError(error)
        return Promise.reject(error)
      }
    )
  }

  // 处理业务错误
  private handleBusinessError(data: ResponseData): void {
    const errorMap: { [key: number]: string } = {
      401: '未授权，请重新登录',
      403: '禁止访问',
      404: '请求的资源不存在',
      500: '服务器内部错误'
    }

    const message = errorMap[data.code] || data.message || '未知错误'
    this.showError(message)
  }

  // 处理网络错误
  private handleNetworkError(error: any): void {
    if (error.code === 'ECONNABORTED') {
      this.showError('请求超时，请检查网络连接')
    } else if (error.code === 'NETWORK_ERROR') {
      this.showError('网络错误，请检查网络连接')
    } else {
      this.showError('网络请求失败，请稍后重试')
    }
  }

  // 显示错误信息
  private showError(message: string): void {
    // 这里可以使用Element Plus的Message组件
    console.error(`[Error] ${message}`)
  }

  // 请求方法
  public async request<T = any>(config: RequestConfig): Promise<ResponseData<T>> {
    try {
      return await this.instance.request(config)
    } catch (error) {
      throw error
    }
  }

  public async get<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request({ ...config, method: 'GET', url })
  }

  public async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request({ ...config, method: 'POST', url, data })
  }

  public async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request({ ...config, method: 'PUT', url, data })
  }

  public async delete<T = any>(url: string, config?: RequestConfig): Promise<ResponseData<T>> {
    return this.request({ ...config, method: 'DELETE', url })
  }
}

// 创建全局实例
const httpClient = new HttpClient({
  timeout: 30000,
  retry: 3,
  retryDelay: 1000
})

export default httpClient
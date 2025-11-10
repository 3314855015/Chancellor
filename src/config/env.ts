// 环境变量配置工具

// N8N API 配置
const N8N_API_BASE_URL = import.meta.env.VITE_N8N_API_BASE_URL || 'http://localhost:5678'
const N8N_AI_RECOMMENDATION_PATH = import.meta.env.VITE_N8N_AI_RECOMMENDATION_PATH || '/webhook/ai-recommendation'
const N8N_AI_TASK_CREATE_PATH = import.meta.env.VITE_N8N_AI_TASK_CREATE_PATH || '/webhook/ai-create'

// N8N 测试环境配置
const N8N_API_BASE_URL_TEST = import.meta.env.VITE_N8N_API_BASE_URL_TEST || 'http://localhost:5678'
const N8N_AI_RECOMMENDATION_PATH_TEST = import.meta.env.VITE_N8N_AI_RECOMMENDATION_PATH_TEST || '/webhook-test/ai-recommendation'
const N8N_AI_TASK_CREATE_PATH_TEST = import.meta.env.VITE_N8N_AI_TASK_CREATE_PATH_TEST || '/webhook-test/ai-create'

// 应用环境
const APP_ENV = import.meta.env.VITE_APP_ENV || 'development'

// API 端点配置
export const API_ENDPOINTS = {
  // AI 推荐服务
  AI_RECOMMENDATION: {
    development: `${N8N_API_BASE_URL}${N8N_AI_RECOMMENDATION_PATH}`,
    test: `${N8N_API_BASE_URL_TEST}${N8N_AI_RECOMMENDATION_PATH_TEST}`,
    production: `${N8N_API_BASE_URL_TEST}${N8N_AI_RECOMMENDATION_PATH_TEST}` // 生产环境默认使用测试环境
  },
  // AI 任务创建服务
  AI_TASK_CREATE: {
    development: `${N8N_API_BASE_URL}${N8N_AI_TASK_CREATE_PATH}`,
    test: `${N8N_API_BASE_URL_TEST}${N8N_AI_TASK_CREATE_PATH_TEST}`,
    production: `${N8N_API_BASE_URL_TEST}${N8N_AI_TASK_CREATE_PATH_TEST}` // 生产环境默认使用测试环境
  }
}

// 获取当前环境的API端点
export const getApiEndpoint = (endpointKey: keyof typeof API_ENDPOINTS): string => {
  const endpoint = API_ENDPOINTS[endpointKey]
  return endpoint[APP_ENV as keyof typeof endpoint] || endpoint.development
}

// 环境判断函数
export const isDevelopment = (): boolean => APP_ENV === 'development'
export const isTest = (): boolean => APP_ENV === 'test'
export const isProduction = (): boolean => APP_ENV === 'production'

// 导出配置对象
export default {
  N8N_API_BASE_URL,
  N8N_AI_RECOMMENDATION_PATH,
  N8N_API_BASE_URL_TEST,
  N8N_AI_RECOMMENDATION_PATH_TEST,
  APP_ENV,
  API_ENDPOINTS,
  getApiEndpoint,
  isDevelopment,
  isTest,
  isProduction
}
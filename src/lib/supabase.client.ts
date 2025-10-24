// src/lib/supabase.client.ts

import { createClient } from '@supabase/supabase-js'

// 从环境变量中获取 Supabase URL 和 匿名密钥
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY 环境变量必须设置')
}

// 创建 Supabase 客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey)

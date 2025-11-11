// 管理员能力管理服务 - 简化版（只保留查看和删除功能）
import { supabase } from '@/lib/supabase.client'

export interface AbilityRecord {
  id: string
  user_id: string
  ability_type: 'frontend' | 'android' | 'backend' | 'ai' | 'communication' | 'creativity' | 'leadership'
  points: number
  source_type: 'initial' | 'task_reward' | 'teacher_assigned' | 'enterprise_match'
  source_id?: string
  description?: string
  obtained_at: string
  expires_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
  user_name?: string
}

export interface MasteryRecord {
  id: string
  user_id: string
  ability_type: 'frontend' | 'android' | 'backend'
  mastery_type: string
  mastery_name: string
  obtained_at: string
  expires_at: string
  is_active: boolean
  created_at: string
  updated_at: string
  user_name?: string
}

/**
 * 获取能力记录列表（管理员功能）- 使用RPC函数
 */
export const getAbilityRecords = async (filters?: {
  userId?: string
  abilityType?: string
  status?: 'active' | 'expired'
  page?: number
  pageSize?: number
}) => {
  try {
    // 使用RPC函数获取数据
    const { data: records, error } = await supabase
      .rpc('get_ability_records_admin', {
        page_number: filters?.page || 1,
        page_size: filters?.pageSize || 10,
        search_user_name: filters?.userId || null,
        ability_type_filter: filters?.abilityType || null,
        status_filter: filters?.status || null
      })

    if (error) {
      throw new Error(error.message)
    }

    if (!records || records.length === 0) {
      return {
        success: true,
        message: '获取能力记录成功',
        data: {
          records: [],
          pagination: {
            page: filters?.page || 1,
            pageSize: filters?.pageSize || 10,
            total: 0,
            totalPages: 0
          }
        }
      }
    }

    // 提取总记录数（从第一条记录获取）
    const totalCount = records.length > 0 ? records[0].total_count : 0

    return {
      success: true,
      message: '获取能力记录成功',
      data: {
        records: records,
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 10,
          total: totalCount,
          totalPages: Math.ceil(totalCount / (filters?.pageSize || 10))
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取能力记录失败'
    return {
      success: false,
      message,
      data: {
        records: [],
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 10,
          total: 0,
          totalPages: 0
        }
      }
    }
  }
}

/**
 * 获取精通记录列表（管理员功能）- 简化版本
 */
export const getMasteryRecords = async (filters?: {
  userId?: string
  abilityType?: string
  page?: number
  pageSize?: number
}) => {
  try {
    // 先获取精通记录表的基本数据
    const { data: records, error, count } = await supabase
      .from('mastery_records')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(error.message)
    }

    // 获取所有用户信息，用于填充用户名
    const { data: users } = await supabase
      .from('users')
      .select('id, username')

    const userMap = new Map()
    users?.forEach(user => {
      userMap.set(user.id, user)
    })

    // 组合数据
    const enrichedRecords = records?.map(record => ({
      ...record,
      user_name: userMap.get(record.user_id)?.username || '未知用户'
    })) || []

    return {
      success: true,
      message: '获取精通记录成功',
      data: {
        records: enrichedRecords,
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 20,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (filters?.pageSize || 20))
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取精通记录失败'
    return {
      success: false,
      message,
      data: {
        records: [],
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 20,
          total: 0,
          totalPages: 0
        }
      }
    }
  }
}

/**
 * 删除能力记录（管理员功能）
 */
export const deleteAbilityRecord = async (recordId: string) => {
  try {
    const { error } = await supabase
      .from('ability_records')
      .delete()
      .eq('id', recordId)

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '能力记录删除成功'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '能力记录删除失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 删除精通记录（管理员功能）
 */
export const deleteMasteryRecord = async (recordId: string) => {
  try {
    const { error } = await supabase
      .from('mastery_records')
      .delete()
      .eq('id', recordId)

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '精通记录删除成功'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '精通记录删除失败'
    return {
      success: false,
      message
    }
  }
}

export default {
  getAbilityRecords,
  getMasteryRecords,
  deleteAbilityRecord,
  deleteMasteryRecord
}
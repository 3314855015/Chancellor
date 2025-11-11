// 管理员任务管理服务 - 简化版（只保留查看和删除功能）
import { supabase } from '@/lib/supabase.client'

export interface Task {
  id: string
  examiner_id: string
  title: string
  description?: string
  ability_type: 'frontend' | 'android' | 'backend' | 'ai' | 'communication' | 'creativity' | 'leadership'
  reward_points: number
  expires_in_months?: number
  deadline?: string
  status: string
  created_at: string
  updated_at: string
  examiner_name?: string
}

export interface TaskAssignment {
  id: string
  task_id: string
  student_id: string
  status: string
  submission?: string
  submitted_at?: string
  reviewed_at?: string
  awarded_points?: number
  created_at: string
  updated_at: string
  student_name?: string
  task_title?: string
}

/**
 * 获取任务列表（管理员功能）
 */
export const getTasks = async (filters?: {
  examinerId?: string
  abilityType?: string
  status?: string
  page?: number
  pageSize?: number
}) => {
  try {
    const query = supabase
      .from('tasks')
      .select(`
        *,
        examiners:users!tasks_examiner_id_fkey(username)
      `)
      .order('created_at', { ascending: false })
    
    if (filters?.examinerId) {
      query.eq('examiner_id', filters.examinerId)
    }
    if (filters?.abilityType) {
      query.eq('ability_type', filters.abilityType)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }
    
    if (filters?.page && filters?.pageSize) {
      const from = (filters.page - 1) * filters.pageSize
      const to = from + filters.pageSize - 1
      query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const tasks = data?.map(item => ({
      ...item,
      examiner_name: item.examiners?.username
    })) || []

    return {
      success: true,
      message: '获取任务列表成功',
      data: {
        tasks,
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 20,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (filters?.pageSize || 20))
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取任务列表失败'
    return {
      success: false,
      message,
      data: {
        tasks: [],
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
 * 获取任务分配列表（管理员功能）
 */
export const getTaskAssignments = async (filters?: {
  taskId?: string
  studentId?: string
  status?: string
  page?: number
  pageSize?: number
}) => {
  try {
    const query = supabase
      .from('task_assignments')
      .select(`
        *,
        students:users!task_assignments_student_id_fkey(username),
        tasks:task_assignments_task_id_fkey(title)
      `)
      .order('created_at', { ascending: false })
    
    if (filters?.taskId) {
      query.eq('task_id', filters.taskId)
    }
    if (filters?.studentId) {
      query.eq('student_id', filters.studentId)
    }
    if (filters?.status) {
      query.eq('status', filters.status)
    }
    
    if (filters?.page && filters?.pageSize) {
      const from = (filters.page - 1) * filters.pageSize
      const to = from + filters.pageSize - 1
      query.range(from, to)
    }

    const { data, error, count } = await query

    if (error) {
      throw new Error(error.message)
    }

    const assignments = data?.map(item => ({
      ...item,
      student_name: item.students?.username,
      task_title: item.tasks?.title
    })) || []

    return {
      success: true,
      message: '获取任务分配列表成功',
      data: {
        assignments,
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 20,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / (filters?.pageSize || 20))
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取任务分配列表失败'
    return {
      success: false,
      message,
      data: {
        assignments: [],
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
 * 删除任务（管理员功能）
 */
export const deleteTask = async (taskId: string) => {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId)

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '任务删除成功'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务删除失败'
    return {
      success: false,
      message
    }
  }
}

/**
 * 删除任务分配（管理员功能）
 */
export const deleteTaskAssignment = async (assignmentId: string) => {
  try {
    const { error } = await supabase
      .from('task_assignments')
      .delete()
      .eq('id', assignmentId)

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '任务分配删除成功'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '任务分配删除失败'
    return {
      success: false,
      message
    }
  }
}

export default {
  getTasks,
  getTaskAssignments,
  deleteTask,
  deleteTaskAssignment
}
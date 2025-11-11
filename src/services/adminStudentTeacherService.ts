// 管理员师生关系管理服务 - 简化版（只保留查看和删除功能）
import { supabase } from '@/lib/supabase.client'

export interface StudentTeacherRelation {
  id: number
  student_id: string
  teacher_id: string
  created_at: string
  updated_at: string
}

/**
 * 获取师生关系列表（管理员功能）- 使用RPC函数
 */
export const getStudentTeacherRelations = async (filters?: {
  studentId?: string
  teacherId?: string
  page?: number
  pageSize?: number
  searchStudentName?: string
  searchTeacherName?: string
}) => {
  try {
    // 使用RPC函数获取数据
    const { data: relations, error } = await supabase
      .rpc('get_student_teacher_relations_admin', {
        page_number: filters?.page || 1,
        page_size: filters?.pageSize || 8,
        search_student_name: filters?.searchStudentName || null,
        search_teacher_name: filters?.searchTeacherName || null
      })

    if (error) {
      throw new Error(error.message)
    }

    if (!relations || relations.length === 0) {
      return {
        success: true,
        message: '获取师生关系成功',
        data: {
          relations: [],
          pagination: {
            page: filters?.page || 1,
            pageSize: filters?.pageSize || 8,
            total: 0,
            totalPages: 0
          }
        }
      }
    }

    // 提取总记录数（从第一条记录获取）
    const totalCount = relations.length > 0 ? relations[0].total_count : 0

    return {
      success: true,
      message: '获取师生关系成功',
      data: {
        relations: relations,
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 8,
          total: totalCount,
          totalPages: Math.ceil(totalCount / (filters?.pageSize || 8))
        }
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '获取师生关系失败'
    return {
      success: false,
      message,
      data: {
        relations: [],
        pagination: {
          page: filters?.page || 1,
          pageSize: filters?.pageSize || 8,
          total: 0,
          totalPages: 0
        }
      }
    }
  }
}

/**
 * 删除师生关系（管理员功能）
 */
export const deleteStudentTeacherRelation = async (relationId: number) => {
  try {
    const { error } = await supabase
      .from('student_teacher_relations')
      .delete()
      .eq('id', relationId)

    if (error) {
      throw new Error(error.message)
    }

    return {
      success: true,
      message: '师生关系删除成功'
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '师生关系删除失败'
    return {
      success: false,
      message
    }
  }
}

export default {
  getStudentTeacherRelations,
  deleteStudentTeacherRelation
}
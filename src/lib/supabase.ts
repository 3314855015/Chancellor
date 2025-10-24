export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string | null
          password_hash: string
          role: 'student' | 'examiner' | 'enterprise' | 'admin'
          status: 'active' | 'inactive' | 'suspended'
          student_status: 'wild' | 'selected' | null
          avatar_url: string | null
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          username: string
          email?: string | null
          password_hash: string
          role?: 'student' | 'examiner' | 'enterprise' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
          student_status?: 'wild' | 'selected' | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          email?: string | null
          password_hash?: string
          role?: 'student' | 'examiner' | 'enterprise' | 'admin'
          status?: 'active' | 'inactive' | 'suspended'
          student_status?: 'wild' | 'selected' | null
          avatar_url?: string | null
          last_login_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_keys: {
        Row: {
          id: number
          key_value: string
          key_type: 'invitation' | 'promotion' | 'teacher'
          creator_id: string
          used: boolean
          used_by: string | null
          used_at: string | null
          expires_at: string
          max_uses: number
          current_uses: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: number
          key_value: string
          key_type: 'invitation' | 'promotion' | 'teacher'
          creator_id: string
          used?: boolean
          used_by?: string | null
          used_at: string | null
          expires_at: string
          max_uses: number
          current_uses: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Update: {
          id?: number
          key_value?: string
          key_type?: 'invitation' | 'promotion' | 'teacher'
          creator_id?: string
          used?: boolean
          used_by?: string | null
          used_at: string | null
          expires_at: string
          max_uses: number
          current_uses: number
          description: string | null
          created_at: string
          updated_at: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_invitation_keys_creator"
            columns: ["creator_id"]
          },
          {
            foreignKeyName: "fk_invitation_keys_used_by"
            columns: ["used_by"]
          }
        ]
      }
      user_abilities: {
        Row: {
          user_id: string
          frontend_points: number
          android_points: number
          backend_points: number
          ai_points: number
          communication_points: number
          creativity_points: number
          leadership_points: number
          updated_at: string
        }
        Insert: {
          user_id: string
          frontend_points?: number
          android_points?: number
          backend_points?: number
          ai_points?: number
          communication_points?: number
          creativity_points?: number
          leadership_points?: number
          updated_at?: string
        }
        Update: {
          user_id?: string
          frontend_points?: number
          android_points?: number
          backend_points?: number
          ai_points?: number
          communication_points?: number
          creativity_points?: number
          leadership_points?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_abilities_user"
            columns: ["user_id"]
          }
        ]
      }
      user_sessions: {
        Row: {
          id: number
          user_id: string
          session_token: string
          ip_address: string | null
          user_agent: string | null
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: number
          user_id: string
          session_token: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at: string
          created_at: string
        }
        Update: {
          id?: number
          user_id?: string
          session_token?: string
          ip_address?: string | null
          user_agent?: string | null
          expires_at: string
          created_at: string
        }
        Relationships: [
          {
            foreignKeyName: "fk_user_sessions_user"
            columns: ["user_id"]
          }
        ]
      }
    }
    Views: {
      user_summary: {
        Row: {
          id: string | null
          username: string | null
          email: string | null
          role: 'student' | 'examiner' | 'enterprise' | 'admin' | null
          status: 'active' | 'inactive' | 'suspended' | null
          student_status: 'wild' | 'selected' | null
          created_at: string | null
          frontend_points: number | null
          android_points: number | null
          backend_points: number | null
          ai_points: number | null
          communication_points: number | null
          creativity_points: number | null
          leadership_points: number | null
        }
      }
    }
    Functions: {
      sp_authenticate_user: {
        Args: {
          p_username: string
          p_password_hash: string  // 修复：从 p_password 改为 p_password_hash，与实际数据库函数参数一致
        }
        Returns: Record<string, any>[]
      }
      sp_register_user: {
        Args: {
          p_username: string
          p_email: string
          p_password_hash: string
        }
        Returns: Record<string, any>[]
      }
      sp_use_invitation_key: {
        Args: {
          p_key_value: string
        }
        Returns: Record<string, any>[]
      }
      api_get_user_profile: {
        Args: {
          user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      user_role: 'student' | 'examiner' | 'enterprise' | 'admin'
      user_status: 'active' | 'inactive' | 'suspended'
      student_status: 'wild' | 'selected'
      key_type: 'invitation' | 'promotion' | 'teacher'
    }
  }
}

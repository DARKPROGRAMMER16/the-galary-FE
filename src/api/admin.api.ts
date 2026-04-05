import axiosInstance from './axiosInstance'
import type { ApiResponse, User } from '../types/api.types'

export const getUsersApi = async () => {
  const res = await axiosInstance.get<ApiResponse<{ users: User[] }>>('/admin/users')
  return res.data.data.users
}

export const updateUserRoleApi = async (userId: string, role: User['role']) => {
  const res = await axiosInstance.patch<ApiResponse<{ user: User }>>(
    `/admin/users/${userId}/role`,
    { role },
  )
  return res.data.data.user
}

export const toggleUserStatusApi = async (userId: string) => {
  const res = await axiosInstance.patch<ApiResponse<{ user: User }>>(
    `/admin/users/${userId}/toggle`,
  )
  return res.data.data.user
}

export const deleteUserApi = async (userId: string) => {
  await axiosInstance.delete(`/admin/users/${userId}`)
}

import axiosInstance from './axiosInstance'
import type { ApiResponse, Organisation, User, Video, VideoListResponse } from '../types/api.types'

export const getSuperAdminOrgsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<{ organisations: Organisation[] }>>(
    '/superadmin/organisations',
  )
  return res.data.data.organisations
}

export const getSuperAdminOrgUsersApi = async (org: string) => {
  const res = await axiosInstance.get<ApiResponse<{ users: User[] }>>(
    `/superadmin/organisations/${encodeURIComponent(org)}/users`,
  )
  return res.data.data.users
}

export const getSuperAdminOrgVideosApi = async (org: string, page = 1, limit = 20) => {
  const res = await axiosInstance.get<ApiResponse<VideoListResponse>>(
    `/superadmin/organisations/${encodeURIComponent(org)}/videos`,
    { params: { page, limit } },
  )
  return res.data.data
}

export const superAdminUpdateRoleApi = async (userId: string, role: User['role']) => {
  const res = await axiosInstance.patch<ApiResponse<{ user: User }>>(
    `/superadmin/users/${userId}/role`,
    { role },
  )
  return res.data.data.user
}

export const superAdminToggleStatusApi = async (userId: string) => {
  const res = await axiosInstance.patch<ApiResponse<{ user: User }>>(
    `/superadmin/users/${userId}/toggle`,
  )
  return res.data.data.user
}

export const superAdminDeleteUserApi = async (userId: string) => {
  await axiosInstance.delete(`/superadmin/users/${userId}`)
}

export const superAdminDeleteVideoApi = async (videoId: string) => {
  await axiosInstance.delete(`/superadmin/videos/${videoId}`)
}

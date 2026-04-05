import axiosInstance from './axiosInstance'
import type { ApiResponse, User } from '../types/api.types'

// Gets users in the requester's org (editor) or a specified org (admin via ?organisation=)
export const getOrgUsersApi = async (organisation?: string) => {
  const res = await axiosInstance.get<ApiResponse<{ users: User[] }>>('/org/users', {
    params: organisation ? { organisation } : undefined,
  })
  return res.data.data.users
}

export const deleteOrgUserApi = async (userId: string) => {
  await axiosInstance.delete(`/org/users/${userId}`)
}

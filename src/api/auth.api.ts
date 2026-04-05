import axiosInstance from './axiosInstance'
import type { ApiResponse, AuthResponse, User } from '../types/api.types'

export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  name: string
  email: string
  password: string
  organisation: string
  role?: 'viewer' | 'editor' | 'admin'
}

export const loginApi = async (payload: LoginPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/login', payload)
  return res.data.data
}

export const registerApi = async (payload: RegisterPayload) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register', payload)
  return res.data.data
}

export const getMeApi = async () => {
  const res = await axiosInstance.get<ApiResponse<{ user: User }>>('/auth/me')
  return res.data.data.user
}

export const registerSuperAdminApi = async (payload: {
  name: string
  email: string
  password: string
  secretKey: string
}) => {
  const res = await axiosInstance.post<ApiResponse<AuthResponse>>('/auth/register/superadmin', payload)
  return res.data.data
}

import axiosInstance from './axiosInstance'
import type {
  ApiResponse,
  Video,
  VideoListResponse,
  VideoStats,
} from '../types/api.types'

export interface UploadVideoPayload {
  title: string
  description?: string
  tags?: string
  storageKey: string
  originalName: string
  fileSize: number
  mimeType: string
  duration?: number
  resolution?: { width: number; height: number }
}

export interface VideoFilters {
  status?: string
  page?: number
  limit?: number
  sort?: string
}

export const getVideosApi = async (filters: VideoFilters = {}) => {
  const res = await axiosInstance.get<ApiResponse<VideoListResponse>>('/videos', {
    params: filters,
  })
  return res.data.data
}

export const getVideoByIdApi = async (id: string) => {
  const res = await axiosInstance.get<ApiResponse<{ video: Video }>>(`/videos/${id}`)
  return res.data.data.video
}

export const createVideoApi = async (payload: UploadVideoPayload) => {
  const res = await axiosInstance.post<ApiResponse<{ video: Video }>>('/videos', payload)
  return res.data.data.video
}

export const updateVideoApi = async (
  id: string,
  payload: { title?: string; description?: string; tags?: string }
) => {
  const res = await axiosInstance.patch<ApiResponse<{ video: Video }>>(`/videos/${id}`, payload)
  return res.data.data.video
}

export const deleteVideoApi = async (id: string) => {
  await axiosInstance.delete(`/videos/${id}`)
}

export const getVideoStatsApi = async () => {
  const res = await axiosInstance.get<ApiResponse<{ stats: VideoStats }>>('/videos/stats')
  return res.data.data.stats
}

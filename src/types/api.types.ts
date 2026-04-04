export interface ApiResponse<T = unknown> {
  success: boolean
  statusCode: number
  data: T
  message: string
}

export interface User {
  _id: string
  name: string
  email: string
  role: 'viewer' | 'editor' | 'admin'
  organisation: string
  isActive: boolean
  lastLogin?: string
  createdAt: string
  updatedAt: string
}

export interface VideoResolution {
  width: number
  height: number
}

export interface SensitivityDetails {
  violence: number
  adult: number
  hate: number
}

export type VideoStatus = 'pending' | 'processing' | 'safe' | 'flagged' | 'error'

export interface Video {
  _id: string
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string | null
  imagekitFileId: string
  imagekitThumbnailFileId: string | null
  originalName: string
  fileSize: number
  mimeType: string
  duration: number
  resolution: VideoResolution
  codec: string
  fps: number
  bitrate: number
  hasAudio: boolean
  status: VideoStatus
  processingProgress: number
  sensitivityScore: number | null
  sensitivityDetails: SensitivityDetails
  tags: string[]
  uploadedBy: { _id: string; name: string; email: string } | string
  organisation: string
  isDeleted: boolean
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface VideoStats {
  total: number
  safe: number
  flagged: number
  processing: number
  pending: number
  error: number
  totalSize: number
}

export interface AuthResponse {
  user: User
  token: string
}

export interface VideoListResponse {
  videos: Video[]
  pagination: Pagination
}

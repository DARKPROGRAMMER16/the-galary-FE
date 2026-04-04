import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  type ReactNode,
} from 'react'
import { io, type Socket } from 'socket.io-client'
import {
  getVideosApi,
  createVideoApi,
  deleteVideoApi,
  updateVideoApi,
  type VideoFilters,
} from '../api/video.api'
import { useAuth } from './AuthContext'
import type { Video, Pagination } from '../types/api.types'

interface VideoContextType {
  videos: Video[]
  pagination: Pagination | null
  isLoading: boolean
  error: string | null
  fetchVideos: (filters?: VideoFilters) => Promise<void>
  uploadVideo: (
    file: File,
    meta: { title: string; description?: string; tags?: string },
    onProgress?: (pct: number) => void
  ) => Promise<Video>
  removeVideo: (id: string) => Promise<void>
  editVideo: (
    id: string,
    payload: { title?: string; description?: string; tags?: string }
  ) => Promise<void>
}

const VideoContext = createContext<VideoContextType | null>(null)

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:8000'

export function VideoProvider({ children }: { children: ReactNode }) {
  const { token } = useAuth()
  const [videos, setVideos] = useState<Video[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // ─── Real-time socket updates ────────────────────────────────────────────
  useEffect(() => {
    if (!token) return

    const socket: Socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
    })

    socket.on('connect_error', (err) => {
      console.warn('[Socket] connect error:', err.message)
    })

    socket.on(
      'video:progress',
      ({ videoId, progress }: { videoId: string; progress: number; step: string }) => {
        setVideos((prev) =>
          prev.map((v) =>
            v._id === videoId ? { ...v, status: 'processing', processingProgress: progress } : v
          )
        )
      }
    )

    socket.on(
      'video:done',
      ({
        videoId,
        status,
        sensitivityScore,
        sensitivityDetails,
      }: {
        videoId: string
        status: Video['status']
        sensitivityScore: number
        sensitivityDetails: Video['sensitivityDetails']
        video: Video
      }) => {
        setVideos((prev) =>
          prev.map((v) =>
            v._id === videoId
              ? { ...v, status, sensitivityScore, sensitivityDetails, processingProgress: 100 }
              : v
          )
        )
      }
    )

    socket.on('video:error', ({ videoId }: { videoId: string }) => {
      setVideos((prev) =>
        prev.map((v) => (v._id === videoId ? { ...v, status: 'error' } : v))
      )
    })

    return () => { socket.disconnect() }
  }, [token])

  // ─── API methods ─────────────────────────────────────────────────────────

  const fetchVideos = useCallback(async (filters: VideoFilters = {}) => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getVideosApi(filters)
      setVideos(data.videos)
      setPagination(data.pagination)
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Failed to load videos.'
      setError(message)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const uploadVideo = useCallback(
    async (
      file: File,
      meta: { title: string; description?: string; tags?: string },
      onProgress?: (pct: number) => void
    ): Promise<Video> => {
      const formData = new FormData()
      formData.append('video', file)
      formData.append('title', meta.title)
      if (meta.description) formData.append('description', meta.description)
      if (meta.tags) formData.append('tags', meta.tags)

      const video = await createVideoApi(formData, onProgress)
      setVideos((prev) => [video, ...prev])
      return video
    },
    []
  )

  const removeVideo = useCallback(async (id: string) => {
    await deleteVideoApi(id)
    setVideos((prev) => prev.filter((v) => v._id !== id))
  }, [])

  const editVideo = useCallback(
    async (
      id: string,
      payload: { title?: string; description?: string; tags?: string }
    ) => {
      const updated = await updateVideoApi(id, payload)
      setVideos((prev) => prev.map((v) => (v._id === id ? updated : v)))
    },
    []
  )

  return (
    <VideoContext.Provider
      value={{ videos, pagination, isLoading, error, fetchVideos, uploadVideo, removeVideo, editVideo }}
    >
      {children}
    </VideoContext.Provider>
  )
}

export function useVideos() {
  const ctx = useContext(VideoContext)
  if (!ctx) throw new Error('useVideos must be used inside <VideoProvider>')
  return ctx
}

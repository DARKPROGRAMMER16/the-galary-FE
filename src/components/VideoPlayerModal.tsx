import { useEffect, useRef, useState } from 'react'
import type { VideoItem } from './VideoCard'

interface VideoPlayerModalProps {
  video: VideoItem
  onClose: () => void
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function VideoPlayerModal({ video, onClose }: VideoPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [showVolume, setShowVolume] = useState(false)

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (isPlaying) { v.pause(); setIsPlaying(false) }
    else { v.play(); setIsPlaying(true) }
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === ' ' && e.target === document.body) { e.preventDefault(); togglePlay() }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    return () => { videoRef.current?.pause() }
  }, [])

  function handleSeek(e: React.MouseEvent<HTMLDivElement>) {
    if (!videoRef.current || !progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    videoRef.current.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = parseFloat(e.target.value)
    setVolume(v)
    if (videoRef.current) videoRef.current.volume = v
  }

  function toggleMute() {
    if (!videoRef.current) return
    const next = volume > 0 ? 0 : 1
    setVolume(next)
    videoRef.current.volume = next
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div
      className="fixed inset-0 bg-inverse-surface/40 z-50 flex items-center justify-center p-3 sm:p-6 md:p-10"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[95vh] sm:max-h-[90vh] bg-surface-container-lowest rounded-2xl sm:rounded-4xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 sm:top-6 sm:right-6 z-60 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-inverse-surface/20 hover:bg-inverse-surface/40 flex items-center justify-center text-white transition-all"
          aria-label="Close"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Video stage */}
        <div className="relative flex-1 min-h-0 bg-inverse-surface group">
          {video.videoUrl ? (
            <video
              ref={videoRef}
              src={video.videoUrl}
              className="w-full h-full object-contain"
              onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
              onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
              onEnded={() => { setIsPlaying(false); setCurrentTime(0) }}
              onClick={togglePlay}
            />
          ) : (
            <div
              className="w-full h-full min-h-48"
              style={{ background: video.thumbnailGradient ?? 'linear-gradient(135deg, #4355b9, #535f78)' }}
            />
          )}

          {/* Center play/pause overlay */}
          {video.videoUrl && (
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              onClick={togglePlay}
            >
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-primary/90 flex items-center justify-center text-white shadow-lg">
                <span className="material-symbols-outlined text-3xl sm:text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                  {isPlaying ? 'pause' : 'play_arrow'}
                </span>
              </div>
            </div>
          )}

          {/* Controls bar */}
          {video.videoUrl && (
            <div
              className="absolute bottom-3 sm:bottom-6 left-1/2 -translate-x-1/2 w-[96%] rounded-xl sm:rounded-2xl p-3 sm:p-4 flex flex-col gap-2 sm:gap-3 shadow-sm border border-white/10"
              style={{ background: 'rgba(252,249,248,0.6)', backdropFilter: 'blur(24px)' }}
            >
              {/* Progress bar */}
              <div
                ref={progressRef}
                className="relative w-full h-1 bg-on-surface/10 rounded-full cursor-pointer group/progress"
                onClick={handleSeek}
              >
                <div className="absolute top-0 left-0 h-full bg-primary rounded-full" style={{ width: `${progress}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-primary rounded-full scale-0 group-hover/progress:scale-100 transition-transform" />
                </div>
              </div>

              {/* Action row */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 sm:gap-5">
                  <button onClick={togglePlay} className="text-on-surface hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                      {isPlaying ? 'pause' : 'play_arrow'}
                    </span>
                  </button>

                  <div
                    className="flex items-center gap-2"
                    onMouseEnter={() => setShowVolume(true)}
                    onMouseLeave={() => setShowVolume(false)}
                  >
                    <button onClick={toggleMute} className="text-on-surface hover:text-primary transition-colors">
                      <span className="material-symbols-outlined text-xl">
                        {volume === 0 ? 'volume_off' : 'volume_up'}
                      </span>
                    </button>
                    <div className={`overflow-hidden transition-all duration-200 hidden sm:block ${showVolume ? 'w-16' : 'w-0'}`}>
                      <input
                        type="range" min="0" max="1" step="0.05"
                        value={volume} onChange={handleVolumeChange}
                        className="w-16 h-1 accent-primary cursor-pointer"
                      />
                    </div>
                  </div>

                  <span className="text-[10px] sm:text-xs font-medium font-body text-on-surface-variant tabular-nums">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-3 sm:gap-5">
                  <button onClick={() => videoRef.current?.requestFullscreen()} className="text-on-surface hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Metadata */}
        <div className="shrink-0 p-4 sm:p-6 md:p-8 bg-surface-container-lowest flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div className="space-y-1.5 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-on-surface leading-none font-headline">
                {video.title}
              </h1>
              {video.quality && (
                <span className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold tracking-widest rounded-full uppercase shrink-0">
                  {video.quality}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-on-surface-variant font-body text-xs flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                <span className="font-semibold tracking-wide uppercase">{video.status}</span>
              </div>
              {video.publishedAt && <><span className="text-outline-variant">•</span><span>{video.publishedAt}</span></>}
              {video.views && <><span className="text-outline-variant">•</span><span>{video.views}</span></>}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button className="flex items-center gap-1.5 px-3 sm:px-5 py-2.5 rounded-xl border border-outline-variant/30 font-semibold text-on-surface hover:bg-surface-container-low transition-all text-sm">
              <span className="material-symbols-outlined text-lg">share</span>
              <span className="hidden sm:inline">Share</span>
            </button>
            <button className="flex items-center gap-1.5 px-3 sm:px-6 py-2.5 rounded-xl indigo-gradient text-on-primary font-bold shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all text-sm">
              <span className="material-symbols-outlined text-lg">add</span>
              <span className="hidden sm:inline">Add to Collection</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react'
import PageHeader from '../components/PageHeader'
import QueueItem, { type QueueItemData } from '../components/QueueItem'

const initialQueue: QueueItemData[] = [
  {
    id: 'q1',
    name: 'Misty_Valley_Raw_02.mp4',
    size: '4.2 GB',
    timeRemaining: '2m 14s remaining',
    progress: 74,
    state: 'uploading',
    thumbnailGradient: 'linear-gradient(135deg, #1a3a4a 0%, #2d6a7a 50%, #4a9aa0 100%)',
  },
  {
    id: 'q2',
    name: 'Modern_Architecture_Series_A.mov',
    size: '1.8 GB',
    timeRemaining: 'Pending Transcode',
    progress: 12,
    state: 'transcoding',
    thumbnailGradient: 'linear-gradient(135deg, #1e2a3a 0%, #2d3f5f 50%, #4a6080 100%)',
  },
]

const guidelines = [
  { title: 'Codec optimized', body: 'H.264 or ProRes 422 are recommended for best processing.' },
  { title: 'Color Space',     body: 'Rec.709 or Rec.2020 (HDR) are fully supported.' },
  { title: 'Bitrate Control', body: 'Dynamic transcoding ensures smooth 60fps delivery.' },
]

export default function UploadPage() {
  const [dragging, setDragging] = useState(false)
  const [queue, setQueue] = useState<QueueItemData[]>(initialQueue)
  const inputRef = useRef<HTMLInputElement>(null)

  function handleDragOver(e: DragEvent) { e.preventDefault(); setDragging(true) }
  function handleDragLeave() { setDragging(false) }
  function handleDrop(e: DragEvent) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files) }
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) { if (e.target.files) addFiles(e.target.files) }

  function addFiles(files: FileList) {
    const newItems: QueueItemData[] = Array.from(files).map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      size: formatBytes(f.size),
      timeRemaining: 'Queued',
      progress: 0,
      state: 'uploading' as const,
    }))
    setQueue((prev) => [...prev, ...newItems])
  }

  function removeItem(id: string) {
    setQueue((prev) => prev.filter((q) => q.id !== id))
  }

  return (
    <>
      {/* Background decoration */}
      <div className="fixed top-0 right-0 -z-10 w-1/2 h-screen overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary opacity-[0.02] rounded-full blur-[100px]" />
        <div className="absolute top-1/2 -right-48 w-150 h-150 bg-tertiary opacity-[0.03] rounded-full blur-[120px]" />
      </div>

      <PageHeader
        title={<>Bring your <span className="text-primary italic">vision</span> to life.</>}
        subtitle="Upload your high-resolution raw assets. Our cinematic processing engine handles the rest."
      />

      {/* Bento grid: drop zone + guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12 lg:mb-16">
        {/* Drop zone */}
        <section className="lg:col-span-8 group relative">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`relative w-full rounded-2xl lg:rounded-4xl border-2 border-dashed flex flex-col items-center justify-center transition-all duration-300 overflow-hidden sm:h-72 lg:h-100 ${
              dragging
                ? 'border-primary bg-surface-container-low scale-[1.01]'
                : 'border-outline-variant bg-surface-container-lowest hover:border-primary hover:bg-surface-container-low'
            }`}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-10 pointer-events-none transition-opacity duration-700">
              <div className="h-full w-full bg-[radial-gradient(circle_at_center,#4355b9,transparent)]" />
            </div>

            <input ref={inputRef} type="file" multiple accept="video/*" className="hidden" onChange={handleFileChange} />

            <div className="flex flex-col items-center text-center px-6 py-10 sm:p-8 z-10">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-surface-container-high flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-500">
                <span className="material-symbols-outlined text-3xl sm:text-4xl text-primary" style={{ fontVariationSettings: "'wght' 300" }}>
                  cloud_upload
                </span>
              </div>
              <h3 className="text-lg sm:text-2xl font-headline font-semibold mb-2">
                Drag and drop assets here
              </h3>
              <p className="text-on-surface-variant text-sm max-w-xs sm:max-w-sm mb-6 sm:mb-8">
                Supports MP4, MOV, and HEVC up to 8K. Max file size: 10GB.
              </p>
              <button
                onClick={() => inputRef.current?.click()}
                className="px-6 sm:px-8 py-3 sm:py-3.5 bg-primary text-on-primary font-semibold rounded-xl flex items-center gap-2 hover:bg-primary-dim transition-all shadow-xl shadow-primary/10 active:scale-95 text-sm sm:text-base"
              >
                Browse Files
                <span className="material-symbols-outlined text-lg">add</span>
              </button>
            </div>
          </div>
        </section>

        {/* Asset guidelines */}
        <section className="lg:col-span-4 flex flex-col">
          <div className="p-6 sm:p-8 rounded-2xl lg:rounded-4xl bg-surface-container-low grow">
            <h4 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-5 sm:mb-6">
              Asset Guidelines
            </h4>
            <ul className="space-y-4 sm:space-y-6">
              {guidelines.map(({ title, body }) => (
                <li key={title} className="flex items-start gap-3 sm:gap-4">
                  <span className="material-symbols-outlined text-primary mt-0.5 text-xl">check_circle</span>
                  <div>
                    <p className="font-semibold text-sm">{title}</p>
                    <p className="text-xs text-on-surface-variant mt-1">{body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>

      {/* Active queue */}
      <section>
        <div className="flex items-center justify-between mb-6 sm:mb-8 gap-4">
          <h3 className="text-xl sm:text-2xl font-headline font-semibold shrink-0">Active Queue</h3>
          {queue.length > 0 && (
            <span className="px-3 py-1 bg-primary-container text-on-primary-container text-[10px] font-bold uppercase tracking-wider rounded-full shrink-0">
              {queue.length} {queue.length === 1 ? 'File' : 'Files'} Processing
            </span>
          )}
        </div>

        <div className="space-y-3 sm:space-y-4">
          {queue.map((item) => (
            <QueueItem key={item.id} item={item} onRemove={removeItem} />
          ))}

          <div className="p-8 sm:p-12 border-2 border-dashed border-surface-container-high rounded-2xl flex flex-col items-center justify-center opacity-40">
            <span className="material-symbols-outlined text-3xl mb-2">playlist_add</span>
            <p className="text-sm font-medium">Add more to the queue</p>
          </div>
        </div>
      </section>
    </>
  )
}

function formatBytes(bytes: number): string {
  if (bytes >= 1e9) return `${(bytes / 1e9).toFixed(1)} GB`
  if (bytes >= 1e6) return `${(bytes / 1e6).toFixed(1)} MB`
  return `${(bytes / 1e3).toFixed(0)} KB`
}

/**
 * videoStorage — IndexedDB-backed storage for video blobs.
 *
 * localStorage has a ~5 MB limit which is far too small for video files.
 * IndexedDB can hold gigabytes of binary data and is the correct browser API
 * for client-side video storage. The "storageKey" saved in the backend DB
 * is the key used to retrieve the blob from here.
 */

const DB_NAME = 'galary_videos'
const STORE_NAME = 'blobs'
const DB_VERSION = 1

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION)
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

/** Persist a video blob under the given key. */
export async function saveVideoBlob(key: string, blob: Blob): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).put(blob, key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

/** Retrieve a video blob by key. Returns null if not found. */
export async function getVideoBlob(key: string): Promise<Blob | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly')
    const req = tx.objectStore(STORE_NAME).get(key)
    req.onsuccess = () => resolve((req.result as Blob) ?? null)
    req.onerror = () => reject(req.error)
  })
}

/** Remove a video blob from IndexedDB (e.g. after soft-deleting from the server). */
export async function removeVideoBlob(key: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite')
    tx.objectStore(STORE_NAME).delete(key)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
}

// ─── Thumbnail helpers (localStorage — JPEG data URLs, ~15-25 KB each) ────────

const THUMB_PREFIX = 'galary_thumb_'

/**
 * Capture a single frame from a video File and return it as a JPEG data URL.
 * Seeks to `atSeconds` (default 1s, clamped to 10% of duration if shorter).
 * Returns an empty string on failure.
 */
export function generateVideoThumbnail(file: File, atSeconds = 1): Promise<string> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.muted = true
    video.playsInline = true

    const cleanup = () => URL.revokeObjectURL(url)

    video.onerror = () => { cleanup(); resolve('') }

    video.onloadedmetadata = () => {
      const seekTo = Math.min(atSeconds, video.duration * 0.1)
      video.currentTime = seekTo > 0 ? seekTo : 0
    }

    video.onseeked = () => {
      try {
        const W = 640
        const H = video.videoHeight && video.videoWidth
          ? Math.round((video.videoHeight / video.videoWidth) * W)
          : 360
        const canvas = document.createElement('canvas')
        canvas.width = W
        canvas.height = H
        const ctx = canvas.getContext('2d')
        if (!ctx) { cleanup(); resolve(''); return }
        ctx.drawImage(video, 0, 0, W, H)
        const dataUrl = canvas.toDataURL('image/jpeg', 0.65)
        cleanup()
        resolve(dataUrl)
      } catch {
        cleanup()
        resolve('')
      }
    }

    video.src = url
    video.load()
  })
}

/** Persist a thumbnail data URL in localStorage under the video's storageKey. */
export function saveThumbnail(storageKey: string, dataUrl: string): void {
  if (!dataUrl) return
  try {
    localStorage.setItem(`${THUMB_PREFIX}${storageKey}`, dataUrl)
  } catch {
    // Quota exceeded — silently skip; gradient fallback will be used instead
  }
}

/** Retrieve the stored thumbnail data URL for a storageKey, or null if absent. */
export function getThumbnail(storageKey: string): string | null {
  return localStorage.getItem(`${THUMB_PREFIX}${storageKey}`)
}

/** Remove a thumbnail from localStorage (call when deleting a video). */
export function removeThumbnail(storageKey: string): void {
  localStorage.removeItem(`${THUMB_PREFIX}${storageKey}`)
}

// ─── Video metadata ────────────────────────────────────────────────────────────

/**
 * Read a video File's duration and resolution via a hidden <video> element.
 * Returns zeros if metadata cannot be read.
 */
export function readVideoMetadata(
  file: File
): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file)
    const video = document.createElement('video')
    video.preload = 'metadata'
    video.src = url
    video.onloadedmetadata = () => {
      const result = {
        duration: video.duration || 0,
        width: video.videoWidth || 0,
        height: video.videoHeight || 0,
      }
      URL.revokeObjectURL(url)
      resolve(result)
    }
    video.onerror = () => {
      URL.revokeObjectURL(url)
      resolve({ duration: 0, width: 0, height: 0 })
    }
  })
}

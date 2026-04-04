/**
 * videoStorage — client-side video utilities.
 *
 * Videos and thumbnails are now stored on ImageKit (CDN).
 * This module only provides a lightweight helper to read
 * a video File's duration and resolution before upload.
 */

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

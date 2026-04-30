/**
 * Extract the first frame from a video file to use as a thumbnail
 */
export const extractVideoThumbnail = (
  videoUrl: string,
  timeInSeconds: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Try fetching the video as a blob first — this improves reliability
    // for CORS-restricted or signed URLs (we create an object URL).
    let objectUrl: string | null = null;

    const cleanup = (video?: HTMLVideoElement) => {
      clearTimeout(timeout);
      if (video) {
        video.removeEventListener('loadedmetadata', handleLoadedMetadata as EventListener);
        video.removeEventListener('seeked', handleSeeked as EventListener);
        video.removeEventListener('error', handleError as EventListener);
      }
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = null;
      }
    };

    const handleLoadedMetadata = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      // Seek to the specified time after metadata is loaded
      try {
        if (video.duration) {
          video.currentTime = Math.min(timeInSeconds, video.duration);
        }
      } catch (err) {
        // Some browsers may throw on setting currentTime too early — ignore
      }
    };

    const handleSeeked = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      cleanup(video);

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      if (canvas.width === 0 || canvas.height === 0) {
        reject(new Error('Invalid video dimensions'));
        return;
      }

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      try {
        ctx.drawImage(video, 0, 0);
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);

        if (thumbnail && thumbnail.length > 100) {
          resolve(thumbnail);
        } else {
          reject(new Error('Failed to generate valid thumbnail'));
        }
      } catch (error) {
        reject(new Error(`Failed to draw video frame: ${error}`));
      }
    };

    const handleError = (e: Event) => {
      const video = e.target as HTMLVideoElement;
      cleanup(video);
      reject(new Error(`Failed to load video: ${video.error?.message || 'Unknown error'}`));
    };

    // Timeout to avoid hanging indefinitely
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout: Failed to generate video thumbnail'));
    }, 12000);

    // Attempt to fetch the video as a blob. If fetch fails, fall back to direct assignment.
    (async () => {
      try {
        const res = await fetch(videoUrl, { method: 'GET' });
        if (!res.ok) throw new Error(`Fetch failed: ${res.status}`);
        const blob = await res.blob();
        objectUrl = URL.createObjectURL(blob);

        const video = document.createElement('video');
        video.preload = 'metadata';

        video.addEventListener('loadedmetadata', handleLoadedMetadata);
        video.addEventListener('seeked', handleSeeked);
        video.addEventListener('error', handleError);

        video.src = objectUrl;
      } catch (err) {
        // If fetch fails (CORS, auth), try assigning the URL directly as a fallback.
        try {
          const video = document.createElement('video');
          video.preload = 'metadata';

          video.addEventListener('loadedmetadata', handleLoadedMetadata);
          video.addEventListener('seeked', handleSeeked);
          video.addEventListener('error', handleError);

          video.src = videoUrl;
        } catch (err2) {
          cleanup();
          reject(new Error(`Both fetch and direct assignment failed: ${err} / ${err2}`));
        }
      }
    })();
  });
};

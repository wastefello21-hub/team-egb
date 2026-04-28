/**
 * Extract the first frame from a video file to use as a thumbnail
 */
export const extractVideoThumbnail = (
  videoUrl: string,
  timeInSeconds: number = 0.5
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    let metadataLoaded = false;
    let seekAttempted = false;
    let timeout: NodeJS.Timeout;

    const cleanup = () => {
      clearTimeout(timeout);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('seeked', handleSeeked);
      video.removeEventListener('error', handleError);
    };

    const handleLoadedMetadata = () => {
      metadataLoaded = true;
      // Seek to the specified time after metadata is loaded
      if (video.duration) {
        video.currentTime = Math.min(timeInSeconds, video.duration);
        seekAttempted = true;
      }
    };

    const handleSeeked = () => {
      if (!seekAttempted || !metadataLoaded) return;

      cleanup();

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
        
        // Verify the thumbnail was actually generated (not just a black image)
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
      cleanup();
      reject(new Error(`Failed to load video: ${(e.target as HTMLVideoElement).error?.message || 'Unknown error'}`));
    };

    // Set a timeout to handle cases where events don't fire
    timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Timeout: Failed to generate video thumbnail'));
    }, 10000);

    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    video.src = videoUrl;
  });
};

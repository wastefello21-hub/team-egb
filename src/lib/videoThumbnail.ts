/**
 * Extract the first frame from a video file to use as a thumbnail
 */
export const extractVideoThumbnail = (
  videoUrl: string,
  timeInSeconds: number = 0
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous';
    video.preload = 'metadata';

    const handleCanplay = () => {
      video.removeEventListener('canplay', handleCanplay);
      video.currentTime = Math.min(timeInSeconds, video.duration);
    };

    const handleSeeked = () => {
      video.removeEventListener('seeked', handleSeeked);
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }

      ctx.drawImage(video, 0, 0);
      const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
      resolve(thumbnail);
    };

    const handleError = () => {
      reject(new Error('Failed to load video'));
    };

    video.addEventListener('canplay', handleCanplay);
    video.addEventListener('seeked', handleSeeked);
    video.addEventListener('error', handleError);

    video.src = videoUrl;
  });
};

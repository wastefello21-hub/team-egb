export default function Head() {
  return (
    <>
      {/* Resource hints for faster initial connections */}
      <link rel="preconnect" href="https://img.youtube.com" crossOrigin="" />
      <link rel="preconnect" href="https://i.ytimg.com" crossOrigin="" />
      <link rel="preconnect" href="https://www.youtube.com" crossOrigin="" />

      {/* Fonts (if used) */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

      {/* Preload critical images used on the page */}
      <link rel="preload" href="/logo_v2.jpg" as="image" />
    </>
  );
}

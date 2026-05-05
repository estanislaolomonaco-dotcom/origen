// Layout mínimo del backend.
// Solo sirve para que Next.js compile las API routes — no hay UI pública.

export const metadata = {
  title: "MusicTrack API",
  description: "Backend de MusicTrack — endpoints REST para el frontend.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}

import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Playlette — Dark Chrome Vinyl Roulette & Spotify Discovery',
  description:
    'Experience your Spotify playlists and vinyl records as a high-precision polished chrome roulette wheel with synchronized lyrics and analogue audio aesthetics.',
  keywords: [
    'Spotify',
    'Roulette',
    'Vinyl',
    'Dark Chrome',
    'Metallic',
    'Music Player',
    'Synchronized Lyrics',
    'Next.js',
  ],
  authors: [{ name: 'Playlette Audio Systems' }],
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#0a0a0a] text-[#e8e8e8] min-h-screen selection:bg-sky-400 selection:text-black">
        {children}
      </body>
    </html>
  );
}

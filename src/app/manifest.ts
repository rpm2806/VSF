import { MetadataRoute } from 'next'
 
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vriksh Students Federation',
    short_name: 'Vriksh Students Federation',
    description: 'Official platform for Vriksh Students Federation management and donations',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#10b981',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}

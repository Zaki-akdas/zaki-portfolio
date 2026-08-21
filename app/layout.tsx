import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Zaki Akdas Choudhary — Web Developer',
  description: 'Professional modern websites and digital experiences for businesses of every kind.',
  metadataBase: new URL('https://zakiakdas.vercel.app'),
  openGraph: {
    title: 'Zaki Akdas Choudhary — Web Developer',
    description: 'Professional websites for businesses of every kind.',
    type: 'website',
    url: 'https://zakiakdas.vercel.app',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Zaki Akdas Choudhary — Web Developer',
    description: 'Professional websites for businesses of every kind.',
  },
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@700&display=swap" rel="stylesheet" />
      </head>
      <body>{children}</body>
    </html>
  )
}

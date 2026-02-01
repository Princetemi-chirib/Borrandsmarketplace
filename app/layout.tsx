import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Borrands Marketplace - Connect Students, Restaurants & Riders',
  description: 'Order meals on campus.',
  keywords: 'university marketplace, food delivery, student ordering, restaurant management, delivery tracking, campus food',
  authors: [{ name: 'Borrands Marketplace Team' }],
  creator: 'Borrands Marketplace',
  publisher: 'Borrands Marketplace',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://orderup.borrands.com.ng/'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Borrands Marketplace - Connect Students, Restaurants & Riders',
    description: 'Order meals on campus.',
    url: 'https://orderup.borrands.com.ng/',
    siteName: 'Borrands Marketplace',
    images: [
      {
        url: '/images/brand-logo.jpeg',
        width: 1200,
        height: 630,
        alt: 'Borrands Marketplace',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Borrands Marketplace - Connect Students, Restaurants & Riders',
    description: 'Order meals on campus.',
    images: ['/images/brand-logo.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/images/brand-logo.jpeg" />
        <link rel="apple-touch-icon" sizes="180x180" href="/images/brand-logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="32x32" href="/images/brand-logo.jpeg" />
        <link rel="icon" type="image/jpeg" sizes="16x16" href="/images/brand-logo.jpeg" />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="theme-color" content="#152d8f" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
      </head>
      <body className={inter.className}>
        <div id="root">
          {children}
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#22c55e',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}



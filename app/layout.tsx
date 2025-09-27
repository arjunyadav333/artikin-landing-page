import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { AuthProvider } from '@/components/providers/auth-provider'
import { GraphQLProvider } from '@/components/providers/graphql-provider'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Artikin - Creative Network Platform',
  description: 'Connect, collaborate, and grow with creative professionals worldwide. Share your work, discover opportunities, and build meaningful connections.',
  keywords: 'creative network, artists, designers, portfolio, collaboration, opportunities',
  authors: [{ name: 'Artikin Team' }],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
  robots: 'index, follow',
  openGraph: {
    title: 'Artikin - Creative Network Platform',
    description: 'Connect, collaborate, and grow with creative professionals worldwide.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Artikin',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Artikin - Creative Network Platform',
    description: 'Connect, collaborate, and grow with creative professionals worldwide.',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <meta name="theme-color" content="#3b82f6" />
        <meta name="color-scheme" content="light dark" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <GraphQLProvider>
              <div className="min-h-screen bg-background font-sans">
                {children}
              </div>
              <Toaster />
              <Sonner />
            </GraphQLProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
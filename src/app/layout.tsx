import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
} from '@clerk/nextjs'
import './globals.css'
import NavBar from '@/components/feat/NavBar'
import { ThemeProvider } from "@/components/feat/ThemeProvider"
import { ptBR } from '@clerk/localizations'
import NavTrail from '@/components/feat/NavTrail'
import ServiceWorkerRegister from '@/components/feat/ServiceWorkerRegister'

export const metadata: Metadata = {
  title: 'Pet Track',
  description: 'Track your pet\'s health and wellness',
  manifest: '/manifest.json',
  themeColor: '#6766e6',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Pet Track',
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: 'Pet Track',
    title: 'Pet Track',
    description: 'Track your pet\'s health and wellness',
  },
  twitter: {
    card: 'summary',
    title: 'Pet Track',
    description: 'Track your pet\'s health and wellness',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    viewportFit: 'cover',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider 
      localization={ptBR}
    >
      <html suppressHydrationWarning lang="pt-BR" className='bg-background'>
        <body suppressHydrationWarning className='h-dvh flex flex-col'>
          <ServiceWorkerRegister />
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <div className='flex max-sm:flex-col sm:flex-row flex-1'>
              <SignedIn>
                <NavTrail />
              </SignedIn>
              <div className='flex flex-col flex-1'>
              {children}
              </div>
              <SignedIn>
                <NavBar />
              </SignedIn>
            </div>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
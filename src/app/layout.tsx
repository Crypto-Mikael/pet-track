import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
} from '@clerk/nextjs'
import './globals.css'
import NavBar from '@/components/feat/NavBar'
import { ThemeProvider } from "@/components/feat/ThemeProvider"
import { ptBR } from '@clerk/localizations'

export const metadata: Metadata = {
  title: 'Pet Track',
  description: 'Track your pet\'s health and wellness',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider localization={ptBR}>
      <html suppressHydrationWarning lang="pt-BR" className='bg-background'>
        <body suppressHydrationWarning className='flex  flex-col h-dvh'>
          <ThemeProvider 
            attribute="class" 
            defaultTheme="system" 
            enableSystem 
            disableTransitionOnChange
          >
            <div className='flex flex-col flex-1'>
            {children}
            </div>
            <SignedIn>
              <NavBar />
            </SignedIn>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
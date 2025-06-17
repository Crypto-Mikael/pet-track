import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'
import { dark } from '@clerk/themes'
import NavBar from '@/components/feat/NavBar'

export const metadata: Metadata = {
  title: 'Pet-Track',
  description: 'Track your pet\'s health and wellness',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider
    appearance={{
        baseTheme: dark,
      }}
      >
      <html lang="pt-BR">
        <body className='bg-background'>
          <SignedIn>
            <header className='flex items-center px-4 h-[10dvh] bg-primary'>
              <UserButton />
            </header>
            <NavBar />
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
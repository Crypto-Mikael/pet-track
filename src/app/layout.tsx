import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from '@clerk/nextjs'
import './globals.css'
import { dark } from '@clerk/themes'

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
        baseTheme: dark, // toggle this if you're using dark mode
      }}
      >
      <html lang="pt-BR">
        <body>
          <SignedIn>
            <header className='h-[10dvh]'>
              <UserButton />
            </header>
            <footer></footer>
          </SignedIn>
          {children}
        </body>
      </html>
    </ClerkProvider>
  )
}
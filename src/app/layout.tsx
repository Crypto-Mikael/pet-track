import type { Metadata } from 'next'
import {
  ClerkProvider,
  SignedIn,
  UserButton,
} from '@clerk/nextjs'
import { dark, neobrutalism, shadesOfPurple } from '@clerk/themes'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

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
        baseTheme: [neobrutalism],
        variables: { colorPrimary: 'blue' },
        signIn: {
          baseTheme: [shadesOfPurple],
          variables: { colorPrimary: 'green' },
        },
      }}
    >
      <html lang="en">
        <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
          <SignedIn>
            <header className=''>
              <UserButton />
            </header>
          </SignedIn>
          {children}
          <footer></footer>
        </body>
      </html>
    </ClerkProvider>
  )
}
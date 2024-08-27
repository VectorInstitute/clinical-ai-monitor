'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { AuthProvider } from './context/auth'
import { CombinedProvider } from './context/combined-provider'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <AuthProvider>
            <CombinedProvider>
              {children}
            </CombinedProvider>
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}

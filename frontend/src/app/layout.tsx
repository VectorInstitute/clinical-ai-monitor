'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ModelProvider } from './context/model'
import { EndpointProvider } from './context/endpoint'
import { AuthProvider } from './context/auth'

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
            <EndpointProvider>
              <ModelProvider>
                {children}
              </ModelProvider>
            </EndpointProvider>
          </AuthProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}

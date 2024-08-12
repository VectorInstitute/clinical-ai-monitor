'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import { ModelProvider } from './context/model'
import { EndpointProvider } from './context/endpoint';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <ChakraProvider>
            <EndpointProvider>
              <ModelProvider>
                {children}
              </ModelProvider>
            </EndpointProvider>
          </ChakraProvider>
        </SessionProvider>
      </body>
    </html>
  )
}

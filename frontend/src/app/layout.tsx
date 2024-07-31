'use client'

import { ChakraProvider } from '@chakra-ui/react'
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
        <ChakraProvider>
          <EndpointProvider>
            <ModelProvider>
              {children}
            </ModelProvider>
          </EndpointProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}

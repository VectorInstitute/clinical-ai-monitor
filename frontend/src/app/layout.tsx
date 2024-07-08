'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { ModelProvider } from './context/model'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider>
          <ModelProvider>
            {children}
          </ModelProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}

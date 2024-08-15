'use client'

import { ChakraProvider } from '@chakra-ui/react'
import { SessionProvider } from "next-auth/react"
import { ModelProvider } from './context/model'
import { EndpointProvider } from './context/endpoint';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ChakraProvider>
        <EndpointProvider>
          <ModelProvider>
            {children}
          </ModelProvider>
        </EndpointProvider>
      </ChakraProvider>
    </SessionProvider>
  )
}

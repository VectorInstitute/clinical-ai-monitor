// frontend/src/app/login/logo.tsx
import Image from 'next/image'
import { Box } from '@chakra-ui/react'

interface LogoProps {
  src: string
  alt: string
  width: number
  height: number
}

export default function Logo({ src, alt, width, height }: LogoProps) {
  return (
    <Box mb={4}>
      <Image src={src} alt={alt} width={width} height={height} />
    </Box>
  )
}

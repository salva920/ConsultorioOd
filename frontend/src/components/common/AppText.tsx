'use client'

import { Box, BoxProps } from '@chakra-ui/react'

interface AppTextProps extends BoxProps {
  children: React.ReactNode
}

export const AppText = ({ children, ...props }: AppTextProps) => {
  return (
    <Box as="span" {...props}>
      {children}
    </Box>
  )
} 
'use client'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useDisclosure,
  useColorModeValue,
  Stack,
  Text,
} from '@chakra-ui/react'
import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import { Link } from '@chakra-ui/next-js'
import { useAuth } from '../contexts/AuthContext'

interface NavLinkProps {
  children: React.ReactNode
  href: string
}

const NavLink = ({ children, href }: NavLinkProps) => (
  <Link
    px={2}
    py={1}
    rounded={'md'}
    _hover={{
      textDecoration: 'none',
      bg: useColorModeValue('gray.200', 'gray.700'),
    }}
    href={href}
  >
    {children}
  </Link>
)

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const { user, logout } = useAuth()

  return (
    <Box bg={useColorModeValue('white', 'gray.900')} px={4} boxShadow="sm">
      <Flex h={16} alignItems={'center'} justifyContent={'space-between'}>
        <IconButton
          size={'md'}
          icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
          aria-label={'Open Menu'}
          display={{ md: 'none' }}
          onClick={isOpen ? onClose : onOpen}
        />
        <HStack spacing={8} alignItems={'center'}>
          <Box>
            <Text fontSize="xl" fontWeight="bold" color="blue.500">
              Odontograma
            </Text>
          </Box>
          <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/pacientes">Pacientes</NavLink>
            <NavLink href="/citas">Citas</NavLink>
            <NavLink href="/odontograma">Odontograma</NavLink>
            <NavLink href="/inventario">Inventario</NavLink>
            <NavLink href="/recordatorios">Recordatorios</NavLink>
          </HStack>
        </HStack>
        <Flex alignItems={'center'}>
          <Menu>
            <MenuButton
              as={Button}
              rounded={'full'}
              variant={'link'}
              cursor={'pointer'}
              minW={0}
            >
              <Text>{user?.username || 'Usuario'}</Text>
            </MenuButton>
            <MenuList>
              <MenuItem>Perfil</MenuItem>
              <MenuItem>Configuración</MenuItem>
              <MenuItem onClick={logout}>Cerrar Sesión</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>

      {isOpen ? (
        <Box pb={4} display={{ md: 'none' }}>
          <Stack as={'nav'} spacing={4}>
            <NavLink href="/">Inicio</NavLink>
            <NavLink href="/pacientes">Pacientes</NavLink>
            <NavLink href="/citas">Citas</NavLink>
            <NavLink href="/odontograma">Odontograma</NavLink>
            <NavLink href="/inventario">Inventario</NavLink>
            <NavLink href="/recordatorios">Recordatorios</NavLink>
          </Stack>
        </Box>
      ) : null}
    </Box>
  )
} 
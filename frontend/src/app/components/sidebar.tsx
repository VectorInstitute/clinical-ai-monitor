'use client'
import React from 'react'
import {
  Box,
  Flex,
  Text,
  VStack,
  Icon,
  Link,
  useColorModeValue,
  Image,
  Drawer,
  DrawerContent,
  IconButton,
  useDisclosure,
  CloseButton,
  Tooltip,
} from '@chakra-ui/react'
import { FiHome, FiSettings, FiUser, FiMenu } from 'react-icons/fi'
import NextLink from 'next/link'

interface SidebarProps {
  hospitalName: string
}

const Sidebar: React.FC<SidebarProps> = ({ hospitalName }) => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  return (
    <Box>
      <SidebarContent
        hospitalName={hospitalName}
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
      />
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent hospitalName={hospitalName} onClose={onClose} />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
    </Box>
  )
}

interface SidebarContentProps extends SidebarProps {
  onClose: () => void
  display?: object
}

const SidebarContent: React.FC<SidebarContentProps> = ({ hospitalName, onClose, ...rest }) => {
  const bgColor = useColorModeValue('#b0caf5', '#1e3a5f')
  const textColor = useColorModeValue('#1e3a5f', '#e0e0e0')
  const borderColor = useColorModeValue('#8eb8f2', '#2c5282')

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="32" alignItems="center" mx="8" justifyContent="space-between">
        <Image
          src="/images/cyclops_logo-dark.png"
          alt="Clinical AI Monitor"
          width={64}
          height={16}
        />
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>
      <Flex alignItems="center" mx="8" mb="6" flexDirection="column">
        <Icon as={FiUser} fontSize="24" mb={2} color={textColor} />
        <Text fontWeight="medium" fontSize="sm" textAlign="center" color={textColor}>
          {hospitalName}
        </Text>
      </Flex>
      <NavItems textColor={textColor} />
      <Flex
        position="absolute"
        bottom="5"
        left="0"
        right="0"
        justifyContent="center"
        alignItems="center"
        flexDirection="column"
      >
        <Image
          src="/images/vector_logo.png"
          alt="Vector Institute"
          width={32}
          height={12}
          mb={2}
        />
        <Text fontSize="xs" color={textColor} textAlign="center" mt={2}>
          © {new Date().getFullYear()} Clinical AI Monitor. All rights reserved.
        </Text>
      </Flex>
    </Box>
  )
}

interface NavItemsProps {
  textColor: string
}

const NavItems: React.FC<NavItemsProps> = ({ textColor }) => {
  return (
    <VStack spacing={1} align="stretch">
      <NavItem icon={FiHome} href="/home" textColor={textColor}>Dashboard</NavItem>
      <NavItem icon={FiSettings} href="/configure" textColor={textColor}>Configure</NavItem>
    </VStack>
  )
}

interface NavItemProps {
  icon: React.ElementType
  children: React.ReactNode
  href: string
  textColor: string
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, href, textColor }) => {
  const bgHover = useColorModeValue('#8eb8f2', '#2c5282')
  const activeColor = useColorModeValue('#1e3a5f', '#ffffff')

  return (
    <Tooltip label={children} placement="right" hasArrow>
      <Link as={NextLink} href={href} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Flex
          align="center"
          p="4"
          mx="4"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          _hover={{
            bg: bgHover,
            color: activeColor,
          }}
          transition="all 0.3s"
        >
          <Icon
            mr="4"
            fontSize="16"
            as={icon}
            color={textColor}
            _groupHover={{
              color: activeColor,
            }}
          />
          <Text fontSize="sm" fontWeight="medium" color={textColor} _groupHover={{ color: activeColor }}>
            {children}
          </Text>
        </Flex>
      </Link>
    </Tooltip>
  )
}

interface MobileNavProps {
  onOpen: () => void
  display?: object
}

const MobileNav: React.FC<MobileNavProps> = ({ onOpen, ...rest }) => {
  const bgColor = useColorModeValue('#b0caf5', '#1e3a5f')
  const borderColor = useColorModeValue('#8eb8f2', '#2c5282')

  return (
    <Flex
      ml={{ base: 0, md: 60 }}
      px={{ base: 4, md: 24 }}
      height="20"
      alignItems="center"
      bg={bgColor}
      borderBottomWidth="1px"
      borderBottomColor={borderColor}
      justifyContent="flex-start"
      {...rest}
    >
      <IconButton
        variant="outline"
        onClick={onOpen}
        aria-label="open menu"
        icon={<FiMenu />}
      />

      <Image
        src="/images/cyclops_logo-dark.png"
        alt="Clinical AI Monitor"
        width={40}
        height={10}
        ml="4"
      />
    </Flex>
  )
}

export default Sidebar

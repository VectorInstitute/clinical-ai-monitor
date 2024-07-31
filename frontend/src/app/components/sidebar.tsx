'use client'
import React, { useState } from 'react'
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
  Tooltip,
} from '@chakra-ui/react'
import { FiHome, FiSettings, FiLogOut, FiMenu, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import NextLink from 'next/link'

const Sidebar = () => {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleSidebar = () => setIsCollapsed(!isCollapsed)

  return (
    <Box>
      <SidebarContent
        onClose={() => onClose}
        display={{ base: 'none', md: 'block' }}
        isCollapsed={isCollapsed}
        toggleSidebar={toggleSidebar}
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
          <SidebarContent onClose={onClose} isCollapsed={false} toggleSidebar={toggleSidebar} />
        </DrawerContent>
      </Drawer>
      <MobileNav display={{ base: 'flex', md: 'none' }} onOpen={onOpen} />
    </Box>
  )
}

interface SidebarContentProps {
  onClose: () => void
  isCollapsed: boolean
  toggleSidebar: () => void
  display?: object
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onClose, isCollapsed, toggleSidebar, ...rest }) => {
  const bgColor = useColorModeValue('#b0caf5', '#1e3a5f')
  const textColor = useColorModeValue('#1e3a5f', '#e0e0e0')
  const borderColor = useColorModeValue('#8eb8f2', '#2c5282')
  const toggleBtnBgColor = useColorModeValue('#8eb8f2', '#2c5282')

  return (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={isCollapsed ? '60px' : { base: 'full', md: '240px' }}
      pos="fixed"
      h="full"
      transition="width 0.3s ease"
      {...rest}
    >
      <Flex direction="column" h="full">
        <Flex h="20" alignItems="center" mx="8" justifyContent="space-between" mb={8}>
          {!isCollapsed && (
            <Image
              src="/images/cyclops_logo-dark.png"
              alt="Clinical AI Monitor"
              width={64}
              height={16}
            />
          )}
        </Flex>
        <VStack spacing={4} align="stretch" flex={1}>
          <NavItems textColor={textColor} isCollapsed={isCollapsed} />
        </VStack>
        <Flex
          direction="column"
          alignItems="center"
          mt={4}
          mb={4}
        >
          {!isCollapsed && (
            <>
              <Image
                src="/images/vector_logo.png"
                alt="Vector Institute"
                width={32}
                height={12}
                mb={2}
              />
              <Text fontSize="xs" color={textColor} textAlign="center" mt={2} mb={4}>
                © {new Date().getFullYear()} Clinical AI Monitor. All rights reserved.
              </Text>
            </>
          )}
          <Tooltip label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"} placement="right" hasArrow>
            <IconButton
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              icon={isCollapsed ? <FiChevronRight /> : <FiChevronLeft />}
              onClick={toggleSidebar}
              variant="solid"
              bg={toggleBtnBgColor}
              color={textColor}
              size="sm"
              _hover={{
                bg: useColorModeValue('#7aa7e0', '#3a6491'),
              }}
            />
          </Tooltip>
        </Flex>
      </Flex>
    </Box>
  )
}

interface NavItemsProps {
  textColor: string
  isCollapsed: boolean
}

const NavItems: React.FC<NavItemsProps> = ({ textColor, isCollapsed }) => {
  return (
    <>
      <NavItem icon={FiHome} href="/home" textColor={textColor} isCollapsed={isCollapsed}>Dashboard</NavItem>
      <NavItem icon={FiSettings} href="/configure" textColor={textColor} isCollapsed={isCollapsed}>Configure</NavItem>
      <NavItem icon={FiLogOut} href="/logout" textColor={textColor} isCollapsed={isCollapsed}>Logout</NavItem>
    </>
  )
}

interface NavItemProps {
  icon: React.ElementType
  children: React.ReactNode
  href: string
  textColor: string
  isCollapsed: boolean
}

const NavItem: React.FC<NavItemProps> = ({ icon, children, href, textColor, isCollapsed }) => {
  const bgHover = useColorModeValue('#8eb8f2', '#2c5282')
  const activeColor = useColorModeValue('#1e3a5f', '#ffffff')

  return (
    <Tooltip label={isCollapsed ? children : ''} placement="right" hasArrow>
      <Link as={NextLink} href={href} style={{ textDecoration: 'none' }} _focus={{ boxShadow: 'none' }}>
        <Flex
          align="center"
          p="4"
          mx={isCollapsed ? '2' : '4'}
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
            mr={isCollapsed ? '0' : '4'}
            fontSize="20"
            as={icon}
            color={textColor}
            _groupHover={{
              color: activeColor,
            }}
          />
          {!isCollapsed && (
            <Text fontSize="sm" fontWeight="medium" color={textColor} _groupHover={{ color: activeColor }}>
              {children}
            </Text>
          )}
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

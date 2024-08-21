'use client'

import React, { useState, useEffect } from 'react';
import {
  Box, VStack, Heading, Text, Button, FormControl, FormLabel, Input, useToast,
  Container, useColorModeValue, Flex, Divider, Badge, Table, Thead, Tbody, Tr, Th, Td,
  Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
  useDisclosure, Select
} from '@chakra-ui/react';
import { useAuth } from '../context/auth';
import Sidebar from '../components/sidebar';
import { withAuth } from '../components/with-auth';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState({ username: '', email: '', password: '', role: 'viewer' });
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');
  const dividerColor = useColorModeValue('gray.200', 'gray.700');

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchUsers();
    }
  }, [user]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
      }
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({
        title: "New passwords don't match",
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      await updatePassword(currentPassword, newPassword);
      toast({
        title: 'Password updated successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      toast({
        title: 'Failed to update password',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        const data = await response.json();
        toast({
          title: 'User created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        onClose();
        fetchUsers();
        setNewUser({ username: '', email: '', password: '', role: 'viewer' });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }
    } catch (error) {
      toast({
        title: 'Failed to create user',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async (userId: number) => {
    if (userId === user?.id) {
      toast({
        title: 'Cannot delete your own account',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        toast({
          title: 'User deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchUsers();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }
    } catch (error) {
      toast({
        title: 'Failed to delete user',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'viewer':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <Flex minHeight="100vh" bg={bgColor}>
      <Sidebar />
      <Box flex={1} ml={{ base: 0, md: 60 }} transition="margin-left 0.3s">
        <Container maxW="container.xl" py={8}>
          <VStack spacing={8} align="stretch">
            <Box bg={cardBgColor} p={8} borderRadius="lg" shadow="md">
              <Heading as="h1" size="xl" color={textColor} mb={4}>User Profile</Heading>
              <Text fontSize="lg" color={useColorModeValue('gray.600', 'gray.400')} mb={6}>
                Manage your account information and security settings.
              </Text>
            </Box>
            <Divider borderColor={dividerColor} />
            <Box bg={cardBgColor} p={8} borderRadius="lg" shadow="md">
              <VStack spacing={6} align="stretch">
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={textColor}>Username:</Text>
                  <Text fontSize="md" color={textColor}>{user?.username}</Text>
                </Box>
                <Box>
                  <Text fontSize="lg" fontWeight="bold" color={textColor} mb={2}>Role:</Text>
                  <Badge colorScheme={getRoleBadgeColor(user?.role || '')} fontSize="md" px={2} py={1}>
                    {user?.role}
                  </Badge>
                </Box>
                <Divider borderColor={dividerColor} />
                <Heading as="h3" size="md" color={textColor}>Change Password</Heading>
                <form onSubmit={handlePasswordUpdate}>
                  <VStack spacing={4}>
                    <FormControl id="current-password" isRequired>
                      <FormLabel color={textColor}>Current Password</FormLabel>
                      <Input
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    <FormControl id="new-password" isRequired>
                      <FormLabel color={textColor}>New Password</FormLabel>
                      <Input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    <FormControl id="confirm-password" isRequired>
                      <FormLabel color={textColor}>Confirm New Password</FormLabel>
                      <Input
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </FormControl>
                    <Button type="submit" colorScheme="blue" width="full">
                      Update Password
                    </Button>
                  </VStack>
                </form>
              </VStack>
            </Box>
            {user?.role === 'admin' && (
              <Box bg={cardBgColor} p={8} borderRadius="lg" shadow="md">
                <Heading as="h3" size="md" color={textColor} mb={4}>User Management</Heading>
                <Button colorScheme="green" mb={4} onClick={onOpen}>Create New User</Button>
                <Table variant="simple">
                  <Thead>
                    <Tr>
                      <Th>Username</Th>
                      <Th>Email</Th>
                      <Th>Role</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {users.map((u) => (
                      <Tr key={u.id}>
                        <Td>{u.username}</Td>
                        <Td>{u.email}</Td>
                        <Td>
                          <Badge colorScheme={getRoleBadgeColor(u.role)}>{u.role}</Badge>
                        </Td>
                        <Td>
                          <Button
                            colorScheme="red"
                            size="sm"
                            onClick={() => handleDeleteUser(u.id)}
                            isDisabled={u.id === user.id}
                          >
                            Delete
                          </Button>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </Box>
            )}
          </VStack>
        </Container>
      </Box>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New User</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl isRequired>
                <FormLabel>Username</FormLabel>
                <Input
                  value={newUser.username}
                  onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  type="email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Password</FormLabel>
                <Input
                  type="password"
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                />
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Role</FormLabel>
                <Select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                >
                  <option value="viewer">Viewer</option>
                  <option value="admin">Admin</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button colorScheme="blue" mr={3} onClick={handleCreateUser}>
              Create
            </Button>
            <Button variant="ghost" onClick={onClose}>Cancel</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default withAuth(ProfilePage);

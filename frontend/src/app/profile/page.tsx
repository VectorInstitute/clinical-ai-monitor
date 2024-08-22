'use client'

import React, { useState, useCallback, useEffect } from 'react';
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

interface NewUser {
  username: string;
  email: string;
  password: string;
  role: string;
}

const INITIAL_NEW_USER: NewUser = { username: '', email: '', password: '', role: 'viewer' };

const ProfilePage: React.FC = () => {
  const { user, updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<NewUser>(INITIAL_NEW_USER);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const cardBgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'gray.100');

  const fetchUsers = useCallback(async () => {
    if (user?.role !== 'admin') return;

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      const response = await fetch('/api/users', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (error) {
      toast({
        title: 'Error fetching users',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  }, [user?.role, toast]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to create user');
      }

      await response.json();
      toast({
        title: 'User created successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      onClose();
      fetchUsers();
      setNewUser(INITIAL_NEW_USER);
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to delete user');
      }

      toast({
        title: 'User deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
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

  const getRoleBadgeColor = (role: string): string => {
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
    <Flex>
      <Sidebar />
      <Box flex={1} bg={bgColor} p={8}>
        <Container maxW="container.xl">
          <VStack spacing={8} align="stretch">
            <Heading as="h1" size="xl" color={textColor}>User Profile</Heading>
            <Text color={textColor}>Manage your account information and security settings.</Text>

            <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="md">
              <VStack spacing={4} align="stretch">
                <Heading as="h2" size="lg" color={textColor}>Account Information</Heading>
                <Text><strong>Username:</strong> {user?.username}</Text>
                <Text>
                  <strong>Role:</strong>{' '}
                  <Badge colorScheme={getRoleBadgeColor(user?.role || '')}>{user?.role}</Badge>
                </Text>
              </VStack>
            </Box>

            <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="md">
              <form onSubmit={handlePasswordUpdate}>
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="lg" color={textColor}>Change Password</Heading>
                  <FormControl>
                    <FormLabel>Current Password</FormLabel>
                    <Input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>New Password</FormLabel>
                    <Input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </FormControl>
                  <FormControl>
                    <FormLabel>Confirm New Password</FormLabel>
                    <Input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                  </FormControl>
                  <Button type="submit" colorScheme="blue">Update Password</Button>
                </VStack>
              </form>
            </Box>

            {user?.role === 'admin' && (
              <Box bg={cardBgColor} p={6} borderRadius="md" boxShadow="md">
                <VStack spacing={4} align="stretch">
                  <Heading as="h2" size="lg" color={textColor}>User Management</Heading>
                  <Button onClick={onOpen} colorScheme="green">Create New User</Button>
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
                </VStack>
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
          <form onSubmit={handleCreateUser}>
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Username</FormLabel>
                  <Input
                    value={newUser.username}
                    onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Email</FormLabel>
                  <Input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Password</FormLabel>
                  <Input
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  />
                </FormControl>
                <FormControl>
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
              <Button type="submit" colorScheme="blue" mr={3}>Create</Button>
              <Button onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>
    </Flex>
  );
};

export default withAuth(ProfilePage);

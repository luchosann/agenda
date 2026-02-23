import { describe, expect, it, beforeAll, afterAll } from '@jest/globals'
import prisma from '../prisma/client'
import * as userServices from '../services/user.services'

describe('User service', () => {
  let userId: string;

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('createUser', () => {
    it('should create a user', async () => {
      const data = {
        name: 'Test User',
        email: 'testuser@example.com',
        password: '123456'
      };
      const user = await userServices.createUser(data);
      userId = user.id;

      expect(user).toHaveProperty('id');
      expect(user.email).toBe(data.email);
    });
  });

  describe('getUserById', () => {
    it('should return user by id', async () => {
      const user = await userServices.getUserById(userId);
      expect(user).not.toBeNull();
      expect(user?.id).toBe(userId);
    });
  });

  describe('getAllUsers', () => {
    it('should return an array of users', async () => {
      const users = await userServices.getAllUsers();
      expect(Array.isArray(users)).toBe(true);
      expect(users.length).toBeGreaterThan(0);
    });
  });

  describe('updateUser', () => {
    it('should update user data', async () => {
      const updatedName = 'Updated Test User';
      const user = await userServices.updateUser(userId, { name: updatedName });
      expect(user.name).toBe(updatedName);
    });
  });

  describe('deleteUser', () => {
    it('should delete the user', async () => {
      const user = await userServices.deleteUser(userId);
      expect(user.id).toBe(userId);

      const deletedUser = await userServices.getUserById(userId);
      expect(deletedUser).toBeNull();
    });
  });
});

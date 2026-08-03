import { jest } from '@jest/globals';
import type { ObjectLiteral, Repository } from 'typeorm';
import type { MockType } from '../mock.utils';

export type MockRepository<T extends ObjectLiteral> = MockType<Repository<T>>;

export const repositoryMockFactory: () => MockRepository<any> = jest.fn(() => ({
  create: jest.fn(),
  update: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findAndCount: jest.fn(),
  findBy: jest.fn(),
  findOne: jest.fn(),
  findOneBy: jest.fn(),
  delete: jest.fn(),
  count: jest.fn(),
}));

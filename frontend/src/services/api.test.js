import {
  authService,
  transactionService,
  budgetService,
  categoryService,
} from './api';

// Mock de axios completo
jest.mock('axios', () => {
  const mockApi = {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    create: jest.fn(() => mockApi),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  };
  return {
    __esModule: true,
    default: mockApi,
  };
});

const axios = require('axios');
const mockApi = axios.default;

describe('API Services', () => {
  beforeEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });

  describe('authService', () => {
    it('debe registrar usuario', async () => {
      const userData = {
        email: 'test@test.com',
        password: 'Pass123',
        fullName: 'Test',
      };
      const response = {
        data: { token: 'token123', user: { id: 1, ...userData } },
      };

      mockApi.post.mockResolvedValue(response);
      const result = await authService.register(userData);

      expect(result.token).toBe('token123');
      expect(localStorage.getItem('token')).toBe('token123');
    });

    it('debe hacer login', async () => {
      const credentials = { email: 'test@test.com', password: 'Pass123' };
      const response = {
        data: { token: 'token456', user: { id: 1, email: credentials.email } },
      };

      mockApi.post.mockResolvedValue(response);
      const result = await authService.login(credentials);

      expect(result.token).toBe('token456');
      expect(localStorage.getItem('token')).toBe('token456');
    });

    it('debe hacer logout', () => {
      localStorage.setItem('token', 'test-token');
      localStorage.setItem('user', JSON.stringify({ id: 1 }));

      authService.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('debe obtener usuario actual', () => {
      const user = { id: 1, email: 'test@test.com' };
      localStorage.setItem('user', JSON.stringify(user));

      const result = authService.getCurrentUser();
      expect(result).toEqual(user);
    });
  });

  describe('transactionService', () => {
    it('debe obtener todas las transacciones', async () => {
      const transactions = [{ id: 1, amount: 100, description: 'Test' }];
      mockApi.get.mockResolvedValue({ data: transactions });

      const result = await transactionService.getAll();
      expect(result).toEqual(transactions);
    });

    it('debe crear transacción', async () => {
      const transaction = { amount: 100, description: 'Test', type: 'expense' };
      mockApi.post.mockResolvedValue({ data: { id: 1, ...transaction } });

      const result = await transactionService.create(transaction);
      expect(result.id).toBe(1);
    });

    it('debe actualizar transacción', async () => {
      const updated = { id: 1, amount: 150 };
      mockApi.put.mockResolvedValue({ data: updated });

      const result = await transactionService.update(1, { amount: 150 });
      expect(result.amount).toBe(150);
    });

    it('debe eliminar transacción', async () => {
      mockApi.delete.mockResolvedValue({ data: { message: 'Deleted' } });

      const result = await transactionService.delete(1);
      expect(result.message).toBe('Deleted');
    });
  });

  describe('budgetService', () => {
    it('debe obtener todos los presupuestos', async () => {
      const budgets = [{ id: 1, amount: 500, month: 1, year: 2024 }];
      mockApi.get.mockResolvedValue({ data: budgets });

      const result = await budgetService.getAll();
      expect(result).toEqual(budgets);
    });

    it('debe crear/actualizar presupuesto', async () => {
      const budget = { amount: 500, categoryId: 1, month: 1, year: 2024 };
      mockApi.post.mockResolvedValue({ data: { id: 1, ...budget } });

      const result = await budgetService.upsert(budget);
      expect(result.id).toBe(1);
    });

    it('debe obtener análisis', async () => {
      const analysis = { budgets: [], summary: {} };
      mockApi.get.mockResolvedValue({ data: analysis });

      const result = await budgetService.getAnalysis(1, 2024);
      expect(result).toEqual(analysis);
    });

    it('debe eliminar presupuesto', async () => {
      mockApi.delete.mockResolvedValue({ data: { message: 'Deleted' } });

      const result = await budgetService.delete(1);
      expect(result.message).toBe('Deleted');
    });
  });

  describe('categoryService', () => {
    it('debe obtener todas las categorías', async () => {
      const categories = [{ id: 1, name: 'Food', type: 'expense' }];
      mockApi.get.mockResolvedValue({ data: categories });

      const result = await categoryService.getAll();
      expect(result).toEqual(categories);
    });
  });
});

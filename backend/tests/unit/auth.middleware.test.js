const jwt = require('jsonwebtoken');
const authMiddleware = require('../../middleware/auth');

describe('Auth Middleware - Unit Tests', () => {
  let req, res, next;

  beforeEach(() => {
    // Mock de request, response y next
    req = {
      headers: {},
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();

    // Configurar JWT_SECRET para testing
    process.env.JWT_SECRET = 'test-secret-key';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Token validation', () => {
    test('debe rechazar request sin token', () => {
      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado. Token no proporcionado.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debe rechazar request con header de autorización vacío', () => {
      req.headers.authorization = '';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Acceso denegado. Token no proporcionado.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debe rechazar token inválido', () => {
      req.headers.authorization = 'Bearer invalid-token';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debe rechazar token expirado', () => {
      const expiredToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
        expiresIn: '-1h',
      });
      req.headers.authorization = `Bearer ${expiredToken}`;

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Token inválido o expirado.',
      });
      expect(next).not.toHaveBeenCalled();
    });

    test('debe aceptar token válido y llamar next()', () => {
      const validToken = jwt.sign({ userId: 123 }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      expect(req.userId).toBe(123);
      expect(next).toHaveBeenCalled();
      expect(res.status).not.toHaveBeenCalled();
      expect(res.json).not.toHaveBeenCalled();
    });

    test('debe extraer userId correcto del token', () => {
      const testUserId = 456;
      const validToken = jwt.sign(
        { userId: testUserId },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      expect(req.userId).toBe(testUserId);
      expect(next).toHaveBeenCalled();
    });

    test('debe manejar formato de autorización incorrecto', () => {
      req.headers.authorization = 'InvalidFormat token123';

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });

    test('debe manejar Authorization sin Bearer prefix', () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      req.headers.authorization = validToken;

      authMiddleware(req, res, next);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    test('debe manejar token con espacios extras', () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });
      req.headers.authorization = `Bearer  ${validToken}  `;

      authMiddleware(req, res, next);

      // Dependiendo de la implementación, esto podría fallar
      // Este test ayuda a identificar si hay un bug
      expect(res.status).toHaveBeenCalledWith(401);
    });

    test('debe manejar headers con diferentes casos (authorization vs Authorization)', () => {
      const validToken = jwt.sign({ userId: 1 }, process.env.JWT_SECRET, {
        expiresIn: '24h',
      });

      // Express normaliza los headers a lowercase
      req.headers.authorization = `Bearer ${validToken}`;

      authMiddleware(req, res, next);

      expect(next).toHaveBeenCalled();
      expect(req.userId).toBe(1);
    });
  });
});

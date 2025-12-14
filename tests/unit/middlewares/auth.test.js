import jwt from 'jsonwebtoken';
import { authMiddleware, requireAdmin, validateApiKey } from '../../../src/middlewares/auth.js';

// Mock the JWT_SECRET - we'll use a test secret
const JWT_SECRET = 'test-secret-key-12345';

// Mock the API_KEY
const API_KEY = 'test-api-key-12345';

// Mock jsonwebtoken
jest.mock('jsonwebtoken');

// Mock the config/env module
jest.mock('../../../src/config/env.js', () => ({
  JWT_SECRET: 'test-secret-key-12345',
  API_KEY: 'test-api-key-12345',
}));

describe('Middleware - Auth Functions', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      headers: {
        authorization: 'Bearer valid-token',
      },
      path: '/some-path',
      user: null,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
    jest.clearAllMocks();
  });

  describe('authMiddleware', () => {
    describe('Test environment - public routes', () => {
      it('should allow access to /login without token in test mode', () => {
        process.env.NODE_ENV = 'test';
        req.path = '/login';
        req.headers = {}; // No token

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Public routes - no auth required', () => {
      it('should allow access to /post/page without token', () => {
        process.env.NODE_ENV = 'production';
        req.path = '/post/page';
        req.headers = {};

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should allow access to /post/public/* routes without token', () => {
        process.env.NODE_ENV = 'production';
        req.path = '/post/public/some-id';
        req.headers = {};

        authMiddleware(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Missing token', () => {
      it('should return 401 error when token is missing', () => {
        req.path = '/protected-route';
        req.headers = {}; // No authorization header

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error when authorization header is empty', () => {
        req.path = '/protected-route';
        req.headers.authorization = '';

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error when authorization header has no Bearer token', () => {
        req.path = '/protected-route';
        req.headers.authorization = 'InvalidFormat';

        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Valid token', () => {
      it('should attach decoded token to req.user and call next on valid token', () => {
        const decodedUser = {
          userId: 1,
          userName: 'testuser',
          email: 'test@example.com',
          is_admin: false,
        };
        jwt.verify.mockReturnValueOnce(decodedUser);

        req.path = '/protected-route';
        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith('valid-token', JWT_SECRET);
        expect(req.user).toEqual(decodedUser);
        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should attach admin user data when is_admin is true', () => {
        const decodedUser = {
          userId: 2,
          userName: 'adminuser',
          email: 'admin@example.com',
          is_admin: true,
        };
        jwt.verify.mockReturnValueOnce(decodedUser);

        req.path = '/admin-route';
        authMiddleware(req, res, next);

        expect(req.user).toEqual(decodedUser);
        expect(req.user.is_admin).toBe(true);
        expect(next).toHaveBeenCalled();
      });
    });

    describe('Invalid token', () => {
      it('should return 401 error on jwt.verify failure (invalid signature)', () => {
        jwt.verify.mockImplementationOnce(() => {
          throw new Error('invalid signature');
        });

        req.path = '/protected-route';
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error on jwt.verify failure (token expired)', () => {
        jwt.verify.mockImplementationOnce(() => {
          const err = new Error('jwt expired');
          err.name = 'TokenExpiredError';
          throw err;
        });

        req.path = '/protected-route';
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error on jwt.verify failure (malformed token)', () => {
        jwt.verify.mockImplementationOnce(() => {
          throw new Error('Unexpected token');
        });

        req.path = '/protected-route';
        authMiddleware(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token inválido' });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Token extraction from Authorization header', () => {
      it('should extract token from "Bearer <token>" format', () => {
        const token = 'my-test-token-123';
        jwt.verify.mockReturnValueOnce({ userId: 1 });
        req.headers.authorization = `Bearer ${token}`;
        req.path = '/protected-route';

        authMiddleware(req, res, next);

        expect(jwt.verify).toHaveBeenCalledWith(token, JWT_SECRET);
      });

      it('should handle Bearer token with extra spaces gracefully', () => {
        const token = 'my-test-token-123';
        req.headers.authorization = `Bearer  ${token}`;  // Two spaces
        req.path = '/protected-route';

        authMiddleware(req, res, next);

        // Split produces ['Bearer', '', 'my-test-token-123'], so [1] is empty string
        // Empty token fails the if (!token) check and returns "Token requerido"
        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ error: 'Token requerido' });
      });
    });
  });

  describe('requireAdmin', () => {
    beforeAll(() => {
      // Suppress console.log during requireAdmin tests
      jest.spyOn(console, 'log').mockImplementation(() => {});
    });

    afterAll(() => {
      console.log.mockRestore();
    });

    describe('Admin access granted', () => {
      it('should call next when user is admin', () => {
        req.user = {
          userId: 1,
          is_admin: true,
        };

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });

      it('should call next for admin user with other properties', () => {
        req.user = {
          userId: 2,
          userName: 'adminuser',
          email: 'admin@example.com',
          is_admin: true,
        };

        requireAdmin(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('Admin access denied', () => {
      it('should return 403 error when user is not admin', () => {
        req.user = {
          userId: 1,
          is_admin: false,
        };

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Solo administradores' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 error when is_admin is missing', () => {
        req.user = {
          userId: 1,
        };

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Solo administradores' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 error when user object is null', () => {
        req.user = null;

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Solo administradores' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 error when user object is undefined', () => {
        req.user = undefined;

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Solo administradores' });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 403 error when is_admin is 0 (falsy number)', () => {
        req.user = {
          userId: 1,
          is_admin: 0,
        };

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ error: 'Solo administradores' });
      });
    });

    describe('Edge cases', () => {
      it('should handle req.user being an empty object', () => {
        req.user = {};

        requireAdmin(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
      });
    });
  });

  describe('validateApiKey', () => {
    beforeEach(() => {
      req.headers = {};
      process.env.NODE_ENV = 'production';
    });

    describe('Test environment bypass', () => {
      it('should bypass validation when NODE_ENV is "test"', () => {
        process.env.NODE_ENV = 'test';
        req.headers['x-api-key'] = 'invalid-key';

        validateApiKey(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Valid API Key', () => {
      it('should call next when valid API Key is provided', () => {
        req.headers['x-api-key'] = API_KEY;

        validateApiKey(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
      });
    });

    describe('Missing API Key', () => {
      it('should return 401 error when x-api-key header is missing', () => {
        req.headers = {}; // No x-api-key

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error when x-api-key is empty string', () => {
        req.headers['x-api-key'] = '';

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error when x-api-key is null', () => {
        req.headers['x-api-key'] = null;

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Invalid API Key', () => {
      it('should return 401 error when API Key is invalid', () => {
        req.headers['x-api-key'] = 'wrong-api-key';

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error for API Key with typo', () => {
        req.headers['x-api-key'] = 'test-api-key-1234'; // Missing last char

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error for API Key with different case', () => {
        req.headers['x-api-key'] = 'TEST-API-KEY-12345'; // Wrong case

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });

      it('should return 401 error for API Key with extra spaces', () => {
        req.headers['x-api-key'] = ` ${API_KEY} `; // With spaces

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({
          error: 'API Key inválida o no proporcionada',
        });
        expect(next).not.toHaveBeenCalled();
      });
    });

    describe('Header case sensitivity', () => {
      it('should work with lowercase x-api-key header', () => {
        req.headers['x-api-key'] = API_KEY;

        validateApiKey(req, res, next);

        expect(next).toHaveBeenCalled();
      });
    });

    describe('Edge cases', () => {
      it('should handle API Key as number', () => {
        req.headers['x-api-key'] = 12345; // Number instead of string

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
      });

      it('should handle API Key with special characters', () => {
        req.headers['x-api-key'] = 'test!@#$%^&*()';

        validateApiKey(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
      });
    });
  });
});

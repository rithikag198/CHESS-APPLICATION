const request = require('supertest');
const express = require('express');

// Basic test to ensure CI/CD pipeline works
describe('Chess Application Basic Tests', () => {
  test('should pass basic test', () => {
    expect(true).toBe(true);
  });

  test('should have required dependencies', () => {
    const express = require('express');
    expect(typeof express).toBe('function');
  });

  test('should load chess.js library', () => {
    const Chess = require('chess.js');
    expect(typeof Chess).toBe('object');
    expect(typeof Chess.Chess).toBe('function');
  });
});

// Basic server test
describe('Server Basic Tests', () => {
  let app;

  beforeAll(() => {
    app = express();
    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'OK' });
    });
  });

  test('should respond to health check', async () => {
    const response = await request(app)
      .get('/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});

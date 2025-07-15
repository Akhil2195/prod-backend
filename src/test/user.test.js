import request from 'supertest';
import { app } from '../app.js';

describe('User API', () => {
  test(
    'should return a string username and tokens',
    async () => {
      const response = await request(app)
        .post('/api/v1/auth/login')
        .set('Content-Type', 'application/json') // Explicitly set content-type
        .send({
          email: 'raishetti1234@yopmail.com',
          password: 'Admin@1234',
        });

      // ✅ Assert success
      expect(response.statusCode).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('User logged In Successfully');

      // ✅ Assert token structure
      const { user, accessToken, refreshToken } = response.body.data;
      expect(typeof user.name).toBe('string');
      expect(typeof user.email).toBe('string');
      expect(typeof accessToken).toBe('string');
      expect(typeof refreshToken).toBe('string');
    },
    15000 // optional timeout
  );
});

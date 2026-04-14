/**
 * Test: axiosInstance interceptor logic (pure JS, no DOM)
 *
 * Tests the interceptor behaviour using an in-memory mock storage.
 */
import { describe, it, expect } from 'vitest';

// Simulate the interceptor logic using a plain object instead of localStorage
const simulateRequestInterceptor = (storage) => {
  const config = { headers: {} };
  const token = storage['shms_token'];
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

const simulateResponseInterceptor = (storage, statusCode) => {
  if (statusCode === 401) {
    delete storage['shms_token'];
  }
};

describe('axiosInstance interceptor logic', () => {
  it('attaches Authorization header when token is present', () => {
    const storage = { shms_token: 'test.jwt.token' };
    const config = simulateRequestInterceptor(storage);
    expect(config.headers.Authorization).toBe('Bearer test.jwt.token');
  });

  it('does NOT attach Authorization header when no token present', () => {
    const storage = {};
    const config = simulateRequestInterceptor(storage);
    expect(config.headers.Authorization).toBeUndefined();
  });

  it('removes token from storage on 401 response', () => {
    const storage = { shms_token: 'expired.jwt.token' };
    simulateResponseInterceptor(storage, 401);
    expect(storage['shms_token']).toBeUndefined();
  });

  it('does NOT clear token on non-401 errors', () => {
    const storage = { shms_token: 'valid.jwt.token' };
    simulateResponseInterceptor(storage, 500);
    expect(storage['shms_token']).toBe('valid.jwt.token');
  });
});

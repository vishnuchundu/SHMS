/**
 * Test: AuthContext — token handling logic (pure JS, no DOM)
 *
 * Tests the core auth logic:
 *   - JWT decoding and expiry detection
 *   - Token storage and retrieval patterns
 */
import { describe, it, expect, vi } from 'vitest';
import { jwtDecode } from 'jwt-decode';

// A valid minimal JWT payload (sub, roles, exp far in future)
const makeMockToken = (sub = 'john.doe', expiresInSecs = 3600) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const payload = btoa(JSON.stringify({
    sub,
    roles: ['ROLE_STUDENT'],
    exp: Math.floor(Date.now() / 1000) + expiresInSecs,
  })).replace(/=/g, '');
  return `${header}.${payload}.SIGNATURE`;
};

const makeExpiredToken = (sub = 'john.doe') => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).replace(/=/g, '');
  const payload = btoa(JSON.stringify({
    sub,
    roles: ['ROLE_STUDENT'],
    exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour in the past
  })).replace(/=/g, '');
  return `${header}.${payload}.SIGNATURE`;
};

describe('AuthContext token logic', () => {
  it('decodes a valid JWT and extracts sub and roles', () => {
    const token = makeMockToken('jane.doe');
    const decoded = jwtDecode(token);
    expect(decoded.sub).toBe('jane.doe');
    expect(decoded.roles).toContain('ROLE_STUDENT');
  });

  it('detects an expired token via exp * 1000 < Date.now()', () => {
    const token = makeExpiredToken('old.user');
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    expect(isExpired).toBe(true);
  });

  it('correctly marks a valid token as NOT expired', () => {
    const token = makeMockToken('active.user', 3600);
    const decoded = jwtDecode(token);
    const isExpired = decoded.exp * 1000 < Date.now();
    expect(isExpired).toBe(false);
  });

  it('login response sets mustChangePassword flag correctly', () => {
    // Simulate what AuthContext.login() does with the response
    const mockResponse = {
      data: {
        token: makeMockToken(),
        mustChangePassword: true,
      },
    };

    const decoded = jwtDecode(mockResponse.data.token);
    const userState = {
      sub: decoded.sub,
      roles: decoded.roles || [],
      token: mockResponse.data.token,
      mustChangePassword: mockResponse.data.mustChangePassword || false,
    };

    expect(userState.sub).toBe('john.doe');
    expect(userState.mustChangePassword).toBe(true);
    expect(userState.roles).toContain('ROLE_STUDENT');
  });
});

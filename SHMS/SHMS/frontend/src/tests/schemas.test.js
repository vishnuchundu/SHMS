/**
 * Test: Zod Validation Schemas
 *
 * Pure logic tests — no rendering required.
 * Validates the loginSchema directly and documents its boundary rules.
 */
import { describe, it, expect } from 'vitest';
import { z } from 'zod';

// Re-define the schema here (same as LoginPage) — tests document the contract
const loginSchema = z.object({
  username: z.string().min(3, 'Username explicitly required mapped to your registered parameters.'),
  password: z.string().min(5, 'Password validation boundary dictates 5 characters minimum.'),
});

// Change-password schema (same as ChangePasswordPage)
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required.'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match.",
  path: ['confirmPassword'],
});

describe('loginSchema', () => {
  it('passes with valid credentials', () => {
    const result = loginSchema.safeParse({ username: 'john.doe', password: 'Welcome@123' });
    expect(result.success).toBe(true);
  });

  it('fails when username is fewer than 3 characters', () => {
    const result = loginSchema.safeParse({ username: 'ab', password: 'Welcome@123' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('explicitly required');
  });

  it('fails when password is fewer than 5 characters', () => {
    const result = loginSchema.safeParse({ username: 'john.doe', password: 'abc' });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('5 characters minimum');
  });

  it('fails when both fields are empty', () => {
    const result = loginSchema.safeParse({ username: '', password: '' });
    expect(result.success).toBe(false);
    expect(result.error.issues.length).toBeGreaterThanOrEqual(2);
  });

  it('exactly passes at boundary — 3 char username, 5 char password', () => {
    const result = loginSchema.safeParse({ username: 'abc', password: 'abcde' });
    expect(result.success).toBe(true);
  });
});

describe('changePasswordSchema', () => {
  it('passes with valid matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass1',
      newPassword: 'NewSecure@1',
      confirmPassword: 'NewSecure@1',
    });
    expect(result.success).toBe(true);
  });

  it('fails when new password is fewer than 6 characters', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass1',
      newPassword: 'abc',
      confirmPassword: 'abc',
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('6 characters');
  });

  it('fails when passwords do not match', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'OldPass1',
      newPassword: 'NewSecure@1',
      confirmPassword: 'DifferentPass@1',
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain("don't match");
  });

  it('fails when currentPassword is empty', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'NewSecure@1',
      confirmPassword: 'NewSecure@1',
    });
    expect(result.success).toBe(false);
  });
});

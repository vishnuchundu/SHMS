/**
 * Test: Login Form Validation & Behaviour
 *
 * Tests the LoginPage component's form:
 *   - Inline Zod validation errors appear without submitting to the API
 *   - Successful login calls the AuthContext `login` function
 *   - API error messages are shown to the user
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LoginPage } from '../pages/LoginPage';

// --- Mock AuthContext so no real auth happens ---
const mockLogin = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: mockLogin }),
}));

// --- Mock react-router-dom (LoginPage doesn't use it directly but deps might) ---
vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders username and password inputs', () => {
    render(<LoginPage />);
    expect(screen.getByPlaceholderText(/username/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/••••••••/)).toBeInTheDocument();
  });

  it('shows validation error when username is too short', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    // Type only 1 char — below the 3 char min
    await user.type(screen.getByPlaceholderText(/username/i), 'ab');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'validpass');
    await user.click(screen.getByRole('button', { name: /secure node access/i }));

    await waitFor(() => {
      expect(screen.getByText(/username explicitly required/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('shows validation error when password is too short', async () => {
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/username/i), 'validuser');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'abc'); // < 5 chars
    await user.click(screen.getByRole('button', { name: /secure node access/i }));

    await waitFor(() => {
      expect(screen.getByText(/5 characters minimum/i)).toBeInTheDocument();
    });
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it('calls login() with correct credentials on valid submit', async () => {
    mockLogin.mockResolvedValue({});
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/username/i), 'john.doe');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Welcome@123');
    await user.click(screen.getByRole('button', { name: /secure node access/i }));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        username: 'john.doe',
        password: 'Welcome@123',
      });
    });
  });

  it('shows API error message when login() rejects', async () => {
    mockLogin.mockRejectedValue({
      response: { data: { message: 'Invalid credentials' } },
    });
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/username/i), 'wronguser');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /secure node access/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument();
    });
  });

  it('shows fallback error message when API returns no message', async () => {
    mockLogin.mockRejectedValue(new Error('Network Error'));
    render(<LoginPage />);
    const user = userEvent.setup();

    await user.type(screen.getByPlaceholderText(/username/i), 'john.doe');
    await user.type(screen.getByPlaceholderText(/••••••••/), 'Welcome@123');
    await user.click(screen.getByRole('button', { name: /secure node access/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid authentication trace/i)).toBeInTheDocument();
    });
  });
});

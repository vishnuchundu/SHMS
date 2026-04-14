/**
 * Test: MyAllotmentPage — data rendering
 *
 * Mocks the React Query useQuery call returning allotment data
 * and asserts that the page renders all key fields correctly.
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MyAllotmentPage } from '../pages/student/MyAllotmentPage';

// Mock @tanstack/react-query so no real API calls happen
vi.mock('@tanstack/react-query', () => ({
  useQuery: vi.fn(),
}));
import { useQuery } from '@tanstack/react-query';

// Mock AuthContext
vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({
    user: { sub: 'john.doe', token: 'mock.token' },
    isAuthenticated: true,
  }),
}));

// Mock axiosInstance
vi.mock('../api/axiosInstance', () => ({
  default: { get: vi.fn() },
}));

const MOCK_ALLOTMENT = {
  studentName: 'John Doe',
  roomNumber: '205',
  hallName: 'Einstein Hall',
  hallType: 'NEW',
  roomType: 'SINGLE',
  currentOccupancy: 1,
  capacity: 1,
  rentAmount: 10000,
  amenityCharge: 1500,
  duesStatus: 'CLEAR',
};

describe('MyAllotmentPage', () => {
  it('renders all allotment fields when data is loaded', () => {
    useQuery.mockReturnValue({
      data: MOCK_ALLOTMENT,
      isLoading: false,
      isError: false,
    });

    render(<MyAllotmentPage />);

    expect(screen.getByText(/John Doe/i)).toBeInTheDocument();
    expect(screen.getByText(/Einstein Hall/i)).toBeInTheDocument();
    expect(screen.getByText(/205/i)).toBeInTheDocument();
    expect(screen.getByText(/DUES CLEAR/i)).toBeInTheDocument();
  });

  it('shows DUES PENDING badge when dues are outstanding', () => {
    useQuery.mockReturnValue({
      data: { ...MOCK_ALLOTMENT, duesStatus: 'PENDING' },
      isLoading: false,
      isError: false,
    });

    render(<MyAllotmentPage />);

    expect(screen.getByText(/DUES PENDING/i)).toBeInTheDocument();
  });

  it('shows a loading state while data is being fetched', () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: true,
      isError: false,
    });

    render(<MyAllotmentPage />);

    // The Loader component renders something while loading
    const loader = document.querySelector('svg, [data-testid="loader"], .animate-spin');
    expect(loader || screen.queryByText(/loading/i)).toBeTruthy();
  });

  it('shows an error state when the API fails', () => {
    useQuery.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Network Error'),
    });

    render(<MyAllotmentPage />);

    // Should show some error indication
    const errorEl = screen.queryByText(/error/i) || screen.queryByText(/failed/i);
    expect(errorEl).not.toBeNull();
  });
});

// Smoke test for the JSX half of the setup: Babel compiles JSX, jsdom renders
// it, and the app's own component (and its `@/` import alias) loads for real.
import { render, screen } from '@testing-library/react';
import AiUnavailable from '@/components/briefing/AiUnavailable';

describe('JSX setup', () => {
  it('renders an app component with its message', () => {
    render(<AiUnavailable message="Endpoint unreachable." />);

    expect(screen.getByText('AI brief unavailable')).toBeInTheDocument();
    expect(screen.getByText('Endpoint unreachable.')).toBeInTheDocument();
  });

  it('falls back to its default copy without a message', () => {
    render(<AiUnavailable />);

    expect(screen.getByText(/could not be generated this time/i)).toBeInTheDocument();
  });
});
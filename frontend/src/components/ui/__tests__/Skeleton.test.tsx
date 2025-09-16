
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Skeleton from '../Skeleton';

describe('Skeleton Component', () => {
  it('renders basic skeleton', () => {
    render(<Skeleton data-testid="skeleton" />);
    const skeleton = screen.getByTestId('skeleton');
    expect(skeleton).toBeInTheDocument();
    expect(skeleton).toHaveClass('bg-gray-800');
  });

  it('renders hero skeleton', () => {
    render(<Skeleton.Hero data-testid="hero-skeleton" />);
    const heroSkeleton = screen.getByTestId('hero-skeleton');
    expect(heroSkeleton).toBeInTheDocument();
    expect(heroSkeleton).toHaveClass('h-screen');
  });

  it('renders content card skeleton', () => {
    render(<Skeleton.ContentCard data-testid="card-skeleton" size="md" />);
    const cardSkeleton = screen.getByTestId('card-skeleton');
    expect(cardSkeleton).toBeInTheDocument();
  });

  it('renders content card skeleton with details', () => {
    render(<Skeleton.ContentCard data-testid="card-skeleton-details" size="md" showDetails={true} />);
    const cardSkeleton = screen.getByTestId('card-skeleton-details');
    expect(cardSkeleton).toBeInTheDocument();
  });

  it('applies correct size classes for different card sizes', () => {
    const { rerender } = render(<Skeleton.ContentCard data-testid="card-skeleton" size="sm" />);
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();

    rerender(<Skeleton.ContentCard data-testid="card-skeleton" size="lg" />);
    expect(screen.getByTestId('card-skeleton')).toBeInTheDocument();
  });

  it('renders text skeleton with multiple lines', () => {
    render(<Skeleton variant="text" lines={3} data-testid="text-skeleton" />);
    const textSkeleton = screen.getByTestId('text-skeleton');
    expect(textSkeleton).toBeInTheDocument();
  });

  it('applies shimmer animation classes', () => {
    render(<Skeleton data-testid="shimmer-skeleton" />);
    const skeleton = screen.getByTestId('shimmer-skeleton');
    expect(skeleton).toHaveClass('before:animate-[shimmer_2s_infinite]');
  });
});
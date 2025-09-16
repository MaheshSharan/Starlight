import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import NavigationArrow from '../NavigationArrow';

describe('NavigationArrow', () => {
  it('renders left arrow correctly', () => {
    const mockOnClick = vi.fn();
    render(
      <NavigationArrow
        direction="left"
        onClick={mockOnClick}
        disabled={false}
      />
    );

    const button = screen.getByRole('button', { name: /scroll left/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('renders right arrow correctly', () => {
    const mockOnClick = vi.fn();
    render(
      <NavigationArrow
        direction="right"
        onClick={mockOnClick}
        disabled={false}
      />
    );

    const button = screen.getByRole('button', { name: /scroll right/i });
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('handles click events', () => {
    const mockOnClick = vi.fn();
    render(
      <NavigationArrow
        direction="left"
        onClick={mockOnClick}
        disabled={false}
      />
    );

    const button = screen.getByRole('button', { name: /scroll left/i });
    fireEvent.click(button);
    
    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    const mockOnClick = vi.fn();
    render(
      <NavigationArrow
        direction="left"
        onClick={mockOnClick}
        disabled={true}
      />
    );

    const button = screen.getByRole('button', { name: /scroll left/i });
    expect(button).toBeDisabled();
    
    fireEvent.click(button);
    expect(mockOnClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    const mockOnClick = vi.fn();
    render(
      <NavigationArrow
        direction="left"
        onClick={mockOnClick}
        disabled={false}
        className="custom-class"
      />
    );

    const button = screen.getByRole('button', { name: /scroll left/i });
    expect(button).toHaveClass('custom-class');
  });
});
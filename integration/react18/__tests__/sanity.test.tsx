/**
 * Sanity test for @uirouter/react with React 18
 * This test verifies basic functionality works with React 18
 */
import { describe, it, expect } from 'vitest';
import * as React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { UIRouter, UIView, UISref, pushStateLocationPlugin } from '@uirouter/react';
import { memoryLocationPlugin } from '@uirouter/core';

const Home = () => <div data-testid="home">Home Page</div>;
const About = () => <div data-testid="about">About Page</div>;

const states = [
  { name: 'home', url: '/home', component: Home },
  { name: 'about', url: '/about', component: About },
];

describe('@uirouter/react with React 18', () => {
  it('renders UIRouter and UIView', async () => {
    render(
      <UIRouter plugins={[memoryLocationPlugin]} states={states}>
        <UIView />
      </UIRouter>
    );

    // Should render without crashing
    expect(document.body).toBeDefined();
  });

  it('navigates to a state and renders the component', async () => {
    const { container } = render(
      <UIRouter plugins={[memoryLocationPlugin]} states={states}>
        <div>
          <nav>
            <UISref to="home">
              <a data-testid="home-link">Home</a>
            </UISref>
            <UISref to="about">
              <a data-testid="about-link">About</a>
            </UISref>
          </nav>
          <UIView />
        </div>
      </UIRouter>
    );

    // Click home link
    screen.getByTestId('home-link').click();

    await waitFor(() => {
      expect(screen.getByTestId('home')).toBeDefined();
    });
  });

  it('UISref generates correct href', async () => {
    render(
      <UIRouter plugins={[memoryLocationPlugin]} states={states}>
        <UISref to="about">
          <a data-testid="link">About</a>
        </UISref>
      </UIRouter>
    );

    await waitFor(() => {
      const link = screen.getByTestId('link');
      expect(link.getAttribute('href')).toContain('/about');
    });
  });
});

import { afterEach, beforeEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Ensure DOM cleanup after each test
afterEach(() => {
  cleanup();
});

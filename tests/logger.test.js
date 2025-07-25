import { describe, it, expect } from 'vitest';
import logger from '../src/logger.js';

describe('Logger', () => {
  it('should be an instance of winston.Logger', () => {
    expect(logger).toBeDefined();
    expect(logger.constructor.name).toBe('DerivedLogger');
  });
});

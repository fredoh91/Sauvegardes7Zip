import { describe, it, expect, vi } from 'vitest';
import { generateArchiveFilename } from '../src/utils.js';

describe('generateArchiveFilename', () => {
  it('should generate a filename in the format YYYYMMDD_HHMMSS.7z', () => {
    // Mock la date pour un test reproductible
    const mockDate = new Date('2025-07-25T10:30:45.123Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const baseName = 'myFile';
    const expectedFilename = 'myFile_20250725_103045.7z';
    const generatedFilename = generateArchiveFilename(baseName);

    expect(generatedFilename).toBe(expectedFilename);

    vi.useRealTimers(); // Restaurer les vrais timers
  });

  it('should handle different base names', () => {
    const mockDate = new Date('2025-01-01T00:00:00.000Z');
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);

    const baseName = 'another_backup';
    const expectedFilename = 'another_backup_20250101_000000.7z';
    const generatedFilename = generateArchiveFilename(baseName);

    expect(generatedFilename).toBe(expectedFilename);

    vi.useRealTimers();
  });
});

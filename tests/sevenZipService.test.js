import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Readable } from 'stream';

vi.mock('node-7z', () => {
  const mockStream = new Readable({
    read() {}
  });
  mockStream.on = vi.fn((event, callback) => {
    if (event === 'end') {
      callback();
    }
    return mockStream;
  });
  const mockAdd = vi.fn(() => mockStream);
  return {
    default: {
      add: mockAdd
    },
    add: mockAdd
  };
});

import { compressFile } from '../src/sevenZipService.js';
import SevenZip from 'node-7z';

describe('sevenZipService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call 7z.add with correct parameters for file compression', async () => {
    const sourcePath = '/path/to/source/file.txt';
    const outputPath = '/path/to/destination/archive.7z';

    await compressFile(sourcePath, outputPath);

    expect(SevenZip.add).toHaveBeenCalledTimes(1);
    expect(SevenZip.add).toHaveBeenCalledWith(outputPath, sourcePath, { ssw: true });
  });

  it('should throw an error if 7z.add fails', async () => {
    const sourcePath = '/path/to/source/file.txt';
    const outputPath = '/path/to/destination/archive.7z';
    const errorMessage = '7z compression failed';

    SevenZip.add.mockImplementation(() => {
      const stream = new Readable({
        read() {}
      });
      stream.on = vi.fn((event, callback) => {
        if (event === 'error') {
          callback(new Error(errorMessage));
        }
        return stream;
      });
      return stream;
    });

    await expect(compressFile(sourcePath, outputPath)).rejects.toThrow(errorMessage);
    expect(SevenZip.add).toHaveBeenCalledWith(outputPath, sourcePath, { ssw: true });
  });
});

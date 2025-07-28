import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processFileBackup } from '../src/backupProcessor.js';
import * as sevenZipService from '../src/sevenZipService.js';
import * as utils from '../src/utils.js';
import path from 'path'; // Importe le module path

describe('backupProcessor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock des fonctions externes
    vi.spyOn(sevenZipService, 'compressFile').mockResolvedValue(undefined);
    vi.spyOn(utils, 'generateArchiveFilename').mockReturnValue('mock_archive.7z');
  });

  it('should process a file backup correctly', async () => {
    const item = {
      path_source: '/source/path',
      nom_fichier: 'myFile',
      ext_fichier: 'txt',
      type_sauvegarde: 'fichier',
    };
    const destinationPath = '/destination/path';

    await processFileBackup(item, destinationPath);

    expect(utils.generateArchiveFilename).toHaveBeenCalledWith(item.nom_fichier);
    expect(sevenZipService.compressFile).toHaveBeenCalledWith(
      path.join(item.path_source, `${item.nom_fichier}.${item.ext_fichier}`),
      path.join(destinationPath, 'mock_archive.7z'),
      {},
      expect.any(Function)
    );
  });

  it('should handle errors during file backup processing', async () => {
    const item = {
      path_source: '/source/path',
      nom_fichier: 'myFile',
      ext_fichier: 'txt',
      type_sauvegarde: 'fichier',
    };
    const destinationPath = '/destination/path';
    const errorMessage = 'Compression failed';

    sevenZipService.compressFile.mockRejectedValueOnce(new Error(errorMessage));

    await expect(processFileBackup(item, destinationPath)).rejects.toThrow(errorMessage);
    expect(utils.generateArchiveFilename).toHaveBeenCalledWith(item.nom_fichier);
    expect(sevenZipService.compressFile).toHaveBeenCalledWith(
      path.join(item.path_source, `${item.nom_fichier}.${item.ext_fichier}`),
      path.join(destinationPath, 'mock_archive.7z'),
      {},
      expect.any(Function)
    );
  });
});
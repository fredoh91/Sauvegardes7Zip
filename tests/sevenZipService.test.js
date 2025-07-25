import { describe, it, expect, vi, beforeEach } from 'vitest';
import { compressFile } from '../src/sevenZipService.js';
// Nous n'importons plus SevenZip directement ici, car il sera importé depuis le mock

vi.mock('node-7z', () => {
  // Déclarer et initialiser ces variables À L'INTÉRIEUR de la factory de mock
  const mockAdd = vi.fn();
  const mockSevenZipInstance = { add: mockAdd };
  const MockSevenZipConstructor = vi.fn(() => mockSevenZipInstance);

  return {
    default: MockSevenZipConstructor,
    // Exposer les fonctions mockées pour pouvoir les utiliser dans les tests
    _mockAdd: mockAdd,
    _mockSevenZipInstance: mockSevenZipInstance,
    _MockSevenZipConstructor: MockSevenZipConstructor,
  };
});

// Importer le constructeur mocké et les fonctions mockées exposées
import SevenZip, { _mockAdd, _mockSevenZipInstance, _MockSevenZipConstructor } from 'node-7z';

describe('sevenZipService', () => {
  beforeEach(() => {
    // Effacer tous les mocks avant chaque test
    vi.clearAllMocks();
    // Réinitialiser l'implémentation du constructeur mocké
    _MockSevenZipConstructor.mockImplementation(() => _mockSevenZipInstance);
  });

  it('should call 7z.add with correct parameters for file compression', async () => {
    const sourcePath = '/path/to/source/file.txt';
    const outputPath = '/path/to/destination/archive.7z';

    // Mock la méthode add pour ce test spécifique
    _mockAdd.mockResolvedValueOnce({});

    await compressFile(sourcePath, outputPath);

    expect(_MockSevenZipConstructor).toHaveBeenCalledTimes(1);
    expect(_mockAdd).toHaveBeenCalledTimes(1);
    expect(_mockAdd).toHaveBeenCalledWith(outputPath, sourcePath, { ssw: true });
  });

  it('should throw an error if 7z.add fails', async () => {
    const sourcePath = '/path/to/source/file.txt';
    const outputPath = '/path/to/destination/archive.7z';
    const errorMessage = '7z compression failed';

    // Mock la méthode add pour ce test spécifique pour rejeter
    _mockAdd.mockRejectedValueOnce(new Error(errorMessage));

    await expect(compressFile(sourcePath, outputPath)).rejects.toThrow(errorMessage);
    expect(_mockAdd).toHaveBeenCalledWith(outputPath, sourcePath, { ssw: true });
  });
});

import { describe, it, expect, vi } from 'vitest';
import { getBackupItems } from '../src/backupService.js';
import pool from '../src/database.js';

// Mock du pool de connexions à la base de données
vi.mock('../src/database.js', () => ({
  default: {
    execute: vi.fn(),
    end: vi.fn(),
  },
}));

describe('backupService', () => {
  it('should fetch backup items from the database', async () => {
    // Définir le comportement simulé pour pool.execute
    pool.execute.mockResolvedValueOnce([[{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }]]);

    const items = await getBackupItems();

    expect(pool.execute).toHaveBeenCalledWith('SELECT * FROM liste_fichiers WHERE liste_fichiers.actif = 1');
    expect(items).toEqual([{ id: 1, name: 'item1' }, { id: 2, name: 'item2' }]);
  });

  it('should handle errors when fetching backup items', async () => {
    const errorMessage = 'Database error';
    pool.execute.mockRejectedValueOnce(new Error(errorMessage));

    await expect(getBackupItems()).rejects.toThrow(errorMessage);
  });
});

import fs from 'fs/promises';
import path from 'path';
import os from 'os';

/**
 * Compte récursivement le nombre de fichiers dans un répertoire.
 * @param {string} directory - Le chemin du répertoire à analyser.
 * @returns {Promise<number>} Le nombre total de fichiers.
 */
export async function countFiles(directory) {
  let fileCount = 0;
  const entries = await fs.readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      fileCount += await countFiles(fullPath);
    } else {
      fileCount++;
    }
  }
  return fileCount;
}

/**
 * Copie récursivement un répertoire et rapporte la progression.
 * @param {string} src - Le chemin du répertoire source.
 * @param {string} dest - Le chemin du répertoire de destination.
 * @param {function(number): void} [onProgress] - Callback pour suivre la progression (en pourcentage).
 */
export async function copyDirectory(src, dest, onProgress) {
  const totalFiles = await countFiles(src);
  let copiedFiles = 0;

  async function copy(src, dest) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });

    for (let entry of entries) {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);

      if (entry.isDirectory()) {
        await copy(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
        copiedFiles++;
        if (onProgress) {
          const percentage = totalFiles > 0 ? Math.round((copiedFiles / totalFiles) * 100) : 100;
          onProgress(percentage);
        }
      }
    }
  }

  await copy(src, dest);
}


/**
 * Génère un nom de fichier d'archive au format AAAMMJJ_HHMMSS.7z.
 * @param {string} baseName - Le nom de base du fichier (par exemple, le nom du fichier compressé).
 * @returns {string} Le nom de fichier d'archive formaté.
 */
export function generateArchiveFilename(baseName) {
  const now = new Date();
  const annee = now.getUTCFullYear();
  const mois = ('0' + (now.getUTCMonth() + 1)).slice(-2);
  const jour = ('0' + now.getUTCDate()).slice(-2);
  const heure = ('0' + now.getUTCHours()).slice(-2);
  const minute = ('0' + now.getUTCMinutes()).slice(-2);
  const seconde = ('0' + now.getUTCSeconds()).slice(-2);

  const timestamp = `${annee}${mois}${jour}_${heure}${minute}${seconde}`;
  return `${baseName}_${timestamp}.7z`;
}

/**
 * Crée un répertoire temporaire unique pour la sauvegarde.
 * @returns {Promise<string>} Le chemin du répertoire temporaire créé.
 */
export async function createTempDirectory() {
  const tmpDir = path.join(os.tmpdir(), 'backup-');
  const tempPath = await fs.mkdtemp(tmpDir);
  return tempPath;
}

/**
 * Nettoie les anciens répertoires temporaires.
 */
export async function cleanOldTempDirectories() {
  const tmpDir = os.tmpdir();
  const files = await fs.readdir(tmpDir);
  for (const file of files) {
    if (file.startsWith('backup-')) {
      const fullPath = path.join(tmpDir, file);
      await fs.rm(fullPath, { recursive: true, force: true });
    }
  }
}

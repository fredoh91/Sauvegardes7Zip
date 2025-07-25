import SevenZip from 'node-7z'; // Importe directement l'objet SevenZip
import logger from './logger.js';

/**
 * Compresse un fichier en utilisant 7zip avec le paramètre -ssw.
 * @param {string} sourcePath - Le chemin complet du fichier source à compresser.
 * @param {string} outputPath - Le chemin complet de l'archive de destination (incluant le nom du fichier .7z).
 * @returns {Promise<void>} Une promesse qui se résout lorsque la compression est terminée.
 */
export async function compressFile(sourcePath, outputPath) {
  logger.info(`Début de la compression du fichier: ${sourcePath} vers ${outputPath}`);
  try {
    // Appel direct de la méthode add sur l'objet SevenZip importé
    await SevenZip.add(outputPath, sourcePath, { ssw: true });
    logger.info(`Compression réussie: ${sourcePath} vers ${outputPath}`);
  } catch (error) {
    logger.error(`Erreur lors de la compression du fichier ${sourcePath}:`, error);
    throw error;
  }
}

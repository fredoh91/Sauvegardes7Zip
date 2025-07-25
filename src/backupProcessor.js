import { compressFile } from './sevenZipService.js';
import { generateArchiveFilename } from './utils.js';
import logger from './logger.js';
import path from 'path';

/**
 * Traite la sauvegarde d'un fichier.
 * @param {object} item - L'objet représentant l'élément de sauvegarde de type 'fichier'.
 * @param {string} destinationPath - Le répertoire de destination pour l'archive.
 * @returns {Promise<void>} Une promesse qui se résout lorsque la sauvegarde est terminée.
 */
export async function processFileBackup(item, destinationPath) {
  const fullSourcePath = path.join(item.path_source, `${item.nom_fichier}.${item.ext_fichier}`);
  const archiveName = generateArchiveFilename(item.nom_fichier);
  const fullArchivePath = path.join(destinationPath, archiveName);

  logger.info(`Traitement de la sauvegarde du fichier: ${fullSourcePath}`);

  try {
    await compressFile(fullSourcePath, fullArchivePath);
    logger.info(`Sauvegarde du fichier ${fullSourcePath} terminée avec succès.`);
  } catch (error) {
    logger.error(`Échec de la sauvegarde du fichier ${fullSourcePath}:`, error);
    throw error;
  }
}

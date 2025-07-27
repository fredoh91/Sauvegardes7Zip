import { compressFile, compressDirectory } from './sevenZipService.js';
import { generateArchiveFilename, createTempDirectory, cleanOldTempDirectories, copyDirectory } from './utils.js';
import logger from './logger.js';
import path from 'path';
import fs from 'fs/promises';

// Fonction utilitaire pour afficher la progression sur une seule ligne
function showProgress(label, percentage) {
  process.stdout.write(`${label}: ${percentage}%\r`);
}

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
    await compressFile(fullSourcePath, fullArchivePath, {}, (percent) => {
      showProgress('Compression', percent);
    });
    process.stdout.write('\n'); // Nouvelle ligne après la progression
    logger.info(`Sauvegarde du fichier ${fullSourcePath} terminée avec succès.`);
  } catch (error) {
    process.stdout.write('\n'); // Assure une nouvelle ligne en cas d'erreur
    logger.error(`Échec de la sauvegarde du fichier ${fullSourcePath}:`, error);
    throw error;
  }
}

/**
 * Traite la sauvegarde d'un répertoire MySQL.
 * @param {object} item - L'objet représentant l'élément de sauvegarde de type 'Repertoire_MySQL'.
 * @param {string} destinationPath - Le répertoire de destination pour l'archive.
 * @returns {Promise<void>} Une promesse qui se résout lorsque la sauvegarde est terminée.
 */
export async function processMysqlBackup(item, destinationPath) {
  logger.info(`Traitement de la sauvegarde du répertoire MySQL: ${item.path_source}`);
  let tempPath;
  try {
    await cleanOldTempDirectories();
    tempPath = await createTempDirectory();

    const sourceDirName = path.basename(item.path_source);
    const targetDirInTemp = path.join(tempPath, sourceDirName);
    
    logger.info('Copie des fichiers vers le répertoire temporaire...');
    await copyDirectory(item.path_source, targetDirInTemp, (percent) => {
      showProgress('Copie', percent);
    });
    process.stdout.write('\n');

    const archiveName = generateArchiveFilename(item.nom_fichier);
    const fullArchivePath = path.join(destinationPath, archiveName);

    const sourceForArchive = path.join(tempPath, '*');

    logger.info('Compression des fichiers...');
    await compressDirectory(sourceForArchive, fullArchivePath, {}, (percent) => {
      showProgress('Compression', percent);
    });
    process.stdout.write('\n');

    logger.info(`Sauvegarde du répertoire MySQL ${item.path_source} terminée avec succès.`);
  } catch (error) {
    process.stdout.write('\n');
    logger.error(`Échec de la sauvegarde du répertoire MySQL ${item.path_source}:`, error);
    throw error;
  } finally {
    if (tempPath) {
      await fs.rm(tempPath, { recursive: true, force: true });
    }
  }
}

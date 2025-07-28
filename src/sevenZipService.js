import SevenZip from 'node-7z';
import logger from './logger.js';

/**
 * Compresse un fichier en utilisant 7zip.
 * @param {string} sourcePath - Le chemin complet du fichier source à compresser.
 * @param {string} outputPath - Le chemin complet de l'archive de destination.
 * @param {object} options - Les options pour node-7z (par exemple, { ssw: true }).
 * @param {function(number): void} [onProgress] - Callback pour suivre la progression (en pourcentage).
 * @returns {Promise<void>} Une promesse qui se résout lorsque la compression est terminée.
 */
export function compressFile(sourcePath, outputPath, options = {}, onProgress) {
  logger.info(`Début de la compression du fichier: ${sourcePath} vers ${outputPath}`);
  
  const sevenZipOptions = { ssw: true, ...options };
  if (onProgress) {
    sevenZipOptions.$progress = true;
  }

  return new Promise((resolve, reject) => {
    const stream = SevenZip.add(outputPath, sourcePath, sevenZipOptions);

    if (onProgress) {
      stream.on('progress', (progress) => {
        onProgress(progress.percent);
      });
    }

    stream.on('end', () => {
      // Assure que la barre de progression atteint 100% à la fin
      if (onProgress) onProgress(100);
      logger.info(`Compression réussie: ${sourcePath} vers ${outputPath}`);
      resolve();
    });

    stream.on('error', (error) => {
      logger.error(`Erreur lors de la compression du fichier ${sourcePath}:`, error);
      reject(error);
    });
  });
}

/**
 * Compresse le contenu d'un répertoire.
 * @param {string} sourcePath - Le chemin du répertoire à compresser.
 * @param {string} outputPath - Le chemin de l'archive de sortie.
 * @param {object} options - Les options pour node-7z (par exemple, { ssw: true, cwd: '...' }).
 * @param {function(number): void} [onProgress] - Callback pour suivre la progression (en pourcentage).
 * @returns {Promise<void>}
 */
export function compressDirectory(sourcePath, outputPath, options = {}, onProgress) {
    logger.info(`Début de la compression du répertoire: ${sourcePath} vers ${outputPath}`);
    
    const sevenZipOptions = { ssw: true, ...options };
    if (onProgress) {
        sevenZipOptions.$progress = true;
    }

    return new Promise((resolve, reject) => {
        const stream = SevenZip.add(outputPath, sourcePath, sevenZipOptions);

        if (onProgress) {
          // logger.info('Attaching progress handler to 7z stream');
          stream.on('progress', (progress) => {
            onProgress(progress.percent);
          });
        }

        stream.on('end', () => {
            // Assure que la barre de progression atteint 100% à la fin
            if (onProgress) onProgress(100);
            logger.info(`Compression du répertoire réussie: ${sourcePath} vers ${outputPath}`);
            resolve();
        });
        
        stream.on('error', (error) => {
            logger.error(`Erreur lors de la compression du répertoire ${sourcePath}:`, error);
            reject(error);
        });
    });
}


// ... (autres fonctions du service si nécessaire)

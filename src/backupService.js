import pool, { updateBackupStatus } from './database.js';
import logger from './logger.js';
import { processFileBackup, processMysqlBackup } from './backupProcessor.js';

/**
 * Récupère la liste des éléments à sauvegarder depuis la base de données.
 * @returns {Promise<Array>} Une promesse qui résout en un tableau d'objets représentant les éléments à sauvegarder.
 */
export async function getBackupItems() {
  try {
    const [rows] = await pool.execute('SELECT * FROM liste_fichiers WHERE liste_fichiers.actif = 1');
    logger.info('Éléments de sauvegarde récupérés avec succès.', { count: rows.length });
    return rows;
  } catch (error) {
    logger.error('Erreur lors de la récupération des éléments de sauvegarde:', error);
    throw error;
  }
}

/**
 * Exécute les sauvegardes en fonction des éléments récupérés.
 * @param {Array} items - La liste des éléments à sauvegarder.
 * @param {string} destinationPath - Le chemin de destination pour les archives.
 */
export async function runBackups(items, destinationPath) {
  for (const item of items) {
    let status = 'ECHEC'; // Statut par défaut en cas d'erreur
    try {
      switch (item.type) {
        case 'fichier':
          await processFileBackup(item, destinationPath);
          break;
        case 'Repertoire_MySQL':
          await processMysqlBackup(item, destinationPath);
          break;
        // Ajoutez d'autres cas pour d'autres types de sauvegarde ici
        default:
          logger.warn(`Type de sauvegarde inconnu: ${item.type} pour l'élément ${item.nom_fichier}`);
      }
      status = 'SUCCES'; // Si tout se passe bien, le statut est SUCCES
    } catch (error) {
      logger.error(`Erreur lors du traitement de l'élément ${item.nom_fichier}:`, error);
      status = 'ECHEC'; // Confirme le statut ECHEC en cas d'erreur
    } finally {
      // Met à jour le statut de la sauvegarde dans la base de données
      await updateBackupStatus(item.id, status);
    }
  }
}

import pool from './database.js';
import logger from './logger.js';

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

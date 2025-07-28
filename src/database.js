import mysql from 'mysql2/promise';
import logger from './logger.js';

// console.log('Chargement des variables d\'environnement...',process.env.NAME);

const pool = mysql.createPool({
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

/**
 * Met à jour le statut et la date de la dernière sauvegarde pour un élément donné.
 * @param {number} itemId - L'ID de l'élément de sauvegarde.
 * @param {string} status - Le statut de la sauvegarde ('SUCCES' ou 'ECHEC').
 * @returns {Promise<void>}
 */
export async function updateBackupStatus(itemId, status) {
  try {
    const query = `
      UPDATE liste_fichiers
      SET
        date_derniere_sauvegarde = NOW(),
        statut_derniere_sauvegarde = ?
      WHERE id = ?
    `;
    await pool.execute(query, [status, itemId]);
    logger.info(`Statut de sauvegarde mis à jour pour l'élément ${itemId}: ${status}`);
  } catch (error) {
    logger.error(`Erreur lors de la mise à jour du statut de sauvegarde pour l'élément ${itemId}:`, error);
  }
}

export default pool;
export { pool };

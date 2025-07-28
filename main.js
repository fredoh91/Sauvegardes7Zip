import 'dotenv/config'; // Charge les variables d'environnement
import { getBackupItems } from './src/backupService.js';
import logger from './src/logger.js';
import pool, { updateBackupStatus } from './src/database.js'; // Importe le pool de connexions et updateBackupStatus
import { processFileBackup, processMysqlBackup } from './src/backupProcessor.js'; // Importe la fonction de traitement des fichiers
import { isBackupDueToday } from './src/backupFilter.js'; // Importe la fonction de filtrage
import path from 'path'; // Importe le module path

export async function main() {
  logger.info('Démarrage du script de sauvegarde...');
  try {
    const items = await getBackupItems();
    logger.info(`Nombre d'éléments à sauvegarder: ${items.length}`);

    for (const item of items) {
      let status = 'ECHEC'; // Statut par défaut en cas d'erreur
      try {
        const destinationPath = item.path_cible; // Utilise path_cible de l'élément
        if (!isBackupDueToday(item)) {
          logger.info(`Sauvegarde ignorée pour l'élément ${item.id} (${item.nom_fichier}) : non planifiée pour aujourd'hui.`);
          status = 'IGNORER'; // Nouveau statut pour les éléments ignorés
          continue; // Passe à l'élément suivant si la sauvegarde n'est pas due aujourd'hui
        }

        switch (item.TypeFichierRepertoire) {
          case 'Fichier':
            logger.info(`Traitement de l'élément de type 'fichier': ${item.nom_fichier}.${item.ext_fichier}`);
            await processFileBackup(item, destinationPath);
            break;
          case 'Répertoire':
            logger.info(`Traitement de l'élément de type 'répertoire', pas encore implémenté: ${item.nom_fichier}`);
            // await processDirectoryBackup(item, destinationPath);
            break;
          case 'Repertoire_MySQL':
            logger.info(`Traitement de l'élément de type 'Repertoire_MySQL': ${item.nom_fichier}`);
            await processMysqlBackup(item, destinationPath);
            break;
          // D'autres types de sauvegarde seront ajoutés ici plus tard
          default:
            logger.warn(`Type de sauvegarde inconnu ou non pris en charge: ${item.TypeFichierRepertoire}`);
        }
        status = 'SUCCES'; // Si tout se passe bien, le statut est SUCCES
      } catch (error) {
        logger.error(`Erreur lors du traitement de l'élément ${item.nom_fichier}:`, error);
        status = 'ECHEC'; // Confirme le statut ECHEC en cas d'erreur
      } finally {
        // Met à jour le statut de la sauvegarde dans la base de données pour chaque élément
        logger.debug(`Tentative de mise à jour du statut pour l'élément ${item.id} avec le statut: ${status}`);
        await updateBackupStatus(item.id, status);
        logger.debug(`Statut mis à jour pour l'élément ${item.id}.`);
      }
    }
  } catch (error) {
    logger.error('Une erreur est survenue lors de la récupération ou du traitement des éléments de sauvegarde:', error);
  } finally {
    logger.info('Script de sauvegarde terminé.');
  }
}

main();
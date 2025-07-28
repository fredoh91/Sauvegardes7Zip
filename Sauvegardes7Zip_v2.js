import { main } from './main.js';
import { pool } from './src/database.js';
import logger from './src/logger.js';

// Exécute la fonction main de main.js et attend sa complétion
await main();

// Ferme le pool de connexions après l'exécution complète de la fonction main
logger.info('Fermeture du pool de connexions...');
await pool.end();
logger.info('Pool de connexions fermé.');
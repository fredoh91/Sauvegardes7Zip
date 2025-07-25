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

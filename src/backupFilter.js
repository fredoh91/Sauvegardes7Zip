/**
 * Détermine si l'heure actuelle est le matin (AM) ou l'après-midi (PM).
 * @returns {'AM' | 'PM'} 'AM' si l'heure est avant 12h, 'PM' sinon.
 */
function getCurrentAmPm() {
  const now = new Date();
  const heure = now.getUTCHours();
  return (heure >= 0 && heure < 12) ? 'AM' : 'PM';
}

/**
 * Détermine si la sauvegarde doit être effectuée aujourd'hui en fonction du type de sauvegarde et du jour de la semaine.
 * @param {string} sTypeSave - Le type de sauvegarde (TOUS_LES_JOURS, LUNDI, etc.).
 * @returns {boolean} True si la sauvegarde doit être faite aujourd'hui, False sinon.
 */
function isDayForBackup(sTypeSave) {
  const now = new Date();
  const nJour = now.getUTCDay(); // 0 = Dimanche, 1 = Lundi, ..., 6 = Samedi

  switch (sTypeSave) {
    case 'TOUS_LES_JOURS':
      return true;
    case 'TOUS_LES_JOURS_SAUF_WE':
      return nJour !== 0 && nJour !== 6;
    case 'LUNDI':
      return nJour === 1;
    case 'MARDI':
      return nJour === 2;
    case 'MERCREDI':
      return nJour === 3;
    case 'JEUDI':
      return nJour === 4;
    case 'VENDREDI':
      return nJour === 5;
    case 'SAMEDI':
      return nJour === 6;
    case 'DIMANCHE':
      return nJour === 0;
    default:
      return false;
  }
}

/**
 * Détermine si un élément de sauvegarde doit être traité aujourd'hui en fonction de ses paramètres AM/PM et JourSauvegarde.
 * @param {object} item - L'objet de l'élément de sauvegarde avec les propriétés AM, PM, et JourSauvegarde.
 * @returns {boolean} True si l'élément doit être sauvegardé aujourd'hui, False sinon.
 */
export function isBackupDueToday(item) {
  const currentAmPm = getCurrentAmPm();
  const isDayValid = isDayForBackup(item.JourSauvegarde);

  if (!isDayValid) {
    return false;
  }

  if (currentAmPm === 'AM' && item.AM === 1) {
    return true;
  }

  if (currentAmPm === 'PM' && item.PM === 1) {
    return true;
  }

  return false;
}

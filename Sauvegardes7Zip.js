import Seven from 'node-7z';
import * as mysql from 'mysql';
import * as dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';

dotenv.config()

const myquery = 'SELECT * FROM liste_fichiers WHERE liste_fichiers.actif = 1'

const ident_connect = {
  host: process.env.HOST,
  user: process.env.USER,
  password: process.env.PASSWORD,
  database: process.env.DATABASE
}

const connection = mysql.createConnection(ident_connect);

function AM_PM() {
  // permet de savoir si on est actuellement le matin ou l'après midi
  const now = new Date();
  const heure = now.getHours()
  if (heure < 12 && heure >= 0) {
    return 'AM'
  } else {
    return 'PM'
  }
}

function sauvegarde_today(sTypeSave) {
  // permet de savoir si la date de jour est valide avec le type de sauvegarde renseignée dans la base
  // TOUS_LES_JOURS
  // TOUS_LES_JOURS_SAUF_WE
  // LUNDI
  // MARDI
  // MERCREDI
  // JEUDI
  // VENDREDI
  // SAMEDI
  // DIMANCHE

  // 0 = Dimanche
  // 1 = Lundi
  // 2 = Mardi
  // 3 = Mercredi
  // 4 = Jeudi
  // 5 = Vendredi
  // 6 = Samedi  

  const now = new Date();
  const nJour = now.getDay();

  if (sTypeSave == 'TOUS_LES_JOURS') {
    return true
  }
  if (sTypeSave == 'LUNDI' && nJour == 1) {
    return true
  }
  if (sTypeSave == 'MARDI' && nJour == 2) {
    return true
  }
  if (sTypeSave == 'MERCREDI' && nJour == 3) {
    return true
  }
  if (sTypeSave == 'JEUDI' && nJour == 4) {
    return true
  }
  if (sTypeSave == 'VENDREDI' && nJour == 5) {
    return true
  }
  if (sTypeSave == 'SAMEDI' && nJour == 6) {
    return true
  }
  if (sTypeSave == 'DIMANCHE' && nJour == 0) {
    return true
  }
  if (sTypeSave == 'TOUS_LES_JOURS_SAUF_WE' && nJour != 0 && nJour != 6) {
    return true
  }
  return false
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function removeDirSync(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      removeDirSync(entryPath);
    } else {
      fs.unlinkSync(entryPath);
    }
  }
  fs.rmdirSync(dir);
}

function add_7z(filecompressee, fileEntree, id, tempDirToDelete = null) {
  let now = new Date();
  let annee = now.getFullYear();
  let mois = ('0' + (now.getMonth() + 1)).slice(-2);
  let jour = ('0' + now.getDate()).slice(-2);
  let heure = ('0' + now.getHours()).slice(-2);
  let minute = ('0' + now.getMinutes()).slice(-2);
  let seconde = ('0' + now.getSeconds()).slice(-2);
  let file_unique = "_" + annee + "_" + mois + "_" + jour + "_" + heure + "_" + minute + "_" + seconde;
  let ext_fic = '7z';

  const archivePath = filecompressee + file_unique + "." + ext_fic;

  // Ajout debug détaillé
  // console.log(`[DEBUG] add_7z(id=${id})`);
  // console.log(`[DEBUG] Chemin fichier à compresser (fileEntree) : "${fileEntree}"`);
  // console.log(`[DEBUG] Chemin archive cible (archivePath) : "${archivePath}"`);
  // console.log(`[DEBUG] Existe source ?`, fs.existsSync(fileEntree.replace(/\\\*$/, '')));
  // console.log(`[DEBUG] Dossier cible existe ?`, fs.existsSync(path.dirname(archivePath)));

  const archivePathFixed = archivePath.replace(/\\/g, '/');
  const fileEntreeFixed = fileEntree.replace(/\\/g, '/');
  // console.log(`[DEBUG] archivePathFixed = ${archivePathFixed}`);
  // console.log(`[DEBUG] fileEntreeFixed = ${fileEntreeFixed}`);

  const myStream = Seven.add(
    archivePathFixed,
    [fileEntreeFixed],
    { $bin: '7z', recursive: true, overwrite: 'a', ssw: true }
  );

  // myStream.on('progress', (progress) => {
  //   console.log(`[DEBUG] Progression de la compression pour id=${id} :`, progress);
  // });
  myStream.on('end', () => {
    // console.log(`[DEBUG] Compression terminée pour id=${id}`);
    if (tempDirToDelete && fs.existsSync(tempDirToDelete)) {
      // console.log(`[DEBUG] Suppression du répertoire temporaire : ${tempDirToDelete}`);
      removeDirSync(tempDirToDelete);
      // console.log(`[DEBUG] Répertoire temporaire supprimé`);
    }
    maj_date_traitement(id)
    maj_statut_derniere_sauvegarde(id, 'OK')
  });
  myStream.on('error', (err) => {
    // console.error(`[DEBUG] Erreur lors de la compression pour id=${id} :`, err);
    if (tempDirToDelete && fs.existsSync(tempDirToDelete)) {
      // console.log(`[DEBUG] Suppression du répertoire temporaire après erreur : ${tempDirToDelete}`);
      removeDirSync(tempDirToDelete);
      // console.log(`[DEBUG] Répertoire temporaire supprimé`);
    }
    if (err === undefined) {
      maj_statut_derniere_sauvegarde(id, 'Erreur, sauvegarde non-effectuée')
    } else {
      maj_statut_derniere_sauvegarde(id, err.toString())
    }
  });
}

function maj_date_traitement(id) {
  // met à jour la ligne dans la base avec le timestamp en cours
  const connection_2 = mysql.createConnection(ident_connect);
  const myquery_maj = 'UPDATE liste_fichiers SET date_derniere_sauvegarde = NOW() WHERE id = ' + id
  connection_2.connect();
  connection_2.query(myquery_maj, function (error, results) {
    if (error) throw error;
  });
  connection_2.end();
}
function maj_statut_derniere_sauvegarde(id, maj) {
  if (!maj) maj = 'Valeur non définie';
  const connection_2 = mysql.createConnection(ident_connect);
  let myquery_maj = 'UPDATE liste_fichiers SET statut_derniere_sauvegarde = ? WHERE id = ?'
  let data = [maj, id];
  connection_2.connect();
  connection_2.query(myquery_maj, data, function (error, results) {
    if (error) throw error;
  });
  connection_2.end();
}

function trait_tab(item, index, array) {
  let fileentree = '';
  let filecompressee = item['path_cible'] + "\\" + item['nom_fichier'];
  let ext_fic = '7z';

  if (item['TypeFichierRepertoire'] === 'Repertoire') {
    fileentree = item['path_source'] + "\\" + '*';
    // console.log(`[DEBUG] Traitement de l'élément id=${item['id']} - type=Repertoire`);
    add_7z(filecompressee, fileentree, item['id']);
  } else if (item['TypeFichierRepertoire'] === 'Fichier') {
    fileentree = item['path_source'] + "\\" + item['nom_fichier'] + "." + item['ext_fichier'];
    // console.log(`[DEBUG] Traitement de l'élément id=${item['id']} - type=Fichier`);
    add_7z(filecompressee, fileentree, item['id']);
  } else if (item['TypeFichierRepertoire'] === 'Repertoire_MySQL') {
    const tempDir = path.join(item['path_cible'], 'data');
    // console.log(`[DEBUG] Création du répertoire temporaire MySQL : ${tempDir}`);
    if (fs.existsSync(tempDir)) {
      // console.log(`[DEBUG] Suppression de l'ancien répertoire temporaire data`);
      removeDirSync(tempDir);
    }
    copyDirSync(item['path_source'], tempDir);
    // console.log(`[DEBUG] Copie du répertoire MySQL terminée`);
    add_7z(filecompressee, tempDir, item['id'], tempDir);
  } else {
    // console.log('[DEBUG] TypeFichierRepertoire non renseigné pour id=' + item['id']);
  }
}

connection.connect();
connection.query(myquery, function (error, results, fields) {
  if (error) throw error;
  results.forEach(trait_tab)
  console.log('Sauvegarde terminée')
});
connection.end();

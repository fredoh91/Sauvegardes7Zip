import Seven from 'node-7z';
import * as mysql from 'mysql';
import * as dotenv from 'dotenv'
import fs from 'fs';
import path from 'path';
import os from 'os';
import { execSync } from 'child_process';

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
  const isDirectory = fs.lstatSync(fileEntree).isDirectory();
  
  // Vérification de l'existence du fichier/répertoire source
  if (!fs.existsSync(fileEntree)) {
    console.error(`ERREUR: La source n'existe pas: ${fileEntree}`);
    return;
  }
  
  // Création du répertoire de destination s'il n'existe pas
  const destDir = path.dirname(archivePath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  try {
    if (isDirectory) {
      // Cas d'un répertoire - on utilise directement 7z sans copie préalable
      console.log(`[INFO] Compression du répertoire ${fileEntree}...`);
      const cmd = `"C:\\Program Files\\7-Zip\\7z.exe" a -t7z -mx=5 -ssw -y "${archivePath}" "${fileEntree}\\*"`;
      execSync(cmd, { stdio: 'inherit' });
    } else {
      // Cas d'un fichier - on fait une copie temporaire pour éviter les problèmes de verrouillage
      console.log(`[INFO] Compression du fichier ${fileEntree}...`);
      
      // Création d'un fichier temporaire local
      const tempFile = path.join(os.tmpdir(), `temp_${Date.now()}_${path.basename(fileEntree)}`);
      
      try {
        // Copie du fichier source vers le répertoire temporaire
        fs.copyFileSync(fileEntree, tempFile);
        
        if (!fs.existsSync(tempFile)) {
          throw new Error('La copie du fichier a échoué');
        }
        
        // Compression du fichier temporaire
        const fileNameInArchive = path.basename(fileEntree);
        const tempDir = path.dirname(tempFile);
        const renamedTempFile = path.join(tempDir, fileNameInArchive);
        
        // Renommage pour avoir le bon nom dans l'archive
        if (fs.existsSync(renamedTempFile)) {
          fs.unlinkSync(renamedTempFile);
        }
        fs.renameSync(tempFile, renamedTempFile);
        
        // Compression
        const cmd = `cd "${tempDir}" && "C:\\Program Files\\7-Zip\\7z.exe" a -t7z -mx=5 -ssw -y "${archivePath}" "${fileNameInArchive}"`;
        execSync(cmd, { stdio: 'inherit' });
        
        // Nettoyage
        if (fs.existsSync(renamedTempFile)) {
          fs.unlinkSync(renamedTempFile);
        }
      } finally {
        // Assurance du nettoyage en cas d'erreur
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      }
    }
  } catch (error) {
    console.error('Erreur lors de la création de l\'archive:', error);
    maj_statut_derniere_sauvegarde(id, 'ERREUR: ' + error.message);
    
    if (tempDirToDelete && fs.existsSync(tempDirToDelete)) {
      console.log(`Suppression du répertoire temporaire après erreur : ${tempDirToDelete}`);
      removeDirSync(tempDirToDelete);
    }
  }
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

async function trait_tab(item, index, array) {
  let fileentree = '';
  let filecompressee = item['path_cible'] + "\\" + item['nom_fichier'];
  let ext_fic = '7z';

  if (item['TypeFichierRepertoire'] === 'Repertoire') {
    fileentree = item['path_source'] + "\\" + '*';
    // console.log(`[DEBUG] Traitement de l'élément id=${item['id']} - type=Repertoire`);
    add_7z(filecompressee, fileentree, item['id']);
    maj_statut_derniere_sauvegarde(item['id'], 'OK');
  } else if (item['TypeFichierRepertoire'] === 'Fichier') {
    fileentree = item['path_source'] + "\\" + item['nom_fichier'] + "." + item['ext_fichier'];
    console.log(`[DEBUG] Traitement de l'élément id=${item['id']} - type=Fichier`);
    add_7z(filecompressee, fileentree, item['id']);
    maj_statut_derniere_sauvegarde(item['id'], 'OK');
  } else if (item['TypeFichierRepertoire'] === 'Repertoire_MySQL') {
    console.log(`[DEBUG] Traitement de l'élément id=${item['id']} - type=Repertoire_MySQL`);
    
    // Vérification que le répertoire source existe
    if (!fs.existsSync(item['path_source'])) {
      console.error(`[ERREUR] Le répertoire source n'existe pas: ${item['path_source']}`);
      maj_statut_derniere_sauvegarde(item['id'], `ERREUR: Le répertoire source n'existe pas`);
      return;
    }
    
    // Création d'un répertoire temporaire unique dans le dossier temporaire système
    const tempDir = path.join(os.tmpdir(), `mysql_backup_${Date.now()}`);
    const tempDataDir = path.join(tempDir, 'data');
    
    try {
      // Création du répertoire temporaire
      fs.mkdirSync(tempDir, { recursive: true });
      // console.log(`[INFO] Répertoire temporaire créé: ${tempDir}`);
      
      // Copie du répertoire source vers le répertoire temporaire avec fs.cpSync (meilleure gestion des permissions)
      // console.log(`[INFO] Copie de ${item['path_source']} vers ${tempDataDir}...`);
      
      // Utilisation de fs.cpSync si disponible (Node.js 16.7.0+), sinon utiliser copyDirSync
      if (fs.cpSync) {
        fs.cpSync(item['path_source'], tempDataDir, { 
          recursive: true,
          force: true,
          errorOnExist: false
        });
      } else {
        // Méthode de repli pour les versions plus anciennes
        copyDirSync(item['path_source'], tempDataDir);
      }
      
      // Vérification que la copie a réussi
      if (!fs.existsSync(tempDataDir) || fs.readdirSync(tempDataDir).length === 0) {
        throw new Error('Échec de la copie du répertoire MySQL - le répertoire de destination est vide');
      }
      
      // console.log(`[INFO] Compression du répertoire MySQL...`);
      // On utilise le répertoire parent pour éviter les problèmes de droits
      add_7z(filecompressee, tempDir, item['id'], tempDir);
      maj_statut_derniere_sauvegarde(item['id'], 'OK');
      
    } catch (error) {
      console.error(`[ERREUR] Erreur lors de la sauvegarde MySQL:`, error);
      if (fs.existsSync(tempDir)) {
        try {
          removeDirSync(tempDir);
          console.log(`[INFO] Nettoyage du répertoire temporaire après erreur`);
        } catch (cleanupError) {
          console.error(`[ERREUR] Impossible de nettoyer le répertoire temporaire:`, cleanupError);
        }
      }
      maj_statut_derniere_sauvegarde(item['id'], `ERREUR: ${error.message}`);
    }
  } else {
    // console.log('[DEBUG] TypeFichierRepertoire non renseigné pour id=' + item['id']);
  }
}

connection.connect();
connection.query(myquery, async function (error, results, fields) {
  if (error) throw error;
  await Promise.all(results.map(trait_tab));
  console.log('Sauvegarde terminée');
});
connection.end();

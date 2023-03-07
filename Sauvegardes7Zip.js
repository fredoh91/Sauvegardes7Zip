import { createArchive } from 'node-7z-archive';
import * as mysql from 'mysql';
import * as dotenv from 'dotenv'

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

function add_7z(filecompressee, fileEntree, id) {
  // compresse le fichier fileentree vers filecompressee et met à jour la ligne id de la base avec le timestamp du moment
  let now = new Date();
  let annee = now.getFullYear();
  let mois = ('0' + (now.getMonth() + 1)).slice(-2);
  let jour = ('0' + now.getDate()).slice(-2);
  let heure = ('0' + now.getHours()).slice(-2);
  let minute = ('0' + now.getMinutes()).slice(-2);
  let seconde = ('0' + now.getSeconds()).slice(-2);
  let file_unique = "_" + annee + "_" + mois + "_" + jour + "_" + heure + "_" + minute + "_" + seconde;
  let ext_fic = '7z';
  // console.log ('fileEntree',fileEntree);
  //   if (TypeFichierRepertoire === 'Repertoire') {
  //     createArchive(filecompressee + file_unique + "." + ext_fic,
  //       fileEntree + '*',
  //       { y: true, ssw: true }
  //     )
  //       .progress(function (files) {
  //       })

  //       .then(function () {
  //         maj_date_traitement(id)
  //         maj_statut_derniere_sauvegarde(id, 'OK')
  //       })
  //       .catch(function (err) {
  //         if (err === undefined) {
  //           maj_statut_derniere_sauvegarde(id, 'Erreur, sauvegarde non-effectuée')
  //         } else {
  //           maj_statut_derniere_sauvegarde(id, err)
  //         }
  //       });
  //   } else if (TypeFichierRepertoire === 'Fichier') {
  createArchive(filecompressee + file_unique + "." + ext_fic,
    fileEntree,
    { y: true, ssw: true }
  )
    .progress(function (files) {
    })

    .then(function () {
      maj_date_traitement(id)
      maj_statut_derniere_sauvegarde(id, 'OK')
    })
    .catch(function (err) {
      if (err === undefined) {
        maj_statut_derniere_sauvegarde(id, 'Erreur, sauvegarde non-effectuée')
      } else {
        maj_statut_derniere_sauvegarde(id, err)
      }
    });
  // } else {
  //   console.log('TypeFichierRepertoire non renseigné');
  // }
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
  // met à jour la ligne dans la base avec le timestamp en cours
  const connection_2 = mysql.createConnection(ident_connect);
  // var myquery_maj = 'UPDATE liste_fichiers SET statut_derniere_sauvegarde = ' + error + ' WHERE id = ' + id
  let myquery_maj = 'UPDATE liste_fichiers SET statut_derniere_sauvegarde = ? WHERE id = ?'
  let data = [maj, id];
  connection_2.connect();
  connection_2.query(myquery_maj, data, function (error, results) {
    if (error) throw error;
  });
  connection_2.end();
}

function trait_tab(item, index, array) {
  // let fileentree = item['path_source'] + "\\" + item['nom_fichier'] + "." + item['ext_fichier']
  let fileentree = '';
  if (item['TypeFichierRepertoire'] === 'Repertoire') {
    fileentree = item['path_source'] + "\\" + '*'
  } else if (item['TypeFichierRepertoire'] === 'Fichier') {
    fileentree = item['path_source'] + "\\" + item['nom_fichier'] + "." + item['ext_fichier']
  } else {
    console.log('TypeFichierRepertoire non renseigné');
  }
  let filecompressee = item['path_cible'] + "\\" + item['nom_fichier']
  let ext_fic = '7z'

  // vérif si sauvegarde programmée matin et/ou aprem
  if ((AM_PM() == 'AM' && item['AM']) || (AM_PM() == 'PM' && item['PM'])) {
    // vérif si le jour en cours correspond a celui spécifié dans la base
    if (sauvegarde_today(item['JourSauvegarde'])) {
      add_7z(filecompressee, fileentree, item['id'])
    }
  }
}

connection.connect();
connection.query(myquery, function (error, results, fields) {
  if (error) throw error;
  results.forEach(trait_tab)
  console.log('Sauvegarde terminée')
});
connection.end();

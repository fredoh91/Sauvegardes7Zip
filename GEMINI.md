# Contexte du Projet : Sauvegarde de fichiers RCP

## But Général
L'application a pour but de sauvegarder des fichiers ou des répertoires depuis un emplacement (souvent réseau) vers un emplacement local, en se basant sur des informations provenant d'une base de données. Les fichiers archivés sont compressés au format 7zip.

## Fonctionnalités Clés

je souhaite créer un nouveau fichier (Sauvegardes7Zip_v2.js) qui sera une nouvelle version de me ancien (Sauvegardes7Zip.js).

Pour cela j'aimerais tu ne modifies pas le fichier correspondant a l'ancienne version, mais que tu t'en inspires pour certaines fonctions et fonctionnalités.

j'aimerais que nous itérions tous les deux pour construire ce projet.

voici diverses informations :

1/ j'aimerais la mise en place d'un fichier de log dans le répertoire /logs
2/ plutot que d'avoir un seul fichier Sauvegardes7Zip_v2.js, il faudrait morceler le code sur plusieurs fichiers pour avoir une meilleure lisibilité
3/ j'aimerais que ce script utilise quand cela est possible les promesses en combinaison avec async/await
4/ la liste des fichiers ou répertoires a traités sont dans une base de données mysql. Pour la connexion a cette base le package mysql2 est recommandé.
5/ les identifiants de connexion sont stockés dans un fichier .env. Il faut utiliser le package dotenv pour s'y connecter
6/ la compression sous format 7zip se fera grace au package node-7z
7/ j'aimerais que tu génères une liste de taches a accomplir ou tu cocheras les actions réalisées. Si de nouvelles actions sont réalisées, tu pourras également les ajouter dans ce fichier. Je pourrais moi même également en ajouter.
8/ il y a trois types de sauvegardes qui seront gérés par ce script :
    a) fichier : le chemin et le nom du fichier a sauvegarder et compresser est dans ces 3 champs : path_source, nom_fichier et ext_fichier
    la compression sera réalisée avec le parametre -ssw qui permet de compresser meme les fichiers ouverts.
    Si la compression ne peut se faire malgré tout sur un fichier ouvert, peut etre qu'il faudrait passer par une copie dansune répertoire temporaire, puis compresser ce fichier et enfin effacer ce répertoire.
    b) Repertoire_MySQL : il s'agit du répertoire /data/ contenant les tables d'une base MySQL. Pour cette compression/sauvegarde, il faudra déjà réaliser, dans un répertoire temporaire Windows, de l'intégralité du répertoire /data/ (fichiers et sous répertoires présents dans /data/). Puis de realiser la compression avec node-7z, et enfin de supprimer ce répertoire temporaire. 
    Il serait egalement utile, en cas de précedent probleme dû a ce script de supprimer avant de realiser cette copie, les eventuels anciens répertoires temporaires, n'ayant pas pu etre supprimés a cause d'un eventuel probleme technique.
    c) Repertoire : la aussi la sauvegarde de tous les fichiers et sous répertoire doit etre réalisée. Mais pour ce type la copie vers un répertoire temporaire n'est pas nécessaire, le parametre -ssw doit etre suffisant.
9/ peut etre qu'il serait souhaitable de mettre en place une TDD (test driven developpement) en amont de la creation de chaque fonction et fonctionnalité afin de s'assurer de la non régression de ce qui a été développé. Il faut utiliser pour cela Vitest.


## Architecture et Technologies
-   **Langage :** Javascript
-   **Environnement :** Node.js
-   **Base de données :** MySQL
-   **Version de javascript:** ES plutôt que commonJS.

## Informations Importantes

-   **Langue d'interaction :** Toujours me répondre en français.
-   **Commentaire et suppression:** Dans la mesure du possible je souhaterais que tu mettes en commentaire le code plutôt que tu le supprimes.
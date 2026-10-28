# Livraison CabuAffili

## Périmètre livré

Le frontend affilié, le frontend Cabunets et le backend partagé sont conservés.
Le programme client rémunère chaque commande admissible, conformément au comportement retenu.
Le programme vendeur exige une approbation commerciale distincte de la confirmation d'email et une première vente livrée.
Les anciennes commissions et écritures ne sont ni effacées ni réécrites.

L'administration expose les statistiques globales, les exports CSV filtrés par période, les vendeurs apportés,
le journal d'audit, les anomalies, les reprises et le seuil de retrait.
L'annulation est réservée aux commandes non payées. Une commande payée exige un remboursement référencé.
L'enregistrement d'un paiement, d'un remboursement ou d'une régularisation ne déclenche aucun transfert Mobile Money.
L'administrateur consigne une opération réellement effectuée par un canal autorisé.

## Tests reproductibles

Backend :
- pnpm install --frozen-lockfile
- pnpm typecheck
- pnpm test

Les tests d'intégration lancent leur propre MongoDB temporaire en replica set, exclusivement sur 127.0.0.1.
Ils n'utilisent jamais MONGO_URI de production, ne chargent pas le .env de production et simulent les emails et paiements.
Au premier lancement, mongodb-memory-server télécharge le binaire officiel MongoDB ; prévoir suffisamment de temps et d'espace.
Le processus temporaire et ses fichiers propres sont arrêtés et nettoyés par la bibliothèque après les tests.

Pour une vérification visuelle isolée, définir AFFILIATE_UI_HOLD=1 avant pnpm test:integration.
L'API de test reste alors sur http://127.0.0.1:3108/api pendant au plus quinze minutes.
Les identifiants sont fictifs : admin@test.invalid ou sponsor@test.invalid, mot de passe TestPassword123.
Ne jamais réutiliser ces comptes ou ces secrets en production.
Un fichier temporaire cabuaffili-ui-fixture.json signale cette session ; sa suppression arrête proprement la session de test.

Frontend CabuAffili :
- pnpm install --frozen-lockfile
- pnpm typecheck
- pnpm test
- pnpm build

Frontend Cabunets :
- pnpm install --frozen-lockfile
- pnpm typecheck
- pnpm test
- pnpm build

Les contrôles TypeScript ciblent tsconfig.app.json ; le simple tsc sur le tsconfig racine vide ne suffit pas.

## Configuration des deux frontends

VITE_API_URL doit pointer sur le backend partagé, avec /api.
VITE_CABUNETS_URL, dans CabuAffili, doit contenir l'origine réelle du frontend Cabunets.
Ces variables sont intégrées au build Vite : reconstruire après toute modification.
Le lien /r/CODE ouvre Cabunets /register?ref=CODE ; le code est conservé sur le domaine Cabunets.
La saisie manuelle permet de corriger un code invalide avant création du compte.
L'attribution et l'inscription sont effectuées dans une même transaction.

CabuAffili utilise la cible Firebase Hosting cabuaffili, séparée du site principal.
Avant le premier déploiement, associer explicitement cette cible à un site dédié du projet :
firebase target:apply hosting cabuaffili IDENTIFIANT_DU_SITE_DEDIE
Puis déployer uniquement cette cible :
firebase deploy --only hosting:cabuaffili
Ne pas associer la cible au site Cabunets principal. Le fichier firebase.json conserve la réécriture SPA.
Le déploiement n'est pas effectué par les tests ni par un simple git push.

## Configuration du backend

MongoDB doit prendre en charge les transactions : Atlas ou replica set.
Configurer les variables de .env.example dans le gestionnaire de secrets de l'hébergeur.
Lancer pnpm check:deployment --production pour contrôler la présence et le format des paramètres sans afficher leurs valeurs.

JWT_SECRET doit être aléatoire et contenir au moins 32 caractères en production.
INTERNAL_SHARED_SECRET doit être aléatoire, partagé avec Cabupay et présent dans x-gateway-signature.
Les notifications de paiement ou de payout sans ce secret sont désormais rejetées.
Conserver AFFILIATE_DESTINATION_KEY de manière stable et sauvegardée : la remplacer rendrait les anciennes destinations illisibles.
Le seuil stocké en administration prévaut sur AFFILIATE_MIN_WITHDRAWAL_CDF, qui sert de valeur de départ.
Les retraits V1 sont en CDF ; les autres devises historiques restent séparées.
SMTP_HOST/SMTP_USER/SMTP_PASS sont supportés, ainsi que les anciens MAIL_USER/MAIL_PASS pour Gmail.

## Secrets et mise en service réelle

Des secrets du .env ont été exposés dans une sortie technique durant la reprise précédente.
Ils ne figurent pas dans les commits, mais doivent être renouvelés auprès des services émetteurs avant mise en service :
accès MongoDB, clé Supabase de service, SMTP/Gmail, JWT, secret Cabupay coordonné avec la passerelle, compte administrateur.
Ne jamais publier un vrai secret dans Git.
Cette rotation externe et l'association du site d'hébergement nécessitent les accès aux consoles des services concernés ;
elles ne sont pas réalisées par ce dépôt.

Le serveur ne supprime pas la base pour installer ces fonctionnalités.
Le nouvel index nommé referral_filleul_unique conserve les anciens index. Si des doublons historiques existent,
examiner les signalements et préparer une correction contrôlée ; ne pas effacer les filleuls ou leurs écritures.

## Opérations courantes

Le job de reprise examine les commandes modifiées toutes les cinq minutes.
Une erreur de commission devient une anomalie consultable et reste rejouable ; la reprise est idempotente.
La validation automatique des commissions respecte leur délai et vérifie encore la vente source.
Une transaction et un verrou par affilié sérialisent les réservations et les changements financiers.
Un remboursement après paiement laisse une dette visible ; les paiements suivants sont bloqués si le disponible est négatif.
Une régularisation justifiée avec une référence unique permet d'enregistrer un remboursement reçu ou une correction documentée.
Les téléphones partagés sont des indices à examiner, jamais un motif de blocage automatique.
La vérification téléphonique reste manuelle dans cette V1 ; aucun OTP de démonstration n'est pris pour une preuve.

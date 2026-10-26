# Reprise CabuAffili

Ce lot conserve le backend partagé et les historiques existants. Aucune migration, suppression de données, commande de seed, connexion à MongoDB ou opération de paiement n'a été exécutée pendant le développement.

## Configuration

- Le backend exige un MongoDB prenant en charge les transactions (replica set ou Atlas), comme le parcours affilié précédent. Les inscriptions créent désormais leurs profils dans une transaction.
- AFFILIATE_DESTINATION_KEY : clé hexadécimale de 64 caractères, stable, réservée au chiffrement AES-256-GCM des destinations. Une clé locale a été ajoutée au .env ignoré si elle manquait. Pour un autre environnement, configurer sa propre clé dans le gestionnaire de secrets et la sauvegarder. Ne jamais remplacer une clé utilisée sans migration des données chiffrées.
- AFFILIATE_MIN_WITHDRAWAL_CDF : minimum de retrait, 5000 par défaut.
- VITE_CABUNETS_URL : origine du frontend Cabunets, utilisée par CabuAffili pour les liens /r/CODE. Valeur par défaut https://cabunets.com ; définir l'URL réelle, notamment en test local.

## Comportement et compatibilité

- L'inscription publique conserve client et vendeur, refuse admin. La création d'admins reste possible par le script existant contrôlé, pas par l'API publique.
- La livraison est réservée au vendeur de la commande ou à l'admin. Les chemins existants sont conservés.
- La vérification téléphone est provisoirement manuelle : POST /api/affiliates/verifier-telephone exige un admin et un body userId. Aucun OTP fictif n'est considéré comme une preuve.
- Les nouvelles commissions ne créditent le registre qu'à leur validation. Les anciens crédits en attente sont conservés, exclus du disponible jusqu'à validation.
- Les anciennes écritures adjustment restent lisibles. Les nouvelles corrections utilisent regularisation.
- Les opérations financières d'un affilié écrivent un compteur ledgerVersion dans une transaction avant de lire son solde. Ce compteur n'est pas un solde. MongoDB peut ainsi détecter et réessayer les opérations concurrentes.
- Les nouvelles règles gérées par l'interface utilisent CDF ; les anciens montants d'autres devises ne sont ni convertis ni additionnés au disponible CDF. Les pourcentages sur des commandes en autre devise utilisent les taux existants, conservés dans le snapshot.
- Les retraits anciens sans numéro complet restent inchangés ; l'administrateur doit confirmer leur destination. Les nouvelles destinations sont chiffrées et accessibles en clair seulement dans le détail administrateur.
- Les liens de recrutement ouvrent Cabunets /register?ref=CODE. Le premier code conservé sur ce frontend expire après 30 jours, puis est envoyé à l'inscription. Le code n'est pas transmis par un localStorage partagé entre domaines.
- La rémunération client par commande existante est conservée. Aucune nouvelle règle commerciale de première commande n'a été imposée.

## Vérification locale sans base

Depuis backend :
node --test -r ts-node/register/transpile-only tests/affiliate-safety.test.ts
node_modules/.bin/tsc --noEmit --incremental false

Les tests remplacent les accès aux modèles par des doubles. Ils couvrent des contrôles d'accès, le calcul des soldes anciens, l'utilisation du verrou transactionnel et le chiffrement. Ils ne prouvent pas le comportement concurrent sur un vrai MongoDB.

## Suite de la reprise

- Tester le parcours complet sur un environnement isolé avec transactions MongoDB, des comptes de test et des fournisseurs simulés.
- Compléter le programme vendeur, les événements d'annulation/remboursement et les reprises automatiques de commissions manquantes.
- Raccorder les pages Audit et Anomalies, les indicateurs globaux et les exports.
- Ajouter la vérification téléphone par un fournisseur réel ; le contrôle manuel administrateur est accessible dans la liste des affiliés.
- Renforcer les autres routes historiques Cabunets, notamment les lectures de commandes et les utilitaires.

## Résultat du premier lot

Les neuf tests backend et les deux tests de conservation du code dans vue passent sans base ni fournisseur. Le backend et le frontend affilié passent les vérifications TypeScript. Le frontend affilié a aussi produit un build Vite/PWA dans un dossier temporaire. Le contrôle complet de vue (tsconfig.app.json) échoue sur des fichiers hors des modifications de ce lot : imports PDF absents, anciens services et déclarations inutilisées, notamment. Aucun déploiement effectué.

Les dépôts frontend contenaient déjà de nombreuses modifications non commitées avant la reprise ; elles sont conservées. Le raccordement Cabunets concerne uniquement App.tsx, services/authService.ts, utils/referral.ts et son test. Les trois copies pointent vers le même dépôt GitHub. Leurs branches de publication sont codex/cabuaffili-backend, codex/cabuaffili-frontend et codex/cabuaffili-cabunets-frontend pour éviter de publier des arbres différents sur la même branche.

## Correction du retour vers la connexion

La connexion et l’inscription chargent la session dans AuthContext avant la navigation. RedirectPage utilise cet état sans relancer la requête de profil. Les anciennes requêtes ne peuvent pas remplacer une nouvelle session et les erreurs API sont affichées à la connexion. Le middleware accepte les anciens comptes sans champ isActive tout en refusant explicitement isActive=false. Les routes d’identité et d’affiliation ne nécessitent plus un profil commercial client/vendeur ; les contrôles de rôle et la gestion administrateur restent applicables.

Vérifications : onze tests backend, quatre tests de redirection et deux tests de conservation du code passent. TypeScript passe pour backend et cabuaffili-frontend. Les erreurs relevées dans vue restent hors du lot.

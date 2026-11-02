# Commandes Cabunets — corrections du 2 novembre 2026

## Sauvegarde et portée
- Sauvegarde du backend avant correction : codex/backup-backend-before-order-fixes-2026-11-02 (332427e), poussée sur origin.
- Sauvegarde du frontend : codex/backup-frontend-before-order-fixes-2026-11-02 (48f8a68), poussée sur origin.
- Ces branches sauvegardent le code, pas la base de données. Aucun effacement ni accès à la base de production pendant ces travaux.
- Backend corrigé sur main local. Aucun déploiement ni push de main effectué dans cette intervention.

## Comportement
- Un JWT fourni reste obligatoire à valider. Un achat invité reste possible sans JWT ; clientId ne provient jamais du corps non authentifié.
- Idempotency-Key est facultatif pour les anciens clients. Les nouveaux clients conservent une clé par tentative ; sa réutilisation avec le même contenu retourne la même commande et ne redéclenche pas le paiement.
- Une clé réutilisée avec un autre contenu retourne 409. Un index unique sparse sur checkoutKey protège les créations concurrentes. Order.init attend son initialisation ; vérifier sa présence si autoIndex est désactivé dans un environnement.
- Les transitions de paiement sont atomiques et augmentent __v. Les notifications et réponses tardives ne remplacent pas un statut terminal.
- Une initialisation sans réponse conserve la référence en PENDING/unknown. Ne pas recommencer aveuglément : attendre le callback ou rapprocher la transaction auprès de Cabupay. Sans depositId, le suivi indique INITIALIZING.
- Webhook, synchronisation et traitement manuel partagent une réservation atomique WhatsApp. whatsappSent signifie acceptation explicite par Cabupay, pas preuve de livraison au téléphone.
- Une réponse explicitement négative libère la réservation. Un délai réseau ou une erreur après envoi conserve whatsappProcessing et marque whatsappProcessingStuckAt pour vérification.
- Avant de libérer une réservation incertaine, vérifier chez Cabupay si le message a été accepté. Ne pas remettre tous les verrous à zéro. Une interruption du processus peut également laisser whatsappProcessing actif sans marqueur stuck.
- Idempotency-Key est transmis à Cabupay pour WhatsApp ; son respect côté Cabupay reste à confirmer. Cette correction empêche les doubles appels concurrents côté Cabunets, sans garantir le comportement interne du fournisseur.

## Validation locale
- pnpm typecheck : réussi.
- pnpm test : 36 tests réussis, dont les courses paiement/callback et notification, les sessions et les commissions.
- MongoDB temporaire et fournisseurs simulés : aucun paiement réel ni message WhatsApp réel.
- Le frontend compatible est dans le checkout vue, branche codex/cabunets-backend-compatibility ; les deux checkouts partagent le même dépôt distant dont main contient le backend.

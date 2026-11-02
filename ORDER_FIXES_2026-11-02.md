# Commandes Cabunets — frontend du 2 novembre 2026

- Sauvegarde distante : codex/backup-frontend-before-order-fixes-2026-11-02 (48f8a68).
- Code corrigé sur codex/cabunets-backend-compatibility. Le main distant commun contient le backend ; ne pas le remplacer par ce frontend.
- Un 401 conserve le formulaire et propose une reconnexion ou un achat invité explicite. Aucun nouvel essai anonyme automatique.
- Le brouillon reste en sessionStorage pendant la reconnexion. Aucun mot de passe ni nouveau stockage de JWT dans ce brouillon.
- Une protection synchrone bloque les doubles confirmations. Une clé Idempotency-Key stable permet de retrouver la même commande après une réponse perdue.
- Après une réponse incertaine, les données sont verrouillées pour éviter un autre paiement. Une commande connue mène au suivi.
- Les erreurs utilisent message ou error du serveur. Les initialisations de paiement incertaines affichent une vérification en cours et la référence de commande.
- Les notifications WhatsApp réservées affichent Envoi en cours ou À vérifier.
- Les futures mises à jour PWA demandent une action explicite. Le bouton est désactivé pendant checkout et order-pending ; aucun rechargement automatique.
- Une ancienne PWA déjà ouverte utilise encore son ancien JavaScript : le nouveau message ne peut pas apparaître rétroactivement. Pour cette première transition, fermer toutes les fenêtres/PWA puis rouvrir lorsque aucun paiement est en cours peut être nécessaire.
- Vérifications : 9 tests frontend, 7 tests de compatibilité HTTP backend/frontend sur base temporaire ; compilation de production vérifiée séparément.
- Aucun déploiement Firebase effectué.

# Compatibilité du frontend Cabunets avec le backend partagé

Branche : codex/cabunets-backend-compatibility, créée depuis 747d728.
Backend ciblé et inchangé : codex/cabuaffili-backend, df08f27.
Cette branche ne fusionne pas main et ne déploie aucun service.

## Adaptations

- Le checkout transmet le jeton Redux pour rattacher la commande au client authentifié. L'achat anonyme reste possible ; un client sans jeton est invité à se reconnecter.
- Les quatre modifications des paramètres administrateur transmettent le jeton. Les réponses partielles sont fusionnées avec les données déjà chargées pour conserver les taux et limites à l'écran.
- Les six statuts du backend sont reconnus dans les listes administrateur, client, vendeur et le suivi public. Un statut inconnu ne devient pas « en attente ».
- Traitement réservé aux commandes PENDING ; livraison aux commandes COMPLETED ; annulation aux commandes PENDING ou FAILED. Le serveur conserve l'autorité et contrôle encore le statut et les droits.
- L'action « Supprimer » une commande devient « Annuler », avec conservation de l'historique. Aucun bouton d'annulation n'est proposé pour une vente payée, livrée, annulée ou remboursée.
- Les opérations de remboursement restent dans l'administration CabuAffili existante ; aucune nouvelle action de transfert d'argent n'est ajoutée.
- Un paiement COMPLETED est présenté comme payé et en attente de livraison ; DELIVERED comme livré. Le suivi cesse de présenter les annulations et remboursements comme un paiement en cours.
- Les actions sur les commandes depuis la fiche vendeur utilisent les mêmes services et règles que la liste administrateur.

## Vérifications reproductibles sans argent réel

Installer les dépendances avec pnpm dans les deux dossiers vue et backend.

Dans vue :
- pnpm typecheck
- pnpm test
- pnpm test:compatibility
- pnpm build

Le test de compatibilité charge les vrais services TypeScript du frontend et les vraies routes du backend. Il crée son propre MongoDB replica set temporaire sur 127.0.0.1 et n'utilise pas la base existante. Les emails, notifications WhatsApp et fournisseurs financiers sont simulés ; les appels sortants des fournisseurs sont bloqués.
CABUNETS_BACKEND_DIR permet d'indiquer un autre chemin local du backend. Sans cette variable, le test utilise ../backend.
Le binaire officiel MongoDB peut être téléchargé par mongodb-memory-server au premier lancement.

Les scénarios couvrent :
1. Achat connecté rattaché au vrai client malgré un clientId falsifié.
2. Achat anonyme sans attribution à un compte envoyé dans le corps.
3. Notifications de paiement absentes/incorrectes refusées, notification correcte acceptée.
4. Livraison réservée au bon vendeur et notification tardive sans régression du statut.
5. Paramètres administrateur avec jeton et refus des droits insuffisants.
6. Annulation conservant l'historique et traitement d'un remboursement simulé.

Pour une recette visuelle, définir CABUNETS_UI_HOLD=1 avant pnpm test:compatibility.
Le test garde alors son API isolée sur http://127.0.0.1:3109/api pendant au plus quinze minutes.
Les identifiants et références fictifs sont écrits dans le fichier temporaire cabunets-compat-ui.json.
Supprimer uniquement ce marqueur arrête la session et nettoie le MongoDB temporaire.
Lancer le frontend avec VITE_API_URL=http://127.0.0.1:3109/api sur un port de test distinct.
Ne jamais réutiliser les comptes fictifs en production.

La recette navigateur a vérifié l'achat client, le rattachement réel de la commande, le suivi du paiement simulé, l'enregistrement des paramètres administrateur, l'absence d'actions de traitement sur un remboursement et la livraison depuis le compte vendeur.

## Limites avant production

Cette validation confirme les contrats applicatifs dans l'environnement isolé. Elle ne certifie pas les secrets ou la configuration des services actuellement déployés.

Restent les points du backend signalés par l'audit :
- Vérifier que la vraie passerelle Cabupay transmet x-gateway-signature avec INTERNAL_SHARED_SECRET pour les paiements ET les décaissements. Le test entrant ne prouve pas la configuration de la passerelle réelle.
- Vérifier JWT_SECRET, la compatibilité MongoDB avec les transactions et les index sur les données existantes.
- Examiner la reprise automatique globale de l'historique, enregistrée toutes les cinq minutes sans activation explicite dans df08f27.
- Un échec conjoint du traitement d'affiliation et de la journalisation de son anomalie peut encore remonter en erreur de livraison ; ce backend n'est pas corrigé dans la branche frontend.
- Valider le traitement financier des remboursements après retraits vendeurs : les commandes remboursées sortent des ventes utilisées par le portefeuille. Aucun recalcul historique n'est effectué par ces tests.

Ces points ne doivent pas être présentés comme résolus par une modification du frontend. Préparer sauvegarde et retour arrière avant toute mise en production.

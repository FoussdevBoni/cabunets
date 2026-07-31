export const pawaPayErrors = [
  // Erreurs de montant
  {
    error: "AMOUNT_OUT_OF_BOUNDS",
    traduction: "Le montant est en dehors des limites autorisées pour ce provider."
  },
  {
    error: "INVALID_AMOUNT",
    traduction: "Le montant contient des décimales non supportées par ce provider."
  },

  // Erreurs de numéro / provider
  {
    error: "INVALID_PHONE_NUMBER",
    traduction: "Le numéro de téléphone n'est pas au format MSISDN valide."
  },
  {
    error: "INVALID_PROVIDER",
    traduction: "Le provider spécifié n'est pas valide pour cette requête."
  },
  {
    error: "INVALID_CURRENCY",
    traduction: "La devise n'est pas supportée par ce provider."
  },

  // Erreurs d'authentification
  {
    error: "NO_AUTHENTICATION",
    traduction: "Le token API est absent des headers de la requête."
  },
  {
    error: "AUTHENTICATION_ERROR",
    traduction: "Le token API est invalide ou manquant."
  },
  {
    error: "AUTHORISATION_ERROR",
    traduction: "Le token API n'est pas autorisé pour cet appel."
  },

  // Erreurs de requête
  {
    error: "INVALID_INPUT",
    traduction: "Le payload de la requête n'a pas pu être analysé."
  },
  {
    error: "MISSING_PARAMETER",
    traduction: "Un paramètre obligatoire est absent du corps de la requête."
  },
  {
    error: "UNSUPPORTED_PARAMETER",
    traduction: "Un paramètre non supporté a été trouvé dans la requête."
  },
  {
    error: "INVALID_PARAMETER",
    traduction: "La valeur d'un paramètre est invalide."
  },
  {
    error: "DUPLICATE_METADATA_FIELD",
    traduction: "Un champ metadata est dupliqué dans la requête."
  },

  // Erreurs de permission
  {
    error: "DEPOSITS_NOT_ALLOWED",
    traduction: "Les dépôts ne sont pas activés pour ce provider sur votre compte PawaPay."
  },

  // Erreurs de transaction (failureReason dans callback)
  {
    error: "PAYER_NOT_FOUND",
    traduction: "Le numéro de téléphone n'a pas de compte mobile money chez ce provider."
  },

  {
    error: "FORMAT_PAYEUR_INVALIDE",
    traduction: "Le numéro de téléphone est incorrect: Veillez respecter ce formet '+243 815 625 169'"
  },
  {
    error: "PAYMENT_NOT_APPROVED",
    traduction: "Le client n'a pas approuvé le paiement."
  },
  {
    error: "PAYER_LIMIT_REACHED",
    traduction: "Le client a atteint sa limite de transaction mobile money."
  },
  {
    error: "PAYMENT_IN_PROGRESS",
    traduction: "Un paiement est déjà en cours pour ce client."
  },
  {
    error: "INSUFFICIENT_BALANCE",
    traduction: "Le client n'a pas suffisamment de fonds."
  },
  {
    error: "WALLET_LIMIT_REACHED",
    traduction: "Le client a atteint la limite de son portefeuille mobile money."
  },
  {
    error: "UNSPECIFIED_FAILURE",
    traduction: "Le provider a confirmé l'échec mais n'a pas précisé la raison."
  },

  // Erreurs système
  {
    error: "PROVIDER_TEMPORARILY_UNAVAILABLE",
    traduction: "Le provider est temporairement indisponible."
  },
  {
    error: "UNKNOWN_ERROR",
    traduction: "Une erreur inconnue s'est produite."
  },
];


export const getPawapayError = (code: string): string => {
  const found = pawaPayErrors.find((item) => item.error === code);
  return found ? found.traduction : code || "Une erreur est survenue.";
};
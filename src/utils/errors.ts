// src/utils/errors.ts

/**
 * Classe de base pour toutes les erreurs de l'application.
 *
 * Toutes les erreurs métier doivent hériter de AppError.
 * Cela permet au middleware Express de les traiter de façon uniforme.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly isOperational: boolean;

  constructor(
    statusCode: number,
    message: string,
    code?: string,
    isOperational: boolean = true
  ) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;

    // Maintient la stack trace propre (V8)
    Error.captureStackTrace(this, this.constructor);
  }
}

// ============================================================
// 400 — Validation
// ============================================================

export class ValidationError extends AppError {
  constructor(message: string, code?: string) {
    super(400, message, code ?? "VALIDATION_ERROR");
  }
}

// ============================================================
// 401 — Authentification
// ============================================================

export class AuthError extends AppError {
  constructor(message: string, code?: string) {
    super(401, message, code ?? "AUTH_ERROR");
  }
}

// ============================================================
// 403 — Autorisation
// ============================================================

export class ForbiddenError extends AppError {
  constructor(message: string, code?: string) {
    super(403, message, code ?? "FORBIDDEN");
  }
}

// ============================================================
// 404 — Ressource non trouvée
// ============================================================

export class NotFoundError extends AppError {
  constructor(message: string, code?: string) {
    super(404, message, code ?? "NOT_FOUND");
  }
}

// ============================================================
// 409 — Conflit
// ============================================================

export class ConflictError extends AppError {
  constructor(message: string, code?: string) {
    super(409, message, code ?? "CONFLICT");
  }
}

// ============================================================
// 500 — Erreur interne
// ============================================================

export class InternalError extends AppError {
  constructor(message: string = "Erreur interne du serveur", code?: string) {
    super(500, message, code ?? "INTERNAL_ERROR", false);
  }
}

// ============================================================
// Helper
// ============================================================

/**
 * Vérifie qu'une erreur est une AppError.
 * Utile dans le middleware pour distinguer les erreurs métier
 * des erreurs inattendues.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}
import { timingSafeEqual } from "crypto";
import { AuthError, InternalError } from "./errors";

export function jwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret || (process.env.NODE_ENV === "production" && secret.length < 32)) {
    throw new InternalError("La clé de session du serveur doit être configurée correctement.");
  }
  return secret;
}
export function verifyGatewayHeader(header?: string): void {
  const secret = process.env.INTERNAL_SHARED_SECRET;
  if (!secret || !header) throw new AuthError("Authentification de la passerelle requise.");
  const actual = Buffer.from(header), expected = Buffer.from(secret);
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    throw new AuthError("Authentification de la passerelle invalide.");
  }
}

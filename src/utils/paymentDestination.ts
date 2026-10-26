import { createCipheriv, createDecipheriv, randomBytes } from "crypto";
import { InternalError } from "./errors";

function key(): Buffer {
  const value = process.env.AFFILIATE_DESTINATION_KEY;
  if (!value || !/^[a-f0-9]{64}$/i.test(value)) {
    throw new InternalError("Le chiffrement des destinations de retrait doit être configuré.");
  }
  return Buffer.from(value, "hex");
}
export function encryptDestination(value: string): string {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key(), iv);
  const data = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), data].map(v => v.toString("base64")).join(".");
}
export function decryptDestination(value: string): string {
  const [iv, tag, data] = value.split(".").map(v => Buffer.from(v, "base64"));
  const cipher = createDecipheriv("aes-256-gcm", key(), iv);
  cipher.setAuthTag(tag);
  return Buffer.concat([cipher.update(data), cipher.final()]).toString("utf8");
}

// src/utils/validators.ts
import validator from "validator";

export const validators = {
  isEmail(value: string): boolean {
    return validator.isEmail(value);
  },

  isStrongPassword(value: string): boolean {
    return typeof value === "string" && value.length >= 6;
  },

  isPhoneNumber(value: string): boolean {
    if (!value) return false;
    return /^[+]?[0-9\s-]{8,20}$/.test(value.trim());
  },

  isOtp(value: string): boolean {
    return /^[0-9]{6}$/.test(value);
  },

  isAffiliateCode(value: string): boolean {
    return /^[A-Z0-9-]{4,20}$/.test(value);
  },
};
// src/utils/phone.ts

/**
 * Indicatifs par défaut par pays (Afrique centrale principalement).
 */
const COUNTRY_CODES: Record<string, string> = {
    CD: "+243", // RD Congo
    RW: "+250", // Rwanda
    BI: "+257", // Burundi
    CG: "+242", // Congo-Brazzaville
    UG: "+256", // Ouganda
    TZ: "+255", // Tanzanie
};

const DEFAULT_COUNTRY = "CD"; // RDC par défaut

export const phone = {
    /**
     * Normalise un numéro de téléphone au format E.164.
     * Ex: "0812345678" (RDC) → "+243812345678"
     *
     * @param value - numéro brut
     * @param countryCode - code pays ISO (ex: "CD")
     */
    normalize(value: string, countryCode: string = DEFAULT_COUNTRY): string | null {
        if (!value) return null;

        // Retirer espaces, tirets, parenthèses, points
        let cleaned = value.replace(/[\s\-().]/g, "");

        // Si commence déjà par "+", on garde tel quel
        if (cleaned.startsWith("+")) {
            return this.isValid(cleaned) ? cleaned : null;
        }

        // Si commence par "00", remplacer par "+"
        if (cleaned.startsWith("00")) {
            cleaned = "+" + cleaned.slice(2);
            return this.isValid(cleaned) ? cleaned : null;
        }

        // Sinon, appliquer l'indicatif du pays
        const prefix = COUNTRY_CODES[countryCode.toUpperCase()];
        if (!prefix) return null;

        // Retirer un éventuel "0" initial (ex: 0812345678)
        if (cleaned.startsWith("0")) {
            cleaned = cleaned.slice(1);
        }

        const full = prefix + cleaned;
        return this.isValid(full) ? full : null;
    },

    /**
     * Vérifie qu'un numéro est valide au format E.164.
     * Format : "+" suivi de 8 à 15 chiffres.
     */
    isValid(value: string): boolean {
        if (!value) return false;
        return /^\+[1-9]\d{7,14}$/.test(value);
    },

    /**
     * Masque un numéro pour l'affichage.
     * Ex: "+243812345678" → "+243 81 *** 78"
     */
    mask(value: string): string {
        if (!value || !this.isValid(value)) return value ?? "";

        // Garde les 5 premiers et les 2 derniers caractères
        const head = value.slice(0, 5);   // ex: "+2438"
        const tail = value.slice(-2);     // ex: "78"
        return `${head} *** ${tail}`;
    },

    /**
     * Retourne l'indicatif d'un pays.
     */
    getCountryCode(countryCode: string): string | null {
        return COUNTRY_CODES[countryCode.toUpperCase()] ?? null;
    },

    /**
     * Formate pour l'affichage lisible.
     * Ex: "+243812345678" → "+243 81 234 5678"
     */
    format(value: string): string {
        if (!value || !this.isValid(value)) return value ?? "";

        const prefix = value.slice(0, 4);     // "+243"
        const rest = value.slice(4);

        // Groupe par 2 ou 3
        const groups = rest.match(/.{1,3}/g) ?? [];
        return `${prefix} ${groups.join(" ")}`;
    },
};
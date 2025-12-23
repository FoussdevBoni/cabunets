import jwt from "jsonwebtoken";

// === Types JWT ===
export interface TokenPayload {
  id: string;
  role: string;
  iat: number;
  exp: number;
}

// === Générer un token JWT ===
export const generateToken = (userId: string, role: string) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET || "supersecret",
    { expiresIn: "7d" }
  );
};

// === Vérifier un token JWT ===
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecret");
    if (typeof decoded !== "object" || !("id" in decoded) || !("role" in decoded)) {
      return null;
    }
    return decoded as TokenPayload;
  } catch (err) {
    console.error("Token invalide :", err);
    return null;
  }
};
